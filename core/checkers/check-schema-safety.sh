#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

TARGET_DIR=""
IS_FIX=false
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
APPROVAL_FILE="${KIT_ROOT}/.agentc/schema-approval.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET_DIR="$2"; shift 2 ;;
    --fix)    IS_FIX=true; shift ;;
    --approve)
      mkdir -p "$(dirname "${APPROVAL_FILE}")"
      echo "{\"approved\":true,\"by\":\"human\",\"at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "${APPROVAL_FILE}"
      echo -e "${GREEN}✓ Schema destruction approved. Approval token written.${NC}"
      exit 0
      ;;
    *) TARGET_DIR="$1"; shift ;;
  esac
done

if [ -z "${TARGET_DIR}" ]; then
  TARGET_DIR="${KIT_ROOT}"
fi

DESTRUCTIVE_PATTERNS=(
  "DROP TABLE"
  "DROP COLUMN"
  "DROP INDEX"
  "TRUNCATE TABLE"
  "TRUNCATE "
  "deleteMany\(\)"
  "dropTable\("
  "dropColumn\("
  "raw.*DROP"
)

SQL_EXTENSIONS=("*.sql" "*.migration.ts" "*.migration.js" "*.migrate.ts")

VIOLATIONS=0
VIOLATION_FILES=()

echo -e "${BOLD}${CYAN}=============================="
echo -e "  SCHEMA SAFETY GUARDRAIL"
echo -e "==============================${NC}"
echo -e "Target: ${YELLOW}${TARGET_DIR}${NC}"
echo ""

for ext in "${SQL_EXTENSIONS[@]}"; do
  find_cmd=(find "${TARGET_DIR}" -name "${ext}" -not -path "*/node_modules/*" -not -path "*/.git/*")
  if [[ "${TARGET_DIR}" != *"sites"* ]]; then
    find_cmd+=(-not -path "*/sites/*")
  fi
  while IFS= read -r -d '' file; do
    for pattern in "${DESTRUCTIVE_PATTERNS[@]}"; do
      if grep -qi "${pattern}" "${file}" 2>/dev/null; then
        if [ "${VIOLATIONS}" -eq 0 ]; then
          echo -e "${RED}✗ DESTRUCTIVE SCHEMA OPERATIONS DETECTED:${NC}"
        fi
        echo -e "  ${RED}File:${NC} ${file}"
        echo -e "  ${RED}Pattern:${NC} ${pattern}"
        grep -ni "${pattern}" "${file}" | head -3 | sed 's/^/    /'
        echo ""
        VIOLATION_FILES+=("${file}")
        VIOLATIONS=$((VIOLATIONS + 1))
        break
      fi
    done
  done < <("${find_cmd[@]}" -print0 2>/dev/null)
done

if [ "${VIOLATIONS}" -eq 0 ]; then
  echo -e "${GREEN}✓ No destructive schema operations detected. Safe to proceed.${NC}"
  exit 0
fi

echo -e "${RED}${BOLD}Found ${VIOLATIONS} file(s) with destructive schema operations.${NC}"
echo ""
echo -e "${YELLOW}REQUIRED: Human approval token before proceeding.${NC}"
echo -e "Run: ${CYAN}bash scripts/check-schema-safety.sh --approve${NC}"
echo -e "Or:  Create ${CYAN}${APPROVAL_FILE}${NC} manually."
echo ""

if [ -f "${APPROVAL_FILE}" ]; then
  approved="$(node -e "const s=require('./${APPROVAL_FILE}');console.log(s.approved)" 2>/dev/null || echo "false")"
  if [ "${approved}" = "true" ]; then
    echo -e "${GREEN}✓ Human approval token found. Schema destruction permitted.${NC}"
    rm -f "${APPROVAL_FILE}"
    exit 0
  fi
fi

exit 1
