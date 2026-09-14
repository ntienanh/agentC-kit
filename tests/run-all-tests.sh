#!/usr/bin/env bash
# agentc-v2/tests/run-all-tests.sh
# Master E2E Test Suite Runner for agentc-v2 (Tiers 1-4)
#
# Usage:
#   bash run-all-tests.sh [options]
# Options:
#   --tier <1|2|3|4>   Run only specified tier
#   --verbose, -v      Show detailed outputs
#   --quiet, -q        Show only final executive summary
#   --help, -h         Show this help message

set -u

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTC_ROOT="$(cd "$TESTS_DIR/.." && pwd)"

# Formatting
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RESET="\033[0m"
  C_GREEN="\033[0;32m"
  C_RED="\033[0;31m"
  C_YELLOW="\033[0;33m"
  C_BLUE="\033[0;34m"
  C_CYAN="\033[0;36m"
  C_BOLD="\033[1m"
else
  C_RESET=""
  C_GREEN=""
  C_RED=""
  C_YELLOW=""
  C_BLUE=""
  C_CYAN=""
  C_BOLD=""
fi

# Options
SELECTED_TIER=""
VERBOSE=0
QUIET=0

show_help() {
  cat << EOF
agentc-v2 E2E Master Test Runner

Usage:
  bash run-all-tests.sh [options]

Options:
  --tier <1|2|3|4|5> Run only specified tier:
                       1: Feature Coverage (65 tests)
                       2: Boundary & Corner Cases (65 tests)
                       3: Cross-Feature Integration (7 tests)
                       4: Application Scenarios (5 tests)
                       5: MCP & Platform Adapters (17 tests)
  -v, --verbose      Verbose output
  -q, --quiet        Quiet mode, minimal output
  -h, --help         Show this help message

Exit Status:
  0 on 100% test pass
  1 if any test fails
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --tier)
      if [ -n "${2:-}" ] && [[ "$2" =~ ^[1-5]$ ]]; then
        SELECTED_TIER="$2"
        shift 2
      else
        echo "Error: --tier requires an argument between 1 and 5"
        exit 1
      fi
      ;;
    -v|--verbose)
      VERBOSE=1
      shift
      ;;
    -q|--quiet)
      QUIET=1
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

TIERS_TO_RUN=()
if [ -n "$SELECTED_TIER" ]; then
  case "$SELECTED_TIER" in
    1) TIERS_TO_RUN+=("tier1-feature-coverage.sh:Tier 1: Feature Coverage") ;;
    2) TIERS_TO_RUN+=("tier2-boundary-corner.sh:Tier 2: Boundary & Corner") ;;
    3) TIERS_TO_RUN+=("tier3-cross-feature.sh:Tier 3: Cross-Feature") ;;
    4) TIERS_TO_RUN+=("tier4-application-scenarios.sh:Tier 4: Application Scenarios") ;;
    5) TIERS_TO_RUN+=("tier5-mcp-adapters.sh:Tier 5: MCP & Platform Adapters") ;;
  esac
else
  TIERS_TO_RUN+=(
    "tier1-feature-coverage.sh:Tier 1: Feature Coverage"
    "tier2-boundary-corner.sh:Tier 2: Boundary & Corner"
    "tier3-cross-feature.sh:Tier 3: Cross-Feature"
    "tier4-application-scenarios.sh:Tier 4: Application Scenarios"
    "tier5-mcp-adapters.sh:Tier 5: MCP & Platform Adapters"
  )
fi

echo -e "${C_BOLD}${C_CYAN}╔══════════════════════════════════════════════════════════════════════╗${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}║                agentc-v2 OPAQUE-BOX E2E TEST SUITE                   ║${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}╚══════════════════════════════════════════════════════════════════════╝${C_RESET}"
echo -e "Started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo -e "Target:  $AGENTC_ROOT"
echo ""

START_TIME=$(date +%s)
OVERALL_TOTAL=0
OVERALL_PASSED=0
OVERALL_FAILED=0
OVERALL_SKIPPED=0
OVERALL_STATUS=0

declare -a TIER_RESULTS=()

for entry in "${TIERS_TO_RUN[@]}"; do
  script_name="${entry%%:*}"
  tier_title="${entry#*:}"
  script_path="$TESTS_DIR/$script_name"

  if [ ! -f "$script_path" ]; then
    echo -e "${C_RED}Error: Test script not found: $script_path${C_RESET}"
    OVERALL_FAILED=$((OVERALL_FAILED + 1))
    OVERALL_STATUS=1
    TIER_RESULTS+=("$tier_title | MISSING | 0 | 0 | 1")
    continue
  fi

  # Run tier script
  local_out=""
  local_exit=0
  local_out=$(bash "$script_path" 2>&1) || local_exit=$?

  if [ "$QUIET" -ne 1 ]; then
    echo "$local_out"
  fi

  # Parse summary from output
  tier_total=$(echo "$local_out" | grep "Total:" | tail -n 1 | awk '{print $2}' || echo "0")
  tier_passed=$(echo "$local_out" | grep "Passed:" | tail -n 1 | awk '{print $2}' || echo "0")
  tier_failed=$(echo "$local_out" | grep "Failed:" | tail -n 1 | awk '{print $2}' || echo "0")
  tier_skipped=$(echo "$local_out" | grep "Skipped:" | tail -n 1 | awk '{print $2}' || echo "0")

  [ -z "$tier_total" ] && tier_total=0
  [ -z "$tier_passed" ] && tier_passed=0
  [ -z "$tier_failed" ] && tier_failed=0
  [ -z "$tier_skipped" ] && tier_skipped=0

  OVERALL_TOTAL=$((OVERALL_TOTAL + tier_total))
  OVERALL_PASSED=$((OVERALL_PASSED + tier_passed))
  OVERALL_FAILED=$((OVERALL_FAILED + tier_failed))
  OVERALL_SKIPPED=$((OVERALL_SKIPPED + tier_skipped))

  if [ "$local_exit" -ne 0 ] || [ "$tier_failed" -gt 0 ]; then
    OVERALL_STATUS=1
    TIER_RESULTS+=("$tier_title | FAILED | $tier_total | $tier_passed | $tier_failed")
  else
    TIER_RESULTS+=("$tier_title | PASSED | $tier_total | $tier_passed | $tier_failed")
  fi
done

END_TIME=$(date +%s)
ELAPSED_SEC=$(( END_TIME - START_TIME ))

echo ""
echo -e "${C_BOLD}${C_CYAN}══════════════════════════════════════════════════════════════════════${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}                  EXECUTIVE TEST EXECUTION SUMMARY                    ${C_RESET}"
echo -e "${C_BOLD}${C_CYAN}══════════════════════════════════════════════════════════════════════${C_RESET}"
printf "%-32s | %-8s | %-6s | %-6s | %-6s\n" "Tier Name" "Status" "Total" "Pass" "Fail"
echo "----------------------------------------------------------------------"

for res in "${TIER_RESULTS[@]}"; do
  IFS="|" read -r r_name r_stat r_tot r_pass r_fail <<< "$res"
  r_name=$(echo "$r_name" | xargs)
  r_stat=$(echo "$r_stat" | xargs)
  r_tot=$(echo "$r_tot" | xargs)
  r_pass=$(echo "$r_pass" | xargs)
  r_fail=$(echo "$r_fail" | xargs)

  if [ "$r_stat" = "PASSED" ]; then
    stat_colored="${C_GREEN}PASSED${C_RESET}"
  else
    stat_colored="${C_RED}FAILED${C_RESET}"
  fi
  printf "%-32s | %-17b | %-6s | %-6s | %-6s\n" "$r_name" "$stat_colored" "$r_tot" "$r_pass" "$r_fail"
done

echo "----------------------------------------------------------------------"
echo -e "Total Tests Executed:   $OVERALL_TOTAL"
echo -e "Tests Passed:           ${C_GREEN}$OVERALL_PASSED${C_RESET}"
if [ "$OVERALL_FAILED" -gt 0 ]; then
  echo -e "Tests Failed:           ${C_RED}$OVERALL_FAILED${C_RESET}"
else
  echo -e "Tests Failed:           0"
fi
if [ "$OVERALL_SKIPPED" -gt 0 ]; then
  echo -e "Tests Skipped:          ${C_YELLOW}$OVERALL_SKIPPED${C_RESET}"
fi
echo -e "Duration:               ${ELAPSED_SEC}s"
echo -e "${C_BOLD}${C_CYAN}══════════════════════════════════════════════════════════════════════${C_RESET}"

if [ "$OVERALL_STATUS" -eq 0 ] && [ "$OVERALL_FAILED" -eq 0 ]; then
  echo -e "\n${C_BOLD}${C_GREEN}🎉 ALL TESTS PASSED! Quality gates satisfied.${C_RESET}\n"
  exit 0
else
  echo -e "\n${C_BOLD}${C_RED}❌ TEST FAILURES DETECTED! Review failure details above.${C_RESET}\n"
  exit 1
fi
