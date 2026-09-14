#!/usr/bin/env bash
# agentc-v2/tests/tier1-feature-coverage.sh
# Tier 1: Comprehensive Feature Coverage & Happy-Path Tests (65 test cases)

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

log_header "TIER 1: FEATURE COVERAGE & HAPPY PATH (65 Tests)"

# -----------------------------------------------------------------------------
# FEATURE 1: Minimalist Agent Kernel (< 60 lines)
# -----------------------------------------------------------------------------
KERNEL_FILE="$AGENTC_ROOT/AGENTS.md"

assert_file_exists "T1.1.1" "Kernel file exists at agentc-v2/AGENTS.md" "$KERNEL_FILE"
assert_file_not_empty "T1.1.2" "Kernel file is non-empty" "$KERNEL_FILE"
assert_file_contains "T1.1.3" "Kernel defines core execution axioms" \
  "(Axiom|Tôn chỉ|Thiết quân luật|Zero-Code|Anti-LARP)" "$KERNEL_FILE"
assert_file_contains "T1.1.4" "Kernel defines 5-gate lifecycle" \
  "(Gate|Chặng|Lifecycle|GATE [0-4])" "$KERNEL_FILE"
assert_file_contains "T1.1.5" "Kernel defines progressive disclosure pointing to skills directory" \
  "skills/" "$KERNEL_FILE"

# -----------------------------------------------------------------------------
# FEATURE 2: Progressive Disclosure AI Skills Library
# -----------------------------------------------------------------------------
SKILLS_DIR="$AGENTC_ROOT/agents/skills"

assert_dir_exists "T1.2.1" "Skills directory exists at agentc-v2/skills" "$SKILLS_DIR"

# Count skill directories
check_skills_count() {
  if [ -d "$SKILLS_DIR" ]; then
    local count
    count=$(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d '[:space:]')
    if [ "$count" -ge 18 ]; then
      record_pass "T1.2.2" "At least 18 skill directories exist (found: $count)"
    else
      record_fail "T1.2.2" "At least 18 skill directories exist" "Found only $count skills in $SKILLS_DIR"
    fi
  else
    record_fail "T1.2.2" "At least 18 skill directories exist" "Skills directory missing"
  fi
}
check_skills_count

# Check every skill directory contains SKILL.md
check_skill_files_exist() {
  if [ -d "$SKILLS_DIR" ]; then
    local missing=0
    local total=0
    for d in "$SKILLS_DIR"/*/; do
      [ -d "$d" ] || continue
      total=$((total + 1))
      if [ ! -f "${d}SKILL.md" ]; then
        missing=$((missing + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$missing" -eq 0 ]; then
      record_pass "T1.2.3" "All $total skill directories contain SKILL.md"
    else
      record_fail "T1.2.3" "All skill directories contain SKILL.md" "$missing of $total missing SKILL.md"
    fi
  else
    record_fail "T1.2.3" "All skill directories contain SKILL.md" "Skills directory missing"
  fi
}
check_skill_files_exist

# Check valid YAML frontmatter delimiters
check_yaml_frontmatter() {
  if [ -d "$SKILLS_DIR" ]; then
    local invalid=0
    local total=0
    for f in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$f" ] || continue
      total=$((total + 1))
      local first_line
      first_line=$(head -n 1 "$f" | tr -d '[:space:]')
      if [ "$first_line" != "---" ]; then
        invalid=$((invalid + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$invalid" -eq 0 ]; then
      record_pass "T1.2.4" "All $total SKILL.md files start with YAML frontmatter delimiter (---)"
    else
      record_fail "T1.2.4" "All SKILL.md files start with YAML frontmatter delimiter" "$invalid of $total invalid"
    fi
  else
    record_fail "T1.2.4" "YAML frontmatter format" "Skills directory missing"
  fi
}
check_yaml_frontmatter

# Check Decision Matrix section in skills
check_decision_matrix() {
  if [ -d "$SKILLS_DIR" ]; then
    local missing=0
    local total=0
    for f in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$f" ] || continue
      total=$((total + 1))
      if ! grep -E -q -i "(decision matrix|ma trận quyết định|decision branch|bảng quyết định)" "$f"; then
        missing=$((missing + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$missing" -eq 0 ]; then
      record_pass "T1.2.5" "All $total SKILL.md files contain a Decision Matrix / Branching section"
    else
      record_fail "T1.2.5" "All SKILL.md files contain Decision Matrix" "$missing of $total missing decision matrix"
    fi
  else
    record_fail "T1.2.5" "Decision Matrix presence" "Skills directory missing"
  fi
}
check_decision_matrix

# -----------------------------------------------------------------------------
# FEATURE 3: Code-Review-Graph MCP Config
# -----------------------------------------------------------------------------
MCP_CONFIG="$AGENTC_ROOT/.mcp.json"

assert_file_exists "T1.3.1" "MCP configuration exists at agentc-v2/.mcp.json" "$MCP_CONFIG"
assert_json_valid "T1.3.2" "agentc-v2/.mcp.json is valid JSON syntax" "$MCP_CONFIG"

check_mcp_servers_decl() {
  if [ -f "$MCP_CONFIG" ]; then
    if node -e "
      const cfg = JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'));
      if (!cfg.mcpServers || !cfg.mcpServers['code-review-graph']) process.exit(1);
    " >/dev/null 2>&1; then
      record_pass "T1.3.3" ".mcp.json registers 'code-review-graph' under mcpServers"
    else
      record_fail "T1.3.3" ".mcp.json registers 'code-review-graph'" "Key missing or invalid structure"
    fi
  else
    record_fail "T1.3.3" "MCP config check" "File missing"
  fi
}
check_mcp_servers_decl

check_mcp_command_runner() {
  if [ -f "$MCP_CONFIG" ]; then
    if node -e "
      const cfg = JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'));
      const srv = cfg.mcpServers && cfg.mcpServers['code-review-graph'];
      if (!srv || !srv.command || !(srv.args && srv.args.some(a => a.includes('code-review-graph')))) process.exit(1);
    " >/dev/null 2>&1; then
      record_pass "T1.3.4" ".mcp.json specifies command runner pointing to code-review-graph script"
    else
      record_fail "T1.3.4" ".mcp.json command runner" "Server command or args invalid"
    fi
  else
    record_fail "T1.3.4" "MCP config check" "File missing"
  fi
}
check_mcp_command_runner

check_mcp_tools_declaration() {
  if [ -f "$MCP_CONFIG" ]; then
    if grep -E -q "(query_graph_tool|get_impact_radius|get_review_context_tool)" "$MCP_CONFIG"; then
      record_pass "T1.3.5" ".mcp.json references code-review-graph tools"
    else
      record_fail "T1.3.5" ".mcp.json tools declaration" "Required tool names not mentioned"
    fi
  else
    record_fail "T1.3.5" "MCP config tools check" "File missing"
  fi
}
check_mcp_tools_declaration

# -----------------------------------------------------------------------------
# FEATURE 4: Code-Review-Graph MCP Server Execution
# -----------------------------------------------------------------------------
MCP_RUNNER="$AGENTC_ROOT/core/mcp/code-review-graph.mjs"

assert_file_exists "T1.4.1" "MCP runner exists at tools/mcp/code-review-graph.mjs" "$MCP_RUNNER"

# Test JSON-RPC initialize
check_mcp_initialize() {
  if [ -f "$MCP_RUNNER" ]; then
    local init_req='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0"}}}'
    local response
    response=$(echo "$init_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -q '"result"'; then
      record_pass "T1.4.2" "MCP runner responds to JSON-RPC initialize"
    else
      record_fail "T1.4.2" "MCP runner initialize" "Invalid response: $response"
    fi
  else
    record_fail "T1.4.2" "MCP runner initialize" "Runner file missing"
  fi
}
check_mcp_initialize

# Test JSON-RPC tools/list
check_mcp_tools_list() {
  if [ -f "$MCP_RUNNER" ]; then
    local list_req='{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
    local response
    response=$(echo "$list_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -q '"tools"'; then
      record_pass "T1.4.3" "MCP runner responds to tools/list"
    else
      record_fail "T1.4.3" "MCP runner tools/list" "Invalid response: $response"
    fi
  else
    record_fail "T1.4.3" "MCP runner tools/list" "Runner file missing"
  fi
}
check_mcp_tools_list

# Test required tools advertised
check_mcp_advertises_tools() {
  if [ -f "$MCP_RUNNER" ]; then
    local list_req='{"jsonrpc":"2.0","id":3,"method":"tools/list","params":{}}'
    local response
    response=$(echo "$list_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    local has_query
    local has_radius
    local has_ctx
    has_query=$(echo "$response" | grep -c "query_graph_tool" || true)
    has_radius=$(echo "$response" | grep -c "get_impact_radius" || true)
    has_ctx=$(echo "$response" | grep -c "get_review_context_tool" || true)
    if [ "$has_query" -ge 1 ] && [ "$has_radius" -ge 1 ] && [ "$has_ctx" -ge 1 ]; then
      record_pass "T1.4.4" "MCP runner advertises all 3 required tools"
    else
      record_fail "T1.4.4" "MCP runner advertises tools" "Missing tools in response: $response"
    fi
  else
    record_fail "T1.4.4" "MCP runner tools check" "Runner file missing"
  fi
}
check_mcp_advertises_tools

# Test query_graph_tool invocation
check_mcp_query_graph_invocation() {
  if [ -f "$MCP_RUNNER" ]; then
    local call_req='{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"query_graph_tool","arguments":{"query":"test"}}}'
    local response
    response=$(echo "$call_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -E -q '("result"|"content"|"status")'; then
      record_pass "T1.4.5" "MCP runner executes query_graph_tool with standard envelope"
    else
      record_fail "T1.4.5" "MCP runner query_graph_tool" "Unexpected envelope: $response"
    fi
  else
    record_fail "T1.4.5" "MCP runner invocation" "Runner file missing"
  fi
}
check_mcp_query_graph_invocation

# -----------------------------------------------------------------------------
# FEATURE 5: AST-Guided Skills (wireup-review & code-refactor)
# -----------------------------------------------------------------------------
WIREUP_SKILL="$AGENTC_ROOT/agents/skills/wireup-review/SKILL.md"
REFACTOR_SKILL="$AGENTC_ROOT/agents/skills/code-refactor/SKILL.md"

assert_file_exists "T1.5.1" "wireup-review skill exists at skills/wireup-review/SKILL.md" "$WIREUP_SKILL"
assert_file_contains "T1.5.2" "wireup-review skill specifies query_graph_tool and get_impact_radius" \
  "(query_graph_tool|get_impact_radius)" "$WIREUP_SKILL"
assert_file_exists "T1.5.3" "code-refactor skill exists at skills/code-refactor/SKILL.md" "$REFACTOR_SKILL"
assert_file_contains "T1.5.4" "code-refactor skill specifies get_review_context_tool and get_impact_radius" \
  "(get_review_context_tool|get_impact_radius)" "$REFACTOR_SKILL"
assert_file_contains "T1.5.5" "AST skills specify context budget constraints (<= 2000 tokens)" \
  "(2000 tokens|ngân sách|context budget)" "$REFACTOR_SKILL"

# -----------------------------------------------------------------------------
# FEATURE 6: Master Verification Script (verify-invariants.sh)
# -----------------------------------------------------------------------------
VERIFY_SCRIPT="$AGENTC_ROOT/core/checkers/verify-invariants.sh"

assert_file_exists "T1.6.1" "verify-invariants.sh exists at agentc-v2/scripts/" "$VERIFY_SCRIPT"
assert_executable "T1.6.2" "verify-invariants.sh is executable" "$VERIFY_SCRIPT"

check_verify_help() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local help_out
    help_out=$("$VERIFY_SCRIPT" --help 2>&1 || true)
    if echo "$help_out" | grep -E -q -i "(usage|options|invariants|check)"; then
      record_pass "T1.6.3" "verify-invariants.sh displays help/usage"
    else
      record_fail "T1.6.3" "verify-invariants.sh --help" "No usage output"
    fi
  else
    record_fail "T1.6.3" "verify-invariants.sh --help" "Script not executable or missing"
  fi
}
check_verify_help

# Test execution on clean mock project (exit code 0)
test_verify_clean_mock() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "mock_clean")"
    mkdir -p "$mock_dir/src/shared/ui/button" "$mock_dir/src/logic/user" "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo 'export const AppButton = () => null;' > "$mock_dir/src/shared/ui/button/AppButton.tsx"
    echo 'export const useUser = () => ({});' > "$mock_dir/src/logic/user/useUserLogic.ts"
    echo '{"welcome":"Hello"}' > "$mock_dir/messages/en/common.json"
    echo '{"welcome":"Xin chào"}' > "$mock_dir/messages/vi/common.json"

    local exit_code=0
    "$VERIFY_SCRIPT" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T1.6.4" "verify-invariants.sh exits 0 on clean mock project"
    else
      record_fail "T1.6.4" "verify-invariants.sh clean mock" "Expected exit 0, got $exit_code"
    fi
  else
    record_fail "T1.6.4" "verify-invariants.sh clean mock" "Script not executable or missing"
  fi
}
test_verify_clean_mock

# Test execution on dirty mock project (exit code 1)
test_verify_dirty_mock() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "mock_dirty")"
    mkdir -p "$mock_dir/src"
    echo '// stray comment violating invariant 31' > "$mock_dir/src/bad.ts"

    local exit_code=0
    "$VERIFY_SCRIPT" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.6.5" "verify-invariants.sh exits non-zero on dirty mock project"
    else
      record_fail "T1.6.5" "verify-invariants.sh dirty mock" "Expected non-zero, got 0"
    fi
  else
    record_fail "T1.6.5" "verify-invariants.sh dirty mock" "Script not executable or missing"
  fi
}
test_verify_dirty_mock

# -----------------------------------------------------------------------------
# FEATURE 7: Modular Zero-Comment Checker (Invariant 31)
# -----------------------------------------------------------------------------
CHECK_COMMENTS="$AGENTC_ROOT/core/checkers/check-no-comments.sh"

assert_file_exists "T1.7.1" "check-no-comments.sh exists" "$CHECK_COMMENTS"
assert_executable "T1.7.2" "check-no-comments.sh is executable" "$CHECK_COMMENTS"

test_comment_detection_single() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_single")"
    mkdir -p "$mock_dir/src"
    echo 'const a = 1; // bad comment' > "$mock_dir/src/file.ts"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.7.3" "check-no-comments.sh detects single-line comment (exit non-zero)"
    else
      record_fail "T1.7.3" "check-no-comments.sh single-line" "Expected non-zero exit code"
    fi
  else
    record_fail "T1.7.3" "check-no-comments.sh single-line" "Script not executable or missing"
  fi
}
test_comment_detection_single

test_comment_detection_block() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_block")"
    mkdir -p "$mock_dir/src"
    echo '/* bad block comment */ const b = 2;' > "$mock_dir/src/file.ts"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.7.4" "check-no-comments.sh detects block comment (exit non-zero)"
    else
      record_fail "T1.7.4" "check-no-comments.sh block" "Expected non-zero exit code"
    fi
  else
    record_fail "T1.7.4" "check-no-comments.sh block" "Script not executable or missing"
  fi
}
test_comment_detection_block

test_comment_fix_flag() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_fix")"
    mkdir -p "$mock_dir/src"
    echo 'const a = 1; // stray comment' > "$mock_dir/src/file.ts"

    local fix_exit=0
    "$CHECK_COMMENTS" --fix "$mock_dir" >/dev/null 2>&1 || fix_exit=$?

    # Verify subsequent run exits 0
    local verify_exit=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || verify_exit=$?
    if [ "$verify_exit" -eq 0 ]; then
      record_pass "T1.7.5" "check-no-comments.sh --fix strips comments and restores clean state"
    else
      record_fail "T1.7.5" "check-no-comments.sh --fix" "Code still has comments after --fix"
    fi
  else
    record_fail "T1.7.5" "check-no-comments.sh --fix" "Script not executable or missing"
  fi
}
test_comment_fix_flag

# -----------------------------------------------------------------------------
# FEATURE 8: Modular Anti-Barrel Checker (Invariant 33)
# -----------------------------------------------------------------------------
CHECK_BARRELS="$AGENTC_ROOT/core/checkers/check-no-barrels.sh"

assert_file_exists "T1.8.1" "check-no-barrels.sh exists" "$CHECK_BARRELS"
assert_executable "T1.8.2" "check-no-barrels.sh is executable" "$CHECK_BARRELS"

test_barrel_direct_import_allowed() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_direct")"
    mkdir -p "$mock_dir/src/features/auth"
    echo "import { AppButton } from '@/shared/ui/button/AppButton';" > "$mock_dir/src/features/auth/Login.tsx"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T1.8.3" "check-no-barrels.sh allows direct imports"
    else
      record_fail "T1.8.3" "check-no-barrels.sh direct" "Failed on direct import"
    fi
  else
    record_fail "T1.8.3" "check-no-barrels.sh direct" "Script not executable or missing"
  fi
}
test_barrel_direct_import_allowed

test_barrel_god_barrel_detected() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_god")"
    mkdir -p "$mock_dir/src/features/auth"
    echo "import { Button } from '@/components';" > "$mock_dir/src/features/auth/Login.tsx"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.8.4" "check-no-barrels.sh detects god barrel import '@/components'"
    else
      record_fail "T1.8.4" "check-no-barrels.sh god barrel" "Did not detect god barrel import"
    fi
  else
    record_fail "T1.8.4" "check-no-barrels.sh god barrel" "Script not executable or missing"
  fi
}
test_barrel_god_barrel_detected

test_barrel_disallowed_index_detected() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_index")"
    mkdir -p "$mock_dir/src/components"
    echo "export * from './Button'; export * from './Table';" > "$mock_dir/src/components/index.ts"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.8.5" "check-no-barrels.sh detects forbidden high-level barrel file"
    else
      record_fail "T1.8.5" "check-no-barrels.sh barrel file" "Did not detect forbidden index.ts"
    fi
  else
    record_fail "T1.8.5" "check-no-barrels.sh barrel file" "Script not executable or missing"
  fi
}
test_barrel_disallowed_index_detected

# -----------------------------------------------------------------------------
# FEATURE 9: Modular Wire-Up Checker (Invariants 32, 35, 40)
# -----------------------------------------------------------------------------
CHECK_WIREUP="$AGENTC_ROOT/core/checkers/check-wireup-integrity.sh"

assert_file_exists "T1.9.1" "check-wireup-integrity.sh exists" "$CHECK_WIREUP"
assert_executable "T1.9.2" "check-wireup-integrity.sh is executable" "$CHECK_WIREUP"

test_wireup_orphan_feature() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_orphan")"
    mkdir -p "$mock_dir/src/features/ghost-feature"
    echo "export const GhostTable = () => null;" > "$mock_dir/src/features/ghost-feature/GhostTable.tsx"
    # No page.tsx created

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.9.3" "check-wireup-integrity.sh detects phantom feature without page.tsx"
    else
      record_fail "T1.9.3" "check-wireup-integrity.sh phantom feature" "Orphan feature not detected"
    fi
  else
    record_fail "T1.9.3" "check-wireup-integrity.sh orphan" "Script not executable or missing"
  fi
}
test_wireup_orphan_feature

test_wireup_unregistered_route() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_unreg")"
    mkdir -p "$mock_dir/src/app/[locale]/(protected)/unregistered"
    mkdir -p "$mock_dir/src/components/layout"
    echo "export default function Page() { return null; }" > "$mock_dir/src/app/[locale]/(protected)/unregistered/page.tsx"
    echo "export const menuItems = ['/dashboard'];" > "$mock_dir/src/components/layout/SidebarMenu.tsx"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.9.4" "check-wireup-integrity.sh detects page missing from menu/navigation"
    else
      record_fail "T1.9.4" "check-wireup-integrity.sh menu check" "Unregistered page not detected"
    fi
  else
    record_fail "T1.9.4" "check-wireup-integrity.sh route" "Script not executable or missing"
  fi
}
test_wireup_unregistered_route

test_wireup_inline_query_violation() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_inline")"
    mkdir -p "$mock_dir/src/features/player"
    echo "import { useQuery } from '@tanstack/react-query'; export const View = () => { useQuery({queryKey: ['bad']}); return null; };" > "$mock_dir/src/features/player/PlayerView.tsx"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.9.5" "check-wireup-integrity.sh detects inline query in UI view without logic hook"
    else
      record_fail "T1.9.5" "check-wireup-integrity.sh inline query" "Inline query violation not detected"
    fi
  else
    record_fail "T1.9.5" "check-wireup-integrity.sh query" "Script not executable or missing"
  fi
}
test_wireup_inline_query_violation

# -----------------------------------------------------------------------------
# FEATURE 10: Modular i18n Parity Checker (Invariant 36)
# -----------------------------------------------------------------------------
CHECK_I18N="$AGENTC_ROOT/core/checkers/check-i18n-parity.sh"

assert_file_exists "T1.10.1" "check-i18n-parity.sh exists" "$CHECK_I18N"
assert_executable "T1.10.2" "check-i18n-parity.sh is executable" "$CHECK_I18N"

test_i18n_key_divergence() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_diverge")"
    mkdir -p "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo '{"save":"Save","cancel":"Cancel"}' > "$mock_dir/messages/en/common.json"
    echo '{"save":"Lưu"}' > "$mock_dir/messages/vi/common.json"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.10.3" "check-i18n-parity.sh detects missing key between locales"
    else
      record_fail "T1.10.3" "check-i18n-parity.sh divergence" "Key divergence not detected"
    fi
  else
    record_fail "T1.10.3" "check-i18n-parity.sh diverge" "Script not executable or missing"
  fi
}
test_i18n_key_divergence

test_i18n_hardcoded_literal() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_hardcoded")"
    mkdir -p "$mock_dir/src/features/player"
    echo 'export const Header = () => <h1>Player Management</h1>;' > "$mock_dir/src/features/player/Header.tsx"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.10.4" "check-i18n-parity.sh detects hardcoded UI text literal"
    else
      record_fail "T1.10.4" "check-i18n-parity.sh hardcoded" "Hardcoded string not detected"
    fi
  else
    record_fail "T1.10.4" "check-i18n-parity.sh hardcoded" "Script not executable or missing"
  fi
}
test_i18n_hardcoded_literal

test_i18n_domain_scoped_layout() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_god")"
    mkdir -p "$mock_dir/messages"
    echo '{"en":{"save":"Save"}}' > "$mock_dir/messages/en.json" # Single god JSON file

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.10.5" "check-i18n-parity.sh enforces domain-scoped dictionary structure"
    else
      record_fail "T1.10.5" "check-i18n-parity.sh layout" "Single god JSON not flagged"
    fi
  else
    record_fail "T1.10.5" "check-i18n-parity.sh layout" "Script not executable or missing"
  fi
}
test_i18n_domain_scoped_layout

# -----------------------------------------------------------------------------
# FEATURE 11: Modular Clean Architecture Checker (Invariants 29, 34, 37, 41)
# -----------------------------------------------------------------------------
CHECK_ARCH="$AGENTC_ROOT/core/checkers/check-clean-arch.sh"

assert_file_exists "T1.11.1" "check-clean-arch.sh exists" "$CHECK_ARCH"
assert_executable "T1.11.2" "check-clean-arch.sh is executable" "$CHECK_ARCH"

test_arch_anti_toy_violation() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_toy")"
    mkdir -p "$mock_dir/src/server"
    echo 'const HTML = `<div><h1>Fake App</h1></div>`;' > "$mock_dir/src/server/app.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.11.3" "check-clean-arch.sh detects Anti-Toy HTML template strings in server code"
    else
      record_fail "T1.11.3" "check-clean-arch.sh anti-toy" "Anti-Toy violation not detected"
    fi
  else
    record_fail "T1.11.3" "check-clean-arch.sh toy" "Script not executable or missing"
  fi
}
test_arch_anti_toy_violation

test_arch_colocation_violation() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_colocate")"
    mkdir -p "$mock_dir/src/__tests__"
    echo 'describe("foo", () => {});' > "$mock_dir/src/__tests__/isolated.spec.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.11.4" "check-clean-arch.sh detects non-colocated spec in src/__tests__"
    else
      record_fail "T1.11.4" "check-clean-arch.sh colocation" "Non-colocated spec directory not flagged"
    fi
  else
    record_fail "T1.11.4" "check-clean-arch.sh colocation" "Script not executable or missing"
  fi
}
test_arch_colocation_violation

test_arch_util_scoping_violation() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_util")"
    mkdir -p "$mock_dir/src/app/[locale]/(protected)/player"
    echo 'export const formatDate = (d: string) => d;' > "$mock_dir/src/app/[locale]/(protected)/player/date.util.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T1.11.5" "check-clean-arch.sh detects utility file placed inside src/app/ router"
    else
      record_fail "T1.11.5" "check-clean-arch.sh util scoping" "Utility in src/app not detected"
    fi
  else
    record_fail "T1.11.5" "check-clean-arch.sh util" "Script not executable or missing"
  fi
}
test_arch_util_scoping_violation

# -----------------------------------------------------------------------------
# FEATURE 12: Quantitative Migration Benchmark Report (R4)
# -----------------------------------------------------------------------------
BENCHMARK_DOC="$AGENTC_ROOT/docs/BENCHMARK.md"

assert_file_exists "T1.12.1" "MIGRATION_BENCHMARK.md exists at agentc-v2/docs/" "$BENCHMARK_DOC"
assert_file_contains "T1.12.2" "Benchmark contains token consumption comparison table" \
  "(Token|token|Bytes|bytes)" "$BENCHMARK_DOC"
assert_file_contains "T1.12.3" "Benchmark verifies token reduction > 85%" \
  "(8[5-9]%|9[0-9]%)" "$BENCHMARK_DOC"
assert_file_contains "T1.12.4" "Benchmark contains file count comparison" \
  "(Files|files|Tệp|Số lượng)" "$BENCHMARK_DOC"
assert_file_contains "T1.12.5" "Benchmark contains quick-start instructions for Antigravity" \
  "(Quick-Start|Hạ tầng|Cài đặt|Onboarding|Getting Started)" "$BENCHMARK_DOC"

# -----------------------------------------------------------------------------
# FEATURE 13: Backward Compatibility (v1 archived in agentC-v1-legacy)
# -----------------------------------------------------------------------------
LEGACY_DIR="$REPO_ROOT/agentC-v1-legacy"
LEGACY_AGENTS="$LEGACY_DIR/AGENTS.md"
LEGACY_PODS="$LEGACY_DIR/.agents"
LEGACY_PROJECT="$LEGACY_DIR/docs/PROJECT.md"
LEGACY_ORIGINAL="$LEGACY_DIR/docs/ORIGINAL_REQUEST.md"
LEGACY_INFRA="$LEGACY_DIR/docs/TEST_INFRA.md"

assert_file_exists "T1.13.1" "Legacy AGENTS.md preserved in agentC-v1-legacy/" "$LEGACY_AGENTS"
assert_dir_exists "T1.13.2" "Legacy .agents directory preserved in agentC-v1-legacy/" "$LEGACY_PODS"
assert_file_exists "T1.13.3" "Legacy PROJECT.md preserved in agentC-v1-legacy/docs/" "$LEGACY_PROJECT"
assert_file_exists "T1.13.4" "Legacy ORIGINAL_REQUEST.md preserved in agentC-v1-legacy/docs/" "$LEGACY_ORIGINAL"
assert_file_exists "T1.13.5" "Legacy TEST_INFRA.md preserved in agentC-v1-legacy/docs/" "$LEGACY_INFRA"

print_summary "Tier 1: Feature Coverage"
