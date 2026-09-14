#!/usr/bin/env node

/**
 * ============================================================================
 * AUTOMATED ANTI-HALLUCINATION ARCHITECTURAL INVARIANT LINTER
 * ============================================================================
 * 
 * Enforces strict compliance against the 11 AI Hallucinations & Invariants:
 * 1. [ANTI_PHANTOM_PAGE]       - Invariant 32: Whole-Lifecycle Wire-Up
 * 2. [ANTI_LAYER_BYPASS]       - USER_RULES: UI must separate logic via src/logic
 * 3. [ANTI_TYPE_ERASURE]       - Runtime DTO Validation (no TS interfaces in @Body)
 * 4. [ANTI_INLINE_QUERY_KEYS]  - Centralized Query Key Factories
 * 5. [ANTI_NOISE_COMMENTS]     - Invariant 31: Clean Code & Zero-Noise Commenting
 * 6. [ANTI_SECRET_FALLBACK]    - Security: No hardcoded fallback secrets
 * 7. [ANTI_FAKE_E2E]          - Invariant 30: True Black-Box E2E Testing
 * 8. [ANTI_TOY_ARCHITECTURE]   - Invariant 29: Anti-Toy Architecture (no inline HTML)
 * 9. [ANTI_BARREL_POLLUTION]   - Invariant 33: Direct Imports & Anti-Barrel Proliferation
 * 10. [ANTI_I18N_DRIFT]        - Architectural Invariant: i18n Parity & Namespace Registration
 * 11. [ANTI_ISOLATED_SPECS]    - Invariant 34: Unit Spec Co-location & Anti-Isolated Specs Folder
 *
 * Usage:
 *   node tools/audit/verify-invariants.mjs [--target <path>] [--redteam]
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const args = process.argv.slice(2);
const isRedTeam = args.includes('--redteam');
const targetIdx = args.indexOf('--target');
const customTarget = targetIdx !== -1 && args[targetIdx + 1] ? args[targetIdx + 1] : null;

const rootDir = customTarget ? path.resolve(customTarget) : path.resolve(__dirname, '../..');

function walkDir(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.yarn', 'dist', '.next', 'build', 'sites'].includes(entry.name)) {
        continue;
      }
      walkDir(fullPath, filterFn, fileList);
    } else if (entry.isFile()) {
      if (!filterFn || filterFn(fullPath, entry.name)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

class ArchitecturalInvariantAuditor {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.violations = [];
    this.stats = {
      filesScanned: 0,
      rulesChecked: 11,
      violationsCount: 0,
    };
  }

  recordViolation(ruleId, ruleName, filePath, lineNum, lineContent, remediation) {
    const relPath = path.relative(this.baseDir, filePath);
    this.violations.push({
      ruleId,
      ruleName,
      filePath: relPath,
      lineNum,
      lineContent: (lineContent || '').trim(),
      remediation,
    });
    this.stats.violationsCount++;
  }

  getCmsDir() {
    if (fs.existsSync(path.join(this.baseDir, 'cms'))) {
      return path.join(this.baseDir, 'cms');
    }
    return path.join(this.baseDir, 'cms-antd');
  }

  getCmsRel() {
    return fs.existsSync(path.join(this.baseDir, 'cms')) ? 'cms' : 'cms-antd';
  }

  getBeDir() {
    if (fs.existsSync(path.join(this.baseDir, 'be'))) {
      return path.join(this.baseDir, 'be');
    }
    return path.join(this.baseDir, 'nestjs-starter-template');
  }

  getBeRel() {
    return fs.existsSync(path.join(this.baseDir, 'be')) ? 'be' : 'nestjs-starter-template';
  }

  getFoDir() {
    if (fs.existsSync(path.join(this.baseDir, 'fo'))) {
      return path.join(this.baseDir, 'fo');
    }
    return path.join(this.baseDir, 'fo-shadcn');
  }

  getFoRel() {
    return fs.existsSync(path.join(this.baseDir, 'fo')) ? 'fo' : 'fo-shadcn';
  }

  checkPhantomPages() {
    const cmsDir = this.getCmsDir();
    if (!fs.existsSync(cmsDir)) return;

    const featuresDir = path.join(cmsDir, 'src/features');
    if (!fs.existsSync(featuresDir)) return;

    const features = fs.readdirSync(featuresDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const routesDir = path.join(cmsDir, 'src/app/[locale]/(protected)');
    const navConfigFile = path.join(cmsDir, 'src/configs/app/features/navigation.config.tsx');
    const shellNavFile = path.join(cmsDir, 'src/configs/app/features/shell-navigation.config.tsx');
    const manifestsDir = path.join(cmsDir, 'src/manifests');

    let navContent = '';
    if (fs.existsSync(navConfigFile)) navContent += fs.readFileSync(navConfigFile, 'utf8');
    if (fs.existsSync(shellNavFile)) navContent += fs.readFileSync(shellNavFile, 'utf8');

    let manifestContent = '';
    if (fs.existsSync(manifestsDir)) {
      const manifestFiles = walkDir(manifestsDir, (_, name) => name.endsWith('.ts'));
      manifestContent = manifestFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    }

    for (const feat of features) {
      if (['auth', 'dashboard', 'profile', 'layout'].includes(feat)) continue;

      const pageFile = path.join(routesDir, feat, 'page.tsx');
      const manifestFile = path.join(manifestsDir, `${feat}.manifest.ts`);
      const hasPage = fs.existsSync(pageFile);
      const hasManifest = fs.existsSync(manifestFile);

      if (!hasPage && !hasManifest) {
        this.recordViolation(
          'ANTI_PHANTOM_PAGE',
          'Invariant 32: Whole-Lifecycle Wire-Up & Anti-Phantom Pages',
          path.join(featuresDir, feat),
          1,
          `Feature directory 'src/features/${feat}' has no route page`,
          `Create 'src/app/[locale]/(protected)/${feat}/page.tsx' or 'src/manifests/${feat}.manifest.ts'`
        );
      }

      const featKebab = feat.toLowerCase();
      const featUpper = feat.replace(/-/g, '_').toUpperCase();
      const isReferencedInNav = navContent.includes(`/${featKebab}`) || navContent.includes(featUpper);
      const isReferencedInManifest = manifestContent.includes(`/${featKebab}`) || manifestContent.includes(featUpper);

      if (!isReferencedInNav && !isReferencedInManifest) {
        this.recordViolation(
          'ANTI_PHANTOM_PAGE',
          'Invariant 32: Unregistered Navigation & Sidebar Menu',
          path.join(featuresDir, feat),
          1,
          `Feature '${feat}' is not registered in navigation config or feature manifests`,
          `Register '${feat}' in 'src/configs/app/features/navigation.config.tsx' or '${feat}.manifest.ts'`
        );
      }
    }
  }

  checkLayerBypass() {
    const cmsDir = this.getCmsDir();
    if (!fs.existsSync(cmsDir)) return;

    const files = walkDir(cmsDir, (f, name) => {
      if (!name.endsWith('.tsx')) return false;
      const rel = path.relative(cmsDir, f);
      if (rel.includes('/logic/') || rel.includes('/services/') || rel.includes('/providers/') || rel.includes('.spec.')) {
        return false;
      }
      return rel.includes('src/features/') || rel.includes('src/components/');
    });

    for (const file of files) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (/(?<![\w])fetch\s*\(/.test(line) && !line.includes('//') && !line.includes('*')) {
          this.recordViolation(
            'ANTI_LAYER_BYPASS',
            'USER_RULES: UI Layer-Bypass (Raw fetch in UI)',
            file,
            idx + 1,
            line,
            'Move API call logic into src/logic/<feature>/use<Feature>Logic.ts or service hook'
          );
        }

        if (/clientFetcher\.(get|post|put|delete|patch)\s*\(/.test(line)) {
          this.recordViolation(
            'ANTI_LAYER_BYPASS',
            'USER_RULES: UI Layer-Bypass (clientFetcher in UI)',
            file,
            idx + 1,
            line,
            'Move clientFetcher calls into feature services or src/logic'
          );
        }

        if (/useQuery\s*\(\s*\{/.test(line) && file.includes('/components/')) {
          this.recordViolation(
            'ANTI_LAYER_BYPASS',
            'USER_RULES: Inline useQuery in Presentation Component',
            file,
            idx + 1,
            line,
            'Delegate state and query logic to hook in src/logic/'
          );
        }
      });
    }
  }

  checkTypeErasure() {
    const beDir = this.getBeDir();
    if (!fs.existsSync(beDir)) return;

    const controllers = walkDir(beDir, (_, name) => name.endsWith('.controller.ts'));

    for (const file of controllers) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const match = /@Body\s*\([^)]*\)\s*\w+\s*:\s*(I[A-Z]\w+)/.exec(line);
        if (match) {
          const interfaceName = match[1];
          this.recordViolation(
            'ANTI_TYPE_ERASURE',
            'Type Safety: TypeScript Interface Erased at Runtime in @Body()',
            file,
            idx + 1,
            line,
            `Replace interface '${interfaceName}' with a runtime DTO Class decorated with class-validator`
          );
        }
      });
    }
  }

  checkInlineQueryKeys() {
    const cmsDir = this.getCmsDir();
    if (!fs.existsSync(cmsDir)) return;

    const files = walkDir(cmsDir, (f, name) => {
      return (name.endsWith('.ts') || name.endsWith('.tsx')) && !name.endsWith('.d.ts');
    });

    for (const file of files) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (/queryKey:\s*\[\s*['"`]/.test(line)) {
          if (file.includes('query-keys') || file.includes('queryKeys')) return;

          this.recordViolation(
            'ANTI_INLINE_QUERY_KEYS',
            'React Query: Inline Hardcoded Query Key Array',
            file,
            idx + 1,
            line,
            'Use centralized query key factory from src/shared/query-keys/'
          );
        }
      });
    }
  }

  checkNoiseComments() {
    const dirs = [
      path.join(this.getCmsDir(), 'src'),
      path.join(this.getBeDir(), 'src'),
      path.join(this.getFoDir(), 'src'),
    ];

    for (const fullDir of dirs) {
      if (!fs.existsSync(fullDir)) continue;

      const files = walkDir(fullDir, (_, name) => {
        return (name.endsWith('.ts') || name.endsWith('.tsx')) && !name.endsWith('.d.ts');
      });

      for (const file of files) {
        this.stats.filesScanned++;
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          const trimmed = line.trim();

          if (/\/\/\s*[─=\-~*#]{4,}/.test(trimmed)) {
            this.recordViolation(
              'ANTI_NOISE_COMMENTS',
              'Invariant 31: Decorative Banner Comment Padding',
              file,
              idx + 1,
              line,
              'Remove decorative banner comments. Code must be self-documenting.'
            );
          }

          if (/\/\/\s*\d+\.\s+[A-Z]/.test(trimmed)) {
            this.recordViolation(
              'ANTI_NOISE_COMMENTS',
              'Invariant 31: Numbered Procedural Comment Padding',
              file,
              idx + 1,
              line,
              'Remove numbered comments. Structure functions with clear intent.'
            );
          }

          if (/^\/\/\s*(src\/|apps\/|packages\/)/.test(trimmed)) {
            this.recordViolation(
              'ANTI_NOISE_COMMENTS',
              'Invariant 31: File Path Header Comment',
              file,
              idx + 1,
              line,
              'Remove redundant file path comment header.'
            );
          }

          if (!file.endsWith('.spec.ts') && !file.endsWith('.spec.tsx') && !file.endsWith('.test.ts') && !file.endsWith('.test.tsx')) {
            if (/^\/\/(?!\s*(eslint-|@ts-|istanbul|vitest|jest|prettier-ignore))/.test(trimmed)) {
              this.recordViolation(
                'ANTI_NOISE_COMMENTS',
                'Invariant 31: Single-Line Explanatory Comment in Source Code',
                file,
                idx + 1,
                line,
                'Remove explanatory comment. Code must be 100% self-documenting.'
              );
            }

            if (/^\/\*(?!\s*(eslint-|istanbul|@ts-))/.test(trimmed)) {
              this.recordViolation(
                'ANTI_NOISE_COMMENTS',
                'Invariant 31: Multi-Line/Block Comment in Source Code',
                file,
                idx + 1,
                line,
                'Remove block comment. Code must be 100% self-documenting.'
              );
            }
          }
        });
      }
    }
  }

  checkSecretFallback() {
    const beDir = path.join(this.getBeDir(), 'src');
    if (!fs.existsSync(beDir)) return;

    const files = walkDir(beDir, (_, name) => name.endsWith('.ts'));

    for (const file of files) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (/process\.env\.(JWT_SECRET|SECRET|API_KEY|PASSWORD)\s*\|\|\s*['"`]/.test(line)) {
          this.recordViolation(
            'ANTI_SECRET_FALLBACK',
            'Security: Insecure Fallback String for Production Secret',
            file,
            idx + 1,
            line,
            'Secrets must fail fast if undefined: throw new Error("JWT_SECRET missing")'
          );
        }
      });
    }
  }

  checkFakeE2E() {
    const beTestDir = path.join(this.getBeDir(), 'test');
    if (fs.existsSync(beTestDir)) {
      const e2eFiles = walkDir(beTestDir, (_, name) => name.endsWith('.e2e-spec.ts'));
      for (const file of e2eFiles) {
        this.stats.filesScanned++;
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('request(app.getHttpServer())') && !content.includes('supertest')) {
          this.recordViolation(
            'ANTI_FAKE_E2E',
            'Invariant 30: Fake E2E Test (No Real HTTP Socket Testing)',
            file,
            1,
            'Test file does not make real HTTP requests via supertest/getHttpServer()',
            'E2E tests must bind to real network sockets or HTTP test server'
          );
        }
      }
    }

    const cmsPlaywrightConfig = path.join(this.getCmsDir(), 'playwright.config.ts');
    if (fs.existsSync(cmsPlaywrightConfig)) {
      const e2eDir = path.join(this.getCmsDir(), 'e2e');
      const specs = fs.existsSync(e2eDir) ? walkDir(e2eDir, (_, name) => name.endsWith('.spec.ts')) : [];
      if (specs.length === 0) {
        this.recordViolation(
          'ANTI_FAKE_E2E',
          'Invariant 30: Missing Playwright E2E Specs in CMS',
          cmsPlaywrightConfig,
          1,
          `playwright.config.ts exists but no .spec.ts files found in ${this.getCmsRel()}/e2e`,
          `Create real Playwright E2E tests validating DOM interactions in ${this.getCmsRel()}/e2e/`
        );
      }
    }
  }

  checkToyArchitecture() {
    const beDir = path.join(this.getBeDir(), 'src');
    if (!fs.existsSync(beDir)) return;

    const files = walkDir(beDir, (_, name) => name.endsWith('.ts'));

    for (const file of files) {
      this.stats.filesScanned++;
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (/<(!DOCTYPE\s+html|html|body|div\s+id=["']root["'])>/i.test(line) && (line.includes('`') || line.includes('"'))) {
          this.recordViolation(
            'ANTI_TOY_ARCHITECTURE',
            'Invariant 29: Anti-Toy Architecture (Serving Fake HTML Strings from Backend)',
            file,
            idx + 1,
            line,
            'UI must be built with independent Next.js / React component architecture'
          );
        }
      });
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 9: Anti-Barrel Proliferation & God Barrels (Invariant 33)
  // --------------------------------------------------------------------------
  checkBarrelPollution() {
    const cmsDir = path.join(this.getCmsDir(), 'src');
    if (fs.existsSync(cmsDir)) {
      const godBarrel = path.join(cmsDir, 'components/index.ts');
      if (fs.existsSync(godBarrel)) {
        const content = fs.readFileSync(godBarrel, 'utf8');
        if (content.includes("export * from './ui'") && content.includes("export * from './shared'")) {
          this.recordViolation(
            'ANTI_BARREL_POLLUTION',
            'Invariant 33: God Barrel in src/components/index.ts',
            godBarrel,
            1,
            content.trim().split('\n')[0],
            'Delete God Barrel or replace with Direct Component Imports to prevent bundle bloat'
          );
        }
      }

      const allSrcFiles = walkDir(cmsDir, (_, name) => (name.endsWith('.ts') || name.endsWith('.tsx')) && !name.endsWith('.d.ts'));
      for (const file of allSrcFiles) {
        this.stats.filesScanned++;
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/from\s+['"]@\/components['"]/.test(line)) {
            this.recordViolation(
              'ANTI_BARREL_POLLUTION',
              'Invariant 33: Importing from God Barrel @/components',
              file,
              idx + 1,
              line,
              'Use direct component import (e.g. import { ... } from "@/shared/ui/button/AppButton")'
            );
          }
        });
      }
    }

    const beDir = path.join(this.getBeDir(), 'src');
    if (fs.existsSync(beDir)) {
      const beFiles = walkDir(beDir, (_, name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'));
      for (const file of beFiles) {
        this.stats.filesScanned++;
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/import\s+\{[^}]*Service[^}]*\}\s+from\s+['"](\.\.\/\w+|@\/modules\/\w+)['"]/.test(line)) {
            this.recordViolation(
              'ANTI_BARREL_POLLUTION',
              'Invariant 33: Backend Cross-Module Service Barrel Import',
              file,
              idx + 1,
              line,
              'Import service directly from file (e.g. from "../users/users.service") to prevent circular DI'
            );
          }
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 10: i18n Dictionary Parity & Namespace Registration (Invariant)
  // --------------------------------------------------------------------------
  checkI18nDrift() {
    const cmsDir = this.getCmsDir();
    if (!fs.existsSync(cmsDir)) return;

    const enDir = path.join(cmsDir, 'messages/en');
    const viDir = path.join(cmsDir, 'messages/vi');
    if (!fs.existsSync(enDir)) return;

    const enFiles = walkDir(enDir, (_, name) => name.endsWith('.json'));
    const viFiles = fs.existsSync(viDir) ? walkDir(viDir, (_, name) => name.endsWith('.json')) : [];

    const getFlattenedKeys = (obj, prefix = '') => {
      let keys = [];
      for (const [k, v] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          keys.push(...getFlattenedKeys(v, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    for (const enFile of enFiles) {
      this.stats.filesScanned++;
      const rel = path.relative(enDir, enFile);
      const matchingViFile = path.join(viDir, rel);

      if (!fs.existsSync(matchingViFile)) {
        this.recordViolation(
          'ANTI_I18N_DRIFT',
          'i18n: Missing Vietnamese Dictionary File Parity',
          matchingViFile,
          1,
          `Dictionary '${rel}' exists in en but missing in vi`,
          `Create '${this.getCmsRel()}/messages/vi/${rel}' with identical key structure`
        );
      } else {
        this.stats.filesScanned++;
        let enJson, viJson;
        try {
          enJson = JSON.parse(fs.readFileSync(enFile, 'utf8'));
        } catch (err) {
          this.recordViolation(
            'ANTI_I18N_DRIFT',
            'i18n: Malformed JSON in English Dictionary',
            enFile,
            1,
            err.message,
            'Fix JSON syntax error'
          );
          continue;
        }
        try {
          viJson = JSON.parse(fs.readFileSync(matchingViFile, 'utf8'));
        } catch (err) {
          this.recordViolation(
            'ANTI_I18N_DRIFT',
            'i18n: Malformed JSON in Vietnamese Dictionary',
            matchingViFile,
            1,
            err.message,
            'Fix JSON syntax error'
          );
          continue;
        }

        const enKeys = new Set(getFlattenedKeys(enJson));
        const viKeys = new Set(getFlattenedKeys(viJson));

        for (const key of enKeys) {
          if (!viKeys.has(key)) {
            this.recordViolation(
              'ANTI_I18N_DRIFT',
              'i18n: Translation Key Missing in Vietnamese',
              matchingViFile,
              1,
              `Key '${key}' exists in messages/en/${rel} but missing in messages/vi/${rel}`,
              `Add key '${key}' to '${this.getCmsRel()}/messages/vi/${rel}'`
            );
          }
        }

        for (const key of viKeys) {
          if (!enKeys.has(key)) {
            this.recordViolation(
              'ANTI_I18N_DRIFT',
              'i18n: Extraneous Key in Vietnamese Translation',
              enFile,
              1,
              `Key '${key}' exists in messages/vi/${rel} but missing in messages/en/${rel}`,
              `Add key '${key}' to '${this.getCmsRel()}/messages/en/${rel}' or remove from vi`
            );
          }
        }
      }
    }

    for (const viFile of viFiles) {
      const rel = path.relative(viDir, viFile);
      const matchingEnFile = path.join(enDir, rel);
      if (!fs.existsSync(matchingEnFile)) {
        this.recordViolation(
          'ANTI_I18N_DRIFT',
          'i18n: Missing English Dictionary File Parity',
          matchingEnFile,
          1,
          `Dictionary '${rel}' exists in vi but missing in en`,
          `Create '${this.getCmsRel()}/messages/en/${rel}' with identical key structure`
        );
      }
    }

    const messagesTsPath = path.join(cmsDir, 'src/shared/i18n/messages.ts');
    if (fs.existsSync(messagesTsPath)) {
      this.stats.filesScanned++;
      const messagesContent = fs.readFileSync(messagesTsPath, 'utf8');
      for (const enFile of enFiles) {
        const rel = path.relative(enDir, enFile);
        const namespace = rel.replace(/\.json$/, '').replace(/[\/\\]/g, '.');
        const namespaceLiteral = `'${namespace}'`;
        if (!messagesContent.includes(namespaceLiteral)) {
          this.recordViolation(
            'ANTI_I18N_DRIFT',
            'i18n: Unregistered Namespace in messages.ts',
            messagesTsPath,
            1,
            `Namespace '${namespace}' from 'messages/en/${rel}' is not in I18N_NAMESPACES`,
            `Register '${namespace}' in I18N_NAMESPACES and I18nDefinition in '${this.getCmsRel()}/src/shared/i18n/messages.ts'`
          );
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 11: Unit Spec Co-location & Anti-Isolated Specs Folder (Invariant 34)
  // --------------------------------------------------------------------------
  checkIsolatedSpecs() {
    const targetDirs = [
      path.join(this.getCmsDir(), 'src'),
      path.join(this.getBeDir(), 'src'),
      path.join(this.getFoDir(), 'src'),
    ];

    const packagesDir = path.join(this.baseDir, 'packages');
    if (fs.existsSync(packagesDir)) {
      const pkgs = fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(packagesDir, d.name, 'src'));
      targetDirs.push(...pkgs);
    }

    const findProhibitedDirs = (dir, results = []) => {
      if (!fs.existsSync(dir)) return results;
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return results;
      }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (['node_modules', '.git', '.yarn', 'dist', '.next', 'build'].includes(entry.name)) {
            continue;
          }
          const fullPath = path.join(dir, entry.name);
          if (entry.name === 'specs' || entry.name === '__tests__') {
            results.push(fullPath);
          }
          findProhibitedDirs(fullPath, results);
        }
      }
      return results;
    };

    for (const srcDir of targetDirs) {
      if (!fs.existsSync(srcDir)) continue;
      this.stats.filesScanned++;
      const prohibitedDirs = findProhibitedDirs(srcDir);
      for (const pDir of prohibitedDirs) {
        const relPath = path.relative(this.baseDir, pDir);
        this.recordViolation(
          'ANTI_ISOLATED_SPECS',
          'Invariant 34: Unit Spec Co-location & Anti-Isolated Specs Folder',
          pDir,
          1,
          `[Invariant 34] Prohibited isolated test directory found: ${relPath}`,
          `[Invariant 34] Prohibited isolated test directory found: ${relPath}. Unit specs must be co-located side-by-side with their source files.`
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // CHECK 12: Strict NestJS 4-Layer Clean Architecture Enforcer
  // --------------------------------------------------------------------------
  checkNestJsCleanArchitecture() {
    const srcDir = path.join(this.baseDir, 'src');
    if (!fs.existsSync(srcDir)) return;

    const modulesDir = path.join(srcDir, 'modules');
    if (!fs.existsSync(modulesDir)) return;

    const moduleEntries = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const requiredLayers = ['domain', 'application', 'infrastructure', 'presentation'];

    for (const modName of moduleEntries) {
      const modPath = path.join(modulesDir, modName);
      this.stats.filesScanned++;

      // 1. Enforce that flat controller/service files are NOT placed directly in src/modules/<modName>/
      const modFiles = fs.readdirSync(modPath, { withFileTypes: true });
      for (const entry of modFiles) {
        if (entry.isFile()) {
          const isModuleFile = entry.name.endsWith('.module.ts');
          const isGitKeep = entry.name === '.gitkeep';
          if (!isModuleFile && !isGitKeep) {
            this.recordViolation(
              'ANTI_FLAT_MODULE',
              `NestJS 4-Layer Violation: Flat file '${entry.name}' in module root`,
              path.join(modPath, entry.name),
              1,
              `File '${entry.name}' is placed directly in module root 'src/modules/${modName}/'`,
              `Move '${entry.name}' into its respective Clean Arch layer: domain/, application/, infrastructure/, or presentation/`
            );
          }
        }
      }

      // 2. Enforce that 4-layer directories exist AND contain actual source files (not just empty .gitkeep)
      for (const layer of requiredLayers) {
        const layerPath = path.join(modPath, layer);
        if (!fs.existsSync(layerPath)) {
          this.recordViolation(
            'ANTI_MISSING_LAYER',
            `NestJS 4-Layer Violation: Missing layer directory '${layer}'`,
            modPath,
            1,
            `Module 'src/modules/${modName}' is missing required Clean Arch layer directory '${layer}/'`,
            `Create 'src/modules/${modName}/${layer}/' and implement corresponding layer components`
          );
        } else {
          const layerFiles = walkDir(layerPath, (_, name) => name.endsWith('.ts') && !name.endsWith('.gitkeep'));
          if (layerFiles.length === 0) {
            this.recordViolation(
              'ANTI_EMPTY_LAYER',
              `NestJS 4-Layer Violation: Layer '${layer}' has no TypeScript implementation`,
              layerPath,
              1,
              `Layer 'src/modules/${modName}/${layer}/' contains no actual .ts code files (only empty or .gitkeep)`,
              `Implement real domain/application/infrastructure/presentation logic inside 'src/modules/${modName}/${layer}/'`
            );
          }
        }
      }
    }
  }

  run() {
    console.log(`${BOLD}${CYAN}=== Automated Anti-Hallucination Architectural Linter ===${RESET}`);
    console.log(`Target Repository: ${YELLOW}${this.baseDir}${RESET}\n`);

    this.checkPhantomPages();
    this.checkLayerBypass();
    this.checkTypeErasure();
    this.checkInlineQueryKeys();
    this.checkNoiseComments();
    this.checkSecretFallback();
    this.checkFakeE2E();
    this.checkToyArchitecture();
    this.checkBarrelPollution();
    this.checkI18nDrift();
    this.checkIsolatedSpecs();
    this.checkNestJsCleanArchitecture();

    return this.report();
  }

  report() {
    console.log(`${BOLD}Audit Summary:${RESET}`);
    console.log(`  - Files Scanned:       ${this.stats.filesScanned}`);
    console.log(`  - Rules Checked:       ${this.stats.rulesChecked}`);
    console.log(`  - Violations Detected: ${this.stats.violationsCount === 0 ? GREEN : RED}${this.stats.violationsCount}${RESET}\n`);

    if (this.violations.length === 0) {
      console.log(`${GREEN}${BOLD}✓ PERFECT COMPLIANCE: 0 Architectural Hallucinations Detected!${RESET}`);
      console.log(`${GREEN}  All code complies strictly with Core Rules, Clean Architecture, and Invariants.${RESET}\n`);
      return 0;
    }

    console.log(`${RED}${BOLD}✗ FAIL: ${this.violations.length} Architectural Invariant Violation(s) Found:${RESET}\n`);

    this.violations.forEach((v, idx) => {
      console.log(`${RED}[${idx + 1}] [${v.ruleId}] ${v.ruleName}${RESET}`);
      console.log(`    File:   ${CYAN}${v.filePath}:${v.lineNum}${RESET}`);
      if (v.lineContent) {
        console.log(`    Code:   ${YELLOW}${v.lineContent}${RESET}`);
      }
      console.log(`    Fix:    ${GREEN}${v.remediation}${RESET}\n`);
    });

    return 1;
  }
}

function runRedTeamHarness() {
  console.log(`${BOLD}${CYAN}====================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   RED-TEAMING ADVERSARIAL SELF-TEST HARNESS       ${RESET}`);
  console.log(`${BOLD}${CYAN}====================================================${RESET}\n`);
  console.log('Synthesizing 11 deliberate AI hallucination test fixtures...\n');

  const tmpDir = path.join(__dirname, '__redteam_fixture__');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    const cmsDir = path.join(tmpDir, 'cms-antd');
    fs.mkdirSync(path.join(cmsDir, 'src/features/hallucinated-orphan/components'), { recursive: true });
    fs.writeFileSync(path.join(cmsDir, 'src/features/hallucinated-orphan/components/OrphanTable.tsx'), 'export const Table = () => null;');
    fs.mkdirSync(path.join(cmsDir, 'src/app/[locale]/(protected)'), { recursive: true });

    fs.mkdirSync(path.join(cmsDir, 'src/features/bad-ui/components'), { recursive: true });
    fs.writeFileSync(
      path.join(cmsDir, 'src/features/bad-ui/components/BadComponent.tsx'),
      'export function Bad() { useEffect(() => { fetch("/api/v1/bad"); }, []); return <div />; }'
    );
    fs.mkdirSync(path.join(cmsDir, 'src/app/[locale]/(protected)/bad-ui'), { recursive: true });
    fs.writeFileSync(path.join(cmsDir, 'src/app/[locale]/(protected)/bad-ui/page.tsx'), 'export default () => null;');
    fs.mkdirSync(path.join(cmsDir, 'src/configs/app/features'), { recursive: true });
    fs.writeFileSync(path.join(cmsDir, 'src/configs/app/features/navigation.config.tsx'), 'export const APP_HREFS = { BAD_UI: "/bad-ui" };');

    const beDir = path.join(tmpDir, 'nestjs-starter-template/src/modules/fake');
    fs.mkdirSync(beDir, { recursive: true });
    fs.writeFileSync(
      path.join(beDir, 'fake.controller.ts'),
      '@Controller("fake") export class FakeController { @Post() create(@Body() dto: IFakeCreateDto) {} }'
    );

    fs.mkdirSync(path.join(cmsDir, 'src/logic/bad-logic'), { recursive: true });
    fs.writeFileSync(
      path.join(cmsDir, 'src/logic/bad-logic/useBad.ts'),
      'export const useBad = () => useQuery({ queryKey: ["bad-key", 1], queryFn: () => null });'
    );

    fs.writeFileSync(
      path.join(cmsDir, 'src/logic/bad-logic/useBanner.ts'),
      '// ──────────────────────────────────────────\n// 1. Get bad logic\nexport const x = 1;'
    );

    fs.writeFileSync(
      path.join(beDir, 'fake.service.ts'),
      'const jwtSecret = process.env.JWT_SECRET || "default_insecure_secret";'
    );

    const beTestDir = path.join(tmpDir, 'nestjs-starter-template/test');
    fs.mkdirSync(beTestDir, { recursive: true });
    fs.writeFileSync(
      path.join(beTestDir, 'fake.e2e-spec.ts'),
      'describe("Fake E2E", () => { it("mocks everything in memory", () => { expect(1).toBe(1); }); });'
    );

    fs.writeFileSync(
      path.join(beDir, 'toy.controller.ts'),
      'res.send(`<!DOCTYPE html><html><body><div id="root">Fake App</div></body></html>`);'
    );

    // 9. Fixture: Barrel Pollution (God Barrel & importing from @/components)
    fs.mkdirSync(path.join(cmsDir, 'src/components'), { recursive: true });
    fs.writeFileSync(
      path.join(cmsDir, 'src/components/index.ts'),
      "export * from './ui';\nexport * from './shared';\n"
    );
    fs.mkdirSync(path.join(cmsDir, 'src/features/barrel-consumer'), { recursive: true });
    fs.writeFileSync(
      path.join(cmsDir, 'src/features/barrel-consumer/consumer.tsx'),
      "import { Button } from '@/components';\nexport const Consumer = () => null;"
    );

    // 10. Fixture: i18n Drift (missing vi key and unregistered namespace)
    const enFixtureDir = path.join(cmsDir, 'messages/en/features');
    const viFixtureDir = path.join(cmsDir, 'messages/vi/features');
    fs.mkdirSync(enFixtureDir, { recursive: true });
    fs.mkdirSync(viFixtureDir, { recursive: true });
    fs.writeFileSync(
      path.join(enFixtureDir, 'unregistered-drift.json'),
      JSON.stringify({ title: 'Hello', description: 'World' }, null, 2)
    );
    fs.writeFileSync(
      path.join(viFixtureDir, 'unregistered-drift.json'),
      JSON.stringify({ title: 'Xin chào' }, null, 2)
    );
    const i18nSharedDir = path.join(cmsDir, 'src/shared/i18n');
    fs.mkdirSync(i18nSharedDir, { recursive: true });
    fs.writeFileSync(
      path.join(i18nSharedDir, 'messages.ts'),
      "export const I18N_NAMESPACES = ['common'] as const;\n"
    );

    // 11. Fixture: Isolated Specs Directory (Invariant 34 violation)
    const isolatedSpecDir = path.join(beDir, 'specs');
    fs.mkdirSync(isolatedSpecDir, { recursive: true });
    fs.writeFileSync(
      path.join(isolatedSpecDir, 'isolated.spec.ts'),
      'describe("Isolated Spec", () => { it("violates invariant 34", () => {}); });'
    );
    const isolatedTestsDir = path.join(cmsDir, 'src/components/__tests__');
    fs.mkdirSync(isolatedTestsDir, { recursive: true });
    fs.writeFileSync(
      path.join(isolatedTestsDir, 'button.spec.tsx'),
      'export const ButtonTest = () => null;'
    );

    console.log(`${YELLOW}Running Architectural Invariant Auditor against deliberate hallucinations...${RESET}\n`);
    const auditor = new ArchitecturalInvariantAuditor(tmpDir);
    const code = auditor.run();

    console.log(`${BOLD}${CYAN}====================================================${RESET}`);
    console.log(`${BOLD}${CYAN}   RED-TEAM VERIFICATION RESULTS                   ${RESET}`);
    console.log(`${BOLD}${CYAN}====================================================${RESET}`);

    const expectedRules = [
      'ANTI_PHANTOM_PAGE',
      'ANTI_LAYER_BYPASS',
      'ANTI_TYPE_ERASURE',
      'ANTI_INLINE_QUERY_KEYS',
      'ANTI_NOISE_COMMENTS',
      'ANTI_SECRET_FALLBACK',
      'ANTI_FAKE_E2E',
      'ANTI_TOY_ARCHITECTURE',
      'ANTI_BARREL_POLLUTION',
      'ANTI_I18N_DRIFT',
      'ANTI_ISOLATED_SPECS',
    ];

    const detectedRuleIds = new Set(auditor.violations.map((v) => v.ruleId));
    let allCaught = true;

    expectedRules.forEach((rule) => {
      if (detectedRuleIds.has(rule)) {
        console.log(`  ${GREEN}✓ CAUGHT [${rule}]: Successfully trapped and blocked!${RESET}`);
      } else {
        console.log(`  ${RED}✗ MISSED [${rule}]: Failed to trap!${RESET}`);
        allCaught = false;
      }
    });

    if (allCaught && code === 1) {
      console.log(`\n${GREEN}${BOLD}✓ RED-TEAM SUCCESS: 100% of hallucinations were mechanically trapped!${RESET}`);
      console.log(`${GREEN}Exit Code 1 correctly triggered to abort deployment.${RESET}\n`);
      process.exit(0);
    } else {
      console.error(`\n${RED}${BOLD}✗ RED-TEAM FAILED: Some hallucinations escaped detection!${RESET}\n`);
      process.exit(1);
    }
  } finally {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

if (isRedTeam) {
  runRedTeamHarness();
} else {
  const auditor = new ArchitecturalInvariantAuditor(rootDir);
  const exitCode = auditor.run();
  process.exit(exitCode);
}
