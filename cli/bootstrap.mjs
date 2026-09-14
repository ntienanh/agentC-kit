#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KIT_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
let targetDir = '.';
let templateOption = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--template' || args[i] === '-t') {
    templateOption = args[i + 1];
    i++;
  } else if (!args[i].startsWith('-')) {
    targetDir = args[i];
  }
}

const targetDirAbs = path.resolve(process.cwd(), targetDir);
console.log(`\n🚀 Bootstrapping AgentC Kernel Governance into: ${targetDirAbs}`);

// 1. Copy Core Engine into .agentc-kit
const agentcDir = path.join(targetDirAbs, '.agentc-kit');
fs.mkdirSync(path.join(agentcDir, 'cli'), { recursive: true });
fs.mkdirSync(path.join(agentcDir, 'core'), { recursive: true });
fs.mkdirSync(path.join(agentcDir, 'agents'), { recursive: true });

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(path.join(KIT_ROOT, 'AGENTS.md'), path.join(agentcDir, 'AGENTS.md'));
copyRecursiveSync(path.join(KIT_ROOT, 'cli'), path.join(agentcDir, 'cli'));
copyRecursiveSync(path.join(KIT_ROOT, 'core'), path.join(agentcDir, 'core'));
copyRecursiveSync(path.join(KIT_ROOT, 'agents'), path.join(agentcDir, 'agents'));

try {
  fs.chmodSync(path.join(agentcDir, 'cli/agentc'), 0o755);
} catch {}

// Function for Arrow Key interactive selector menu
function promptTemplateSelection() {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY || templateOption) {
      resolve(templateOption || '');
      return;
    }

    const options = [
      { name: 'NestJS Enterprise Backend (be)', key: 'be' },
      { name: 'Next.js CMS Admin (cms)', key: 'cms' },
      { name: 'Front Office Client Portal (fo)', key: 'fo' },
      { name: 'None (Pure Governance & Engine Only)', key: '' }
    ];

    let selected = 0;

    function render() {
      console.log('\n📦 Select a Starter Boilerplate Template (Use ↑/↓ Arrow Keys & Enter):');
      options.forEach((opt, idx) => {
        if (idx === selected) {
          console.log(`  \x1b[1;\x1b[36m❯ ${opt.name}\x1b[0m`);
        } else {
          console.log(`    ${opt.name}`);
        }
      });
    }

    function clearMenu() {
      const linesToClear = options.length + 2;
      for (let i = 0; i < linesToClear; i++) {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 0);
      }
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    render();

    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'up') {
        clearMenu();
        selected = selected > 0 ? selected - 1 : options.length - 1;
        render();
      } else if (key.name === 'down') {
        clearMenu();
        selected = selected < options.length - 1 ? selected + 1 : 0;
        render();
      } else if (key.name === 'return') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        clearMenu();
        resolve(options[selected].key);
      } else if (key.ctrl && key.name === 'c') {
        process.stdin.setRawMode(false);
        process.exit(1);
      }
    });
  });
}

async function main() {
  const chosenTemplate = await promptTemplateSelection();

  // 2. Inject Boilerplate Template if selected
  if (chosenTemplate) {
    let srcTemplateDir = '';
    if (['be', 'nestjs', 'backend'].includes(chosenTemplate)) srcTemplateDir = path.join(KIT_ROOT, 'templates/be');
    else if (['cms', 'admin'].includes(chosenTemplate)) srcTemplateDir = path.join(KIT_ROOT, 'templates/cms');
    else if (['fo', 'frontend'].includes(chosenTemplate)) srcTemplateDir = path.join(KIT_ROOT, 'templates/fo');

    if (srcTemplateDir && fs.existsSync(srcTemplateDir)) {
      console.log(`📦 Injecting Starter Template '${chosenTemplate}' into ${targetDirAbs}...`);
      try {
        execSync(`rsync -aq --exclude='node_modules' --exclude='dist' --exclude='.next' "${srcTemplateDir}/" "${targetDirAbs}/"`, { stdio: 'ignore' });
      } catch {
        copyRecursiveSync(srcTemplateDir, targetDirAbs);
      }
      console.log(`✅ Boilerplate Template '${chosenTemplate}' injected successfully!`);
    }
  }

  // 3. Create Root AGENTS.md Pointer
  const rootAgentsContent = `# 🤖 AgentC Governance & Execution Pointer

> **ATTENTION ALL AI AGENTS (Antigravity, Claude Code, Cursor, Windsurf, Roo):**
> This repository is strictly governed by the **AgentC Autonomous Kernel (v2.0)**.

### 🔴 MANDATORY INSTRUCTIONS FOR AI AGENTS:
1. **READ MASTER RULES:** Always refer to \`/.agentc-kit/AGENTS.md\` for the 5 Core Axioms and 5-Gate Lifecycle.
2. **JIT SKILL DISCOVERY:** Execute \`./.agentc-kit/cli/agentc match "<task>"\` to discover JIT skills before starting tasks.
3. **MECHANICAL EVIDENCE:** Run \`./.agentc-kit/cli/agentc verify\` after code changes. Never claim success without Exit Code \`0\`.
4. **RUNTIME CONTEXT & SPECS:** Store PRDs, domain context, and scratch logs under \`/kit-docs/\` (GitIgnored).
`;
  fs.writeFileSync(path.join(targetDirAbs, 'AGENTS.md'), rootAgentsContent);

  // 4. Create kit-docs/ directory
  const kitDocsDir = path.join(targetDirAbs, 'kit-docs');
  fs.mkdirSync(path.join(kitDocsDir, 'specs'), { recursive: true });
  fs.mkdirSync(path.join(kitDocsDir, 'scratch'), { recursive: true });

  const contextExample = path.join(KIT_ROOT, 'templates/kit-docs/CONTEXT.md.example');
  if (!fs.existsSync(path.join(kitDocsDir, 'CONTEXT.md')) && fs.existsSync(contextExample)) {
    fs.copyFileSync(contextExample, path.join(kitDocsDir, 'CONTEXT.md'));
  }

  // 5. Append AgentC Resources to .gitignore
  const gitignorePath = path.join(targetDirAbs, '.gitignore');
  const gitignoreEntries = `
# AgentC Local Runtime Resources & Auto-Generated Artifacts
/kit-docs/
/kit-docs/scratch/
/kit-docs/audits/
*.log
.agentc-state.json
`;
  if (fs.existsSync(gitignorePath)) {
    const existingGitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!existingGitignore.includes('kit-docs')) {
      fs.appendFileSync(gitignorePath, gitignoreEntries);
      console.log("✅ Appended AgentC Runtime Resources to .gitignore");
    }
  } else {
    fs.writeFileSync(gitignorePath, gitignoreEntries.trimStart());
    console.log("✅ Created .gitignore with AgentC Runtime Resources");
  }

  console.log(`\n🎉 Done! AgentC Kit is now active in ${targetDirAbs}`);
  console.log("--------------------------------------------------------");
  console.log("🤖 Root Pointer: AGENTS.md (Auto-read by all AI Agents)");
  console.log("⚙️ Core Engine:  .agentc-kit/ (Rules, Engine & CLI)");
  console.log("📝 Local Docs:   kit-docs/ (CONTEXT.md, specs, scratch - GitIgnored)");
  if (chosenTemplate) {
    console.log(`📦 Template:     ${chosenTemplate}`);
  }
  console.log("--------------------------------------------------------");
  console.log("👉 Usage command in target repo: ./.agentc-kit/cli/agentc verify\n");
}

main();
