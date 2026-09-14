#!/usr/bin/env node

/**
 * ============================================================================
 * AUTOMATED CODE CLEANUP: ZERO-NOISE COMMENT STRIPPER (INVARIANT 31)
 * ============================================================================
 * 
 * Automatically scans and cleans noise comments (explanatory comments, decorative
 * banners, numbered procedural comments, dead code headers) from source code
 * across all monorepo workspaces while strictly preserving compiler & linter
 * directives (eslint, @ts-*, istanbul, vitest, jest, triple-slash directives).
 * 
 * Features:
 *   - Dynamic Workspace Resolution (auto-detects 'be' | 'be-nestjs' | 'nestjs-starter-template',
 *     'cms' | 'cms-antd', 'fo' | 'fo-shadcn', and 'packages/*')
 *   - String-aware inline comment parsing (no corruption of URLs or strings)
 *   - Dry-run mode (--dry-run) for previewing changes
 *   - Compatible with Kit Root, templates/, and individual project directories
 * 
 * Usage:
 *   node tools/cleanup/strip-comments.mjs [targetDir] [options]
 *   node tools/cleanup/strip-comments.mjs --target <targetDir> [options]
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BLUE = '\x1b[34m';

const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  '.next',
  '.git',
  '.yarn',
  'build',
  '.turbo',
  'coverage',
  '.cache',
  '__redteam_fixture__',
]);

function printHelp() {
  console.log(`
${BOLD}${CYAN}Clean Code & Invariant 31 Comment Stripper${RESET}
Automated removal of noise comments, banner art, and redundant comments.

${BOLD}USAGE:${RESET}
  node tools/cleanup/strip-comments.mjs [targetDir] [options]
  node tools/cleanup/strip-comments.mjs --target <targetDir> [options]

${BOLD}OPTIONS:${RESET}
  ${GREEN}--dry-run${RESET}          Preview changes without modifying files
  ${GREEN}--target <dir>${RESET}     Target base directory to clean (default: auto-detected)
  ${GREEN}-v, --verbose${RESET}      Print each file scanned and modified
  ${GREEN}-h, --help${RESET}         Show this help message

${BOLD}DYNAMIC WORKSPACE RESOLUTION:${RESET}
  Auto-detects active workspace layout:
  - Backend:  ${CYAN}be${RESET} | ${CYAN}be-nestjs${RESET} | ${CYAN}nestjs-starter-template${RESET}
  - CMS:      ${CYAN}cms${RESET} | ${CYAN}cms-antd${RESET}
  - FO:       ${CYAN}fo${RESET} | ${CYAN}fo-shadcn${RESET}
  - Packages: ${CYAN}packages/*/src${RESET} (e.g. packages/contracts)
  - Direct:   ${CYAN}<targetDir>/src${RESET} (if targeting an individual workspace)

${BOLD}EXAMPLES:${RESET}
  ${DIM}# Preview cleaning in default template workspace${RESET}
  node tools/cleanup/strip-comments.mjs --dry-run

  ${DIM}# Clean comments in templates/ directory${RESET}
  node tools/cleanup/strip-comments.mjs templates

  ${DIM}# Clean comments in booking-spa5 project with dry-run${RESET}
  node tools/cleanup/strip-comments.mjs booking-spa5 --dry-run

  ${DIM}# Clean comments in a specific workspace${RESET}
  node tools/cleanup/strip-comments.mjs templates/be
`);
}

function parseCliArgs() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('-v') || args.includes('--verbose');

  let targetInput = null;
  const targetIdx = args.indexOf('--target');
  if (targetIdx !== -1 && args[targetIdx + 1] && !args[targetIdx + 1].startsWith('--')) {
    targetInput = args[targetIdx + 1];
  } else {
    const nonFlagArgs = args.filter((a) => !a.startsWith('-'));
    if (nonFlagArgs.length > 0) {
      targetInput = nonFlagArgs[0];
    }
  }

  return { dryRun, verbose, targetInput };
}

function resolveBaseDir(targetInput) {
  if (targetInput) {
    return path.resolve(process.cwd(), targetInput);
  }

  const cwd = process.cwd();
  const cwdCandidates = ['be', 'be-nestjs', 'nestjs-starter-template', 'cms', 'cms-antd', 'fo', 'fo-shadcn'];
  if (cwdCandidates.some((name) => fs.existsSync(path.join(cwd, name)))) {
    return cwd;
  }

  if (fs.existsSync(path.join(cwd, 'templates'))) {
    return path.join(cwd, 'templates');
  }

  const kitRoot = path.resolve(__dirname, '../..');
  if (fs.existsSync(path.join(kitRoot, 'templates'))) {
    return path.join(kitRoot, 'templates');
  }

  return cwd;
}

function resolveWorkspaceSrcDirs(baseDir) {
  const srcDirs = [];
  const resolved = {
    be: null,
    cms: null,
    fo: null,
    packages: [],
    direct: null,
  };

  if (!fs.existsSync(baseDir)) {
    return { srcDirs, resolved };
  }

  const directSrc = path.join(baseDir, 'src');
  const hasSubWorkspaces = ['be', 'be-nestjs', 'nestjs-starter-template', 'cms', 'cms-antd', 'fo', 'fo-shadcn']
    .some((sub) => fs.existsSync(path.join(baseDir, sub)));

  if (fs.existsSync(directSrc) && !hasSubWorkspaces) {
    srcDirs.push(directSrc);
    resolved.direct = directSrc;
    return { srcDirs, resolved };
  }

  const beCandidates = [
    'be',
    'be-nestjs',
    'nestjs-starter-template',
    'apps/be',
    'apps/nestjs-starter-template',
  ];
  for (const cand of beCandidates) {
    const candSrc = path.join(baseDir, cand, 'src');
    if (fs.existsSync(candSrc)) {
      srcDirs.push(candSrc);
      resolved.be = cand;
      break;
    }
  }

  const cmsCandidates = [
    'cms',
    'cms-antd',
    'apps/cms',
    'apps/cms-antd',
  ];
  for (const cand of cmsCandidates) {
    const candSrc = path.join(baseDir, cand, 'src');
    if (fs.existsSync(candSrc)) {
      srcDirs.push(candSrc);
      resolved.cms = cand;
      break;
    }
  }

  const foCandidates = [
    'fo',
    'fo-shadcn',
    'apps/fo',
    'apps/fo-shadcn',
  ];
  for (const cand of foCandidates) {
    const candSrc = path.join(baseDir, cand, 'src');
    if (fs.existsSync(candSrc)) {
      srcDirs.push(candSrc);
      resolved.fo = cand;
      break;
    }
  }

  const packagesDir = path.join(baseDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    try {
      const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pkgSrc = path.join(packagesDir, entry.name, 'src');
          if (fs.existsSync(pkgSrc)) {
            srcDirs.push(pkgSrc);
            resolved.packages.push(`packages/${entry.name}`);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return { srcDirs, resolved };
}

function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        results.push(...walkDir(full));
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') ||
        entry.name.endsWith('.tsx') ||
        entry.name.endsWith('.js') ||
        entry.name.endsWith('.jsx') ||
        entry.name.endsWith('.mjs')) &&
      !entry.name.endsWith('.d.ts') &&
      !entry.name.endsWith('.spec.ts') &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.e2e-spec.ts')
    ) {
      results.push(full);
    }
  }
  return results;
}

function isDirectiveComment(commentText) {
  return (
    commentText.startsWith('///') ||
    commentText.includes('eslint-disable') ||
    commentText.includes('eslint-enable') ||
    commentText.includes('@ts-ignore') ||
    commentText.includes('@ts-expect-error') ||
    commentText.includes('@ts-nocheck') ||
    commentText.includes('@ts-check') ||
    commentText.includes('istanbul ignore') ||
    commentText.includes('vitest') ||
    commentText.includes('jest') ||
    commentText.includes('prettier-ignore')
  );
}

function findInlineCommentIndex(line) {
  let inString = null;
  let isEscaped = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    if (char === '/' && line[i + 1] === '/') {
      return i;
    }
  }

  return -1;
}

function stripCommentsFromFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let inBlockComment = false;
  let inDirectiveBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('///')) {
      newLines.push(line);
      continue;
    }

    if (inDirectiveBlock) {
      newLines.push(line);
      if (line.includes('*/')) {
        inDirectiveBlock = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (line.includes('*/')) {
        inBlockComment = false;
        const after = line.split('*/')[1];
        if (after && after.trim()) {
          newLines.push(after);
        }
      }
      continue;
    }

    if (trimmed.startsWith('/*') || trimmed.startsWith('/**')) {
      if (isDirectiveComment(trimmed)) {
        newLines.push(line);
        if (!trimmed.includes('*/')) {
          inDirectiveBlock = true;
        }
        continue;
      }

      if (line.includes('*/')) {
        const before = line.substring(0, line.indexOf('/*'));
        const after = line.substring(line.indexOf('*/') + 2);
        const remaining = before + after;
        if (remaining.trim()) {
          newLines.push(remaining);
        }
      } else {
        inBlockComment = true;
      }
      continue;
    }

    if (trimmed.startsWith('//')) {
      if (isDirectiveComment(trimmed)) {
        newLines.push(line);
      }
      continue;
    }

    let cleanLine = line;
    const commentIdx = findInlineCommentIndex(line);
    if (commentIdx > -1) {
      const commentPart = line.substring(commentIdx);
      if (isDirectiveComment(commentPart)) {
        newLines.push(line);
        continue;
      }
      const beforeComment = line.substring(0, commentIdx);
      const isUrl = /(https?:\/|file:\/|\/api\/|\/\/localhost)/.test(line);
      if (!isUrl) {
        cleanLine = beforeComment.trimEnd();
      }
    }

    newLines.push(cleanLine);
  }

  const collapsedLines = [];
  let blankCount = 0;
  for (const l of newLines) {
    if (l.trim() === '') {
      blankCount++;
      if (blankCount <= 1) {
        collapsedLines.push(l);
      }
    } else {
      blankCount = 0;
      collapsedLines.push(l);
    }
  }

  const finalContent = collapsedLines.join('\n');
  if (finalContent !== content) {
    if (!dryRun) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
    }
    return true;
  }
  return false;
}

function main() {
  const { dryRun, verbose, targetInput } = parseCliArgs();
  const baseDir = resolveBaseDir(targetInput);
  const relBase = path.relative(process.cwd(), baseDir) || '.';

  console.log(`${BOLD}${CYAN}=== Clean Code & Invariant 31 Comment Stripper ===${RESET}`);
  console.log(`Base Directory: ${BOLD}${relBase}${RESET}${dryRun ? ` ${YELLOW}[DRY RUN]${RESET}` : ''}`);

  const { srcDirs, resolved } = resolveWorkspaceSrcDirs(baseDir);

  if (srcDirs.length === 0) {
    console.log(`\n${RED}✗ No source directories found in ${relBase}.${RESET}`);
    console.log(`Expected at least one workspace: 'be', 'cms', 'fo', 'nestjs-starter-template', 'cms-antd', 'fo-shadcn' or direct 'src/'.`);
    process.exit(1);
  }

  console.log(`\n${BOLD}Resolved Workspaces:${RESET}`);
  if (resolved.direct) {
    console.log(`  ${GREEN}✓${RESET} Direct Workspace:   ${CYAN}${path.relative(baseDir, resolved.direct)}${RESET}`);
  } else {
    if (resolved.be) {
      console.log(`  ${GREEN}✓${RESET} Backend:            ${CYAN}${resolved.be}/src${RESET}`);
    } else {
      console.log(`  ${DIM}- Backend:            (not found)${RESET}`);
    }

    if (resolved.cms) {
      console.log(`  ${GREEN}✓${RESET} CMS:                ${CYAN}${resolved.cms}/src${RESET}`);
    } else {
      console.log(`  ${DIM}- CMS:                (not found)${RESET}`);
    }

    if (resolved.fo) {
      console.log(`  ${GREEN}✓${RESET} Front Office:       ${CYAN}${resolved.fo}/src${RESET}`);
    } else {
      console.log(`  ${DIM}- Front Office:       (not found)${RESET}`);
    }

    if (resolved.packages.length > 0) {
      console.log(`  ${GREEN}✓${RESET} Packages:           ${CYAN}${resolved.packages.map((p) => `${p}/src`).join(', ')}${RESET}`);
    }
  }

  let totalFiles = 0;
  let changedCount = 0;
  const changedFiles = [];

  for (const sDir of srcDirs) {
    const files = walkDir(sDir);
    totalFiles += files.length;

    for (const file of files) {
      const relPath = path.relative(baseDir, file);
      const wasModified = stripCommentsFromFile(file, dryRun);
      if (wasModified) {
        changedCount++;
        changedFiles.push(relPath);
        if (verbose) {
          console.log(`  ${YELLOW}⚡ [${dryRun ? 'WOULD CLEAN' : 'CLEANED'}]${RESET} ${relPath}`);
        }
      }
    }
  }

  console.log(`\n${BOLD}Summary:${RESET}`);
  console.log(`  Total Files Scanned: ${BOLD}${totalFiles}${RESET}`);
  if (changedCount > 0) {
    const actionLabel = dryRun ? 'Files that need cleaning' : 'Files cleaned';
    console.log(`  ${dryRun ? YELLOW : GREEN}${actionLabel}: ${changedCount}${RESET}`);
    if (!verbose && changedCount <= 20) {
      changedFiles.forEach((f) => console.log(`    - ${f}`));
    } else if (!verbose && changedCount > 20) {
      changedFiles.slice(0, 20).forEach((f) => console.log(`    - ${f}`));
      console.log(`    ${DIM}... and ${changedCount - 20} more files${RESET}`);
    }
  } else {
    console.log(`  ${GREEN}✓ All files are 100% compliant with Invariant 31 (No noise comments detected).${RESET}`);
  }

  if (dryRun && changedCount > 0) {
    console.log(`\n${DIM}Run without ${BOLD}--dry-run${RESET}${DIM} to apply changes.${RESET}`);
  }
}

main();
