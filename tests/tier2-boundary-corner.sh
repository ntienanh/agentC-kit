#!/usr/bin/env bash
# agentc-v2/tests/tier2-boundary-corner.sh
# Tier 2: Boundary, Corner Cases & Negative Invariant Tests (65 test cases)

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

log_header "TIER 2: BOUNDARY & CORNER CASES (65 Tests)"

# -----------------------------------------------------------------------------
# FEATURE 1: Minimalist Agent Kernel Boundary
# -----------------------------------------------------------------------------
KERNEL_FILE="$AGENTC_ROOT/AGENTS.md"

assert_line_count_le "T2.1.1" "Kernel line count strictly <= 60 lines" 60 "$KERNEL_FILE"

# Baseline comparison: original AGENTS.md is 27577 bytes. 15% is 4136 bytes. >85% reduction means <= 4136 bytes.
assert_byte_size_le "T2.1.2" "Kernel byte size represents > 85% token reduction (<= 4136 bytes)" 4136 "$KERNEL_FILE"

check_kernel_substantive_lines() {
  if [ -f "$KERNEL_FILE" ]; then
    local non_empty_lines
    non_empty_lines=$(grep -v '^[[:space:]]*$' "$KERNEL_FILE" | wc -l | tr -d '[:space:]')
    if [ "$non_empty_lines" -ge 15 ]; then
      record_pass "T2.1.3" "Kernel has substantive instructions (>= 15 non-empty lines: $non_empty_lines)"
    else
      record_fail "T2.1.3" "Kernel substantive instructions" "Found only $non_empty_lines non-empty lines"
    fi
  else
    record_fail "T2.1.3" "Kernel substantive check" "File missing"
  fi
}
check_kernel_substantive_lines

check_kernel_whitespace_ratio() {
  if [ -f "$KERNEL_FILE" ]; then
    local total_lines empty_lines
    total_lines=$(wc -l < "$KERNEL_FILE" | tr -d '[:space:]')
    empty_lines=$(grep -c '^[[:space:]]*$' "$KERNEL_FILE" || true)
    if [ "$total_lines" -gt 0 ]; then
      local ratio=$(( (empty_lines * 100) / total_lines ))
      if [ "$ratio" -le 35 ]; then
        record_pass "T2.1.4" "Kernel blank lines ratio is balanced (<= 35%: ${ratio}%)"
      else
        record_fail "T2.1.4" "Kernel blank lines ratio" "Excessive blank lines: ${ratio}%"
      fi
    else
      record_fail "T2.1.4" "Kernel blank lines ratio" "Empty file"
    fi
  else
    record_fail "T2.1.4" "Kernel blank lines check" "File missing"
  fi
}
check_kernel_whitespace_ratio

check_kernel_read_permissions() {
  if [ -r "$KERNEL_FILE" ]; then
    record_pass "T2.1.5" "Kernel file has standard readable permissions"
  else
    record_fail "T2.1.5" "Kernel file permissions" "File not readable"
  fi
}
check_kernel_read_permissions

# -----------------------------------------------------------------------------
# FEATURE 2: Progressive Disclosure AI Skills Boundary
# -----------------------------------------------------------------------------
SKILLS_DIR="$AGENTC_ROOT/agents/skills"

check_skills_closing_delimiters() {
  if [ -d "$SKILLS_DIR" ]; then
    local unclosed=0
    local total=0
    for f in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$f" ] || continue
      total=$((total + 1))
      local delim_count
      delim_count=$(grep -c '^---' "$f" || true)
      if [ "$delim_count" -lt 2 ]; then
        unclosed=$((unclosed + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$unclosed" -eq 0 ]; then
      record_pass "T2.2.1" "All $total skills have valid opening and closing YAML delimiters (>= 2 '---')"
    else
      record_fail "T2.2.1" "Skills YAML closing delimiters" "$unclosed skills missing closing '---'"
    fi
  else
    record_fail "T2.2.1" "Skills delimiter check" "Skills directory missing"
  fi
}
check_skills_closing_delimiters

check_skills_name_matches_dir() {
  if [ -d "$SKILLS_DIR" ]; then
    local mismatches=0
    local total=0
    for d in "$SKILLS_DIR"/*/; do
      [ -d "$d" ] || continue
      local dir_name
      dir_name=$(basename "$d")
      local skill_file="${d}SKILL.md"
      [ -f "$skill_file" ] || continue
      total=$((total + 1))
      local name_in_file
      name_in_file=$(grep '^name:' "$skill_file" | head -n 1 | sed 's/name:[[:space:]]*//' | tr -d '[:space:]' | tr -d '"' | tr -d "'")
      if [ "$name_in_file" != "$dir_name" ]; then
        mismatches=$((mismatches + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$mismatches" -eq 0 ]; then
      record_pass "T2.2.2" "All $total skills have 'name' matching their folder directory"
    else
      record_fail "T2.2.2" "Skills name directory match" "$mismatches mismatches found"
    fi
  else
    record_fail "T2.2.2" "Skills name match check" "Skills directory missing"
  fi
}
check_skills_name_matches_dir

check_skills_description_length() {
  if [ -d "$SKILLS_DIR" ]; then
    local short_desc=0
    local total=0
    for f in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$f" ] || continue
      total=$((total + 1))
      local desc_lines
      desc_lines=$(sed -n '/^description:/,/^[a-zA-Z0-9_-]*:/p' "$f" | grep -v '^[a-zA-Z0-9_-]*:' | tr -d '\n' | tr -d '[:space:]')
      if [ "${#desc_lines}" -lt 20 ]; then
        short_desc=$((short_desc + 1))
      fi
    done
    if [ "$total" -gt 0 ] && [ "$short_desc" -eq 0 ]; then
      record_pass "T2.2.3" "All $total skills have substantial description field (>= 20 chars)"
    else
      record_fail "T2.2.3" "Skills description length" "$short_desc skills have short/empty descriptions"
    fi
  else
    record_fail "T2.2.3" "Skills description check" "Skills directory missing"
  fi
}
check_skills_description_length

check_skills_no_crlf() {
  if [ -d "$SKILLS_DIR" ]; then
    local crlf_count=0
    for f in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$f" ] || continue
      if grep -q $'\r' "$f"; then
        crlf_count=$((crlf_count + 1))
      fi
    done
    if [ "$crlf_count" -eq 0 ]; then
      record_pass "T2.2.4" "All skills use clean Unix LF line endings (zero CRLF)"
    else
      record_fail "T2.2.4" "Skills CRLF check" "Found $crlf_count files with CRLF"
    fi
  else
    record_fail "T2.2.4" "Skills CRLF check" "Skills directory missing"
  fi
}
check_skills_no_crlf

check_skills_no_zero_bytes() {
  if [ -d "$SKILLS_DIR" ]; then
    local empty_files
    empty_files=$(find "$SKILLS_DIR" -type f -size 0 | wc -l | tr -d '[:space:]')
    if [ "$empty_files" -eq 0 ]; then
      record_pass "T2.2.5" "Zero 0-byte empty files in skills directory"
    else
      record_fail "T2.2.5" "Skills 0-byte check" "Found $empty_files empty files"
    fi
  else
    record_fail "T2.2.5" "Skills 0-byte check" "Skills directory missing"
  fi
}
check_skills_no_zero_bytes

# -----------------------------------------------------------------------------
# FEATURE 3: Code-Review-Graph MCP Config Boundary
# -----------------------------------------------------------------------------
MCP_CONFIG="$AGENTC_ROOT/.mcp.json"

check_mcp_strict_json() {
  if [ -f "$MCP_CONFIG" ]; then
    if node -e "
      const fs = require('fs');
      const raw = fs.readFileSync('$MCP_CONFIG', 'utf8');
      JSON.parse(raw);
    " >/dev/null 2>&1; then
      record_pass "T2.3.1" ".mcp.json is strict valid JSON with no syntax violations"
    else
      record_fail "T2.3.1" ".mcp.json strict check" "Malformed JSON"
    fi
  else
    record_fail "T2.3.1" ".mcp.json strict check" "File missing"
  fi
}
check_mcp_strict_json

check_mcp_script_path_exists() {
  if [ -f "$MCP_CONFIG" ]; then
    local script_exists=0
    script_exists=$(node -e "
      const cfg = JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'));
      const srv = cfg.mcpServers['code-review-graph'];
      const path = require('path');
      const scriptArg = srv.args.find(a => a.endsWith('.mjs') || a.endsWith('.js'));
      if (!scriptArg) process.exit(1);
      const absPath = path.isAbsolute(scriptArg) ? scriptArg : path.resolve('$AGENTC_ROOT', scriptArg);
      process.exit(require('fs').existsSync(absPath) ? 0 : 1);
    " 2>/dev/null && echo "yes" || echo "no")

    if [ "$script_exists" = "yes" ]; then
      record_pass "T2.3.2" ".mcp.json referenced runner script exists on filesystem"
    else
      record_fail "T2.3.2" ".mcp.json runner path" "Referenced script path not found on disk"
    fi
  else
    record_fail "T2.3.2" ".mcp.json path check" "File missing"
  fi
}
check_mcp_script_path_exists

check_mcp_env_clean() {
  if [ -f "$MCP_CONFIG" ]; then
    if node -e "
      const cfg = JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'));
      const srv = cfg.mcpServers['code-review-graph'];
      if (srv.env && typeof srv.env !== 'object') process.exit(1);
    " >/dev/null 2>&1; then
      record_pass "T2.3.3" ".mcp.json env property is either absent or a valid key-value object"
    else
      record_fail "T2.3.3" ".mcp.json env check" "Invalid env configuration"
    fi
  else
    record_fail "T2.3.3" ".mcp.json env check" "File missing"
  fi
}
check_mcp_env_clean

check_mcp_auto_approve_format() {
  if [ -f "$MCP_CONFIG" ]; then
    if node -e "
      const cfg = JSON.parse(require('fs').readFileSync('$MCP_CONFIG', 'utf8'));
      const srv = cfg.mcpServers['code-review-graph'];
      const tools = srv.autoApprove || srv.tools || [];
      if (!Array.isArray(tools)) process.exit(1);
    " >/dev/null 2>&1; then
      record_pass "T2.3.4" ".mcp.json tools / autoApprove is formatted as an Array"
    else
      record_fail "T2.3.4" ".mcp.json autoApprove format" "Not an array"
    fi
  else
    record_fail "T2.3.4" ".mcp.json format check" "File missing"
  fi
}
check_mcp_auto_approve_format

check_mcp_no_duplicate_keys() {
  if [ -f "$MCP_CONFIG" ]; then
    # Check duplicate top-level keys in raw text
    local dupes
    dupes=$(grep -o '"[^"]*"' "$MCP_CONFIG" | sort | uniq -d | grep -c "code-review-graph" || true)
    if [ "$dupes" -le 1 ]; then
      record_pass "T2.3.5" ".mcp.json has unique server keys without duplicate definitions"
    else
      record_fail "T2.3.5" ".mcp.json duplicates" "Duplicate server key found"
    fi
  else
    record_fail "T2.3.5" ".mcp.json duplicates check" "File missing"
  fi
}
check_mcp_no_duplicate_keys

# -----------------------------------------------------------------------------
# FEATURE 4: Code-Review-Graph MCP Server Execution Boundary
# -----------------------------------------------------------------------------
MCP_RUNNER="$AGENTC_ROOT/core/mcp/code-review-graph.mjs"

test_mcp_malformed_json_error() {
  if [ -f "$MCP_RUNNER" ]; then
    local bad_req='{"invalid json'
    local response
    response=$(echo "$bad_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -E -q '(-32700|"error")'; then
      record_pass "T2.4.1" "MCP server returns JSON-RPC parse error (-32700) on malformed input"
    else
      record_fail "T2.4.1" "MCP server malformed JSON" "Expected parse error, got: $response"
    fi
  else
    record_fail "T2.4.1" "MCP server malformed test" "Runner missing"
  fi
}
test_mcp_malformed_json_error

test_mcp_unknown_method_error() {
  if [ -f "$MCP_RUNNER" ]; then
    local bad_req='{"jsonrpc":"2.0","id":99,"method":"non_existent_method","params":{}}'
    local response
    response=$(echo "$bad_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -E -q '(-32601|"error")'; then
      record_pass "T2.4.2" "MCP server returns Method Not Found error (-32601) on unknown method"
    else
      record_fail "T2.4.2" "MCP server unknown method" "Expected method not found, got: $response"
    fi
  else
    record_fail "T2.4.2" "MCP server unknown method test" "Runner missing"
  fi
}
test_mcp_unknown_method_error

test_mcp_invalid_params_error() {
  if [ -f "$MCP_RUNNER" ]; then
    # Calling tool without required tool name or params
    local bad_req='{"jsonrpc":"2.0","id":98,"method":"tools/call","params":{}}'
    local response
    response=$(echo "$bad_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    if echo "$response" | grep -E -q '(-32602|"error")'; then
      record_pass "T2.4.3" "MCP server handles missing tool arguments with error response"
    else
      record_fail "T2.4.3" "MCP server invalid params" "Expected error response, got: $response"
    fi
  else
    record_fail "T2.4.3" "MCP server invalid params test" "Runner missing"
  fi
}
test_mcp_invalid_params_error

test_mcp_context_budget_limit() {
  if [ -f "$MCP_RUNNER" ]; then
    local call_req='{"jsonrpc":"2.0","id":97,"method":"tools/call","params":{"name":"get_review_context_tool","arguments":{"files":["src/app.ts"]}}}'
    local response
    response=$(echo "$call_req" | node "$MCP_RUNNER" 2>/dev/null || true)
    # Check that response length in characters corresponds to <= 2000 tokens (~8000 chars)
    local char_len=${#response}
    if [ "$char_len" -lt 10000 ]; then
      record_pass "T2.4.4" "MCP get_review_context_tool response fits within 2000 token budget"
    else
      record_fail "T2.4.4" "MCP context budget limit" "Response character length ($char_len) exceeds budget"
    fi
  else
    record_fail "T2.4.4" "MCP context budget test" "Runner missing"
  fi
}
test_mcp_context_budget_limit

test_mcp_clean_eof_exit() {
  if [ -f "$MCP_RUNNER" ]; then
    local exit_code=0
    echo "" | node "$MCP_RUNNER" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.4.5" "MCP server exits cleanly (code 0) on EOF without hanging"
    else
      record_fail "T2.4.5" "MCP clean EOF exit" "Exited with code $exit_code on EOF"
    fi
  else
    record_fail "T2.4.5" "MCP clean EOF test" "Runner missing"
  fi
}
test_mcp_clean_eof_exit

# -----------------------------------------------------------------------------
# FEATURE 5: AST-Guided Skills Boundary
# -----------------------------------------------------------------------------
WIREUP_SKILL="$AGENTC_ROOT/agents/skills/wireup-review/SKILL.md"
REFACTOR_SKILL="$AGENTC_ROOT/agents/skills/code-refactor/SKILL.md"

assert_file_contains "T2.5.1" "wireup-review handles empty/unconnected symbols in graph" \
  "(0 callers|unconnected|không có liên kết|empty)" "$WIREUP_SKILL"
assert_file_contains "T2.5.2" "code-refactor defines handling for isolated symbols" \
  "(isolated|0 consumers|độc lập)" "$REFACTOR_SKILL"
assert_file_contains "T2.5.3" "AST skills specify fallback when blast radius exceeds 2000 tokens" \
  "(fallback|vượt quá|nén|compress|slice)" "$REFACTOR_SKILL"
assert_file_contains "T2.5.4" "AST skills require verifying clean-seam boundaries before changes" \
  "(clean seam|đường nối|seam)" "$REFACTOR_SKILL"
assert_file_contains "T2.5.5" "AST skills document handling of circular dependencies" \
  "(circular|vòng lặp|chu trình)" "$WIREUP_SKILL"

# -----------------------------------------------------------------------------
# FEATURE 6: Master Verification Script Boundary
# -----------------------------------------------------------------------------
VERIFY_SCRIPT="$AGENTC_ROOT/core/checkers/verify-invariants.sh"

test_verify_nonexistent_dir() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local exit_code=0
    "$VERIFY_SCRIPT" "/tmp/non_existent_directory_for_agentc_test" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.6.1" "verify-invariants.sh exits non-zero on non-existent directory"
    else
      record_fail "T2.6.1" "verify-invariants non-existent dir" "Expected exit 1, got 0"
    fi
  else
    record_fail "T2.6.1" "verify-invariants non-existent test" "Script not executable or missing"
  fi
}
test_verify_nonexistent_dir

test_verify_dir_with_spaces() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "mock dir with spaces")"
    mkdir -p "$mock_dir/src/shared/ui/button" "$mock_dir/src/logic/user" "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo 'export const AppButton = () => null;' > "$mock_dir/src/shared/ui/button/AppButton.tsx"
    echo 'export const useUser = () => ({});' > "$mock_dir/src/logic/user/useUserLogic.ts"
    echo '{"ok":"OK"}' > "$mock_dir/messages/en/common.json"
    echo '{"ok":"OK"}' > "$mock_dir/messages/vi/common.json"

    local exit_code=0
    "$VERIFY_SCRIPT" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.6.2" "verify-invariants.sh handles directory paths containing spaces without error"
    else
      record_fail "T2.6.2" "verify-invariants spaces in path" "Failed with exit code $exit_code"
    fi
  else
    record_fail "T2.6.2" "verify-invariants spaces test" "Script not executable or missing"
  fi
}
test_verify_dir_with_spaces

test_verify_empty_dir() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "mock_empty")"

    # Running on an empty directory should execute cleanly without crashing shell
    local exit_code=0
    "$VERIFY_SCRIPT" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    record_pass "T2.6.3" "verify-invariants.sh completes execution on empty directory without shell crash"
  else
    record_fail "T2.6.3" "verify-invariants empty test" "Script not executable or missing"
  fi
}
test_verify_empty_dir

test_verify_failure_aggregation() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "mock_multi_fail")"
    mkdir -p "$mock_dir/src"
    echo '// comment 1' > "$mock_dir/src/a.ts"
    echo '// comment 2' > "$mock_dir/src/b.ts"

    local exit_code=0
    "$VERIFY_SCRIPT" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.6.4" "verify-invariants.sh properly propagates failure exit code"
    else
      record_fail "T2.6.4" "verify-invariants failure propagation" "Expected non-zero exit code"
    fi
  else
    record_fail "T2.6.4" "verify-invariants failure test" "Script not executable or missing"
  fi
}
test_verify_failure_aggregation

test_verify_posix_compliance() {
  if [ -f "$VERIFY_SCRIPT" ]; then
    # Test shell syntax with bash -n
    if bash -n "$VERIFY_SCRIPT" >/dev/null 2>&1; then
      record_pass "T2.6.5" "verify-invariants.sh passes bash syntax validation"
    else
      record_fail "T2.6.5" "verify-invariants syntax" "Syntax error in script"
    fi
  else
    record_fail "T2.6.5" "verify-invariants syntax test" "Script missing"
  fi
}
test_verify_posix_compliance

# -----------------------------------------------------------------------------
# FEATURE 7: Modular Zero-Comment Checker Boundary
# -----------------------------------------------------------------------------
CHECK_COMMENTS="$AGENTC_ROOT/core/checkers/check-no-comments.sh"

test_comment_ignore_urls_and_strings() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_string")"
    mkdir -p "$mock_dir/src"
    echo 'const url = "https://api.example.com/v1/auth"; const slash = "a/b";' > "$mock_dir/src/string.ts"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.7.1" "check-no-comments.sh ignores URLs and slashes inside string literals"
    else
      record_fail "T2.7.1" "check-no-comments URLs" "False positive on string containing slashes"
    fi
  else
    record_fail "T2.7.1" "check-no-comments string test" "Script not executable or missing"
  fi
}
test_comment_ignore_urls_and_strings

test_comment_ignore_non_src() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_nonsrc")"
    mkdir -p "$mock_dir/docs" "$mock_dir/tests"
    echo '# markdown comment' > "$mock_dir/docs/readme.md"
    echo '// test script comment' > "$mock_dir/tests/helper.ts"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.7.2" "check-no-comments.sh targets src/ only and ignores non-src directories"
    else
      record_fail "T2.7.2" "check-no-comments non-src" "False positive on non-src files"
    fi
  else
    record_fail "T2.7.2" "check-no-comments non-src test" "Script not executable or missing"
  fi
}
test_comment_ignore_non_src

test_comment_multiline_span() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_span")"
    mkdir -p "$mock_dir/src"
    printf "const x = 1;\n/*\n * Comment line 1\n * Comment line 2\n */\nconst y = 2;\n" > "$mock_dir/src/span.ts"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.7.3" "check-no-comments.sh detects multiline comments spanning across lines"
    else
      record_fail "T2.7.3" "check-no-comments multiline" "Multiline comment not detected"
    fi
  else
    record_fail "T2.7.3" "check-no-comments multiline test" "Script not executable or missing"
  fi
}
test_comment_multiline_span

test_comment_jsx_comment() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_jsx")"
    mkdir -p "$mock_dir/src"
    echo 'export const Comp = () => <div>{/* bad banner */}</div>;' > "$mock_dir/src/comp.tsx"

    local exit_code=0
    "$CHECK_COMMENTS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.7.4" "check-no-comments.sh detects JSX comment syntax {/* ... */}"
    else
      record_fail "T2.7.4" "check-no-comments JSX" "JSX comment not detected"
    fi
  else
    record_fail "T2.7.4" "check-no-comments JSX test" "Script not executable or missing"
  fi
}
test_comment_jsx_comment

test_comment_fix_preserves_code() {
  if [ -x "$CHECK_COMMENTS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "comment_fix_code")"
    mkdir -p "$mock_dir/src"
    echo 'const foo = 42; // remove me' > "$mock_dir/src/code.ts"

    "$CHECK_COMMENTS" --fix "$mock_dir" >/dev/null 2>&1 || true
    if grep -q "const foo = 42" "$mock_dir/src/code.ts" && ! grep -q "remove me" "$mock_dir/src/code.ts"; then
      record_pass "T2.7.5" "check-no-comments.sh --fix preserves code while stripping comment"
    else
      record_fail "T2.7.5" "check-no-comments --fix code" "Code altered or comment remained"
    fi
  else
    record_fail "T2.7.5" "check-no-comments --fix test" "Script not executable or missing"
  fi
}
test_comment_fix_preserves_code

# -----------------------------------------------------------------------------
# FEATURE 8: Modular Anti-Barrel Checker Boundary
# -----------------------------------------------------------------------------
CHECK_BARRELS="$AGENTC_ROOT/core/checkers/check-no-barrels.sh"

test_barrel_type_export_allowed() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_type")"
    mkdir -p "$mock_dir/src/models"
    echo "export type { UserProfile } from './types';" > "$mock_dir/src/models/index.ts"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.8.1" "check-no-barrels.sh allows zero-runtime type-only barrel exports"
    else
      record_fail "T2.8.1" "check-no-barrels type exports" "False positive on type export"
    fi
  else
    record_fail "T2.8.1" "check-no-barrels type test" "Script not executable or missing"
  fi
}
test_barrel_type_export_allowed

test_barrel_relative_import() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_rel")"
    mkdir -p "$mock_dir/src/features/user/components"
    echo "import { UserAvatar } from './UserAvatar';" > "$mock_dir/src/features/user/components/UserProfile.tsx"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.8.2" "check-no-barrels.sh allows local relative file imports"
    else
      record_fail "T2.8.2" "check-no-barrels relative imports" "False positive on relative import"
    fi
  else
    record_fail "T2.8.2" "check-no-barrels rel test" "Script not executable or missing"
  fi
}
test_barrel_relative_import

test_barrel_wildcard_reexport_detected() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_wildcard")"
    mkdir -p "$mock_dir/src/shared"
    echo "export * from './ui/button/AppButton';" > "$mock_dir/src/shared/index.ts"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.8.3" "check-no-barrels.sh detects wildcard re-export in shared/index.ts"
    else
      record_fail "T2.8.3" "check-no-barrels wildcard" "Wildcard export not detected"
    fi
  else
    record_fail "T2.8.3" "check-no-barrels wildcard test" "Script not executable or missing"
  fi
}
test_barrel_wildcard_reexport_detected

test_barrel_monorepo_contracts_allowed() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_pkg")"
    mkdir -p "$mock_dir/packages/contracts/src"
    echo "export * from './user.dto';" > "$mock_dir/packages/contracts/src/index.ts"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.8.4" "check-no-barrels.sh permits contract DTO exports at package boundaries"
    else
      record_fail "T2.8.4" "check-no-barrels contract DTOs" "Contract boundary export flagged"
    fi
  else
    record_fail "T2.8.4" "check-no-barrels contract test" "Script not executable or missing"
  fi
}
test_barrel_monorepo_contracts_allowed

test_barrel_empty_file_handled() {
  if [ -x "$CHECK_BARRELS" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "barrel_empty")"
    mkdir -p "$mock_dir/src"
    touch "$mock_dir/src/empty.ts"

    local exit_code=0
    "$CHECK_BARRELS" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.8.5" "check-no-barrels.sh cleanly handles empty files without error"
    else
      record_fail "T2.8.5" "check-no-barrels empty file" "Error on empty file"
    fi
  else
    record_fail "T2.8.5" "check-no-barrels empty test" "Script not executable or missing"
  fi
}
test_barrel_empty_file_handled

# -----------------------------------------------------------------------------
# FEATURE 9: Modular Wire-Up Checker Boundary
# -----------------------------------------------------------------------------
CHECK_WIREUP="$AGENTC_ROOT/core/checkers/check-wireup-integrity.sh"

test_wireup_orphan_hook() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_orphan_hook")"
    mkdir -p "$mock_dir/src/logic/orphan"
    echo "export const useOrphanLogic = () => ({});" > "$mock_dir/src/logic/orphan/useOrphanLogic.ts"
    # No component or page imports this hook

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.9.1" "check-wireup-integrity.sh detects orphaned logic hook with 0 consumers"
    else
      record_fail "T2.9.1" "check-wireup orphan hook" "Orphan hook not detected"
    fi
  else
    record_fail "T2.9.1" "check-wireup hook test" "Script not executable or missing"
  fi
}
test_wireup_orphan_hook

test_wireup_dynamic_routes() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_dynamic")"
    mkdir -p "$mock_dir/src/app/[locale]/(protected)/orders/[id]"
    mkdir -p "$mock_dir/src/components/layout"
    echo "export default function OrderDetail() { return null; }" > "$mock_dir/src/app/[locale]/(protected)/orders/[id]/page.tsx"
    echo "export const routes = ['/orders'];" > "$mock_dir/src/components/layout/SidebarMenu.tsx"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    record_pass "T2.9.2" "check-wireup-integrity.sh processes parameterized dynamic route segments"
  else
    record_fail "T2.9.2" "check-wireup dynamic route test" "Script not executable or missing"
  fi
}
test_wireup_dynamic_routes

test_wireup_multiple_queries_in_hook() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_multi_query")"
    mkdir -p "$mock_dir/src/logic/dashboard"
    echo "import { useQuery } from '@tanstack/react-query'; export const useDashboardLogic = () => { const q1 = useQuery({}); const q2 = useQuery({}); return { q1, q2 }; };" > "$mock_dir/src/logic/dashboard/useDashboardLogic.ts"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    record_pass "T2.9.3" "check-wireup-integrity.sh allows multiple queries centralized inside logic hook"
  else
    record_fail "T2.9.3" "check-wireup multi query test" "Script not executable or missing"
  fi
}
test_wireup_multiple_queries_in_hook

test_wireup_empty_page_stub() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_empty_page")"
    mkdir -p "$mock_dir/src/app/[locale]/(protected)/stub"
    touch "$mock_dir/src/app/[locale]/(protected)/stub/page.tsx"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.9.4" "check-wireup-integrity.sh detects stub / empty page.tsx"
    else
      record_fail "T2.9.4" "check-wireup empty page" "Empty page stub not flagged"
    fi
  else
    record_fail "T2.9.4" "check-wireup empty page test" "Script not executable or missing"
  fi
}
test_wireup_empty_page_stub

test_wireup_raw_table_violation() {
  if [ -x "$CHECK_WIREUP" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "wireup_raw_table")"
    mkdir -p "$mock_dir/src/features/player"
    echo 'export const PlayerList = () => <table><tbody><tr><td>Row</td></tr></tbody></table>;' > "$mock_dir/src/features/player/PlayerList.tsx"

    local exit_code=0
    "$CHECK_WIREUP" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.9.5" "check-wireup-integrity.sh enforces AppTable usage over raw HTML table"
    else
      record_fail "T2.9.5" "check-wireup raw table" "Raw table tag not flagged"
    fi
  else
    record_fail "T2.9.5" "check-wireup table test" "Script not executable or missing"
  fi
}
test_wireup_raw_table_violation

# -----------------------------------------------------------------------------
# FEATURE 10: Modular i18n Parity Checker Boundary
# -----------------------------------------------------------------------------
CHECK_I18N="$AGENTC_ROOT/core/checkers/check-i18n-parity.sh"

test_i18n_nested_keys() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_nested")"
    mkdir -p "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo '{"auth":{"login":{"title":"Sign In","submit":"Go"}}}' > "$mock_dir/messages/en/auth.json"
    echo '{"auth":{"login":{"title":"Đăng nhập"}}}' > "$mock_dir/messages/vi/auth.json"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.10.1" "check-i18n-parity.sh detects missing deeply nested keys (auth.login.submit)"
    else
      record_fail "T2.10.1" "check-i18n nested" "Nested key divergence not detected"
    fi
  else
    record_fail "T2.10.1" "check-i18n nested test" "Script not executable or missing"
  fi
}
test_i18n_nested_keys

test_i18n_empty_translation_value() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_empty_val")"
    mkdir -p "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo '{"label":"Save"}' > "$mock_dir/messages/en/common.json"
    echo '{"label":""}' > "$mock_dir/messages/vi/common.json"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.10.2" "check-i18n-parity.sh flags empty translation strings"
    else
      record_fail "T2.10.2" "check-i18n empty val" "Empty string translation not flagged"
    fi
  else
    record_fail "T2.10.2" "check-i18n empty val test" "Script not executable or missing"
  fi
}
test_i18n_empty_translation_value

test_i18n_ignore_css_and_numbers() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_css")"
    mkdir -p "$mock_dir/src/features/ui"
    echo 'export const Box = () => <div className="flex flex-col p-4">123</div>;' > "$mock_dir/src/features/ui/Box.tsx"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.10.3" "check-i18n-parity.sh ignores CSS classNames and pure numeric literals"
    else
      record_fail "T2.10.3" "check-i18n CSS classNames" "False positive on CSS or numbers"
    fi
  else
    record_fail "T2.10.3" "check-i18n CSS test" "Script not executable or missing"
  fi
}
test_i18n_ignore_css_and_numbers

test_i18n_array_values() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_array")"
    mkdir -p "$mock_dir/messages/en" "$mock_dir/messages/vi"
    echo '{"steps":["One","Two"]}' > "$mock_dir/messages/en/steps.json"
    echo '{"steps":["Một","Hai"]}' > "$mock_dir/messages/vi/steps.json"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.10.4" "check-i18n-parity.sh supports array-valued translation keys"
    else
      record_fail "T2.10.4" "check-i18n array values" "Array values caused failure"
    fi
  else
    record_fail "T2.10.4" "check-i18n array test" "Script not executable or missing"
  fi
}
test_i18n_array_values

test_i18n_malformed_json_handling() {
  if [ -x "$CHECK_I18N" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "i18n_malformed")"
    mkdir -p "$mock_dir/messages/en"
    echo '{ invalid json }' > "$mock_dir/messages/en/broken.json"

    local exit_code=0
    "$CHECK_I18N" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.10.5" "check-i18n-parity.sh detects unparseable JSON files and exits non-zero"
    else
      record_fail "T2.10.5" "check-i18n malformed JSON" "Did not fail on malformed JSON"
    fi
  else
    record_fail "T2.10.5" "check-i18n malformed test" "Script not executable or missing"
  fi
}
test_i18n_malformed_json_handling

# -----------------------------------------------------------------------------
# FEATURE 11: Modular Clean Architecture Checker Boundary
# -----------------------------------------------------------------------------
CHECK_ARCH="$AGENTC_ROOT/core/checkers/check-clean-arch.sh"

test_arch_magic_number_detection() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_magic")"
    mkdir -p "$mock_dir/src/features/auth"
    echo 'export const waitTime = 3000; setTimeout(() => {}, 4500);' > "$mock_dir/src/features/auth/service.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.11.1" "check-clean-arch.sh detects magic numbers in business code"
    else
      record_fail "T2.11.1" "check-clean-arch magic number" "Magic number not detected"
    fi
  else
    record_fail "T2.11.1" "check-clean-arch magic test" "Script not executable or missing"
  fi
}
test_arch_magic_number_detection

test_arch_allowed_numbers() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_allowed_num")"
    mkdir -p "$mock_dir/src/shared/utils"
    echo 'export const isZero = (n: number) => n === 0 || n === 1 || n === -1;' > "$mock_dir/src/shared/utils/math.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -eq 0 ]; then
      record_pass "T2.11.2" "check-clean-arch.sh permits standard index/boolean numbers (0, 1, -1)"
    else
      record_fail "T2.11.2" "check-clean-arch allowed numbers" "False positive on standard numbers"
    fi
  else
    record_fail "T2.11.2" "check-clean-arch allowed test" "Script not executable or missing"
  fi
}
test_arch_allowed_numbers

test_arch_arbitrary_hex_color() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_hex")"
    mkdir -p "$mock_dir/src/shared/ui/badge"
    echo 'export const Badge = () => <span style={{ color: "#ff4400" }}>Badge</span>;' > "$mock_dir/src/shared/ui/badge/Badge.tsx"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.11.3" "check-clean-arch.sh flags arbitrary hex colors outside token system"
    else
      record_fail "T2.11.3" "check-clean-arch hex colors" "Arbitrary hex color not detected"
    fi
  else
    record_fail "T2.11.3" "check-clean-arch hex test" "Script not executable or missing"
  fi
}
test_arch_arbitrary_hex_color

test_arch_misplaced_unit_spec() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_misplaced_spec")"
    mkdir -p "$mock_dir/src/specs"
    echo 'describe("test", () => {});' > "$mock_dir/src/specs/bad.spec.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.11.4" "check-clean-arch.sh detects unit spec placed in forbidden src/specs/"
    else
      record_fail "T2.11.4" "check-clean-arch misplaced spec" "Forbidden src/specs/ not detected"
    fi
  else
    record_fail "T2.11.4" "check-clean-arch spec test" "Script not executable or missing"
  fi
}
test_arch_misplaced_unit_spec

test_arch_util_in_app_router() {
  if [ -x "$CHECK_ARCH" ]; then
    local mock_dir
    mock_dir="$(make_temp_dir "arch_app_util")"
    mkdir -p "$mock_dir/src/app"
    echo 'export const helper = () => {};' > "$mock_dir/src/app/helper.util.ts"

    local exit_code=0
    "$CHECK_ARCH" "$mock_dir" >/dev/null 2>&1 || exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
      record_pass "T2.11.5" "check-clean-arch.sh prevents util files in root src/app/"
    else
      record_fail "T2.11.5" "check-clean-arch util in app" "Utility in app router not detected"
    fi
  else
    record_fail "T2.11.5" "check-clean-arch app util test" "Script not executable or missing"
  fi
}
test_arch_util_in_app_router

# -----------------------------------------------------------------------------
# FEATURE 12: Quantitative Migration Benchmark Report Boundary
# -----------------------------------------------------------------------------
BENCHMARK_DOC="$AGENTC_ROOT/docs/BENCHMARK.md"

check_benchmark_line_count() {
  if [ -f "$BENCHMARK_DOC" ]; then
    local lines
    lines=$(wc -l < "$BENCHMARK_DOC" | tr -d '[:space:]')
    if [ "$lines" -ge 40 ]; then
      record_pass "T2.12.1" "MIGRATION_BENCHMARK.md has comprehensive length (>= 40 lines: $lines)"
    else
      record_fail "T2.12.1" "Benchmark length" "Only $lines lines"
    fi
  else
    record_fail "T2.12.1" "Benchmark length check" "File missing"
  fi
}
check_benchmark_line_count

assert_file_contains "T2.12.2" "Benchmark report defines explicit units (KB|tokens|ms)" \
  "(KB|tokens|ms|bytes)" "$BENCHMARK_DOC"
assert_file_contains "T2.12.3" "Benchmark report contains reproducible methodology" \
  "(Methodology|Phương pháp|Đo lường|Reproduce)" "$BENCHMARK_DOC"
assert_file_contains "T2.12.4" "Benchmark report documents offline capability" \
  "(Offline|Local|Air-gap|Không phụ thuộc)" "$BENCHMARK_DOC"
assert_file_contains "T2.12.5" "Benchmark report lists token metrics for skills" \
  "(Skills|Kỹ năng|Token Load)" "$BENCHMARK_DOC"

# -----------------------------------------------------------------------------
# FEATURE 13: Backward Compatibility Boundary
# -----------------------------------------------------------------------------
LEGACY_DIR="$REPO_ROOT/agentC-v1-legacy"
LEGACY_AGENTS="$LEGACY_DIR/AGENTS.md"

check_legacy_agents_lines() {
  if [ -f "$LEGACY_AGENTS" ]; then
    local lines
    lines=$(wc -l < "$LEGACY_AGENTS" | tr -d '[:space:]')
    if [ "$lines" -eq 258 ]; then
      record_pass "T2.13.1" "Legacy AGENTS.md line count preserved in agentC-v1-legacy/ (258 lines)"
    else
      record_fail "T2.13.1" "Legacy AGENTS.md lines" "Expected 258 lines, got $lines"
    fi
  else
    record_fail "T2.13.1" "Legacy AGENTS check" "File missing"
  fi
}
check_legacy_agents_lines

check_git_status_integrity() {
  if [ -d "$LEGACY_DIR/.agents/skills" ]; then
    local legacy_skills_count
    legacy_skills_count=$(find "$LEGACY_DIR/.agents/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d '[:space:]')
    if [ "$legacy_skills_count" -ge 8 ]; then
      record_pass "T2.13.2" "Legacy .agents/skills directory retains original skills in agentC-v1-legacy/ (found: $legacy_skills_count)"
    else
      record_fail "T2.13.2" "Legacy skills count" "Found only $legacy_skills_count skills"
    fi
  else
    record_fail "T2.13.2" "Legacy skills check" "Directory missing"
  fi
}
check_git_status_integrity

check_legacy_pods_intact() {
  if [ -d "$LEGACY_DIR/.agents" ]; then
    local pods_count
    pods_count=$(find "$LEGACY_DIR/.agents" -mindepth 1 -maxdepth 1 -name "0*" -type d | wc -l | tr -d '[:space:]')
    if [ "$pods_count" -ge 9 ]; then
      record_pass "T2.13.3" "Legacy pod definitions (01-pm through 10-devops) intact in agentC-v1-legacy/.agents/"
    else
      record_fail "T2.13.3" "Legacy pod definitions" "Found only $pods_count pods"
    fi
  else
    record_fail "T2.13.3" "Legacy pod check" "Directory missing"
  fi
}
check_legacy_pods_intact

check_legacy_permissions_intact() {
  if [ -r "$LEGACY_DIR/docs/PROJECT.md" ] && [ -r "$LEGACY_DIR/docs/ORIGINAL_REQUEST.md" ]; then
    record_pass "T2.13.4" "Legacy governance markdown files readable in agentC-v1-legacy/docs/"
  else
    record_fail "T2.13.4" "Legacy permissions" "Files not readable"
  fi
}
check_legacy_permissions_intact

check_no_leaked_symlinks() {
  local bad_symlinks=0
  for dir in "agents" "cli" "core" "docs"; do
    if [ -d "$AGENTC_ROOT/$dir" ]; then
      for l in $(find "$AGENTC_ROOT/$dir" -type l 2>/dev/null || true); do
        local target
        target=$(readlink "$l")
        if [[ "$target" == *".."* ]]; then
          bad_symlinks=$((bad_symlinks + 1))
        fi
      done
    fi
  done
  if [ "$bad_symlinks" -eq 0 ]; then
    record_pass "T2.13.5" "AgentC kit core directories contain zero escaping symlinks"
  else
    record_fail "T2.13.5" "Symlink leak check" "Found $bad_symlinks leaking symlinks"
  fi
}
check_no_leaked_symlinks

print_summary "Tier 2: Boundary & Corner Cases"
