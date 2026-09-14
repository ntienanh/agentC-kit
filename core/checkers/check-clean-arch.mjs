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
Usage: check-clean-arch.sh [options] [target_dir]

Options:
  --target <dir> Target directory to scan (default: current working directory)
  -h, --help     Show this help message

Enforces Invariants 29, 34, 37, 38, 41:
- Invariant 29: Anti-Toy Architecture (no inline HTML strings in server code)
- Invariant 34: Unit Spec Co-location (no isolated src/specs/ or src/__tests__/)
- Invariant 37: Strict Utility Scoping (no util files inside src/app/)
- Invariant 38: Monorepo Unified Design Tokens (no arbitrary hex colors in UI)
- Invariant 41: Anti-Magic Numbers & Canonical Enums
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

let globalFileScannedCount = 0;
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
    } else {
      results.push(full); globalFileScannedCount++;
    }
  }
  return results;
}

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

  return srcDirs;
}

// 1. INVARIANT 34: ANTI-ISOLATED SPECS (Unit Spec Co-location)
function findProhibitedSpecDirs(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.name === 'specs' || entry.name === '__tests__') {
        results.push(full); globalFileScannedCount++;
      }
      results.push(...findProhibitedSpecDirs(full));
    }
  }
  return results;
}

const srcDirs = findSrcDirectories(targetDir);
for (const sDir of srcDirs) {
  const prohibitedDirs = findProhibitedSpecDirs(sDir);
  for (const pDir of prohibitedDirs) {
    totalViolations++;
    const rel = path.relative(targetDir, pDir);
    console.error(`\x1b[31m[INVARIANT-34 ISOLATED-SPECS]\x1b[0m Forbidden isolated spec folder found: ${rel}`);
    console.error(`    Remediation: Move unit specs side-by-side (co-located) with their target source files.`);
  }
}

// 2. INVARIANT 37: UTILITY SCOPING (No util in src/app/)
function findAppDirs(base) {
  const appDirs = [];
  for (const sDir of srcDirs) {
    const appDir = path.join(sDir, 'app');
    if (fs.existsSync(appDir)) {
      appDirs.push(appDir);
    }
  }
  return appDirs;
}

const appDirs = findAppDirs(targetDir);
for (const aDir of appDirs) {
  const allAppFiles = walk(aDir);
  for (const file of allAppFiles) {
    const baseName = path.basename(file);
    if (/.*util.*\.ts$/i.test(baseName) || /.*utils.*\.ts$/i.test(baseName)) {
      totalViolations++;
      const rel = path.relative(targetDir, file);
      console.error(`\x1b[31m[INVARIANT-37 UTIL-IN-APP]\x1b[0m Utility file placed inside App Router: ${rel}`);
      console.error(`    Remediation: Move utility to src/shared/utils/ or feature logic hook.`);
    }
  }
}

// 3. INVARIANT 29: ANTI-TOY ARCHITECTURE (No inline HTML in backend/server)
for (const sDir of srcDirs) {
  const allFiles = walk(sDir).filter(
    (f) =>
      (/\.(ts|js)$/.test(f) && !/\.(spec|test|d)\.ts$/.test(f)) &&
      (f.includes('/server/') ||
        f.includes('/be/') ||
        f.includes('/modules/') ||
        f.includes('app.ts') ||
        f.includes('controller') ||
        f.includes('service'))
  );

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (
        /<(?:!DOCTYPE\s+html|html\b|body\b|div\b|h[1-6]\b|table\b|p\b)[^>]*>/i.test(line) &&
        (line.includes('`') || line.includes('"') || line.includes("'")) &&
        !file.endsWith('.tsx') &&
        !file.endsWith('.jsx')
      ) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-29 ANTI-TOY]\x1b[0m Inline HTML string in server code: ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: UI must be an independent React / Next.js component application.`);
      }
    });
  }
}

// 4. INVARIANT 41: MAGIC NUMBERS IN BUSINESS CODE
for (const sDir of srcDirs) {
  const bizFiles = walk(sDir).filter(
    (f) =>
      /\.(ts|tsx)$/.test(f) &&
      !/\.(d|spec|test)\.ts$/.test(f) &&
      !f.includes('/utils/') &&
      !f.includes('.util.') &&
      !f.includes('.config.') &&
      !f.includes('.constants.') &&
      !f.includes('/constants/') &&
      !f.includes('/tokens/') &&
      (f.includes('/features/') || f.includes('/modules/') || f.includes('/server/'))
  );

  for (const file of bizFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      const magicMatches = [
        /(?:waitTime|timeout|delay|sleep|duration|interval|expire)\s*[:=]\s*(\d+)/i,
        /setTimeout\s*\([^,]+,\s*(\d+)\)/,
        /setInterval\s*\([^,]+,\s*(\d+)\)/,
      ];

      for (const rx of magicMatches) {
        const m = line.match(rx);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > 10) {
            totalViolations++;
            const rel = path.relative(targetDir, file);
            console.error(`\x1b[31m[INVARIANT-41 MAGIC-NUMBER]\x1b[0m Magic number '${num}' in business code: ${rel}:${idx + 1}`);
            console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
            console.error(`    Remediation: Extract magic number to centralized UI_TIMING or feature constants.`);
            break;
          }
        }
      }
    });
  }
}

// 5. INVARIANT 38: ARBITRARY HEX COLORS IN UI
for (const sDir of srcDirs) {
  const uiFiles = walk(sDir).filter(
    (f) =>
      (/\.(tsx|ts)$/.test(f) && !/\.(d|spec|test)\.ts$/.test(f)) &&
      (f.includes('/ui/') || f.includes('/components/') || f.includes('/features/')) &&
      !f.includes('palette.') &&
      !f.includes('theme.') &&
      !f.includes('token.') &&
      !f.includes('color.')
  );

  for (const file of uiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      const hexMatch = line.match(/(['"`])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\1/);
      if (hexMatch) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-38 ARBITRARY-HEX]\x1b[0m Raw hex color '${hexMatch[0]}' in UI component: ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: Use design token or semantic status token from @repo/design-tokens.`);
      }
    });
  }
}

// 6. BE CLEAN ARCHITECTURE 4-LAYER CHECK
const beModulesDirCandidates = [
  path.join(targetDir, 'be/src/modules'),
  path.join(targetDir, 'be-nestjs/src/modules'),
  path.join(targetDir, 'nestjs-starter-template/src/modules'),
  path.join(targetDir, 'src/modules'),
];

for (const bDir of beModulesDirCandidates) {
  if (fs.existsSync(bDir)) {
    try {
      const modules = fs.readdirSync(bDir, { withFileTypes: true });
      for (const m of modules) {
        if (m.isDirectory()) {
          const modPath = path.join(bDir, m.name);
          const requiredLayers = ['domain', 'application', 'infrastructure', 'presentation'];
          for (const layer of requiredLayers) {
            const layerPath = path.join(modPath, layer);
            if (!fs.existsSync(layerPath)) {
              totalViolations++;
              const rel = path.relative(targetDir, layerPath);
              console.error(`\x1b[31m[CLEAN-ARCH-LAYER]\x1b[0m BE Module '${m.name}' missing required layer: ${rel}/`);
              console.error(`    Remediation: Create missing Clean Architecture layer directory.`);
            }
          }
        }
      }
    } catch {}
  }
}

if (globalFileScannedCount === 0) { console.error("\n\x1b[31m[FAIL] Zero files audited.\x1b[0m"); process.exit(1); }
if (totalViolations > 0) {
  console.error(`\n\x1b[31m[FAIL] Found ${totalViolations} Clean Architecture violation(s).\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m[PASS] Invariants 29, 34, 37, 38, 41: Clean Architecture verified.\x1b[0m`);
process.exit(0);
