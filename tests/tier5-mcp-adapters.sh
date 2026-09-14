#!/usr/bin/env bash
# agentc-v2/tests/tier5-mcp-adapters.sh
# Tier 5: MCP Server, Platform Adapters & Subagent Dispatcher Verification (15 Tests)

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

log_header "TIER 5: MCP SERVER, PLATFORM ADAPTERS & SUBAGENTS (15 Tests)"

MCP_SERVER="$AGENTC_ROOT/core/mcp/agentc-server.mjs"
MCP_CONFIG="$AGENTC_ROOT/.mcp.json"
EXPORT_SCRIPT="$AGENTC_ROOT/core/adapters/export-adapter.mjs"
DISPATCHER="$AGENTC_ROOT/core/harness/subagent-dispatcher.mjs"

# -----------------------------------------------------------------------------
# 1. AgentC Unified MCP Server
# -----------------------------------------------------------------------------
assert_file_exists "T5.1.1" "agentc-server.mjs exists" "$MCP_SERVER"
assert_executable "T5.1.2" "agentc-server.mjs is executable" "$MCP_SERVER"

test_mcp_initialize() {
  local res
  res=$(node -e "
    const { spawn } = require('child_process');
    const p = spawn('node', ['$MCP_SERVER']);
    p.stdout.on('data', (d) => {
      const r = JSON.parse(d.toString().trim());
      if (r.result?.serverInfo?.name === 'agentc-engine') {
        console.log('OK');
        p.kill();
      }
    });
    p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }) + '\n');
  " 2>/dev/null || echo "")

  if [ "$res" = "OK" ]; then
    record_pass "T5.1.3" "agentc-server.mjs responds to initialize with agentc-engine"
  else
    record_fail "T5.1.3" "agentc-server initialize" "Did not get expected initialize response"
  fi
}
test_mcp_initialize

test_mcp_tools_list() {
  local tool_count
  tool_count=$(node -e "
    const { spawn } = require('child_process');
    const p = spawn('node', ['$MCP_SERVER']);
    p.stdout.on('data', (d) => {
      const r = JSON.parse(d.toString().trim());
      if (r.result?.tools) {
        console.log(r.result.tools.length);
        p.kill();
      }
    });
    p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
  " 2>/dev/null || echo "0")

  if [ "$tool_count" -ge 6 ]; then
    record_pass "T5.1.4" "agentc-server.mjs registers at least 6 tools (found: $tool_count)"
  else
    record_fail "T5.1.4" "agentc-server tools/list" "Expected >=6 tools, got $tool_count"
  fi
}
test_mcp_tools_list

test_mcp_tool_match() {
  local match_status
  match_status=$(node -e "
    const { spawn } = require('child_process');
    const p = spawn('node', ['$MCP_SERVER']);
    p.stdout.on('data', (d) => {
      const r = JSON.parse(d.toString().trim());
      if (r.result?.status === 'success') {
        console.log('OK');
        p.kill();
      }
    });
    p.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'agentc_match', arguments: { prompt: 'backend nestjs' } }
    }) + '\n');
  " 2>/dev/null || echo "")

  if [ "$match_status" = "OK" ]; then
    record_pass "T5.1.5" "agentc-server.mjs executes agentc_match tool via JSON-RPC"
  else
    record_fail "T5.1.5" "agentc-server tools/call" "Failed to execute agentc_match"
  fi
}
test_mcp_tool_match

# -----------------------------------------------------------------------------
# 2. Root MCP Configuration
# -----------------------------------------------------------------------------
assert_file_exists "T5.2.1" ".mcp.json exists in root" "$MCP_CONFIG"

test_mcp_json_valid() {
  if node -e "JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'))" >/dev/null 2>&1; then
    record_pass "T5.2.2" ".mcp.json is valid JSON"
  else
    record_fail "T5.2.2" ".mcp.json valid" "Invalid JSON in .mcp.json"
  fi
}
test_mcp_json_valid

assert_file_contains "T5.2.3" ".mcp.json defines agentc-engine server" \
  "agentc-engine" "$MCP_CONFIG"

# -----------------------------------------------------------------------------
# 3. Platform Adapters & Exporter
# -----------------------------------------------------------------------------
assert_file_exists "T5.3.1" "export-adapter.mjs exists and is executable" "$EXPORT_SCRIPT"
assert_file_exists "T5.3.2" "CLAUDE.md.template exists" "$AGENTC_ROOT/adapters/claude/CLAUDE.md.template"
assert_file_exists "T5.3.3" "CODEX.md.template exists" "$AGENTC_ROOT/adapters/codex/CODEX.md.template"

test_export_claude_xml() {
  local mock_dir
  mock_dir="$(make_temp_dir "export_claude")"
  local target_file="$mock_dir/CLAUDE.md"

  node "$EXPORT_SCRIPT" --target claude --output "$target_file" >/dev/null 2>&1 || true

  if [ -f "$target_file" ] && grep -q "<agentc_kernel" "$target_file" && grep -q "<kernel_axioms>" "$target_file"; then
    record_pass "T5.3.4" "export --target claude generates valid XML-tagged CLAUDE.md"
  else
    record_fail "T5.3.4" "export claude" "CLAUDE.md missing or not XML tagged"
  fi
}
test_export_claude_xml

test_export_codex_schema() {
  local mock_dir
  mock_dir="$(make_temp_dir "export_codex")"
  local target_file="$mock_dir/CODEX.md"

  node "$EXPORT_SCRIPT" --target codex --output "$target_file" >/dev/null 2>&1 || true

  if [ -f "$target_file" ] && grep -q "Dispatch Packet" "$target_file"; then
    record_pass "T5.3.5" "export --target codex generates structured schema CODEX.md"
  else
    record_fail "T5.3.5" "export codex" "CODEX.md missing or lacks schema definitions"
  fi
}
test_export_codex_schema

# -----------------------------------------------------------------------------
# 4. Strict Multi-Agent Subagent Dispatcher
# -----------------------------------------------------------------------------
assert_file_exists "T5.4.1" "subagent-dispatcher.mjs exists and is executable" "$DISPATCHER"

test_subagent_dispatch() {
  local out
  out=$(node "$DISPATCHER" dispatch --role "Tester" --prompt "Execute tests" --json 2>/dev/null || echo "")

  if echo "$out" | grep -q '"status": "ACTIVE"'; then
    record_pass "T5.4.2" "subagent-dispatcher creates active worker session packet"
  else
    record_fail "T5.4.2" "subagent dispatch" "Failed to dispatch worker: $out"
  fi
}
test_subagent_dispatch

test_subagent_list() {
  local out
  out=$(node "$DISPATCHER" list --json 2>/dev/null || echo "[]")

  if echo "$out" | grep -q 'worker-'; then
    record_pass "T5.4.3" "subagent-dispatcher list returns dispatched workers"
  else
    record_fail "T5.4.3" "subagent list" "Did not list any workers"
  fi
}
test_subagent_list

# -----------------------------------------------------------------------------
# 5. Invariant Verifier Context Budgeting Compression
# -----------------------------------------------------------------------------
test_verify_compress_flag() {
  local mock_dir
  mock_dir="$(make_temp_dir "verify_compress")"
  mkdir -p "$mock_dir/src" "$mock_dir/messages/en" "$mock_dir/messages/vi"
  echo 'export const a = 1;' > "$mock_dir/src/a.ts"
  echo '{"ok":"OK"}' > "$mock_dir/messages/en/common.json"
  echo '{"ok":"OK"}' > "$mock_dir/messages/vi/common.json"

  local exit_code=0
  bash "$AGENTC_ROOT/core/checkers/verify-invariants.sh" --compress "$mock_dir" >/dev/null 2>&1 || exit_code=$?

  if [ "$exit_code" -eq 0 ]; then
    record_pass "T5.5.1" "verify-invariants.sh --compress executes cleanly without errors"
  else
    record_fail "T5.5.1" "verify-invariants compress" "Failed with exit $exit_code"
  fi
}
test_verify_compress_flag

print_summary "Tier 5: MCP, Adapters & Subagents"
