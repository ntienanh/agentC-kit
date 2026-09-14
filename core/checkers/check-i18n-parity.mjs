#!/usr/bin/env node
let globalFileScannedCount = 0;

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
Usage: check-i18n-parity.sh [options] [target_dir]

Options:
  --target <dir> Target directory to scan (default: current working directory)
  -h, --help     Show this help message

Enforces Invariant 36: Domain-Scoped i18n & Zero Hardcoded Literals.
- Validates 1-to-1 dictionary parity between en and vi
- Rejects monolithic flat God JSON files (messages/{en,vi}.json)
- Validates JSON syntax and flags empty translation values
- Detects hardcoded UI text literals in JSX/TSX
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

function findMessagesDirectories(base) {
  const msgDirs = [];
  const directMessages = path.join(base, 'messages');
  if (fs.existsSync(directMessages)) {
    msgDirs.push(directMessages);
  }

  const candidateWorkspaces = ['be', 'be-nestjs', 'nestjs-starter-template', 'cms', 'cms-antd', 'fo', 'fo-shadcn', 'templates/be', 'templates/cms', 'templates/fo', 'templates/packages'];

  for (const cw of candidateWorkspaces) {
    const md = path.join(base, cw, 'messages');
    if (fs.existsSync(md) && !msgDirs.includes(md)) {
      msgDirs.push(md);
    }
  }

  return msgDirs;
}

function getJsonFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        results.push(...getJsonFiles(full));
      }
    } else if (entry.name.endsWith('.json')) {
      results.push(full); globalFileScannedCount++;
    }
  }
  return results;
}

function flattenKeys(obj, prefix = '') {
  let entries = [];
  if (!obj || typeof obj !== 'object') return entries;

  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      entries.push(...flattenKeys(v, fullKey));
    } else {
      entries.push({ key: fullKey, value: v });
    }
  }
  return entries;
}

// 1. CHECK MESSAGES DIRECTORIES & PARITY
const messagesDirs = findMessagesDirectories(targetDir);

for (const mDir of messagesDirs) {
  // Check for monolithic god JSON files
  const godJsonCandidates = ['en.json', 'vi.json', 'br.json'];
  for (const god of godJsonCandidates) {
    const godPath = path.join(mDir, god);
    if (fs.existsSync(godPath)) {
      totalViolations++;
      const rel = path.relative(targetDir, godPath);
      console.error(`\x1b[31m[INVARIANT-36 GOD-JSON]\x1b[0m Monolithic flat dictionary detected: ${rel}`);
      console.error(`    Remediation: Use domain-scoped dictionaries in messages/{locale}/{domain}.json`);
    }
  }

  const enDir = path.join(mDir, 'en');
  const viDir = path.join(mDir, 'vi');

  if (fs.existsSync(enDir) || fs.existsSync(viDir)) {
    const enFiles = getJsonFiles(enDir);
    const viFiles = getJsonFiles(viDir);

    for (const file of [...enFiles, ...viFiles]) {
      try {
        JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch (err) {
        totalViolations++;
        const relPath = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-36 MALFORMED-JSON]\x1b[0m Invalid JSON syntax in ${relPath}: ${err.message}`);
      }
    }

    for (const enFile of enFiles) {
      const rel = path.relative(enDir, enFile);
      const viFile = path.join(viDir, rel);

      if (!fs.existsSync(viFile)) {
        totalViolations++;
        const relPath = path.relative(targetDir, viFile);
        console.error(`\x1b[31m[INVARIANT-36 MISSING-FILE]\x1b[0m Missing Vietnamese file: ${relPath}`);
        continue;
      }

      let enData, viData;
      try {
        enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
      } catch {
        continue;
      }

      try {
        viData = JSON.parse(fs.readFileSync(viFile, 'utf8'));
      } catch {
        continue;
      }

      const enEntries = flattenKeys(enData);
      const viEntries = flattenKeys(viData);

      const enKeyMap = new Map(enEntries.map((e) => [e.key, e.value]));
      const viKeyMap = new Map(viEntries.map((e) => [e.key, e.value]));

      for (const [key, enVal] of enKeyMap.entries()) {
        if (!viKeyMap.has(key)) {
          totalViolations++;
          const relPath = path.relative(targetDir, viFile);
          console.error(`\x1b[31m[INVARIANT-36 KEY-DIVERGENCE]\x1b[0m Key '${key}' missing in ${relPath}`);
        } else {
          const viVal = viKeyMap.get(key);
          if (
            typeof enVal === 'string' &&
            enVal.trim().length > 0 &&
            typeof viVal === 'string' &&
            viVal.trim().length === 0
          ) {
            totalViolations++;
            const relPath = path.relative(targetDir, viFile);
            console.error(`\x1b[31m[INVARIANT-36 EMPTY-VALUE]\x1b[0m Empty translation string for key '${key}' in ${relPath}`);
          }
        }
      }

      for (const key of viKeyMap.keys()) {
        if (!enKeyMap.has(key)) {
          totalViolations++;
          const relPath = path.relative(targetDir, viFile);
          console.error(`\x1b[31m[INVARIANT-36 EXTRA-KEY]\x1b[0m Extraneous key '${key}' in ${relPath} not present in en`);
        }
      }
    }

    for (const viFile of viFiles) {
      const rel = path.relative(viDir, viFile);
      const enFile = path.join(enDir, rel);
      if (!fs.existsSync(enFile)) {
        totalViolations++;
        const relPath = path.relative(targetDir, enFile);
        console.error(`\x1b[31m[INVARIANT-36 MISSING-FILE]\x1b[0m Missing English file: ${relPath}`);
      }
    }
  }
}

// 2. CHECK HARDCODED UI TEXT LITERALS IN TSX
function findTsxFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        results.push(...findTsxFiles(full));
      }
    } else if (
      entry.name.endsWith('.tsx') &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      results.push(full); globalFileScannedCount++;
    }
  }
  return results;
}

const candidateSrcRoots = [
  path.join(targetDir, 'src'),
  path.join(targetDir, 'cms/src'),
  path.join(targetDir, 'cms-antd/src'),
  path.join(targetDir, 'fo/src'),
  path.join(targetDir, 'fo-shadcn/src'),
  path.join(targetDir, 'apps/cms/src'),
  path.join(targetDir, 'apps/fo/src'),
  path.join(targetDir, 'apps/web/src'),
];

for (const sRoot of candidateSrcRoots) {
  if (!fs.existsSync(sRoot)) continue;
  const tsxFiles = findTsxFiles(sRoot);

  for (const file of tsxFiles) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      const jsxTextMatches = line.matchAll(/>([^<]+)</g);
      for (const m of jsxTextMatches) {
        const text = m[1].trim();
        if (text.length === 0) continue;
        if (text.startsWith('{') && text.endsWith('}')) continue;
        if (/^[0-9\s.,:;!?()_+\-*\/#%&$@=~^|\\<>[\]]+$/.test(text)) continue;

        if (/[a-zA-Z\u00C0-\u024F\u1EA0-\u1EF9]{2,}/.test(text)) {
          totalViolations++;
          const rel = path.relative(targetDir, file);
          console.error(`\x1b[31m[INVARIANT-36 HARDCODED-LITERAL]\x1b[0m ${rel}:${idx + 1}`);
          console.error(`    Literal text: \x1b[33m"${text}"\x1b[0m`);
          console.error(`    Remediation: Replace hardcoded UI text with useTranslations() hook key.`);
        }
      }
    });
  }
}

if (globalFileScannedCount === 0) { console.error("\n\x1b[31m[FAIL] Zero files audited.\x1b[0m"); process.exit(1); }
if (totalViolations > 0) {
  console.error(`\n\x1b[31m[FAIL] Found ${totalViolations} Invariant 36 i18n violation(s).\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m[PASS] Invariant 36: 100% domain-scoped i18n parity verified.\x1b[0m`);
process.exit(0);
