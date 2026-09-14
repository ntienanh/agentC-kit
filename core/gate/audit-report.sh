#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
RUNS_DIR="${KIT_ROOT}/.agentc/runs"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

LAST_N=10
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --last-n) LAST_N="$2"; shift 2 ;;
    --json)   JSON_OUTPUT=true; shift ;;
    *) shift ;;
  esac
done

if [ ! -d "${RUNS_DIR}" ] || [ -z "$(ls -A "${RUNS_DIR}" 2>/dev/null)" ]; then
  echo -e "${YELLOW}No audit runs found in ${RUNS_DIR}${NC}"
  echo "Run tasks via: bash scripts/run-audit-logger.sh --gate N --checker name -- <command>"
  exit 0
fi

echo -e "${BOLD}${CYAN}======================================================="
echo -e "  AGENTC-V2 AUDIT REPORT (Last ${LAST_N} runs)"
echo -e "=======================================================${NC}"
echo ""

node << JSEOF
const fs = require('fs');
const path = require('path');
const dir = '${RUNS_DIR}';
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.json'))
  .sort()
  .slice(-${LAST_N});

if (files.length === 0) {
  console.log('No runs found.');
  process.exit(0);
}

const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const totalRuns = runs.length;
const passedRuns = runs.filter(r => r.exit_code === 0).length;
const failedRuns = totalRuns - passedRuns;
const ftrRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;
const totalTokens = runs.reduce((sum, r) => sum + (r.token_estimate || 0), 0);
const avgDuration = totalRuns > 0
  ? Math.round(runs.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / totalRuns)
  : 0;

let minGateTs = null;
let maxGateTs = null;
runs.forEach(r => {
  if (r.started_at) {
    const t = new Date(r.started_at);
    if (!minGateTs || t < minGateTs) minGateTs = t;
  }
  if (r.finished_at) {
    const t = new Date(r.finished_at);
    if (!maxGateTs || t > maxGateTs) maxGateTs = t;
  }
});
const cycleTimeMs = (minGateTs && maxGateTs) ? (maxGateTs - minGateTs) : 0;
const cycleTimeSec = Math.round(cycleTimeMs / 1000);

console.log('KPI Summary:');
console.log('  Total Runs      : ' + totalRuns);
console.log('  Pass            : ' + passedRuns + '  |  Fail: ' + failedRuns);
console.log('  FTR Rate        : ' + ftrRate + '%  (First-Time-Right)');
console.log('  Avg Duration    : ' + avgDuration + 'ms');
console.log('  Cycle Time      : ' + cycleTimeSec + 's');
console.log('  Total Tokens    : ~' + totalTokens.toLocaleString() + ' tokens (~\$' + (totalTokens * 0.000003).toFixed(4) + ')');
console.log('');
console.log('Run History:');
console.log('  ' + ['Gate','Checker','Duration','Exit','Violations'].map(h => h.padEnd(22)).join(''));
console.log('  ' + '-'.repeat(100));
runs.forEach(r => {
  const gate = ('Gate ' + r.gate).padEnd(22);
  const checker = (r.checker || '').substring(0,20).padEnd(22);
  const dur = ((r.duration_ms || 0) + 'ms').padEnd(22);
  const exit = (r.exit_code === 0 ? 'PASS' : 'FAIL').padEnd(22);
  const viols = String(r.violations || 0).padEnd(22);
  console.log('  ' + gate + checker + dur + exit + viols);
});
JSEOF

echo ""
echo -e "${CYAN}Runs directory: ${RUNS_DIR}${NC}"
echo -e "To clear runs: ${YELLOW}rm -rf ${RUNS_DIR}/*.json${NC}"
