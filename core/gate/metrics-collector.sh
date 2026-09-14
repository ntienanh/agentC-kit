#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
METRICS_DIR="${KIT_ROOT}/.agentc/metrics"
METRICS_FILE="${METRICS_DIR}/metrics.jsonl"
mkdir -p "${METRICS_DIR}"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

GATE=""
DURATION_MS=0
EXIT_CODE=0
SKILL=""
CHECKER=""
VIOLATIONS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gate)       GATE="$2"; shift 2 ;;
    --duration)   DURATION_MS="$2"; shift 2 ;;
    --exit)       EXIT_CODE="$2"; shift 2 ;;
    --skill)      SKILL="$2"; shift 2 ;;
    --checker)    CHECKER="$2"; shift 2 ;;
    --violations) VIOLATIONS="$2"; shift 2 ;;
    *) shift ;;
  esac
done

TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

node -e "
const fs = require('fs');
const record = {
  timestamp: '${TIMESTAMP}',
  gate: ${GATE:-0},
  checker: '${CHECKER}',
  skill_loaded: '${SKILL}',
  duration_ms: ${DURATION_MS},
  exit_code: ${EXIT_CODE},
  violations: ${VIOLATIONS},
  pass: ${EXIT_CODE} === 0
};
fs.appendFileSync('${METRICS_FILE}', JSON.stringify(record) + '\n');
" 2>/dev/null

echo -e "${GREEN}✓ Metric recorded: gate=${GATE} checker=${CHECKER} exit=${EXIT_CODE} duration=${DURATION_MS}ms${NC}"
