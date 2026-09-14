#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let targetInput = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--target') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      targetInput = args[++i];
    }
  } else if (arg === '-h' || arg === '--help') {
    console.log(`
Usage: check-no-barrels.sh [options] [target_dir]

Options:
  --target <dir> Target directory to scan (default: current working directory)
  -h, --help     Show this help message

Enforces Invariant 33: Direct Import & Anti-Barrel Proliferation.
Detects God Barrels (src/components/index.ts, src/shared/index.ts, etc.) and barrel imports.
Exit code: 0 = PASS, 1 = FAIL.
`);
    process.exit(0);
  } else if (!arg.startsWith('-') && !targetInput) {
    targetInput = arg;
  }
}

const targetDir = targetInput ? path.resolve(targetInput) : process.cwd();

if (!fs.existsSync(targetDir)) {
  console.error(`\x1b[31mError: Target directory does not exist: ${targetDir}\x1b[0m`);
  process.exit(1);
}

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.yarn',
  'dist',
  '.next',
  'build',
  '.turbo',
  'coverage',
  '.cache',
  '__redteam_fixture__',
  'sites',
]);

let totalViolations = 0;
let totalScanned = 0;

function isPackageBoundary(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.includes('/packages/') ||
    normalized.includes('@repo/contracts') ||
    normalized.includes('/contracts/src/')
  );
}

function findProhibitedBarrels(base) {
  const candidateWorkspaces = ['.', 'be', 'be-nestjs', 'nestjs-starter-template', 'cms', 'cms-antd', 'fo', 'fo-shadcn', 'templates/be', 'templates/cms', 'templates/fo', 'templates/packages'];

  const barrelRelPaths = [
    'src/components/index.ts',
    'src/components/index.tsx',
    'src/shared/index.ts',
    'src/shared/index.tsx',
    'src/shared/ui/index.ts',
    'src/shared/ui/index.tsx',
    'src/layouts/index.ts',
    'src/layouts/index.tsx',
  ];

  for (const cw of candidateWorkspaces) {
    const wsDir = path.resolve(base, cw);
    if (!fs.existsSync(wsDir)) continue;

    for (const barrel of barrelRelPaths) {
      const fullPath = path.join(wsDir, barrel);
      if (fs.existsSync(fullPath) && !isPackageBoundary(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8').trim();
          if (content.length > 0) {
            const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
            const nonTypeExports = lines.filter(
              (l) =>
                (l.startsWith('export ') || l.startsWith('export*')) &&
                !l.startsWith('export type ') &&
                !l.startsWith('export type{')
            );
            if (nonTypeExports.length > 0 || content.includes('export *')) {
              totalViolations++;
              const rel = path.relative(targetDir, fullPath);
              console.error(`\x1b[31m[INVARIANT-33 GOD-BARREL]\x1b[0m Prohibited high-level barrel file found: ${rel}`);
              console.error(`    Remediation: Delete God Barrel and use Direct Component Imports.`);
            }
          }
        } catch {}
      }
    }

    const beModulesDir = path.join(wsDir, 'src/modules');
    if (fs.existsSync(beModulesDir) && !isPackageBoundary(beModulesDir)) {
      try {
        const modules = fs.readdirSync(beModulesDir, { withFileTypes: true });
        for (const m of modules) {
          if (m.isDirectory()) {
            const modIndex = path.join(beModulesDir, m.name, 'index.ts');
            if (fs.existsSync(modIndex)) {
              const modContent = fs.readFileSync(modIndex, 'utf8');
              if (/export\s+.*(Service|Controller|Repository)/.test(modContent)) {
                totalViolations++;
                const rel = path.relative(targetDir, modIndex);
                console.error(`\x1b[31m[INVARIANT-33 BE-BARREL]\x1b[0m Prohibited backend module barrel found: ${rel}`);
                console.error(`    Remediation: Remove barrel re-exports of NestJS providers to prevent circular DI.`);
              }
            }
          }
        }
      } catch {}
    }
  }
}

findProhibitedBarrels(targetDir);

function findSrcDirectories(base) {
  const srcDirs = [];
  if (path.basename(base) === 'src') {
    srcDirs.push(base);
    return srcDirs;
  }

  const directSrc = path.join(base, 'src');
  if (fs.existsSync(directSrc)) {
    srcDirs.push(directSrc);
  }

  const candidateWorkspaces = ['be', 'be-nestjs', 'nestjs-starter-template', 'cms', 'cms-antd', 'fo', 'fo-shadcn', 'templates/be', 'templates/cms', 'templates/fo', 'templates/packages'];
  for (const cw of candidateWorkspaces) {
    const s = path.join(base, cw, 'src');
    if (fs.existsSync(s) && !srcDirs.includes(s)) {
      srcDirs.push(s);
    }
  }

  const appsDir = path.join(base, 'apps');
  if (fs.existsSync(appsDir)) {
    try {
      const entries = fs.readdirSync(appsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const s = path.join(appsDir, entry.name, 'src');
          if (fs.existsSync(s) && !srcDirs.includes(s)) {
            srcDirs.push(s);
          }
        }
      }
    } catch {}
  }

  const packagesDir = path.join(base, 'packages');
  if (fs.existsSync(packagesDir)) {
    try {
      const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const s = path.join(packagesDir, entry.name, 'src');
          if (fs.existsSync(s) && !srcDirs.includes(s)) {
            srcDirs.push(s);
          }
        }
      }
    } catch {}
  }

  return srcDirs;
}

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        results.push(...walk(full));
      }
    } else if (
      /\.(ts|tsx|js|jsx)$/.test(entry.name) &&
      !/\.(d|spec|test|e2e-spec)\.(ts|tsx|js|jsx)$/.test(entry.name)
    ) {
      results.push(full);
    }
  }
  return results;
}

function maskComments(code) {
  let inString = null;
  let inTemplate = false;
  let isEscaped = false;
  const chars = code.split('');

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (c === '\\') {
      isEscaped = true;
      continue;
    }
    if (inString) {
      if (c === inString) inString = null;
      continue;
    }
    if (inTemplate) {
      if (c === '`') inTemplate = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = c;
      continue;
    }
    if (c === '`') {
      inTemplate = true;
      continue;
    }
    if (c === '/' && chars[i + 1] === '/') {
      while (i < chars.length && chars[i] !== '\n') {
        chars[i] = ' ';
        i++;
      }
      continue;
    }
    if (c === '/' && chars[i + 1] === '*') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      i += 2;
      while (i < chars.length - 1 && !(chars[i] === '*' && chars[i + 1] === '/')) {
        if (chars[i] !== '\n') chars[i] = ' ';
        i++;
      }
      if (i < chars.length) chars[i] = ' ';
      if (i + 1 < chars.length) chars[i + 1] = ' ';
      i++;
      continue;
    }
  }
  return chars.join('');
}

const srcDirs = findSrcDirectories(targetDir);
for (const sDir of srcDirs) {
  const files = walk(sDir);
  totalScanned += files.length;
  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (!content || content.trim().length === 0) continue;

    const masked = maskComments(content);
    const importRegex = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(masked)) !== null) {
      const importedClause = match[1].trim();
      const specifier = match[2].trim();
      const lineNum = masked.slice(0, match.index).split('\n').length;
      const rel = path.relative(targetDir, file);
      const displaySnippet = match[0].replace(/\s+/g, ' ').trim();

      const isHighLevelBarrel =
        /^@\/(components|shared|shared\/ui|layouts)(\/index(\.[jt]sx?)?)?\/?$/.test(specifier) ||
        /^(?:\.\.\/|\.\/)+(components|shared|shared\/ui|layouts)(\/index(\.[jt]sx?)?)?\/?$/.test(specifier);

      let resolvesToProhibitedBarrel = false;
      if (specifier.startsWith('.')) {
        try {
          const resolved = path.resolve(path.dirname(file), specifier);
          const relToSrc = path.relative(sDir, resolved).replace(/\\/g, '/');
          if (/^(components|shared|shared\/ui|layouts)(\/index(\.[jt]sx?)?)?$/.test(relToSrc)) {
            resolvesToProhibitedBarrel = true;
          }
        } catch {}
      }

      if (isHighLevelBarrel || resolvesToProhibitedBarrel) {
        totalViolations++;
        console.error(`\x1b[31m[INVARIANT-33 BARREL-IMPORT]\x1b[0m ${rel}:${lineNum}`);
        console.error(`    Line: \x1b[33m${displaySnippet}\x1b[0m`);
        console.error(`    Remediation: Use direct component import (e.g. '@/shared/ui/button/AppButton').`);
      }

      const hasBackendSymbols = /(?:Service|Controller|Repository)\b/.test(importedClause);
      const isBackendBarrelSpec =
        (/^@\/modules\/[a-zA-Z0-9_-]+(\/index(\.[jt]sx?)?)?\/?$/.test(specifier) ||
          (/^(?:\.\.\/|\.\/)+[a-zA-Z0-9_-]+(\/index(\.[jt]sx?)?)?\/?$/.test(specifier) &&
            !/\.(service|controller|repository|entity|dto|module)\b/.test(specifier))) &&
        !specifier.endsWith('/base') &&
        !specifier.endsWith('/enum');

      if (hasBackendSymbols && isBackendBarrelSpec) {
        totalViolations++;
        console.error(`\x1b[31m[INVARIANT-33 BE-CROSS-BARREL]\x1b[0m ${rel}:${lineNum}`);
        console.error(`    Line: \x1b[33m${displaySnippet}\x1b[0m`);
        console.error(`    Remediation: Import service directly from file (e.g. "../users/users.service").`);
      }
    }
  }
}

if (totalScanned === 0) { console.error(`\n\x1b[31m[FAIL] Zero files audited.\x1b[0m`); process.exit(1); }
if (totalViolations > 0) {
  console.error(`\n\x1b[31m[FAIL] Found ${totalViolations} Invariant 33 barrel violation(s).\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m[PASS] Invariant 33: Zero barrel violations detected.\x1b[0m`);
process.exit(0);
