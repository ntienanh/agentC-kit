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
Usage: check-wireup-integrity.sh [options] [target_dir]

Options:
  --target <dir> Target directory to scan (default: current working directory)
  -h, --help     Show this help message

Enforces Invariants 32, 35, 40:
- Whole-Lifecycle Wire-Up & Anti-Phantom Pages (7-link vertical slice)
- Navigation & Sidebar Menu Registration
- Logic Decoupling (no inline fetch/useQuery in UI view)
- Centralized Logic Hooks & AppTable enforcement
- Anti-Legacy Loading (no manual useState loading)
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
      results.push(full);
    }
  }
  return results;
}

function findWorkspaces(base) {
  const candidates = [
    base,
    path.join(base, 'cms'),
    path.join(base, 'cms-antd'),
    path.join(base, 'fo'),
    path.join(base, 'fo-shadcn'), path.join(base, 'templates/cms'), path.join(base, 'templates/fo'),
    path.join(base, 'apps/cms'),
    path.join(base, 'apps/fo'),
    path.join(base, 'apps/web'),
  ];
  return candidates.filter((d) => fs.existsSync(path.join(d, 'src')));
}

let totalViolations = 0;
let totalScanned = 0;
const workspaces = findWorkspaces(targetDir);

if (workspaces.length === 0 && fs.existsSync(targetDir)) {
  workspaces.push(targetDir);
}

for (const ws of workspaces) {
  const srcDir = path.join(ws, 'src');
  if (!fs.existsSync(srcDir)) continue;

  // 1. CHECK EMPTY / STUB PAGES
  const allFiles = walk(srcDir);
  totalScanned += allFiles.length;
  const pageFiles = allFiles.filter((f) => f.endsWith('/page.tsx') || f.endsWith('\\page.tsx'));
  for (const pFile of pageFiles) {
    const content = fs.readFileSync(pFile, 'utf8').trim();
    if (content.length === 0) {
      totalViolations++;
      const rel = path.relative(targetDir, pFile);
      console.error(`\x1b[31m[INVARIANT-32 STUB-PAGE]\x1b[0m Empty / stub route page found: ${rel}`);
      console.error(`    Remediation: Implement complete route component or remove stub page.`);
    }
  }

  // 2. CHECK PHANTOM FEATURES (features without routes/manifests)
  const featuresDir = path.join(srcDir, 'features');
  if (fs.existsSync(featuresDir)) {
    try {
      const featEntries = fs.readdirSync(featuresDir, { withFileTypes: true });
      for (const fe of featEntries) {
        if (!fe.isDirectory()) continue;
        const featName = fe.name;
        if (['auth', 'dashboard', 'profile', 'layout', 'common', 'shared', 'ui'].includes(featName)) {
          continue;
        }

        const featPath = path.join(featuresDir, featName);
        const featCodeFiles = walk(featPath).filter(
          (f) => /\.(ts|tsx)$/.test(f) && !/\.(d|spec|test)\.ts$/.test(f)
        );
        if (featCodeFiles.length === 0) continue;

        const candidateRoutePages = [
          path.join(srcDir, `app/[locale]/(protected)/${featName}/page.tsx`),
          path.join(srcDir, `app/[locale]/(auth)/${featName}/page.tsx`),
          path.join(srcDir, `app/[locale]/${featName}/page.tsx`),
          path.join(srcDir, `app/${featName}/page.tsx`),
          path.join(srcDir, `app/(protected)/${featName}/page.tsx`),
          path.join(srcDir, `manifests/${featName}.manifest.ts`),
        ];

        const hasRoute = candidateRoutePages.some((p) => fs.existsSync(p));
        if (!hasRoute) {
          totalViolations++;
          const rel = path.relative(targetDir, featPath);
          console.error(`\x1b[31m[INVARIANT-32 PHANTOM-FEATURE]\x1b[0m Feature directory '${rel}' has no route page.`);
          console.error(`    Remediation: Create 'src/app/[locale]/(protected)/${featName}/page.tsx' or feature manifest.`);
        }
      }
    } catch {}
  }

  // 3. CHECK UNREGISTERED ROUTES IN NAVIGATION
  const navSearchFiles = allFiles.filter(
    (f) =>
      f.includes('SidebarMenu') ||
      f.includes('navigation.config') ||
      f.includes('shell-navigation.config') ||
      f.includes('.manifest.ts')
  );

  if (navSearchFiles.length > 0) {
    let navContent = '';
    for (const nf of navSearchFiles) {
      try {
        navContent += fs.readFileSync(nf, 'utf8') + '\n';
      } catch {}
    }

    for (const pFile of pageFiles) {
      const rel = path.relative(srcDir, pFile).replace(/\\/g, '/');
      if (
        rel.includes('(auth)') ||
        rel === 'app/page.tsx' ||
        rel === 'app/[locale]/page.tsx' ||
        rel.includes('not-found') ||
        rel.includes('error')
      ) {
        continue;
      }

      const match = rel.match(/app\/(?:\[locale\]\/)?(?:\(protected\)\/)?([^/]+)/);
      if (match) {
        const routeSegment = match[1];
        if (['auth', 'dashboard', 'profile', 'layout', 'common'].includes(routeSegment)) {
          continue;
        }

        const isRegistered =
          navContent.includes(`/${routeSegment}`) ||
          navContent.includes(`'${routeSegment}'`) ||
          navContent.includes(`"${routeSegment}"`) ||
          navContent.includes(routeSegment.replace(/-/g, '_').toUpperCase());

        if (!isRegistered) {
          totalViolations++;
          const pRel = path.relative(targetDir, pFile);
          console.error(`\x1b[31m[INVARIANT-32 UNREGISTERED-ROUTE]\x1b[0m Route page '${pRel}' is missing from SidebarMenu / navigation config.`);
          console.error(`    Remediation: Register '${routeSegment}' in navigation menu or feature manifest.`);
        }
      }
    }
  }

  // 4. CHECK INLINE QUERIES & LAYER BYPASS IN UI
  const uiFiles = allFiles.filter(
    (f) =>
      (f.endsWith('.tsx') || f.endsWith('.ts')) &&
      !f.endsWith('.d.ts') &&
      !f.includes('.spec.') &&
      !f.includes('.test.') &&
      !f.includes('/logic/') &&
      !f.includes('/services/') &&
      !f.includes('/providers/') &&
      !f.includes('/shared/lib/http/')
  );

  for (const file of uiFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      if (/useQuery\s*\(\s*\{/.test(line) || /useMutation\s*\(\s*\{/.test(line)) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-32/35 INLINE-QUERY]\x1b[0m ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: Delegate queries to hook in src/logic/<feature>/use<Feature>Logic.ts.`);
      }

      if (/(?<![\w])fetch\s*\(/.test(line) && !line.includes('//') && !line.includes('*')) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-32 LAYER-BYPASS]\x1b[0m ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: Move raw fetch calls to services layer or logic hooks.`);
      }

      if (/const\s*\[\s*(?:is)?loading\s*,\s*set(?:Is)?Loading\s*\]\s*=\s*useState/i.test(line)) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-40 LEGACY-LOADING]\x1b[0m ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: Invariant 40 forbids manual useState(loading). Use TanStack Query isPending.`);
      }

      if (/<table[\s>]/i.test(line) && !file.includes('/shared/ui/table/')) {
        totalViolations++;
        const rel = path.relative(targetDir, file);
        console.error(`\x1b[31m[INVARIANT-35 RAW-TABLE]\x1b[0m ${rel}:${idx + 1}`);
        console.error(`    Line: \x1b[33m${trimmed}\x1b[0m`);
        console.error(`    Remediation: Enforce AppTable component usage instead of raw HTML table.`);
      }
    });
  }

  // 5. CHECK ORPHANED LOGIC HOOKS
  const logicDir = path.join(srcDir, 'logic');
  if (fs.existsSync(logicDir)) {
    const logicFiles = walk(logicDir).filter(
      (f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && !f.includes('.spec.') && !f.includes('.test.')
    );

    const otherFiles = allFiles.filter(
      (f) =>
        (f.endsWith('.ts') || f.endsWith('.tsx')) &&
        !f.endsWith('.d.ts') &&
        !f.includes('.spec.') &&
        !f.includes('.test.') &&
        !f.startsWith(logicDir)
    );

    let otherFilesContent = '';
    for (const ofile of otherFiles) {
      try {
        otherFilesContent += fs.readFileSync(ofile, 'utf8') + '\n';
      } catch {}
    }

    for (const lFile of logicFiles) {
      const lContent = fs.readFileSync(lFile, 'utf8');
      if (lContent.includes('@allow-unused')) continue;

      const hookMatches = [...lContent.matchAll(/export\s+(?:const|function)\s+(use\w+Logic)\b/g)].map((m) => m[1]);
      for (const hookName of hookMatches) {
        const hookRegex = new RegExp(`\\b${hookName}\\b`);
        const hasNoConsumers = otherFiles.length === 0 || !hookRegex.test(otherFilesContent);

        if (hasNoConsumers) {
          totalViolations++;
          const rel = path.relative(targetDir, lFile);
          console.error(`\x1b[31m[INVARIANT-32 ORPHAN-HOOK]\x1b[0m Logic hook '${hookName}' in ${rel} has 0 consumers.`);
          console.error(`    Remediation: Connect hook to UI component or page, or remove unused hook.`);
        }
      }
    }
  }
}

if (totalScanned === 0) { console.error(`\n\x1b[31m[FAIL] Zero files audited.\x1b[0m`); process.exit(1); }
if (totalViolations > 0) {
  console.error(`\n\x1b[31m[FAIL] Found ${totalViolations} wire-up integrity violation(s).\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m[PASS] Invariants 32, 35, 40: 100% wire-up integrity verified.\x1b[0m`);
process.exit(0);
