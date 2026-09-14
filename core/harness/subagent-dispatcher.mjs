#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KIT_ROOT = path.resolve(__dirname, '../..');
const WORKERS_DIR = path.join(KIT_ROOT, '.agentc/workers');

fs.mkdirSync(WORKERS_DIR, { recursive: true });

function printUsage() {
  console.log(`
AgentC Subagent Dispatcher — Strict Multi-Agent Isolation Harness (Axiom 1)

Usage:
  node subagent-dispatcher.mjs dispatch --role <role> --prompt <prompt> [options]
  node subagent-dispatcher.mjs list
  node subagent-dispatcher.mjs status <worker_id>

Options:
  --role <role>         Job role for the worker (e.g., "Backend Engineer", "QA Tester")
  --prompt <prompt>     Specific instructions for the subagent worker
  --model <model>       Model to use (inherit, sonnet, codex, etc. Default: inherit)
  --workspace <mode>    inherit | branch (Default: inherit)
  --exec <cmd>          Optional worker execution command to run inside isolated context
  --json                Output structured JSON
  -h, --help            Show this guidance
`);
}

function parseArgs(args) {
  const parsed = {
    command: args[0] || 'list',
    role: null,
    prompt: null,
    model: 'inherit',
    workspace: 'inherit',
    exec: null,
    json: false,
    workerId: null,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--role' && args[i + 1]) {
      parsed.role = args[++i];
    } else if (arg === '--prompt' && args[i + 1]) {
      parsed.prompt = args[++i];
    } else if (arg === '--model' && args[i + 1]) {
      parsed.model = args[++i];
    } else if (arg === '--workspace' && args[i + 1]) {
      parsed.workspace = args[++i];
    } else if (arg === '--exec' && args[i + 1]) {
      parsed.exec = args[++i];
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (!arg.startsWith('-') && !parsed.workerId) {
      parsed.workerId = arg;
    }
  }

  return parsed;
}

function dispatchWorker(options) {
  if (!options.role || !options.prompt) {
    console.error('Error: --role and --prompt are required for subagent dispatch.');
    process.exit(1);
  }

  const timestamp = Date.now();
  const workerId = `worker-${timestamp}-${Math.random().toString(36).slice(2, 7)}`;
  const sessionDir = path.join(WORKERS_DIR, workerId);
  fs.mkdirSync(sessionDir, { recursive: true });

  const packet = {
    worker_id: workerId,
    role: options.role,
    prompt: options.prompt,
    model: options.model,
    workspace: options.workspace,
    dispatched_at: new Date(timestamp).toISOString(),
    status: 'ACTIVE',
    exit_code: null,
  };

  fs.writeFileSync(
    path.join(sessionDir, 'dispatch-packet.json'),
    JSON.stringify(packet, null, 2)
  );

  const transcriptPath = path.join(sessionDir, 'transcript.log');
  fs.writeFileSync(
    transcriptPath,
    `[${packet.dispatched_at}] Worker ${workerId} initialized with role "${options.role}".\nTask: ${options.prompt}\n`
  );

  if (options.exec) {
    fs.appendFileSync(transcriptPath, `[EXEC] Running command: ${options.exec}\n`);
    try {
      const output = execSync(options.exec, {
        cwd: KIT_ROOT,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      fs.appendFileSync(transcriptPath, `[OUTPUT]\n${output}\n`);
      packet.status = 'COMPLETED';
      packet.exit_code = 0;
    } catch (err) {
      fs.appendFileSync(
        transcriptPath,
        `[FAILED] Exit ${err.status}\n${err.stdout || ''}\n${err.stderr || ''}\n`
      );
      packet.status = 'FAILED';
      packet.exit_code = err.status || 1;
    }
  }

  fs.writeFileSync(
    path.join(sessionDir, 'dispatch-packet.json'),
    JSON.stringify(packet, null, 2)
  );

  if (options.json) {
    console.log(JSON.stringify(packet, null, 2));
  } else {
    console.log(`\x1b[32m[DISPATCHED]\x1b[0m Worker: \x1b[36m${workerId}\x1b[0m`);
    console.log(`  Role:      ${options.role}`);
    console.log(`  Workspace: ${options.workspace}`);
    console.log(`  Session:   ${sessionDir}`);
    console.log(`  Status:    ${packet.status}`);
  }
}

function listWorkers(options) {
  if (!fs.existsSync(WORKERS_DIR)) {
    if (options.json) {
      console.log(JSON.stringify([]));
    } else {
      console.log('No subagents have been dispatched yet.');
    }
    return;
  }

  const entries = fs.readdirSync(WORKERS_DIR, { withFileTypes: true });
  const workers = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const packetFile = path.join(WORKERS_DIR, entry.name, 'dispatch-packet.json');
      if (fs.existsSync(packetFile)) {
        try {
          workers.push(JSON.parse(fs.readFileSync(packetFile, 'utf8')));
        } catch {}
      }
    }
  }

  workers.sort((a, b) => (b.dispatched_at || '').localeCompare(a.dispatched_at || ''));

  if (options.json) {
    console.log(JSON.stringify(workers, null, 2));
    return;
  }

  if (workers.length === 0) {
    console.log('No subagents found.');
    return;
  }

  console.log(`Dispatched Subagents (${workers.length}):`);
  console.log('----------------------------------------------------------------------');
  for (const w of workers) {
    console.log(`• ${w.worker_id} [${w.status}] - Role: ${w.role} (${w.dispatched_at})`);
  }
}

function workerStatus(workerId, options) {
  if (!workerId) {
    console.error('Error: Worker ID is required.');
    process.exit(1);
  }

  const sessionDir = path.join(WORKERS_DIR, workerId);
  const packetFile = path.join(sessionDir, 'dispatch-packet.json');

  if (!fs.existsSync(packetFile)) {
    console.error(`Error: Worker ${workerId} not found.`);
    process.exit(1);
  }

  const packet = JSON.parse(fs.readFileSync(packetFile, 'utf8'));

  if (options.json) {
    console.log(JSON.stringify(packet, null, 2));
    return;
  }

  console.log(`Worker Status: ${packet.worker_id}`);
  console.log(`  Role:       ${packet.role}`);
  console.log(`  Status:     ${packet.status}`);
  console.log(`  Model:      ${packet.model}`);
  console.log(`  Dispatched: ${packet.dispatched_at}`);
  console.log(`  Log:        ${path.join(sessionDir, 'transcript.log')}`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const parsed = parseArgs(args);

  switch (parsed.command) {
    case 'dispatch':
      dispatchWorker(parsed);
      break;
    case 'list':
      listWorkers(parsed);
      break;
    case 'status':
      workerStatus(parsed.workerId, parsed);
      break;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      printUsage();
      process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { dispatchWorker, listWorkers, workerStatus };
