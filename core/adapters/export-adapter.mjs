#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KIT_ROOT = path.resolve(__dirname, '../..');

function printUsage() {
  console.log(`
AgentC Platform Adapter Exporter (v2.1-Hyper)

Usage:
  agentc export --target <claude|codex|antigravity> [options]

Options:
  --target <name>   Target platform (claude, codex, antigravity)
  --output <path>   Destination filepath (default: root CLAUDE.md, CODEX.md, or AGENTS.md)
  --json            Output structured JSON result
  -h, --help        Show this help message
`);
}

function parseArgs(args) {
  const parsed = {
    target: null,
    output: null,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--target' && args[i + 1]) {
      parsed.target = args[++i].toLowerCase();
    } else if (arg === '--output' && args[i + 1]) {
      parsed.output = args[++i];
    } else if (arg === '--json') {
      parsed.json = true;
    }
  }

  return parsed;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help') || args.length === 0) {
    printUsage();
    process.exit(0);
  }

  const parsed = parseArgs(args);

  if (!parsed.target) {
    console.error('Error: --target is required. Options: claude, codex, antigravity.');
    process.exit(1);
  }

  let templateFile;
  let defaultOutput;

  switch (parsed.target) {
    case 'claude':
      templateFile = path.join(KIT_ROOT, 'adapters/claude/CLAUDE.md.template');
      defaultOutput = path.join(KIT_ROOT, 'CLAUDE.md');
      break;
    case 'codex':
      templateFile = path.join(KIT_ROOT, 'adapters/codex/CODEX.md.template');
      defaultOutput = path.join(KIT_ROOT, 'CODEX.md');
      break;
    case 'antigravity':
      templateFile = path.join(KIT_ROOT, 'adapters/antigravity/AGENTS.md.template');
      defaultOutput = path.join(KIT_ROOT, 'AGENTS.md');
      break;
    default:
      console.error(`Error: Unknown target "${parsed.target}". Must be claude, codex, or antigravity.`);
      process.exit(1);
  }

  if (!fs.existsSync(templateFile)) {
    console.error(`Error: Template file missing at ${templateFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(templateFile, 'utf8');
  const targetPath = parsed.output ? path.resolve(parsed.output) : defaultOutput;

  fs.writeFileSync(targetPath, content, 'utf8');

  const result = {
    status: 'success',
    target: parsed.target,
    template: templateFile,
    exported_to: targetPath,
    bytes: content.length,
  };

  if (parsed.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\x1b[32m[EXPORTED]\x1b[0m Target: \x1b[36m${parsed.target}\x1b[0m -> ${targetPath}`);
  }
}

main();
