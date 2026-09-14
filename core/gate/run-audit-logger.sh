#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
RUNS_DIR="${KIT_ROOT}/.agentc/runs"
mkdir -p "${RUNS_DIR}"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

GATE=""
CHECKER=""
CMD_ARGS=()
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gate)     GATE="$2"; shift 2 ;;
    --checker)  CHECKER="$2"; shift 2 ;;
    --json)     JSON_OUTPUT=true; shift ;;
    --)         shift; CMD_ARGS+=("$@"); break ;;
    *)          CMD_ARGS+=("$1"); shift ;;
  esac
done

if [ "${#CMD_ARGS[@]}" -eq 0 ]; then
  echo -e "${RED}Usage: run-audit-logger.sh [--gate N] [--checker name] -- <command> [args...]${NC}"
  echo "Example: run-audit-logger.sh --gate 2 --checker verify-invariants -- bash scripts/verify-invariants.sh"
  exit 1
fi

TIMESTAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
GATE_LABEL="${GATE:-unknown}"
CHECKER_LABEL="${CHECKER:-${CMD_ARGS[0]##*/}}"
RUN_ID="${TIMESTAMP}-gate${GATE_LABEL}-${CHECKER_LABEL}"
LOG_FILE="${RUNS_DIR}/${RUN_ID}.json"

START_MS="$(node -e 'console.log(Date.now())' 2>/dev/null || echo 0)"
START_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

STDOUT_CAPTURE=""
EXIT_CODE=0
VIOLATIONS=0

set +e
STDOUT_CAPTURE="$("${CMD_ARGS[@]}" 2>&1)"
EXIT_CODE=$?
set -e

END_MS="$(node -e 'console.log(Date.now())' 2>/dev/null || echo 0)"
DURATION_MS=$((END_MS - START_MS))
END_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ "${EXIT_CODE}" -ne 0 ]; then
  VIOLATIONS="$(echo "${STDOUT_CAPTURE}" | grep -c "\[FAIL\]\|✗\|VIOLATION\|Error:" 2>/dev/null || echo 1)"
fi

STDOUT_ESCAPED="$(echo "${STDOUT_CAPTURE}" | head -20 | sed 's/\\/\\\\/g;s/"/\\"/g;s/$/\\n/' | tr -d '\n')"
TOKEN_ESTIMATE=$(( (${#STDOUT_CAPTURE} + 3) / 4 ))

node -e "
const fs=require('fs');
const record={
  run_id: '${RUN_ID}',
  gate: ${GATE:-0},
  checker: '${CHECKER_LABEL}',
  command: '${CMD_ARGS[*]}',
  started_at: '${START_ISO}',
  finished_at: '${END_ISO}',
  duration_ms: ${DURATION_MS},
  exit_code: ${EXIT_CODE},
  violations: ${VIOLATIONS},
  token_estimate: ${TOKEN_ESTIMATE},
  stdout_preview: '${STDOUT_ESCAPED}'
};
fs.writeFileSync('${LOG_FILE}', JSON.stringify(record, null, 2));
" 2>/dev/null || true

echo "${STDOUT_CAPTURE}"

if [ "${JSON_OUTPUT}" = "true" ]; then
  echo -e "\n${CYAN}--- Audit Log ---${NC}"
  cat "${LOG_FILE}"
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo -e "${GREEN}✓ Audit logged: ${LOG_FILE} (${DURATION_MS}ms, exit 0)${NC}" >&2
else
  echo -e "${RED}✗ Audit logged: ${LOG_FILE} (${DURATION_MS}ms, exit ${EXIT_CODE}, ${VIOLATIONS} violations)${NC}" >&2
fi

exit "${EXIT_CODE}"
