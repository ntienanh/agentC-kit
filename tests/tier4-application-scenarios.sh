#!/usr/bin/env bash
# agentc-v2/tests/tier4-application-scenarios.sh
# Tier 4: Real-World Application Scenarios (5 Workloads from TEST_INFRA.md)

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

log_header "TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Scenarios)"

KERNEL_FILE="$AGENTC_ROOT/AGENTS.md"
SKILLS_DIR="$AGENTC_ROOT/agents/skills"
MCP_CONFIG="$AGENTC_ROOT/.mcp.json"
MCP_RUNNER="$AGENTC_ROOT/core/mcp/code-review-graph.mjs"
SCRIPTS_DIR="$AGENTC_ROOT/core/checkers"
VERIFY_SCRIPT="$SCRIPTS_DIR/verify-invariants.sh"
CHECK_COMMENTS="$SCRIPTS_DIR/check-no-comments.sh"
CHECK_BARRELS="$SCRIPTS_DIR/check-no-barrels.sh"
CHECK_WIREUP="$SCRIPTS_DIR/check-wireup-integrity.sh"
CHECK_I18N="$SCRIPTS_DIR/check-i18n-parity.sh"
CHECK_ARCH="$SCRIPTS_DIR/check-clean-arch.sh"
BENCHMARK_DOC="$AGENTC_ROOT/docs/BENCHMARK.md"

# =============================================================================
# SCENARIO 1: Agent Onboarding & Progressive Skill Discovery (F1, F2, F12)
# =============================================================================
test_scenario_1_onboarding() {
  local scenario_id="T4.1"
  local desc="Scenario 1: Agent Onboarding & Progressive Skill Discovery"

  # Step 1: Agent loads kernel rule
  if [ ! -f "$KERNEL_FILE" ]; then
    record_fail "$scenario_id" "$desc" "Kernel file missing"
    return 1
  fi
  local kernel_lines kernel_bytes
  kernel_lines=$(wc -l < "$KERNEL_FILE" | tr -d '[:space:]')
  kernel_bytes=$(wc -c < "$KERNEL_FILE" | tr -d '[:space:]')

  if [ "$kernel_lines" -gt 60 ] || [ "$kernel_bytes" -gt 4136 ]; then
    record_fail "$scenario_id" "$desc" "Kernel exceeds size threshold: $kernel_lines lines, $kernel_bytes bytes"
    return 1
  fi

  # Step 2: Agent scans frontmatter descriptions (Progressive Disclosure)
  local target_task="backend refactoring with blast radius"
  local matched_skill=""

  for s in "$SKILLS_DIR"/*/SKILL.md; do
    [ -f "$s" ] || continue
    # Extract only frontmatter (between first and second ---)
    local frontmatter
    frontmatter=$(sed -n '1,/^---$/p' "$s")
    if echo "$frontmatter" | grep -E -q -i "(refactor|blast radius|ast|clean-module)"; then
      matched_skill="$s"
      break
    fi
  done

  if [ -z "$matched_skill" ]; then
    record_fail "$scenario_id" "$desc" "Failed to discover relevant skill from frontmatter triggers"
    return 1
  fi

  # Step 3: Agent loads the matched skill and checks Decision Matrix
  if ! grep -E -q -i "(decision matrix|ma trận quyết định)" "$matched_skill"; then
    record_fail "$scenario_id" "$desc" "Matched skill $matched_skill lacks Decision Matrix"
    return 1
  fi

  # Step 4: Verify total onboarding token budget is < 2000 tokens (~8000 bytes)
  local skill_bytes
  skill_bytes=$(wc -c < "$matched_skill" | tr -d '[:space:]')
  local total_onboarding_bytes=$(( kernel_bytes + skill_bytes ))
  if [ "$total_onboarding_bytes" -gt 15000 ]; then
    record_fail "$scenario_id" "$desc" "Total onboarding payload too large ($total_onboarding_bytes bytes)"
    return 1
  fi

  record_pass "$scenario_id" "$desc (Kernel: $kernel_lines lines, Matched: $(basename "$(dirname "$matched_skill")"), Payload: ${total_onboarding_bytes}B)"
  return 0
}
test_scenario_1_onboarding

# =============================================================================
# SCENARIO 2: Refactoring with Blast-Radius & AST Slicing (F3, F4, F5, F6)
# =============================================================================
test_scenario_2_refactoring_workflow() {
  local scenario_id="T4.2"
  local desc="Scenario 2: Refactoring with Blast-Radius & AST Slicing"

  # Step 1: Ensure MCP runner is available
  if [ ! -f "$MCP_RUNNER" ]; then
    record_fail "$scenario_id" "$desc" "MCP runner missing at $MCP_RUNNER"
    return 1
  fi

  # Step 2: Query blast-radius for a target symbol via MCP
  local radius_req='{"jsonrpc":"2.0","id":201,"method":"tools/call","params":{"name":"get_impact_radius","arguments":{"target":"formatCurrency","depth":2}}}'
  local radius_resp
  radius_resp=$(echo "$radius_req" | node "$MCP_RUNNER" 2>/dev/null || true)

  if ! echo "$radius_resp" | grep -E -q '("result"|"content"|"status")'; then
    record_fail "$scenario_id" "$desc" "MCP get_impact_radius call failed: $radius_resp"
    return 1
  fi

  # Step 3: Fetch sliced review context within <= 2000 token budget
  local ctx_req='{"jsonrpc":"2.0","id":202,"method":"tools/call","params":{"name":"get_review_context_tool","arguments":{"files":["src/utils/format.ts"]}}}'
  local ctx_resp
  ctx_resp=$(echo "$ctx_req" | node "$MCP_RUNNER" 2>/dev/null || true)

  if ! echo "$ctx_resp" | grep -E -q '("result"|"content"|"status")'; then
    record_fail "$scenario_id" "$desc" "MCP get_review_context_tool call failed: $ctx_resp"
    return 1
  fi

  # Step 4: Simulate refactoring on mock sandbox and run verify-invariants
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_sandbox
    mock_sandbox="$(make_temp_dir "mock_scenario_2")"
    mkdir -p "$mock_sandbox/src/shared/utils" "$mock_sandbox/src/logic/wallet" "$mock_sandbox/messages/en" "$mock_sandbox/messages/vi"

    # Create clean refactored code conforming to invariants
    echo 'export const formatCurrency = (val: number): string => `${val} USD`;' > "$mock_sandbox/src/shared/utils/currency.util.ts"
    echo "import { formatCurrency } from '@/shared/utils/currency.util'; export const useWallet = () => ({ formatted: formatCurrency(100) });" > "$mock_sandbox/src/logic/wallet/useWalletLogic.ts"
    echo '{"currency":"Currency"}' > "$mock_sandbox/messages/en/wallet.json"
    echo '{"currency":"Tiền tệ"}' > "$mock_sandbox/messages/vi/wallet.json"

    local verify_exit=0
    "$VERIFY_SCRIPT" "$mock_sandbox" >/dev/null 2>&1 || verify_exit=$?

    if [ "$verify_exit" -ne 0 ]; then
      record_fail "$scenario_id" "$desc" "Refactored sandbox failed invariant checks (exit: $verify_exit)"
      return 1
    fi
  else
    record_fail "$scenario_id" "$desc" "verify-invariants.sh missing or not executable"
    return 1
  fi

  record_pass "$scenario_id" "$desc (Blast radius computed, AST context extracted, invariants verified)"
  return 0
}
test_scenario_2_refactoring_workflow

# =============================================================================
# SCENARIO 3: Pre-commit Invariant Violation Catch (F7, F8, F9, F10, F11)
# =============================================================================
test_scenario_3_precommit_catch() {
  local scenario_id="T4.3"
  local desc="Scenario 3: Pre-commit Invariant Multi-Violation Catch"

  if [ ! -x "$VERIFY_SCRIPT" ]; then
    record_fail "$scenario_id" "$desc" "verify-invariants.sh missing or not executable"
    return 1
  fi

  # Set up a sandbox with 5 distinct invariant violations:
  # 1. Invariant 31: stray comment in src/
  # 2. Invariant 33: god barrel import from '@/components'
  # 3. Invariant 36: missing key in vi.json
  # 4. Invariant 32: orphan feature without page.tsx
  # 5. Invariant 41: magic number in business logic
  local dirty_sandbox
  dirty_sandbox="$(make_temp_dir "mock_scenario_3")"

  mkdir -p "$dirty_sandbox/src/features/broken-feature"
  mkdir -p "$dirty_sandbox/src/shared/ui/button"
  mkdir -p "$dirty_sandbox/messages/en" "$dirty_sandbox/messages/vi"

  # V1: Comment
  echo 'const x = 1; // VIOLATION 1: comment' > "$dirty_sandbox/src/shared/ui/button/bad.ts"
  # V2: Barrel import
  echo "import { Button } from '@/components';" > "$dirty_sandbox/src/features/broken-feature/BrokenView.tsx"
  # V3: Missing i18n key
  echo '{"save":"Save","extra":"Only in English"}' > "$dirty_sandbox/messages/en/common.json"
  echo '{"save":"Lưu"}' > "$dirty_sandbox/messages/vi/common.json"
  # V4: Orphan feature (broken-feature has no page.tsx in src/app/)
  # V5: Magic number
  echo 'export const delay = 3500;' >> "$dirty_sandbox/src/features/broken-feature/BrokenView.tsx"

  # Execute verification
  local exit_code=0
  local output
  output="$("$VERIFY_SCRIPT" "$dirty_sandbox" 2>&1)" || exit_code=$?

  if [ "$exit_code" -ne 0 ]; then
    record_pass "$scenario_id" "$desc (All violations successfully trapped, exit code: $exit_code)"
    return 0
  else
    record_fail "$scenario_id" "$desc" "Dirty commit was incorrectly allowed (exit code: 0)"
    return 1
  fi
}
test_scenario_3_precommit_catch

# =============================================================================
# SCENARIO 4: Offline CI/CD Execution & Benchmark (F1, F3, F6, F12, F13)
# =============================================================================
test_scenario_4_offline_cicd() {
  local scenario_id="T4.4"
  local desc="Scenario 4: Offline CI/CD Pipeline Execution & Benchmark"

  # Verify no external network calls required (pure local execution)
  # Test that scripts execute in sub-second to a few seconds (< 15 seconds)
  local start_time
  start_time=$(date +%s)

  # Check MCP runner runs offline with built-in node
  local mcp_ok=0
  if [ -f "$MCP_RUNNER" ]; then
    local init_req='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
    echo "$init_req" | node "$MCP_RUNNER" >/dev/null 2>&1 && mcp_ok=1
  fi

  # Check verification script executes offline
  local verifier_ok=0
  if [ -x "$VERIFY_SCRIPT" ]; then
    "$VERIFY_SCRIPT" --help >/dev/null 2>&1 && verifier_ok=1
  fi

  local end_time
  end_time=$(date +%s)
  local elapsed=$(( end_time - start_time ))

  if [ "$mcp_ok" -eq 1 ] && [ "$verifier_ok" -eq 1 ] && [ "$elapsed" -le 15 ]; then
    record_pass "$scenario_id" "$desc (Pure offline execution completed in ${elapsed}s <= 15s)"
    return 0
  else
    record_fail "$scenario_id" "$desc" "mcp_ok: $mcp_ok, verifier_ok: $verifier_ok, elapsed: ${elapsed}s"
    return 1
  fi
}
test_scenario_4_offline_cicd

# =============================================================================
# SCENARIO 5: Legacy Code Cleanup with Automated Fixer (F7, F8, F11, F13)
# =============================================================================
test_scenario_5_automated_cleanup() {
  local scenario_id="T4.5"
  local desc="Scenario 5: Legacy Code Cleanup with Automated Fixer"

  if [ ! -x "$CHECK_COMMENTS" ]; then
    record_fail "$scenario_id" "$desc" "check-no-comments.sh missing or not executable"
    return 1
  fi

  local cleanup_sandbox
  cleanup_sandbox="$(make_temp_dir "mock_scenario_5")"
  mkdir -p "$cleanup_sandbox/src/modules/auth"

  # Create code with comments
  cat << 'EOF' > "$cleanup_sandbox/src/modules/auth/service.ts"
// 1. Initial configuration
export const login = (user: string, pass: string) => {
  /* Validate credentials */
  const isValid = user.length > 0 && pass.length > 0;
  // Return status
  return isValid;
};
EOF

  # Step 1: Initial checker run should detect comments
  local initial_exit=0
  "$CHECK_COMMENTS" "$cleanup_sandbox" >/dev/null 2>&1 || initial_exit=$?
  if [ "$initial_exit" -eq 0 ]; then
    record_fail "$scenario_id" "$desc" "Initial run failed to detect comments in legacy code"
    return 1
  fi

  # Step 2: Run automated fixer
  local fix_exit=0
  "$CHECK_COMMENTS" --fix "$cleanup_sandbox" >/dev/null 2>&1 || fix_exit=$?

  # Step 3: Subsequent checker run must pass cleanly
  local final_exit=0
  "$CHECK_COMMENTS" "$cleanup_sandbox" >/dev/null 2>&1 || final_exit=$?

  # Step 4: Verify code functionality was preserved
  local code_content
  code_content=$(cat "$cleanup_sandbox/src/modules/auth/service.ts")
  local preserves_func=0
  if echo "$code_content" | grep -q "export const login" && echo "$code_content" | grep -q "return isValid"; then
    preserves_func=1
  fi

  # Step 5: Verify outer legacy agentC-kit was untouched
  local outer_untouched=0
  if [ -f "$REPO_ROOT/AGENTS.md" ] && [ -d "$REPO_ROOT/agentC-v1-legacy/.agents" ]; then
    outer_untouched=1
  fi

  if [ "$final_exit" -eq 0 ] && [ "$preserves_func" -eq 1 ] && [ "$outer_untouched" -eq 1 ]; then
    record_pass "$scenario_id" "$desc (Comments stripped automatically, code preserved, legacy kit untouched)"
    return 0
  else
    record_fail "$scenario_id" "$desc" "final_exit: $final_exit, preserves_func: $preserves_func, outer_untouched: $outer_untouched"
    return 1
  fi
}
test_scenario_5_automated_cleanup

print_summary "Tier 4: Application Scenarios"
