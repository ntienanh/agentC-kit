#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const VERSION = '1.0.0';
const SERVER_NAME = 'code-review-graph';

const DEFAULT_PROJECT_ROOT = process.env.CRG_PROJECT_ROOT || process.cwd();
const DEFAULT_EXCLUDE_PATTERNS = (
  process.env.CRG_EXCLUDE_PATTERNS || 'node_modules,dist,.next,build,.git,.yarn,.agents,.cache,coverage,sites'
)
  .split(',')
  .map(p => p.trim())
  .filter(Boolean);
const DEFAULT_MAX_SEARCH_DEPTH = parseInt(process.env.CRG_MAX_SEARCH_DEPTH || '5', 10);
const DEFAULT_TOKEN_BUDGET = parseInt(process.env.CRG_DEFAULT_TOKEN_BUDGET || '2000', 10);

const TOOL_DEFINITIONS = [
  {
    name: 'query_graph_tool',
    description:
      'Execute semantic graph queries against the indexed codebase AST. Finds symbols, callers, callees, type definitions, component hierarchies, and route bindings with fine-grained filtering.',
    parameters: {
      type: 'object',
      properties: {
        query_type: {
          type: 'string',
          enum: [
            'find_symbol',
            'find_callers',
            'find_callees',
            'find_references',
            'find_implementations',
            'find_hierarchy',
          ],
          description: 'Category of AST traversal to execute.',
        },
        symbol: {
          type: 'string',
          description: "Target symbol name (e.g., 'usePlayerLogic', 'PlayerDto', 'PlayerTable').",
        },
        query: {
          type: 'string',
          description: 'Alternative symbol name or search query.',
        },
        path: {
          type: 'string',
          description: "Optional file path or glob to restrict query scope (e.g., 'src/features/**/*.ts').",
        },
        kinds: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['function', 'class', 'interface', 'type', 'component', 'hook', 'route', 'query_key'],
          },
          description: 'Filter results by AST node kind.',
        },
        max_results: {
          type: 'integer',
          default: 25,
          description: 'Maximum number of graph nodes/edges to return.',
        },
      },
      required: ['query_type'],
    },
    inputSchema: {
      type: 'object',
      properties: {
        query_type: {
          type: 'string',
          enum: [
            'find_symbol',
            'find_callers',
            'find_callees',
            'find_references',
            'find_implementations',
            'find_hierarchy',
          ],
        },
        symbol: { type: 'string' },
        query: { type: 'string' },
        path: { type: 'string' },
        kinds: {
          type: 'array',
          items: { type: 'string' },
        },
        max_results: { type: 'integer', default: 25 },
      },
      required: ['query_type'],
    },
  },
  {
    name: 'get_impact_radius',
    description:
      'Calculate the transitive blast-radius (callers-of-callers, affected tests, dependent UI components, and API routes) when modifying a file, interface, or symbol.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description:
            "Target symbol name or relative file path (e.g., 'src/contracts/player.contract.ts' or 'PlayerDto').",
        },
        depth: {
          type: 'integer',
          minimum: 1,
          maximum: 5,
          default: 2,
          description: 'Transitive traversal depth for callers-of-callers analysis.',
        },
        direction: {
          type: 'string',
          enum: ['upstream', 'downstream', 'both'],
          default: 'upstream',
          description:
            "'upstream' tracks dependents/callers (blast radius); 'downstream' tracks internal dependencies.",
        },
        include_tests: {
          type: 'boolean',
          default: true,
          description: 'Whether to detect co-located unit specs and E2E test files covering affected nodes.',
        },
      },
      required: ['target'],
    },
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string' },
        depth: { type: 'integer', minimum: 1, maximum: 5, default: 2 },
        direction: { type: 'string', enum: ['upstream', 'downstream', 'both'], default: 'upstream' },
        include_tests: { type: 'boolean', default: true },
      },
      required: ['target'],
    },
  },
  {
    name: 'get_review_context_tool',
    description:
      'Extract a token-budgeted, minimal surgical context slice for code review or refactoring. Returns only the modified code, caller signatures, interface contracts, and relevant tests without dumping full files.',
    parameters: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of target or changed relative file paths.',
        },
        max_tokens: {
          type: 'integer',
          default: 2000,
          description: 'Upper token budget limit (enforces Invariant 6 <= 2000 tokens).',
        },
        include_caller_signatures: {
          type: 'boolean',
          default: true,
          description: 'Extract only function/method signatures of direct callers instead of full bodies.',
        },
        include_interface_contracts: {
          type: 'boolean',
          default: true,
          description: 'Include TypeScript types and DTO definitions referenced by target files.',
        },
        compress_comments: {
          type: 'boolean',
          default: true,
          description: 'Strip noise comments and decorative banners to maximize semantic information density.',
        },
      },
      required: ['files'],
    },
    inputSchema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string' } },
        max_tokens: { type: 'integer', default: 2000 },
        include_caller_signatures: { type: 'boolean', default: true },
        include_interface_contracts: { type: 'boolean', default: true },
        compress_comments: { type: 'boolean', default: true },
      },
      required: ['files'],
    },
  },
];

class CodebaseGraph {
  constructor(projectRoot = DEFAULT_PROJECT_ROOT, excludePatterns = DEFAULT_EXCLUDE_PATTERNS) {
    this.projectRoot = path.resolve(projectRoot);
    this.excludePatterns = excludePatterns;
    this.files = new Map();
    this.nodes = new Map();
    this.edges = [];
    this.symbolIndex = new Map();
    this.build();
  }

  build() {
    const filePaths = this.collectFiles(this.projectRoot, 0, DEFAULT_MAX_SEARCH_DEPTH);
    for (const absPath of filePaths) {
      const relPath = path.relative(this.projectRoot, absPath).replace(/\\/g, '/');
      try {
        const content = fs.readFileSync(absPath, 'utf8');
        this.parseFile(relPath, content);
      } catch {
        // Skip unreadable files
      }
    }
    this.resolveEdges();
  }

  collectFiles(dir, currentDepth, maxDepth) {
    if (currentDepth > maxDepth) return [];
    if (!fs.existsSync(dir)) return [];
    const results = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const baseName = entry.name;
        if (this.excludePatterns.some(p => baseName === p || baseName.startsWith(p))) {
          continue;
        }
        if (entry.isDirectory()) {
          results.push(...this.collectFiles(fullPath, currentDepth + 1, maxDepth));
        } else if (entry.isFile()) {
          if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // Permission / read error ignored
    }
    return results;
  }

  parseFile(relPath, content) {
    const fileRecord = {
      path: relPath,
      content,
      imports: [],
      exports: [],
      symbols: [],
      references: new Set(),
      isTest: /\.(spec|test)\.(ts|tsx|js|jsx)$/.test(relPath) || relPath.startsWith('tests/') || relPath.startsWith('e2e/'),
      isRoute: /src\/app\/.*\/page\.(tsx|jsx|js|ts)$/.test(relPath) || /app\/.*\/page\.(tsx|jsx|js|ts)$/.test(relPath),
    };

    if (fileRecord.isRoute) {
      let routePath = relPath.replace(/^src\/app/, '').replace(/^app/, '').replace(/\/page\.[^.]+$/, '');
      if (!routePath) routePath = '/';
      const routeNode = { id: `${relPath}::route`, name: routePath, kind: 'route', path: relPath, line: 1, character: 1, signature: `Route ${routePath}` };
      this.addNode(routeNode);
      fileRecord.symbols.push(routeNode);
    }

    // ADVANCED REGEX PARSER for Imports
    const importRegex = /import\s+(?:type\s+)?([^{"';]*?)(?:\{([^}]*)\})?\s*from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const defaultImportRaw = match[1] || '';
      const namedImportsRaw = match[2] || '';
      const importPath = match[3];

      const symbols = [];
      
      const defaultImport = defaultImportRaw.replace(/,/g, '').trim();
      if (defaultImport && !defaultImport.startsWith('*')) {
        symbols.push(defaultImport);
      } else if (defaultImport.startsWith('*')) {
         const starMatch = defaultImport.match(/\*\s+as\s+([A-Za-z0-9_$]+)/);
         if (starMatch) symbols.push(starMatch[1]);
      }

      if (namedImportsRaw) {
        namedImportsRaw.split(',').forEach(s => {
          const name = s.trim().split(/\s+as\s+/)[0];
          if (name) symbols.push(name);
        });
      }
      
      if (symbols.length > 0) {
        fileRecord.imports.push({ rawPath: importPath, symbols });
      }
    }

    const requireRegex = /(?:const|let|var)\s+([^{=;]+|\{[^}]+\})\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      const lhs = match[1].trim();
      const importPath = match[2];
      const symbols = [];
      
      if (lhs.startsWith('{')) {
         lhs.slice(1, -1).split(',').forEach(s => {
            const name = s.trim().split(/\s*:\s*/)[0];
            if (name) symbols.push(name);
         });
      } else {
         symbols.push(lhs);
      }
      if (symbols.length > 0) fileRecord.imports.push({ rawPath: importPath, symbols });
    }

    // ADVANCED REGEX for Exports and Symbols
    const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|interface|let|var)\s+([A-Za-z0-9_$]+)/g;
    while ((match = exportRegex.exec(content)) !== null) {
       fileRecord.exports.push(match[1]);
    }
    
    const symbolRegex = /(?:const|function|class|interface|let|var)\s+([A-Za-z0-9_$]+)\s*(?:=|\(|\{)/g;
    while ((match = symbolRegex.exec(content)) !== null) {
       const name = match[1];
       if (['if', 'for', 'while', 'switch', 'catch', 'return', 'yield'].includes(name)) continue;
       const line = content.substring(0, match.index).split('\n').length;
       const kind = 'symbol';
       const n = { id: `${relPath}::${name}`, name, kind, path: relPath, line, character: 1, signature: `${name}` };
       this.addNode(n);
       fileRecord.symbols.push(n);
    }
    
    // Quick References Scan
    const refRegex = /\b[A-Za-z0-9_$]{2,}\b/g;
    while ((match = refRegex.exec(content)) !== null) {
       fileRecord.references.add(match[0]);
    }

    this.files.set(relPath, fileRecord);
  }





  classifyKind(name, relPath, defaultKind = 'function') {
    if (name.startsWith('use') && name.length > 3 && /^[A-Z]/.test(name[3])) {
      return 'hook';
    }
    if (relPath.includes('query-keys') || name.endsWith('QueryKeys') || name.endsWith('Keys')) {
      return 'query_key';
    }
    if (
      /^[A-Z]/.test(name) &&
      (relPath.includes('components') ||
        relPath.includes('ui') ||
        relPath.includes('layouts') ||
        name.endsWith('Table') ||
        name.endsWith('Button') ||
        name.endsWith('Modal') ||
        name.endsWith('View') ||
        name.endsWith('Card'))
    ) {
      return 'component';
    }
    if (
      name.toLowerCase().includes('navigation') ||
      name.toLowerCase().includes('route') ||
      name.toLowerCase().includes('menu') ||
      relPath.includes('navigation') ||
      relPath.includes('menu')
    ) {
      return 'route';
    }
    return defaultKind;
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    if (!this.symbolIndex.has(node.name)) {
      this.symbolIndex.set(node.name, []);
    }
    this.symbolIndex.get(node.name).push(node);
  }

  resolveEdges() {
    for (const [relPath, fileRecord] of this.files.entries()) {
      for (const imp of fileRecord.imports) {
        for (const sym of imp.symbols) {
          const targetNodes = this.symbolIndex.get(sym) || [];
          for (const target of targetNodes) {
            if (target.path !== relPath) {
              this.edges.push({
                source: `${relPath}::${fileRecord.symbols[0] ? fileRecord.symbols[0].name : 'file'}`,
                sourceFile: relPath,
                target: target.id,
                targetName: target.name,
                targetFile: target.path,
                relation: 'IMPORTS',
              });
            }
          }
        }
      }

      for (const symNode of fileRecord.symbols) {
        if (symNode.extends) {
          const baseNodes = this.symbolIndex.get(symNode.extends) || [];
          for (const base of baseNodes) {
            this.edges.push({
              source: symNode.id,
              sourceFile: relPath,
              target: base.id,
              targetName: base.name,
              targetFile: base.path,
              relation: 'EXTENDS',
            });
          }
        }
      }

      for (const [symName, targetNodes] of this.symbolIndex.entries()) {
        if (fileRecord.references.has(symName)) {
          for (const target of targetNodes) {
            if (target.path !== relPath) {
              let callerSym = fileRecord.symbols.find(s => s.path === relPath);
              const callerId = callerSym ? callerSym.id : `${relPath}::${symName}Caller`;
              this.edges.push({
                source: callerId,
                sourceFile: relPath,
                target: target.id,
                targetName: target.name,
                targetFile: target.path,
                relation: target.kind === 'component' ? 'RENDERS' : 'CALLS',
                callsite: { file: relPath, line: target.line },
              });
            }
          }
        }
      }
    }
  }

  queryGraph(params = {}) {
    const queryType = params.query_type || 'find_symbol';
    const targetSymbol =
      typeof params.symbol === 'string'
        ? params.symbol
        : typeof params.query === 'string'
          ? params.query
          : params.symbol != null
            ? String(params.symbol)
            : params.query != null
              ? String(params.query)
              : '';
    const filterPath = typeof params.path === 'string' ? params.path : '';
    const kinds = Array.isArray(params.kinds) ? params.kinds : [];
    const maxResults = typeof params.max_results === 'number' && params.max_results > 0 ? params.max_results : 25;

    let matchedNodes = [];
    let matchedEdges = [];

    const pathMatches = nodePath => {
      if (!filterPath) return true;
      if (filterPath.includes('*')) {
        try {
          const regexStr = '^' + filterPath.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$';
          return new RegExp(regexStr).test(nodePath);
        } catch {
          const cleanFilter = filterPath.replace(/[*[\]?+^$(){}|\\]/g, '');
          return nodePath.includes(cleanFilter);
        }
      }
      return nodePath.includes(filterPath);
    };

    const kindMatches = kind => {
      if (!kinds || kinds.length === 0) return true;
      return kinds.includes(kind);
    };

    switch (queryType) {
      case 'find_symbol': {
        for (const node of this.nodes.values()) {
          const nameMatches = targetSymbol ? node.name.toLowerCase().includes(targetSymbol.toLowerCase()) : true;
          if (nameMatches && pathMatches(node.path) && kindMatches(node.kind)) {
            matchedNodes.push(node);
          }
        }
        break;
      }
      case 'find_callers': {
        const callerEdges = this.edges.filter(
          e =>
            (e.targetName === targetSymbol || e.target.endsWith(`::${targetSymbol}`)) &&
            (e.relation === 'CALLS' || e.relation === 'RENDERS' || e.relation === 'IMPORTS'),
        );
        for (const edge of callerEdges) {
          matchedEdges.push(edge);
          const sourceNode = this.nodes.get(edge.source);
          if (sourceNode && pathMatches(sourceNode.path) && kindMatches(sourceNode.kind)) {
            matchedNodes.push(sourceNode);
          } else if (!sourceNode && edge.sourceFile) {
            matchedNodes.push({
              id: edge.source,
              name: edge.source.split('::')[1] || path.basename(edge.sourceFile),
              kind: 'caller',
              path: edge.sourceFile,
              line: edge.callsite ? edge.callsite.line : 1,
            });
          }
        }

        if (matchedNodes.length === 0 && targetSymbol) {
          for (const [relPath, rec] of this.files.entries()) {
            if (rec.references.has(targetSymbol) && !relPath.includes(targetSymbol)) {
              matchedNodes.push({
                id: `${relPath}::${targetSymbol}Caller`,
                name: path.basename(relPath),
                kind: 'caller',
                path: relPath,
                line: 1,
              });
              matchedEdges.push({
                source: `${relPath}::${targetSymbol}Caller`,
                sourceFile: relPath,
                target: targetSymbol,
                targetName: targetSymbol,
                targetFile: '',
                relation: 'CALLS',
              });
            }
          }
        }
        break;
      }
      case 'find_callees': {
        for (const edge of this.edges) {
          if (edge.source.endsWith(`::${targetSymbol}`) || edge.sourceFile.includes(targetSymbol)) {
            matchedEdges.push(edge);
            const targetNode = this.nodes.get(edge.target);
            if (targetNode) matchedNodes.push(targetNode);
          }
        }
        break;
      }
      case 'find_references': {
        for (const [relPath, rec] of this.files.entries()) {
          if (rec.references.has(targetSymbol)) {
            matchedNodes.push({
              id: `${relPath}::reference`,
              name: targetSymbol,
              kind: 'reference',
              path: relPath,
              line: 1,
            });
            matchedEdges.push({
              source: relPath,
              target: targetSymbol,
              relation: 'REFERENCES',
            });
          }
        }
        break;
      }
      case 'find_implementations': {
        for (const edge of this.edges) {
          if (
            edge.relation === 'EXTENDS' &&
            (edge.targetName === targetSymbol || edge.target.endsWith(`::${targetSymbol}`))
          ) {
            matchedEdges.push(edge);
            const sourceNode = this.nodes.get(edge.source);
            if (sourceNode) matchedNodes.push(sourceNode);
          }
        }
        break;
      }
      case 'find_hierarchy': {
        for (const node of this.nodes.values()) {
          const matchesSymbol = targetSymbol ? node.name.toLowerCase().includes(targetSymbol.toLowerCase()) : true;
          if (
            matchesSymbol &&
            (node.kind === 'route' || node.kind === 'component' || node.kind === 'variable') &&
            pathMatches(node.path)
          ) {
            matchedNodes.push(node);
          }
        }
        matchedEdges = this.edges.filter(e => e.relation === 'RENDERS' || e.relation === 'EXTENDS');
        break;
      }
      default:
        for (const node of this.nodes.values()) {
          if (targetSymbol && node.name.includes(targetSymbol)) matchedNodes.push(node);
        }
    }

    const uniqueNodes = [];
    const seenNodeIds = new Set();
    for (const n of matchedNodes) {
      if (!seenNodeIds.has(n.id)) {
        seenNodeIds.add(n.id);
        uniqueNodes.push(n);
      }
    }

    const trimmedNodes = uniqueNodes.slice(0, maxResults);
    const trimmedEdges = matchedEdges.slice(0, maxResults);

    return {
      status: 'success',
      query: { query_type: queryType, symbol: targetSymbol, path: filterPath },
      nodes: trimmedNodes,
      edges: trimmedEdges,
      summary: `Found ${trimmedNodes.length} nodes and ${trimmedEdges.length} edges matching query '${queryType}'.`,
    };
  }

  getImpactRadius(params = {}) {
    const target =
      typeof params.target === 'string' ? params.target : params.target != null ? String(params.target) : '';
    const rawDepth = Number.parseInt(params.depth, 10);
    const depth = Number.isNaN(rawDepth) ? 2 : Math.max(1, Math.min(5, rawDepth));
    const direction = params.direction || 'upstream';
    const includeTests = params.include_tests !== false;

    let targetNodes = [];
    if (this.nodes.has(target)) {
      targetNodes.push(this.nodes.get(target));
    } else {
      for (const node of this.nodes.values()) {
        if (node.name === target || node.path === target || node.path.endsWith(target)) {
          targetNodes.push(node);
        }
      }
    }

    const targetFiles = new Set();
    for (const n of targetNodes) targetFiles.add(n.path);
    if (target.includes('/') || target.includes('.')) targetFiles.add(target);

    const tier1 = [];
    const tier2 = [];
    const visitedNodes = new Set();
    const visitedFiles = new Set([...targetFiles]);

    const isUpstream = direction === 'upstream' || direction === 'both';
    const isDownstream = direction === 'downstream' || direction === 'both';

    for (const edge of this.edges) {
      if (isUpstream && (targetFiles.has(edge.targetFile) || edge.targetName === target)) {
        const srcNode = this.nodes.get(edge.source) || {
          symbol: edge.source.split('::')[1] || 'anonymous',
          kind: 'caller',
          file: edge.sourceFile,
          line: edge.callsite ? edge.callsite.line : 1,
        };
        if (!visitedNodes.has(edge.source)) {
          visitedNodes.add(edge.source);
          visitedFiles.add(edge.sourceFile);
          tier1.push({
            symbol: srcNode.name || srcNode.symbol,
            kind: srcNode.kind || 'caller',
            file: srcNode.path || edge.sourceFile,
            line: srcNode.line || 1,
          });
        }
      }

      if (isDownstream && (targetFiles.has(edge.sourceFile) || edge.source.endsWith(`::${target}`))) {
        const tgtNode = this.nodes.get(edge.target) || {
          symbol: edge.targetName,
          kind: 'callee',
          file: edge.targetFile,
          line: 1,
        };
        if (!visitedNodes.has(edge.target)) {
          visitedNodes.add(edge.target);
          visitedFiles.add(edge.targetFile);
          tier1.push({
            symbol: tgtNode.name || tgtNode.symbol,
            kind: tgtNode.kind || 'callee',
            file: tgtNode.path || edge.targetFile,
            line: tgtNode.line || 1,
          });
        }
      }
    }

    if (tier1.length === 0 && target) {
      for (const [relPath, rec] of this.files.entries()) {
        if (rec.references.has(target) && !relPath.includes(target)) {
          visitedFiles.add(relPath);
          tier1.push({
            symbol: path.basename(relPath).replace(/\.[^.]+$/, ''),
            kind: 'caller',
            file: relPath,
            line: 1,
          });
        }
      }
    }

    let currentFrontier = [...tier1];
    for (let currentDepth = 2; currentDepth <= depth; currentDepth++) {
      const nextFrontier = [];
      for (const item of currentFrontier) {
        for (const edge of this.edges) {
          if (isUpstream && (edge.targetFile === item.file || edge.targetName === item.symbol)) {
            if (!visitedNodes.has(edge.source) && !targetFiles.has(edge.sourceFile)) {
              visitedNodes.add(edge.source);
              visitedFiles.add(edge.sourceFile);
              const node = this.nodes.get(edge.source) || {
                symbol: edge.source.split('::')[1] || path.basename(edge.sourceFile),
                kind: 'caller',
                file: edge.sourceFile,
                line: edge.callsite ? edge.callsite.line : 1,
              };
              const record = {
                symbol: node.name || node.symbol,
                kind: node.kind || 'transitive_caller',
                file: node.path || edge.sourceFile,
                line: node.line || 1,
              };
              tier2.push(record);
              nextFrontier.push(record);
            }
          }

          if (isDownstream && (edge.sourceFile === item.file || edge.source.endsWith(`::${item.symbol}`))) {
            if (!visitedNodes.has(edge.target) && !targetFiles.has(edge.targetFile)) {
              visitedNodes.add(edge.target);
              visitedFiles.add(edge.targetFile);
              const node = this.nodes.get(edge.target) || {
                symbol: edge.targetName,
                kind: 'callee',
                file: edge.targetFile,
                line: 1,
              };
              const record = {
                symbol: node.name || node.symbol,
                kind: node.kind || 'transitive_callee',
                file: node.path || edge.targetFile,
                line: node.line || 1,
              };
              tier2.push(record);
              nextFrontier.push(record);
            }
          }
        }
      }
      currentFrontier = nextFrontier;
      if (currentFrontier.length === 0) break;
    }

    const affectedTests = [];
    if (includeTests) {
      for (const f of visitedFiles) {
        const dir = path.dirname(f);
        const base = path.basename(f, path.extname(f));
        const specCandidates = [
          path.join(dir, `${base}.spec.ts`),
          path.join(dir, `${base}.spec.tsx`),
          path.join(dir, `${base}.test.ts`),
          path.join(dir, `${base}.test.tsx`),
        ];
        for (const cand of specCandidates) {
          const norm = cand.replace(/\\/g, '/');
          if (this.files.has(norm) && !affectedTests.includes(norm)) {
            affectedTests.push(norm);
          }
        }
      }

      for (const [relPath, rec] of this.files.entries()) {
        if (rec.isTest && !affectedTests.includes(relPath)) {
          if (
            rec.references.has(target) ||
            [...visitedFiles].some(vf => rec.references.has(path.basename(vf, path.extname(vf))))
          ) {
            affectedTests.push(relPath);
          }
        }
      }
    }

    const affectedRoutes = [];
    for (const f of visitedFiles) {
      if (/src\/app\/.*\/page\.(tsx|jsx|js|ts)$/.test(f) || /app\/.*\/page\.(tsx|jsx|js|ts)$/.test(f)) {
        let route = f
          .replace(/^src\/app/, '')
          .replace(/^app/, '')
          .replace(/\/page\.[^.]+$/, '');
        if (!route) route = '/';
        if (!affectedRoutes.includes(route)) affectedRoutes.push(route);
      }
    }

    const totalAffectedFiles = visitedFiles.size;
    const isContract =
      target.includes('contract') ||
      target.includes('dto') ||
      target.includes('model') ||
      target.endsWith('Dto') ||
      target.endsWith('Contract');
    let riskLevel = 'LOW';
    if (totalAffectedFiles > 6 || isContract) {
      riskLevel = 'HIGH';
    } else if (totalAffectedFiles >= 3) {
      riskLevel = 'MEDIUM';
    }

    return {
      status: 'success',
      target,
      depth,
      blast_radius: {
        tier_1_direct: tier1,
        tier_2_transitive: tier2,
        affected_tests: affectedTests,
        affected_routes: affectedRoutes,
        risk_level: riskLevel,
        metrics: {
          total_affected_files: totalAffectedFiles,
          total_affected_callsites: tier1.length + tier2.length,
          has_breaking_contract_risk: isContract,
        },
      },
    };
  }

  getReviewContext(params = {}) {
    const rawFiles = Array.isArray(params.files) ? params.files : [];
    const files = rawFiles.filter(f => typeof f === 'string' && f.trim().length > 0);
    const parsedTokens = parseInt(params.max_tokens, 10);
    const maxTokens = !Number.isNaN(parsedTokens) && parsedTokens > 0 ? parsedTokens : DEFAULT_TOKEN_BUDGET;
    const includeCallerSignatures = params.include_caller_signatures !== false;
    const includeInterfaceContracts = params.include_interface_contracts !== false;
    const compressComments = params.compress_comments !== false;

    const slices = [];
    const referencedContracts = new Set();
    const primarySymbols = new Set();

    for (const relPath of files) {
      let absPath;
      try {
        absPath = path.isAbsolute(relPath) ? relPath : path.resolve(this.projectRoot, relPath);
      } catch {
        slices.push({
          file: relPath,
          type: 'primary_target',
          content: `// Invalid path: ${relPath}`,
        });
        continue;
      }

      let content = '';
      try {
        if (fs.existsSync(absPath)) {
          const stat = fs.statSync(absPath);
          if (stat.isFile()) {
            content = fs.readFileSync(absPath, 'utf8');
            if (compressComments) {
              content = this.stripComments(content);
            }
          } else {
            content = `// Invalid or directory path: ${relPath}`;
          }
        } else {
          content = `// File not found on disk: ${relPath}`;
        }
      } catch (err) {
        content = `// Error reading file: ${relPath} (${err.message})`;
      }

      slices.push({
        file: relPath,
        type: 'primary_target',
        content,
      });

      const fileRec = this.files.get(relPath.replace(/\\/g, '/'));
      if (fileRec) {
        for (const sym of fileRec.symbols) primarySymbols.add(sym.name);
        for (const imp of fileRec.imports) {
          for (const s of imp.symbols) {
            if (
              /^[A-Z]/.test(s) &&
              (s.endsWith('Dto') ||
                s.endsWith('Type') ||
                s.endsWith('Params') ||
                s.endsWith('Result') ||
                s.endsWith('Status') ||
                s.endsWith('Config'))
            ) {
              referencedContracts.add(s);
            }
          }
        }
      }
    }

    if (includeInterfaceContracts && referencedContracts.size > 0) {
      for (const contractSym of referencedContracts) {
        const nodes = this.symbolIndex.get(contractSym) || [];
        for (const node of nodes) {
          if (node.kind === 'interface' || node.kind === 'type' || node.kind === 'class') {
            const absContractPath = path.resolve(this.projectRoot, node.path);
            let contractSnippet = node.signature;
            if (fs.existsSync(absContractPath)) {
              try {
                const stat = fs.statSync(absContractPath);
                if (stat.isFile()) {
                  const fullText = fs.readFileSync(absContractPath, 'utf8');
                  const defRegex = new RegExp(
                    `export\\s+(interface|type|class)\\s+${contractSym}\\b[^{;]*(\\{[^}]*\\}|=[^;]+;)`,
                    'm',
                  );
                  const m = defRegex.exec(fullText);
                  if (m) contractSnippet = m[0];
                }
              } catch {}
            }
            slices.push({
              file: node.path,
              type: 'contract_definition',
              content: contractSnippet,
            });
          }
        }
      }
    }

    if (includeCallerSignatures && primarySymbols.size > 0) {
      for (const sym of primarySymbols) {
        for (const edge of this.edges) {
          if (edge.targetName === sym && (edge.relation === 'CALLS' || edge.relation === 'RENDERS')) {
            const callerNode = this.nodes.get(edge.source);
            if (callerNode && !files.includes(callerNode.path)) {
              slices.push({
                file: callerNode.path,
                type: 'caller_signature_stub',
                content: callerNode.signature || `// caller: ${callerNode.name}`,
              });
            }
          }
        }
      }
    }

    const budgetCharLimit = Math.floor(maxTokens * 3.8);
    let totalChars = 0;
    const finalSlices = [];
    const truncationMarker = '\n// ... [truncated to comply with token budget]';
    const markerLen = truncationMarker.length;

    for (const slice of slices) {
      const sliceChars = slice.content.length;
      if (totalChars + sliceChars <= budgetCharLimit) {
        finalSlices.push(slice);
        totalChars += sliceChars;
      } else {
        const remainingChars = budgetCharLimit - totalChars;
        if (remainingChars > markerLen + 10) {
          const sliceLen = Math.max(0, remainingChars - markerLen);
          const truncatedContent = slice.content.slice(0, sliceLen) + truncationMarker;
          finalSlices.push({
            ...slice,
            content: truncatedContent,
          });
          totalChars += truncatedContent.length;
        }
        break;
      }
    }

    const estimatedTokenCount = Math.ceil(totalChars / 4);

    return {
      status: 'success',
      token_count: estimatedTokenCount,
      budget_limit: maxTokens,
      slices: finalSlices,
      recommended_verification_command:
        files.length > 0 ? `yarn test ${files[0].replace(/\.[^.]+$/, '.spec.ts')}` : 'yarn test',
    };
  }

  stripComments(code) {
    let result = '';
    let i = 0;
    const n = code.length;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;

    while (i < n) {
      const ch = code[i];
      const next = code[i + 1];

      if (!inDoubleQuote && !inBacktick && ch === "'" && (i === 0 || code[i - 1] !== '\\')) {
        inSingleQuote = !inSingleQuote;
        result += ch;
        i++;
        continue;
      }

      if (!inSingleQuote && !inBacktick && ch === '"' && (i === 0 || code[i - 1] !== '\\')) {
        inDoubleQuote = !inDoubleQuote;
        result += ch;
        i++;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && ch === '`' && (i === 0 || code[i - 1] !== '\\')) {
        inBacktick = !inBacktick;
        result += ch;
        i++;
        continue;
      }

      if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
        if (ch === '/' && next === '/') {
          i += 2;
          while (i < n && code[i] !== '\n') i++;
          continue;
        }
        if (ch === '/' && next === '*') {
          i += 2;
          while (i + 1 < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
          i += 2;
          continue;
        }
      }

      result += ch;
      i++;
    }

    return result.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  }
}

function printHelp() {
  console.log(`code-review-graph v${VERSION} - Local AST Code Intelligence MCP Server

USAGE:
  node code-review-graph.mjs [OPTIONS]

OPTIONS:
  -h, --help     Show this help message and exit
  -v, --version  Print version information and exit
  -t, --test     Run standalone self-test suite and exit

ENVIRONMENT VARIABLES:
  CRG_PROJECT_ROOT          Base path for codebase analysis (default: current working directory)
  CRG_EXCLUDE_PATTERNS      Comma-separated list of directories to exclude (default: node_modules,dist,.next,build,.git,...)
  CRG_MAX_SEARCH_DEPTH      Maximum directory depth for AST indexing (default: 5)
  CRG_DEFAULT_TOKEN_BUDGET  Maximum token budget limit for context slicing (default: 2000)

AVAILABLE TOOLS:
  1. query_graph_tool        AST graph queries (find_symbol, find_callers, find_references, etc.)
  2. get_impact_radius       Transitive blast-radius calculation across 1-5 depths
  3. get_review_context_tool Token-budgeted surgical context extraction (<= 2000 tokens)
`);
}

function runSelfTests() {
  console.log(`[TEST] Running code-review-graph MCP Server Self-Test Suite...`);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  const graph = new CodebaseGraph();

  const initResponse = handleInitialize({ id: 1, jsonrpc: '2.0', method: 'initialize' });
  assert(
    initResponse.result && initResponse.result.serverInfo.name === SERVER_NAME,
    'JSON-RPC initialize returns valid server info',
  );

  const toolsResponse = handleToolsList({ id: 2, jsonrpc: '2.0', method: 'tools/list' });
  assert(
    toolsResponse.result && Array.isArray(toolsResponse.result.tools) && toolsResponse.result.tools.length === 3,
    'tools/list advertises exactly 3 tools',
  );

  const queryResp = graph.queryGraph({ query_type: 'find_symbol', symbol: 'CodebaseGraph' });
  assert(
    queryResp.status === 'success' && Array.isArray(queryResp.nodes),
    'query_graph_tool returns success status and nodes array',
  );

  const radiusResp = graph.getImpactRadius({ target: 'CodebaseGraph', depth: 2 });
  assert(
    radiusResp.status === 'success' &&
      radiusResp.blast_radius &&
      ['LOW', 'MEDIUM', 'HIGH'].includes(radiusResp.blast_radius.risk_level),
    'get_impact_radius computes valid blast radius with risk level',
  );

  const ctxResp = graph.getReviewContext({ files: ['agentc-v2/tools/mcp/code-review-graph.mjs'], max_tokens: 2000 });
  assert(
    ctxResp.status === 'success' && ctxResp.token_count <= 2000 && Array.isArray(ctxResp.slices),
    'get_review_context_tool slices context within 2000 token budget',
  );

  const rawSnippet = 'const x = 42; // some comment\n/* multi-line\ncomment */ const y = "keep";';
  const stripped = graph.stripComments(rawSnippet);
  assert(
    !stripped.includes('some comment') && stripped.includes('keep'),
    'stripComments safely strips comments while preserving code',
  );

  const zeroDepthResp = graph.getImpactRadius({ target: 'CodebaseGraph', depth: 0 });
  assert(zeroDepthResp.depth === 1, 'get_impact_radius clamps depth 0 to 1');

  const nonStringTargetResp = graph.getImpactRadius({ target: 123 });
  assert(nonStringTargetResp.status === 'success', 'get_impact_radius safely handles non-string target');

  const invalidRegexResp = graph.queryGraph({ query_type: 'find_symbol', path: 'src/**/[a-z', kinds: 123 });
  assert(invalidRegexResp.status === 'success', 'query_graph_tool safely handles invalid regex and non-array kinds');

  const dirContextResp = graph.getReviewContext({ files: ['.', null] });
  assert(
    dirContextResp.status === 'success',
    'get_review_context_tool safely handles directory and null files without EISDIR',
  );

  console.log(`\nSelf-test results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

function handleInitialize(req) {
  return {
    jsonrpc: '2.0',
    id: req.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
      serverInfo: {
        name: SERVER_NAME,
        version: VERSION,
      },
    },
  };
}

function handleToolsList(req) {
  return {
    jsonrpc: '2.0',
    id: req.id,
    result: {
      tools: TOOL_DEFINITIONS,
    },
  };
}

function handleToolCall(req, graph) {
  try {
    const params = req.params;
    if (!params || !params.name) {
      return {
        jsonrpc: '2.0',
        id: req.id !== undefined ? req.id : null,
        error: {
          code: -32602,
          message: 'Invalid params: missing tool name',
        },
      };
    }

    const toolName = params.name;
    const args = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};
    let toolResult;

    switch (toolName) {
      case 'query_graph_tool':
        toolResult = graph.queryGraph(args);
        break;
      case 'get_impact_radius':
        toolResult = graph.getImpactRadius(args);
        break;
      case 'get_review_context_tool':
        toolResult = graph.getReviewContext(args);
        break;
      default:
        return {
          jsonrpc: '2.0',
          id: req.id !== undefined ? req.id : null,
          error: {
            code: -32602,
            message: `Unknown tool: ${toolName}`,
          },
        };
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(toolResult, null, 2),
          },
        ],
        status: 'success',
        ...toolResult,
      },
    };
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id: req.id !== undefined ? req.id : null,
      error: {
        code: -32603,
        message: `Internal error: ${err.message}`,
      },
    };
  }
}

function startStdioServer() {
  let graph = null;
  function getGraph() {
    if (!graph) {
      graph = new CodebaseGraph();
    }
    return graph;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', line => {
    try {
      const trimmed = line.trim();
      if (!trimmed) return;

      let req;
      try {
        req = JSON.parse(trimmed);
      } catch {
        const parseError = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error: Invalid JSON',
          },
        };
        process.stdout.write(JSON.stringify(parseError) + '\n');
        return;
      }

      if (!req || typeof req !== 'object') {
        const parseError = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error: Request must be an object',
          },
        };
        process.stdout.write(JSON.stringify(parseError) + '\n');
        return;
      }

      const method = req.method;

      if (method === 'initialize') {
        const res = handleInitialize(req);
        process.stdout.write(JSON.stringify(res) + '\n');
        return;
      }

      if (method === 'notifications/initialized' || method === 'initialized') {
        return;
      }

      if (method === 'tools/list') {
        const res = handleToolsList(req);
        process.stdout.write(JSON.stringify(res) + '\n');
        return;
      }

      if (method === 'tools/call') {
        const res = handleToolCall(req, getGraph());
        process.stdout.write(JSON.stringify(res) + '\n');
        return;
      }

      if (method === 'ping') {
        const res = { jsonrpc: '2.0', id: req.id, result: {} };
        process.stdout.write(JSON.stringify(res) + '\n');
        return;
      }

      const methodNotFound = {
        jsonrpc: '2.0',
        id: req.id !== undefined ? req.id : null,
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
      };
      process.stdout.write(JSON.stringify(methodNotFound) + '\n');
    } catch (topErr) {
      const internalErr = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: `Internal error: ${topErr.message}`,
        },
      };
      process.stdout.write(JSON.stringify(internalErr) + '\n');
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }
  if (args.includes('-v') || args.includes('--version')) {
    console.log(`code-review-graph v${VERSION}`);
    process.exit(0);
  }
  if (args.includes('-t') || args.includes('--test')) {
    runSelfTests();
    return;
  }

  startStdioServer();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { CodebaseGraph, SERVER_NAME, VERSION };
