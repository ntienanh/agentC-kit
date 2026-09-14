#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
STATE_FILE="${KIT_ROOT}/.agentc/state.json"
mkdir -p "${KIT_ROOT}/.agentc"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TARGET_DIR="${TARGET_DIR:-}"

init_state() {
  if [ ! -f "${STATE_FILE}" ]; then
    cat > "${STATE_FILE}" << 'JSON'
{"current_gate":0,"retry_count":0,"status":"ACTIVE","last_updated":"","checkpoints":{}}
JSON
    update_state_field "last_updated" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  fi
}

read_state_field() {
  local field="$1"
  node -e "const s=require('${STATE_FILE}');console.log(s['${field}']??'')" 2>/dev/null || echo ""
}

update_state_field() {
  local field="$1"
  local value="$2"
  local tmp
  tmp="$(mktemp)"
  node -e "
    const fs=require('fs');
    const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
    s['${field}']=${value};
    fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
  " 2>/dev/null || true
  rm -f "${tmp}"
}

check_gate_preconditions() {
  local gate="$1"
  case "${gate}" in
    1)
      if ! ls "${KIT_ROOT}/docs/specs/"*.prd.md 2>/dev/null | grep -q .; then
        echo -e "${RED}Gate 1 precondition FAIL: No PRD found in docs/specs/*.prd.md${NC}"
        return 1
      fi
      ;;
    2)
      local contracts_dir="${TARGET_DIR:-${KIT_ROOT}/templates}/packages/contracts/src"
      if ! ls "${contracts_dir}/"*.ts 2>/dev/null | grep -q .; then
        echo -e "${RED}Gate 2 precondition FAIL: No contracts found in ${contracts_dir}/*.ts${NC}"
        return 1
      fi
      ;;
    3)
      echo -e "${CYAN}Gate 3: Verify E2E tests pass before security audit${NC}"
      if ! bash "${KIT_ROOT}/tests/run-all-tests.sh"; then
        echo -e "${RED}Gate 3 precondition FAIL: E2E tests failed!${NC}"
        return 1
      fi
      ;;
    4)
      if [ ! -d "${KIT_ROOT}/docs/debates" ]; then
        mkdir -p "${KIT_ROOT}/docs/debates"
      fi
      ;;
  esac
  return 0
}

cmd_status() {
  init_state
  local gate
  local status
  local retry
  gate="$(node -e "const s=require('${STATE_FILE}');console.log(s.current_gate)" 2>/dev/null || echo "0")"
  status="$(node -e "const s=require('${STATE_FILE}');console.log(s.status)" 2>/dev/null || echo "ACTIVE")"
  retry="$(node -e "const s=require('${STATE_FILE}');console.log(s.retry_count)" 2>/dev/null || echo "0")"
  echo -e "${BOLD}${CYAN}=============================="
  echo -e "  AGENTC-V2 GATE STATUS"
  echo -e "==============================${NC}"
  echo -e "Current Gate : ${YELLOW}Gate ${gate}${NC}"
  echo -e "Status       : ${GREEN}${status}${NC}"
  echo -e "Retry Count  : ${retry}/2"
  echo -e "State File   : ${STATE_FILE}"
  echo ""
  echo -e "Gate Map:"
  echo -e "  Gate 0: Spec & Challenge    (PRD + 5W2H)"
  echo -e "  Gate 1: Contract & DB       (DTOs + Schema)"
  echo -e "  Gate 2: Wire-Up & Impl      (BE 4-layer + FE 7-zone)"
  echo -e "  Gate 3: Security & Audit    (SAST + remediation)"
  echo -e "  Gate 4: Pack & Ship         (Docker + invariants 100%)"
}

cmd_advance() {
  init_state
  local current
  current="$(node -e "const s=require('${STATE_FILE}');console.log(s.current_gate)" 2>/dev/null || echo "0")"
  local next=$((current + 1))

  if [ "${next}" -gt 4 ]; then
    echo -e "${GREEN}✓ All gates completed. Pipeline is DONE.${NC}"
    node -e "
      const fs=require('fs');
      const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
      s.status='COMPLETE';s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
      fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
    " 2>/dev/null || true
    exit 0
  fi

  echo -e "${CYAN}Checking preconditions for Gate ${next}...${NC}"
  if check_gate_preconditions "${next}"; then
    node -e "
      const fs=require('fs');
      const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
      s.current_gate=${next};s.retry_count=0;
      s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
      s.checkpoints['gate_${next}_entered']='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
      fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
    " 2>/dev/null || true
    echo -e "${GREEN}✓ Advanced to Gate ${next}${NC}"
    bash "${SCRIPT_DIR}/git-checkpoint.sh" save "gate-${next}" 2>/dev/null || true
  else
    echo -e "${RED}✗ Cannot advance: preconditions for Gate ${next} not met${NC}"
    exit 1
  fi
}

cmd_retry() {
  init_state
  local retry
  retry="$(node -e "const s=require('${STATE_FILE}');console.log(s.retry_count)" 2>/dev/null || echo "0")"
  local next_retry=$((retry + 1))

  if [ "${next_retry}" -gt 2 ]; then
    echo -e "${RED}Circuit Breaker TRIPPED: retry_count >= 3${NC}"
    echo -e "${RED}Escalate to Tech Lead via deadlock-arbitration skill.${NC}"
    node -e "
      const fs=require('fs');
      const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
      s.status='CIRCUIT_BREAKER';s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
      fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
    " 2>/dev/null || true
    exit 1
  fi

  node -e "
    const fs=require('fs');
    const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
    s.retry_count=${next_retry};s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
    fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
  " 2>/dev/null || true
  echo -e "${YELLOW}Retry ${next_retry}/2 recorded. Remaining retries: $((2 - next_retry))${NC}"
}

cmd_reset() {
  cat > "${STATE_FILE}" << 'JSON'
{"current_gate":0,"retry_count":0,"status":"ACTIVE","last_updated":"","checkpoints":{}}
JSON
  node -e "
    const fs=require('fs');
    const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
    s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
    fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
  " 2>/dev/null || true
  echo -e "${GREEN}✓ State reset to Gate 0 / ACTIVE${NC}"
}

cmd_abort() {
  bash "${SCRIPT_DIR}/agentc-abort.sh" 2>/dev/null || true
  node -e "
    const fs=require('fs');
    const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
    s.status='ABORTED';s.last_updated='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
    fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
  " 2>/dev/null || true
  echo -e "${RED}Pipeline ABORTED. State saved.${NC}"
}

ACTION="${1:-status}"
case "${ACTION}" in
  status)   cmd_status ;;
  advance)  cmd_advance ;;
  retry)    cmd_retry ;;
  reset)    cmd_reset ;;
  abort)    cmd_abort ;;
  *)
    echo -e "${RED}Unknown action: ${ACTION}${NC}"
    echo "Usage: gate-runner.sh [status|advance|retry|reset|abort]"
    exit 1
    ;;
esac
