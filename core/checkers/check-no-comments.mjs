#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let isFix = false;
let targetInput = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--fix') {
    isFix = true;
  } else if (arg === '--target') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      targetInput = args[++i];
    }
  } else if (arg === '-h' || arg === '--help') {
    console.log(`
Usage: check-no-comments.sh [options] [target_dir]

Options:
  --fix          Automatically remove noise comments while preserving code & directives
  --target <dir> Target directory to scan (default: current working directory)
  -h, --help     Show this help message

Enforces Invariant 31: Pure Self-Documenting & Zero-Comment Invariant.
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
      /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) &&
      !/\.(d|spec|test|e2e-spec)\.(ts|tsx|js|jsx)$/.test(entry.name)
    ) {
      results.push(full);
    }
  }
  return results;
}

function isAllowedDirective(commentText) {
  const trimmed = commentText.trim();
  return (
    trimmed.startsWith('///') ||
    trimmed.includes('eslint-disable') ||
    trimmed.includes('eslint-enable') ||
    trimmed.includes('@ts-ignore') ||
    trimmed.includes('@ts-expect-error') ||
    trimmed.includes('@ts-nocheck') ||
    trimmed.includes('@ts-check') ||
    trimmed.includes('istanbul ignore') ||
    trimmed.includes('vitest') ||
    trimmed.includes('jest') ||
    trimmed.includes('prettier-ignore') ||
    trimmed.includes('<reference')
  );
}

function scanComments(content) {
  const comments = [];
  let inString = null;
  let isEscaped = false;
  const templateStack = [];

  let i = 0;
  const n = content.length;

  while (i < n) {
    const c = content[i];
    const next = i + 1 < n ? content[i + 1] : '';

    if (isEscaped) {
      isEscaped = false;
      i++;
      continue;
    }

    if (c === '\\') {
      isEscaped = true;
      i++;
      continue;
    }

    if (inString) {
      if (c === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    const inTemplateString =
      templateStack.length > 0 && templateStack[templateStack.length - 1].braceDepth === 0;

    if (inTemplateString) {
      if (c === '`') {
        templateStack.pop();
        i++;
        continue;
      }
      if (c === '$' && next === '{') {
        templateStack[templateStack.length - 1].braceDepth = 1;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    if (templateStack.length > 0) {
      if (c === '{') {
        templateStack[templateStack.length - 1].braceDepth++;
      } else if (c === '}') {
        templateStack[templateStack.length - 1].braceDepth--;
        if (templateStack[templateStack.length - 1].braceDepth === 0) {
          i++;
          continue;
        }
      }
    }

    if (c === '"' || c === "'") {
      inString = c;
      i++;
      continue;
    }

    if (c === '`') {
      templateStack.push({ braceDepth: 0 });
      i++;
      continue;
    }

    if (c === '{' && next === '/' && i + 2 < n && content[i + 2] === '*') {
      const start = i;
      const endComment = content.indexOf('*/}', start + 3);
      if (endComment !== -1) {
        const fullComment = content.slice(start, endComment + 3);
        const innerText = content.slice(start + 3, endComment);
        comments.push({
          start,
          end: endComment + 3,
          text: fullComment,
          innerText,
          isJsx: true,
          isBlock: true,
        });
        i = endComment + 3;
        continue;
      }
    }

    if (c === '/' && next === '/') {
      const start = i;
      let end = content.indexOf('\n', start);
      if (end === -1) end = n;
      const text = content.slice(start, end);
      comments.push({
        start,
        end,
        text,
        innerText: text.slice(2),
        isJsx: false,
        isBlock: false,
      });
      i = end;
      continue;
    }

    if (c === '/' && next === '*') {
      const start = i;
      let end = content.indexOf('*/', start + 2);
      if (end === -1) {
        end = n;
      } else {
        end += 2;
      }
      const text = content.slice(start, end);
      comments.push({
        start,
        end,
        text,
        innerText: text.slice(2, end === n ? n : end - 2),
        isJsx: false,
        isBlock: true,
      });
      i = end;
      continue;
    }

    i++;
  }

  return comments;
}

const srcDirs = findSrcDirectories(targetDir);
let totalViolations = 0;

let totalScanned = 0;
for (const sDir of srcDirs) {
  const files = walk(sDir);
  totalScanned += files.length;
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const allComments = scanComments(content);
    const violatingComments = [];

    for (const comment of allComments) {
      if (isAllowedDirective(comment.text) || isAllowedDirective(comment.innerText)) {
        continue;
      }

      violatingComments.push(comment);
      totalViolations++;
      const rel = path.relative(targetDir, file);
      const lineNum = content.slice(0, comment.start).split('\n').length;
      const firstLineOfComment = comment.text.trim().split('\n')[0];

      if (!isFix) {
        console.error(`\x1b[31m[INVARIANT-31 VIOLATION]\x1b[0m ${rel}:${lineNum}`);
        console.error(`    Offending: \x1b[33m${firstLineOfComment}\x1b[0m`);
        console.error(`    Remediation: Remove comment. Express intent through clean self-documenting code.`);
      }
    }

    if (isFix && violatingComments.length > 0) {
      let modified = content;
      violatingComments.sort((a, b) => b.start - a.start);

      for (const comment of violatingComments) {
        const lineStart = modified.lastIndexOf('\n', comment.start - 1) + 1;
        let lineEnd = modified.indexOf('\n', comment.end);
        if (lineEnd === -1) lineEnd = modified.length;

        const preceding = modified.slice(lineStart, comment.start);
        const following = modified.slice(comment.end, lineEnd);

        if (!comment.isBlock) {
          if (preceding.trim() === '') {
            const cutEnd = comment.end < modified.length && modified[comment.end] === '\n' ? comment.end + 1 : comment.end;
            modified = modified.slice(0, lineStart) + modified.slice(cutEnd);
          } else {
            const trimmedPreceding = preceding.trimEnd();
            modified = modified.slice(0, lineStart) + trimmedPreceding + modified.slice(comment.end);
          }
        } else if (comment.isJsx) {
          if (preceding.trim() === '' && following.trim() === '') {
            const cutEnd = lineEnd < modified.length && modified[lineEnd] === '\n' ? lineEnd + 1 : lineEnd;
            modified = modified.slice(0, lineStart) + modified.slice(cutEnd);
          } else {
            modified = modified.slice(0, comment.start) + modified.slice(comment.end);
          }
        } else {
          if (preceding.trim() === '' && following.trim() === '') {
            const cutEnd = lineEnd < modified.length && modified[lineEnd] === '\n' ? lineEnd + 1 : lineEnd;
            modified = modified.slice(0, lineStart) + modified.slice(cutEnd);
          } else if (following.trim() === '') {
            const trimmedPreceding = preceding.trimEnd();
            modified = modified.slice(0, lineStart) + trimmedPreceding + modified.slice(comment.end);
          } else {
            const needSpace = !/\s$/.test(preceding) && !/^\s/.test(following);
            modified = modified.slice(0, comment.start) + (needSpace ? ' ' : '') + modified.slice(comment.end);
          }
        }
      }

      const lines = modified.split('\n');
      const collapsedLines = [];
      let blankCount = 0;
      for (const l of lines) {
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
      fs.writeFileSync(file, collapsedLines.join('\n'), 'utf8');
    }
  }
}

if (totalViolations > 0 && !isFix) {
  console.error(`\n\x1b[31m[FAIL] Found ${totalViolations} Invariant 31 comment violation(s).\x1b[0m`);
  console.error(`Run with '--fix' to automatically strip noise comments.`);
  process.exit(1);
}

if (isFix && totalViolations > 0) {
  console.log(`\x1b[32m[FIXED] Successfully stripped ${totalViolations} comment violation(s).\x1b[0m`);
  process.exit(0);
}

console.log(`\x1b[32m[PASS] Invariant 31: Zero comment violations detected across ${totalScanned} files.\x1b[0m`);
process.exit(0);
