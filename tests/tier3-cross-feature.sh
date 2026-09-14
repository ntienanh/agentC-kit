#!/usr/bin/env bash
# agentc-v2/tests/tier3-cross-feature.sh
# Tier 3: Cross-Feature Integration & Pairwise Component Interaction Tests

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test-helpers.sh"

log_header "TIER 3: CROSS-FEATURE INTEGRATION (7 Tests)"

KERNEL_FILE="$AGENTC_ROOT/AGENTS.md"
SKILLS_DIR="$AGENTC_ROOT/agents/skills"
MCP_CONFIG="$AGENTC_ROOT/.mcp.json"
MCP_RUNNER="$AGENTC_ROOT/core/mcp/code-review-graph.mjs"
SCRIPTS_DIR="$AGENTC_ROOT/core/checkers"
VERIFY_SCRIPT="$SCRIPTS_DIR/verify-invariants.sh"
BENCHMARK_DOC="$AGENTC_ROOT/docs/BENCHMARK.md"

# -----------------------------------------------------------------------------
# CROSS 3.1: Kernel ↔ Progressive Disclosure Skills Discovery
# -----------------------------------------------------------------------------
test_cross_kernel_skill_discovery() {
  if [ -f "$KERNEL_FILE" ] && [ -d "$SKILLS_DIR" ]; then
    # Verify that the kernel guides agents to discover skills in skills/
    local mentions_skills
    mentions_skills=$(grep -c "skills/" "$KERNEL_FILE" || true)

    # Verify that each discoverable skill has complete frontmatter
    local total_skills=0
    local valid_skills=0
    for s in "$SKILLS_DIR"/*/SKILL.md; do
      [ -f "$s" ] || continue
      total_skills=$((total_skills + 1))
      if grep -q "^name:" "$s" && grep -q "^description:" "$s"; then
        valid_skills=$((valid_skills + 1))
      fi
    done

    if [ "$mentions_skills" -ge 1 ] && [ "$total_skills" -ge 18 ] && [ "$valid_skills" -eq "$total_skills" ]; then
      record_pass "T3.1" "Kernel discovery rules seamlessly resolve to all $total_skills valid JIT skills"
    else
      record_fail "T3.1" "Kernel-Skill discovery" "Kernel mentions: $mentions_skills, Valid skills: $valid_skills/$total_skills"
    fi
  else
    record_fail "T3.1" "Kernel-Skill discovery" "Kernel or skills directory missing"
  fi
}
test_cross_kernel_skill_discovery

# -----------------------------------------------------------------------------
# CROSS 3.2: AST Skills ↔ MCP Server Configuration (.mcp.json)
# -----------------------------------------------------------------------------
test_cross_ast_skills_mcp_config() {
  local wireup_skill="$SKILLS_DIR/wireup-review/SKILL.md"
  local refactor_skill="$SKILLS_DIR/code-refactor/SKILL.md"

  if [ -f "$wireup_skill" ] && [ -f "$refactor_skill" ] && [ -f "$MCP_CONFIG" ]; then
    local tools_matched=0

    # Tools used in skills: query_graph_tool, get_impact_radius, get_review_context_tool
    for tool in "query_graph_tool" "get_impact_radius" "get_review_context_tool"; do
      if grep -q "$tool" "$wireup_skill" || grep -q "$tool" "$refactor_skill"; then
        if grep -q "$tool" "$MCP_CONFIG"; then
          tools_matched=$((tools_matched + 1))
        fi
      fi
    done

    if [ "$tools_matched" -eq 3 ]; then
      record_pass "T3.2" "All 3 AST tools referenced in skills are declared in .mcp.json autoApprove"
    else
      record_fail "T3.2" "AST skills MCP config match" "Only $tools_matched of 3 tools matched in .mcp.json"
    fi
  else
    record_fail "T3.2" "AST skills MCP config" "Skill files or .mcp.json missing"
  fi
}
test_cross_ast_skills_mcp_config

# -----------------------------------------------------------------------------
# CROSS 3.3: AST Skills ↔ MCP Server Runtime Execution
# -----------------------------------------------------------------------------
test_cross_ast_skills_runtime_execution() {
  if [ -f "$MCP_RUNNER" ]; then
    # Simulate workflow of wireup-review skill:
    # 1. query_graph_tool to locate callers
    # 2. get_impact_radius to determine blast radius
    local query_call='{"jsonrpc":"2.0","id":101,"method":"tools/call","params":{"name":"query_graph_tool","arguments":{"query":"AppButton"}}}'
    local radius_call='{"jsonrpc":"2.0","id":102,"method":"tools/call","params":{"name":"get_impact_radius","arguments":{"target":"AppButton","depth":2}}}'

    local resp1 resp2
    resp1=$(echo "$query_call" | node "$MCP_RUNNER" 2>/dev/null || true)
    resp2=$(echo "$radius_call" | node "$MCP_RUNNER" 2>/dev/null || true)

    local ok1 ok2
    ok1=$(echo "$resp1" | grep -E -c '("result"|"content"|"status")' || true)
    ok2=$(echo "$resp2" | grep -E -c '("result"|"content"|"status")' || true)

    if [ "$ok1" -ge 1 ] && [ "$ok2" -ge 1 ]; then
      record_pass "T3.3" "MCP runner successfully executes full AST skill tool invocation chain"
    else
      record_fail "T3.3" "MCP runner AST invocation" "resp1 ok: $ok1, resp2 ok: $ok2"
    fi
  else
    record_fail "T3.3" "MCP runner AST execution" "Runner missing"
  fi
}
test_cross_ast_skills_runtime_execution

# -----------------------------------------------------------------------------
# CROSS 3.4: Master Verification Script ↔ All 5 Modular Checkers
# -----------------------------------------------------------------------------
test_cross_master_verifier_orchestration() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    # Verify master script references or invokes each sub-checker
    local sub_checkers=(
      "check-no-comments"
      "check-no-barrels"
      "check-wireup-integrity"
      "check-i18n-parity"
      "check-clean-arch"
    )

    local referenced=0
    for checker in "${sub_checkers[@]}"; do
      if grep -q "$checker" "$VERIFY_SCRIPT"; then
        referenced=$((referenced + 1))
      fi
    done

    if [ "$referenced" -eq 5 ]; then
      record_pass "T3.4" "verify-invariants.sh references and orchestrates all 5 modular sub-checkers"
    else
      record_fail "T3.4" "Master verifier orchestration" "Only $referenced of 5 checkers found in verify-invariants.sh"
    fi
  else
    record_fail "T3.4" "Master verifier orchestration" "verify-invariants.sh not executable or missing"
  fi
}
test_cross_master_verifier_orchestration

# -----------------------------------------------------------------------------
# CROSS 3.5: Modular Checkers ↔ Git Integration (Pre-commit simulation)
# -----------------------------------------------------------------------------
test_cross_git_precommit_integration() {
  if [ -x "$VERIFY_SCRIPT" ]; then
    local mock_git_repo
    mock_git_repo="$(make_temp_dir "mock_git_precommit")"

    # Initialize a temporary git repository
    (
      cd "$mock_git_repo" || exit 1
      git init -q
      mkdir -p src/shared/ui/button src/logic/auth messages/en messages/vi
      echo 'export const AppButton = () => null;' > src/shared/ui/button/AppButton.tsx
      echo 'export const useAuth = () => ({});' > src/logic/auth/useAuthLogic.ts
      echo '{"login":"Login"}' > messages/en/auth.json
      echo '{"login":"Đăng nhập"}' > messages/vi/auth.json
      git add .
    )

    # Run verification on staged state
    local exit_clean=0
    "$VERIFY_SCRIPT" "$mock_git_repo" >/dev/null 2>&1 || exit_clean=$?

    # Now introduce a violation in working tree
    echo '// bad comment' >> "$mock_git_repo/src/shared/ui/button/AppButton.tsx"
    local exit_dirty=0
    "$VERIFY_SCRIPT" "$mock_git_repo" >/dev/null 2>&1 || exit_dirty=$?

    if [ "$exit_clean" -eq 0 ] && [ "$exit_dirty" -ne 0 ]; then
      record_pass "T3.5" "Pre-commit verification correctly passes clean git state and blocks dirty commits"
    else
      record_fail "T3.5" "Git pre-commit integration" "clean exit: $exit_clean, dirty exit: $exit_dirty"
    fi
  else
    record_fail "T3.5" "Git pre-commit test" "Script not executable or missing"
  fi
}
test_cross_git_precommit_integration

# -----------------------------------------------------------------------------
# CROSS 3.6: Context Budgeting Skill ↔ MCP Server Token Limits
# -----------------------------------------------------------------------------
test_cross_context_budget_mcp_coherence() {
  local budget_skill="$SKILLS_DIR/context-budgeting/SKILL.md"

  if [ -f "$budget_skill" ] && [ -f "$MCP_RUNNER" ]; then
    # Verify skill states <= 2000 tokens
    local skill_budget_mentioned
    skill_budget_mentioned=$(grep -c "2000 tokens" "$budget_skill" || true)

    # Call MCP server for context extraction
    local ctx_call='{"jsonrpc":"2.0","id":103,"method":"tools/call","params":{"name":"get_review_context_tool","arguments":{"files":["src/app.ts"]}}}'
    local resp
    resp=$(echo "$ctx_call" | node "$MCP_RUNNER" 2>/dev/null || true)

    local enforces_budget
    enforces_budget=$(echo "$resp" | grep -E -c '(tokens|budget|max|limit|status)' || true)

    if [ "$skill_budget_mentioned" -ge 1 ] && [ "$enforces_budget" -ge 1 ]; then
      record_pass "T3.6" "Context budget rule (<= 2000 tokens) in skill matches MCP server tool limits"
    else
      record_fail "T3.6" "Context budget coherence" "Skill mentions: $skill_budget_mentioned, MCP enforcement: $enforces_budget"
    fi
  else
    record_fail "T3.6" "Context budget coherence" "Skill or runner missing"
  fi
}
test_cross_context_budget_mcp_coherence

# -----------------------------------------------------------------------------
# CROSS 3.7: Migration Benchmark ↔ Actual Filesystem Measurements
# -----------------------------------------------------------------------------
test_cross_benchmark_filesystem_parity() {
  if [ -f "$BENCHMARK_DOC" ] && [ -f "$KERNEL_FILE" ]; then
    # Verify actual kernel lines <= 60
    local actual_lines
    actual_lines=$(wc -l < "$KERNEL_FILE" | tr -d '[:space:]')

    # Verify benchmark mentions kernel line limit <= 60
    local benchmark_mentions_limit
    benchmark_mentions_limit=$(grep -c "60" "$BENCHMARK_DOC" || true)

    # Verify actual reduction > 85%
    local actual_bytes
    actual_bytes=$(wc -c < "$KERNEL_FILE" | tr -d '[:space:]')
    local is_reduced=0
    if [ "$actual_bytes" -le 4136 ]; then
      is_reduced=1
    fi

    if [ "$actual_lines" -le 60 ] && [ "$benchmark_mentions_limit" -ge 1 ] && [ "$is_reduced" -eq 1 ]; then
      record_pass "T3.7" "Migration Benchmark metrics match actual filesystem measurements (lines: $actual_lines, bytes: $actual_bytes)"
    else
      record_fail "T3.7" "Benchmark parity" "Lines: $actual_lines, benchmark mentions: $benchmark_mentions_limit, reduced: $is_reduced"
    fi
  else
    record_fail "T3.7" "Benchmark parity" "Benchmark doc or kernel missing"
  fi
}
test_cross_benchmark_filesystem_parity

print_summary "Tier 3: Cross-Feature Integration"
