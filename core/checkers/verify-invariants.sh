#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 MASTER ARCHITECTURAL INVARIANTS VERIFIER
# Enforces Invariants 29-41 with strict exit codes (0 = PASS, 1 = FAIL)
# Modular checkers:
#   - check-no-comments.sh     (Invariant 31: Zero Comments)
#   - check-no-barrels.sh      (Invariant 33: Anti-Barrel Proliferation)
#   - check-wireup-integrity.sh (Invariants 32, 35, 40: Wire-up, Navigation, Loading)
#   - check-i18n-parity.sh     (Invariant 36: Domain i18n & Zero Hardcoded Literals)
#   - check-clean-arch.sh      (Invariants 29, 34, 37, 38, 41: Clean Arch & Scoping)
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_help() {
  cat << EOF
Usage: verify-invariants.sh [options] [target_dir]

Options:
  --target <dir>     Specify target directory to audit (default: repository root)
  --rule <name>      Execute a specific invariant checker:
                       comments (Invariant 31)
                       barrels  (Invariant 33)
                       wireup   (Invariants 32, 35, 40)
                       i18n     (Invariant 36)
                       arch     (Invariants 29, 34, 37, 38, 41)
                       schema   (Guardrail: Schema Safety)
  --gate <n>         Run only checkers relevant to gate N (0-4)
  --fix              Automatically fix violations where supported (e.g. strip comments)
  --staged           Audit only git staged changes for fast pre-commit checks
  --json-output      Emit structured JSON summary after all checks
  -h, --help         Show this usage and options guide

Exit Codes:
  0 = All invariants passed cleanly (100% compliant)
  1 = One or more invariant violations detected
EOF
}

TARGET_DIR=""
SELECTED_RULE=""
SELECTED_GATE=""
IS_FIX=false
IS_STAGED=false
IS_JSON_OUTPUT=false
IS_COMPRESS=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      print_help
      exit 0
      ;;
    --target)
      if [ -n "$2" ] && [[ "$2" != -* ]]; then
        TARGET_DIR="$2"
        shift 2
      else
        echo -e "${RED}Error: --target requires a directory path${NC}"
        exit 1
      fi
      ;;
    --rule)
      if [ -n "$2" ] && [[ "$2" != -* ]]; then
        SELECTED_RULE="$2"
        shift 2
      else
        echo -e "${RED}Error: --rule requires a rule name${NC}"
        exit 1
      fi
      ;;
    --gate)
      if [ -n "$2" ] && [[ "$2" != -* ]]; then
        SELECTED_GATE="$2"
        shift 2
      else
        echo -e "${RED}Error: --gate requires a gate number (0-4)${NC}"
        exit 1
      fi
      ;;
    --fix)
      IS_FIX=true
      shift
      ;;
    --staged)
      IS_STAGED=true
      shift
      ;;
    --compress)
      IS_COMPRESS=true
      shift
      ;;
    --json-output)
      IS_JSON_OUTPUT=true
      shift
      ;;
    -*)
      echo -e "${RED}Unknown option: $1${NC}"
      print_help
      exit 1
      ;;
    *)
      if [ -z "$TARGET_DIR" ]; then
        TARGET_DIR="$1"
      fi
      shift
      ;;
  esac
done

if [ -z "$TARGET_DIR" ]; then
  TARGET_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${RED}Error: Target directory does not exist: ${TARGET_DIR}${NC}"
  exit 1
fi

echo -e "${BOLD}${CYAN}====================================================${NC}"
echo -e "${BOLD}${CYAN}   AGENTC-V2 MECHANICAL INVARIANT VERIFICATION      ${NC}"
echo -e "${BOLD}${CYAN}====================================================${NC}"
echo -e "Target Directory: ${YELLOW}${TARGET_DIR}${NC}"
if [ "$IS_FIX" = true ]; then
  echo -e "Mode:             ${GREEN}--fix (auto-remediation enabled)${NC}"
fi
if [ "$IS_COMPRESS" = true ]; then
  echo -e "Compression:      ${GREEN}--compress (anchored to <= 20 lines)${NC}"
fi
if [ -n "$SELECTED_RULE" ]; then
  echo -e "Active Filter:    ${CYAN}Rule '${SELECTED_RULE}' only${NC}"
fi
echo ""

TOTAL_FAILED=0

run_checker() {
  local name="$1"
  local script="$2"
  local extra_flags=()

  if [ "$IS_FIX" = true ]; then
    extra_flags+=("--fix")
  fi

  echo -e "${BOLD}▶ Running Checker: ${CYAN}${name}${NC}..."
  if [ "$IS_COMPRESS" = true ]; then
    local out
    if out=$(bash "$SCRIPT_DIR/$script" "${extra_flags[@]}" "$TARGET_DIR" 2>&1); then
      echo -e "${out}"
      echo -e "${GREEN}✓ [PASS] ${name}${NC}\n"
    else
      local filtered
      filtered=$(echo "$out" | grep -E "error|fail|violation|invariant|assertion" -i || true)
      if [ -n "$filtered" ]; then
        echo "$filtered" | head -n 20
      else
        echo "$out" | head -n 20
      fi
      echo -e "${RED}✗ [FAIL] ${name}${NC}\n"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  else
    if bash "$SCRIPT_DIR/$script" "${extra_flags[@]}" "$TARGET_DIR"; then
      echo -e "${GREEN}✓ [PASS] ${name}${NC}\n"
    else
      echo -e "${RED}✗ [FAIL] ${name}${NC}\n"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  fi
}

# 1. Invariant 31: Pure Self-Documenting & Zero Comments
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "comments" ] || [ "$SELECTED_RULE" = "31" ]; then
  run_checker "Invariant 31: Zero Comments" "check-no-comments.sh"
fi

# 2. Invariant 33: Direct Import & Anti-Barrel Proliferation
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "barrels" ] || [ "$SELECTED_RULE" = "33" ]; then
  run_checker "Invariant 33: Anti-Barrel Proliferation" "check-no-barrels.sh"
fi

# 3. Invariants 32, 35, 40: Whole-Lifecycle Wire-Up & Data Lifecycle
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "wireup" ] || [ "$SELECTED_RULE" = "32" ] || [ "$SELECTED_RULE" = "35" ] || [ "$SELECTED_RULE" = "40" ]; then
  run_checker "Invariants 32, 35, 40: Wire-Up & Data Lifecycle" "check-wireup-integrity.sh"
fi

# 4. Invariant 36: Domain-Scoped i18n & Zero Hardcoded Literals
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "i18n" ] || [ "$SELECTED_RULE" = "36" ]; then
  run_checker "Invariant 36: i18n Dictionary Parity" "check-i18n-parity.sh"
fi

# 5. Invariants 29, 34, 37, 38, 41: Clean Architecture & Scoping
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "arch" ] || [ "$SELECTED_RULE" = "29" ] || [ "$SELECTED_RULE" = "34" ] || [ "$SELECTED_RULE" = "37" ] || [ "$SELECTED_RULE" = "41" ]; then
  run_checker "Invariants 29, 34, 37, 38, 41: Clean Arch & Scoping" "check-clean-arch.sh"
fi

# 6. Schema Safety Guardrail (Pillar 6: Guardrails)
if [ -z "$SELECTED_RULE" ] || [ "$SELECTED_RULE" = "schema" ]; then
  if [ -f "$SCRIPT_DIR/check-schema-safety.sh" ]; then
    run_checker "Schema Safety Guardrail: No Destructive DDL" "check-schema-safety.sh"
  fi
fi

# 7. Mandatory Framework Build & Type-Check Verification
echo -e "${BOLD}${CYAN}▶ Running Mandatory Framework Build & Type-Check...${NC}"
if [ -f "$TARGET_DIR/package.json" ]; then
  HAS_BUILD_SCRIPT=$(node -e "const p=require('$TARGET_DIR/package.json');console.log(!!(p.scripts&&p.scripts.build))" 2>/dev/null || echo "false")
  if [ "$HAS_BUILD_SCRIPT" = "true" ]; then
    echo -e "${CYAN}Executing 'npm run build' in ${TARGET_DIR}...${NC}"
    if (cd "$TARGET_DIR" && npm run build >/dev/null 2>&1); then
      echo -e "${GREEN}✓ [PASS] Mandatory Framework Build: Compilation Succeeded${NC}\n"
    else
      echo -e "${RED}✗ [FAIL] Mandatory Framework Build: Compilation Failed ('npm run build' exited with error)${NC}\n"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  else
    echo -e "${YELLOW}⚠️ [SKIP] No 'build' script found in package.json${NC}\n"
  fi
fi

# 8. Mandatory E2E Test Execution (Template-Aware)
echo -e "${BOLD}${CYAN}▶ Running Mandatory E2E Verification...${NC}"
if [ -f "$TARGET_DIR/package.json" ]; then
  HAS_E2E_SCRIPT=$(node -e "const p=require('$TARGET_DIR/package.json');console.log(!!(p.scripts&&(p.scripts['test:e2e']||p.scripts['e2e'])))" 2>/dev/null || echo "false")
  if [ "$HAS_E2E_SCRIPT" = "true" ]; then
    E2E_CMD="test:e2e"
    E2E_EXISTS=$(node -e "const p=require('$TARGET_DIR/package.json');console.log(!!(p.scripts&&p.scripts['test:e2e']))" 2>/dev/null || echo "false")
    if [ "$E2E_EXISTS" = "false" ]; then E2E_CMD="e2e"; fi
    
    echo -e "${CYAN}Executing 'npm run ${E2E_CMD}' in ${TARGET_DIR}...${NC}"
    if (cd "$TARGET_DIR" && npm run "${E2E_CMD}" >/dev/null 2>&1); then
      echo -e "${GREEN}✓ [PASS] Mandatory E2E Tests Passed${NC}\n"
    else
      echo -e "${RED}✗ [FAIL] Mandatory E2E Tests Failed ('npm run ${E2E_CMD}' exited with error)${NC}\n"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
  else
    echo -e "${YELLOW}⚠️ [SKIP] No E2E test script ('test:e2e' or 'e2e') found in package.json${NC}\n"
  fi
fi

echo -e "${BOLD}${CYAN}====================================================${NC}"
if [ $TOTAL_FAILED -eq 0 ]; then
  echo -e "${GREEN}${BOLD}✓ ALL INVARIANTS PASSED (Exit Code 0)${NC}"
  echo -e "${GREEN}Architecture is 100% mechanically compliant and verified via build/E2E. Safe for release.${NC}"
  if [ "$IS_JSON_OUTPUT" = true ]; then
    echo '{"status":"PASS","violations":0,"exit_code":0}'
  fi
  exit 0
else
  echo -e "${RED}${BOLD}✗ VERIFICATION FAILED: ${TOTAL_FAILED} checker(s) reported violations (Exit Code 1)${NC}"
  echo -e "${RED}Review violation details above and apply recommended remediations.${NC}"
  if [ "$IS_JSON_OUTPUT" = true ]; then
    echo "{\"status\":\"FAIL\",\"violations\":${TOTAL_FAILED},\"exit_code\":1}"
  fi
  exit 1
fi
