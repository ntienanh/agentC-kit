#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const VERSION = '2.1.0';
const SERVER_NAME = 'agentc-engine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KIT_ROOT = path.resolve(__dirname, '../..');

const TOOL_DEFINITIONS = [
  {
    name: 'agentc_gate',
    description:
      'Manage the 5-Gate Lifecycle state machine (status, advance, retry, reset, abort). Enforces mechanical preconditions before progression.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['status', 'advance', 'retry', 'reset', 'abort'],
          default: 'status',
          description: 'Gate action to perform.',
        },
        target_dir: {
          type: 'string',
          description: 'Optional target directory to evaluate preconditions for.',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'agentc_match',
    description:
      'BM25 JIT Skill Router — matches task prompt against discrete skill metadata in agents/index.yaml to avoid loading monolithic context.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Task description or keywords to match against skills.',
        },
        gate: {
          type: 'integer',
          description: 'Optional gate filter (0-4).',
        },
        top_n: {
          type: 'integer',
          default: 3,
          description: 'Maximum number of matched skills to return.',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'agentc_verify',
    description:
      'Execute Mechanical Invariant Verifiers. Returns Exit Code 0 on pass, or compressed error details (Axiom 3 & 5).',
    inputSchema: {
      type: 'object',
      properties: {
        target_dir: {
          type: 'string',
          description: 'Optional directory to verify (defaults to current project).',
        },
        fix: {
          type: 'boolean',
          default: false,
          description: 'Automatically fix autofixable violations (like comments).',
        },
        rule: {
          type: 'string',
          description: 'Specific rule name or invariant number to verify.',
        },
        gate: {
          type: 'integer',
          description: 'Specific gate invariants to run (1-4).',
        },
        compress: {
          type: 'boolean',
          default: true,
          description: 'Compress error logs to <= 20 lines anchored at root causes.',
        },
      },
    },
  },
  {
    name: 'agentc_dispatch_subagent',
    description:
      'Strict Multi-Agent Worker Dispatcher. Spawns an isolated subagent worker to modify code while keeping Orchestrator zero-code (Axiom 1).',
    inputSchema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'Subagent role (e.g. "Backend Engineer", "QA Specialist").',
        },
        prompt: {
          type: 'string',
          description: 'Actionable prompt/instructions for the worker.',
        },
        model: {
          type: 'string',
          default: 'inherit',
          description: 'Target model for the worker (inherit, sonnet, codex, etc.).',
        },
        workspace: {
          type: 'string',
          enum: ['inherit', 'branch'],
          default: 'inherit',
          description: 'Workspace isolation mode.',
        },
        inputs: {
          type: 'object',
          description: 'Input artifacts and dependencies passed to subagent.',
        },
        outputs: {
          type: 'object',
          description: 'Expected outputs from subagent.',
        },
        criteria: {
          type: 'string',
          description: 'Quantitative acceptance criteria for verification.',
        },
      },
      required: ['role', 'prompt'],
    },
  },
  {
    name: 'agentc_checkpoint',
    description: 'Manage Git Stash checkpoints (save, list, rollback) for safe iterative development.',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['save', 'list', 'rollback'],
          default: 'list',
          description: 'Checkpoint action to perform.',
        },
        label: {
          type: 'string',
          description: 'Label name for checkpoint save or rollback.',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'agentc_report',
    description: 'Generate KPI & Run-Audit summary dashboard.',
    inputSchema: {
      type: 'object',
      properties: {
        last_n: {
          type: 'integer',
          default: 5,
          description: 'Number of recent runs to include in summary report.',
        },
      },
    },
  },
];

function handleInitialize(req) {
  return {
    jsonrpc: '2.0',
    id: req.id,
    result: {
      protocolVersion: '2024-11-05',
      serverInfo: {
        name: SERVER_NAME,
        version: VERSION,
      },
      capabilities: {
        tools: {
          listChanged: false,
        },
      },
    },
  };
}

function handleToolsList(req) {
  return {
    jsonrpc: '2.0',
    id: req.id,
    result: {
      tools: TOOL_DEFINITIONS,
    },
  };
}

function executeGate(args) {
  const action = args.action || 'status';
  const targetDir = args.target_dir ? `TARGET_DIR="${args.target_dir}" ` : '';
  const cmd = `${targetDir}bash "${KIT_ROOT}/core/gate/gate-runner.sh" ${action}`;
  try {
    const stdout = execSync(cmd, { cwd: KIT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { status: 'success', action, output: stdout.trim() };
  } catch (err) {
    return {
      status: 'failure',
      action,
      exit_code: err.status || 1,
      output: (err.stdout || '') + (err.stderr || '') || err.message,
    };
  }
}

function executeMatch(args) {
  const prompt = args.prompt;
  const gateFlag = args.gate !== undefined ? `--gate ${args.gate}` : '';
  const topNFlag = args.top_n !== undefined ? `--top-n ${args.top_n}` : '';
  const cmd = `node "${KIT_ROOT}/cli/skill-matcher.mjs" --prompt "${prompt.replace(/"/g, '\\"')}" ${gateFlag} ${topNFlag} --json`;
  try {
    const stdout = execSync(cmd, { cwd: KIT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const parsed = JSON.parse(stdout);
    return { status: 'success', matches: parsed };
  } catch (err) {
    return {
      status: 'failure',
      error: err.message,
      output: (err.stdout || '') + (err.stderr || ''),
    };
  }
}

function executeVerify(args) {
  const flags = [];
  if (args.fix) flags.push('--fix');
  if (args.rule) flags.push(`--rule "${args.rule}"`);
  if (args.gate) flags.push(`--gate ${args.gate}`);
  const targetDir = args.target_dir || '.';
  const cmd = `bash "${KIT_ROOT}/core/checkers/verify-invariants.sh" ${flags.join(' ')} "${targetDir}"`;

  try {
    const stdout = execSync(cmd, { cwd: KIT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { status: 'passed', exit_code: 0, output: stdout.trim() };
  } catch (err) {
    let rawOutput = (err.stdout || '') + '\n' + (err.stderr || '');
    let output = rawOutput.trim();

    if (args.compress !== false) {
      const lines = rawOutput.split('\n');
      const filtered = lines.filter((line) =>
        /error|fail|violation|invariant|assertion/i.test(line)
      );
      if (filtered.length > 0) {
        output = filtered.slice(0, 20).join('\n');
      } else {
        output = lines.slice(0, 20).join('\n');
      }
    }

    return {
      status: 'failed',
      exit_code: err.status || 1,
      output,
      remediation: 'Inspect root-cause lines and apply targeted fixes.',
    };
  }
}

function executeDispatchSubagent(args) {
  const workersDir = path.join(KIT_ROOT, '.agentc/workers');
  fs.mkdirSync(workersDir, { recursive: true });

  const workerId = `worker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const workerSessionDir = path.join(workersDir, workerId);
  fs.mkdirSync(workerSessionDir, { recursive: true });

  const packet = {
    worker_id: workerId,
    role: args.role,
    prompt: args.prompt,
    model: args.model || 'inherit',
    workspace: args.workspace || 'inherit',
    inputs: args.inputs || {},
    outputs: args.outputs || {},
    criteria: args.criteria || '',
    created_at: new Date().toISOString(),
    status: 'DISPATCHED',
  };

  fs.writeFileSync(
    path.join(workerSessionDir, 'dispatch-packet.json'),
    JSON.stringify(packet, null, 2)
  );

  const transcriptPath = path.join(workerSessionDir, 'transcript.log');
  fs.writeFileSync(
    transcriptPath,
    `[${packet.created_at}] Dispatched ${args.role} (${workerId}): ${args.prompt}\n`
  );

  return {
    status: 'DISPATCHED',
    worker_id: workerId,
    session_dir: workerSessionDir,
    transcript_log: transcriptPath,
    message: `Subagent worker ${workerId} initiated for role "${args.role}". Orchestrator remains zero-code.`,
  };
}

function executeCheckpoint(args) {
  const action = args.action || 'list';
  const label = args.label ? `"${args.label}"` : '';
  const cmd = `bash "${KIT_ROOT}/core/gate/git-checkpoint.sh" ${action} ${label}`;
  try {
    const stdout = execSync(cmd, { cwd: KIT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { status: 'success', action, output: stdout.trim() };
  } catch (err) {
    return {
      status: 'failure',
      action,
      error: err.message,
      output: (err.stdout || '') + (err.stderr || ''),
    };
  }
}

function executeReport(args) {
  const lastN = args.last_n || 5;
  const cmd = `bash "${KIT_ROOT}/core/gate/audit-report.sh" --last-n ${lastN}`;
  try {
    const stdout = execSync(cmd, { cwd: KIT_ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { status: 'success', output: stdout.trim() };
  } catch (err) {
    return {
      status: 'failure',
      error: err.message,
      output: (err.stdout || '') + (err.stderr || ''),
    };
  }
}

function handleToolCall(req) {
  const toolName = req.params?.name;
  const args = req.params?.arguments || {};

  try {
    let result;
    switch (toolName) {
      case 'agentc_gate':
        result = executeGate(args);
        break;
      case 'agentc_match':
        result = executeMatch(args);
        break;
      case 'agentc_verify':
        result = executeVerify(args);
        break;
      case 'agentc_dispatch_subagent':
        result = executeDispatchSubagent(args);
        break;
      case 'agentc_checkpoint':
        result = executeCheckpoint(args);
        break;
      case 'agentc_report':
        result = executeReport(args);
        break;
      default:
        return {
          jsonrpc: '2.0',
          id: req.id,
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`,
          },
        };
    }

    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        ...result,
      },
    };
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id: req.id,
      error: {
        code: -32603,
        message: `Internal error executing tool ${toolName}: ${err.message}`,
      },
    };
  }
}

function startStdioServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let req;
    try {
      req = JSON.parse(trimmed);
    } catch {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error: Invalid JSON' },
        }) + '\n'
      );
      return;
    }

    if (!req || typeof req !== 'object') return;

    const method = req.method;

    if (method === 'initialize') {
      process.stdout.write(JSON.stringify(handleInitialize(req)) + '\n');
      return;
    }

    if (method === 'notifications/initialized' || method === 'initialized') {
      return;
    }

    if (method === 'tools/list') {
      process.stdout.write(JSON.stringify(handleToolsList(req)) + '\n');
      return;
    }

    if (method === 'tools/call') {
      process.stdout.write(JSON.stringify(handleToolCall(req)) + '\n');
      return;
    }

    if (method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: req.id, result: {} }) + '\n');
      return;
    }

    process.stdout.write(
      JSON.stringify({
        jsonrpc: '2.0',
        id: req.id !== undefined ? req.id : null,
        error: { code: -32601, message: `Method not found: ${method}` },
      }) + '\n'
    );
  });
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    console.log(`agentc-engine MCP Server v${VERSION}\nUsage: node agentc-server.mjs`);
    process.exit(0);
  }
  if (args.includes('-v') || args.includes('--version')) {
    console.log(`agentc-engine v${VERSION}`);
    process.exit(0);
  }
  startStdioServer();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

export { SERVER_NAME, VERSION, TOOL_DEFINITIONS };
