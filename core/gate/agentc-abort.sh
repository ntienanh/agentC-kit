#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

STATE_FILE="${KIT_ROOT}/.agentc/state.json"
COMMON_PORTS=(3000 3001 4000 4001 8080 8000)

echo -e "${BOLD}${RED}======================================"
echo -e "  AGENTC-V2 EMERGENCY ABORT"
echo -e "======================================${NC}"
echo ""

echo -e "${CYAN}[1/4] Killing agentc-related processes...${NC}"
pkill -f "gate-runner" 2>/dev/null || true
pkill -f "verify-invariants" 2>/dev/null || true
pkill -f "run-all-tests" 2>/dev/null || true
echo -e "${GREEN}  ✓ Processes killed${NC}"

echo -e "${CYAN}[2/4] Releasing common ports...${NC}"
for PORT in "${COMMON_PORTS[@]}"; do
  PIDS="$(lsof -t -i :"${PORT}" 2>/dev/null || true)"
  if [ -n "${PIDS}" ]; then
    echo "${PIDS}" | xargs kill -9 2>/dev/null || true
    echo -e "  ✓ Released port ${PORT}"
  fi
done
echo -e "${GREEN}  ✓ Ports released${NC}"

echo -e "${CYAN}[3/4] Saving uncommitted changes to emergency stash...${NC}"
GIT_ROOT=""
search_dir="${KIT_ROOT}"
for i in $(seq 1 5); do
  if [ -d "${search_dir}/.git" ]; then
    GIT_ROOT="${search_dir}"
    break
  fi
  search_dir="$(dirname "${search_dir}")"
done

if [ -n "${GIT_ROOT}" ]; then
  cd "${GIT_ROOT}"
  if git status --porcelain | grep -q .; then
    git stash push --include-untracked -m "agentc/emergency-abort/$(date -u +%Y%m%dT%H%M%SZ)" 2>/dev/null || true
    echo -e "${GREEN}  ✓ Changes stashed (emergency stash created)${NC}"
  else
    echo -e "  ✓ Working tree clean — no stash needed"
  fi
else
  echo -e "${YELLOW}  ⚠ No git repository found, skipping stash${NC}"
fi

echo -e "${CYAN}[4/4] Updating pipeline state to ABORTED...${NC}"
if [ -f "${STATE_FILE}" ]; then
  node -e "
    const fs=require('fs');
    try {
      const s=JSON.parse(fs.readFileSync('${STATE_FILE}','utf8'));
      s.status='ABORTED';
      s.aborted_at='$(date -u +%Y-%m-%dT%H:%M:%SZ)';
      fs.writeFileSync('${STATE_FILE}',JSON.stringify(s,null,2));
    } catch(e) {}
  " 2>/dev/null || true
  echo -e "${GREEN}  ✓ State set to ABORTED${NC}"
else
  mkdir -p "${KIT_ROOT}/.agentc"
  echo '{"status":"ABORTED","current_gate":0,"retry_count":0}' > "${STATE_FILE}"
  echo -e "${GREEN}  ✓ State file created with ABORTED status${NC}"
fi

echo ""
echo -e "${BOLD}${RED}✓ Emergency abort complete.${NC}"
echo -e "  Run: ${CYAN}bash core/gate/gate-runner.sh reset${NC} to restart pipeline"
echo -e "  Run: ${CYAN}bash core/gate/git-checkpoint.sh list${NC} to see recovery options"
