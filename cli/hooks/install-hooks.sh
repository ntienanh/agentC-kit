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

GIT_DIR=""
search_dir="${KIT_ROOT}"
for i in $(seq 1 5); do
  if [ -d "${search_dir}/.git" ]; then
    GIT_DIR="${search_dir}/.git"
    break
  fi
  search_dir="$(dirname "${search_dir}")"
done

if [ -z "${GIT_DIR}" ]; then
  echo -e "${YELLOW}Warning: No .git directory found. Hooks not installed.${NC}"
  exit 0
fi

HOOKS_DIR="${GIT_DIR}/hooks"
mkdir -p "${HOOKS_DIR}"

cat > "${HOOKS_DIR}/pre-commit" << 'HOOK'
#!/usr/bin/env bash
set -eo pipefail
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${HOOK_DIR}/../.." && pwd)"
CLI="${REPO_ROOT}/cli/agentc"
if [ ! -f "${CLI}" ]; then
  echo "agentc CLI not found, skipping pre-commit"
  exit 0
fi
echo "agentc pre-commit: Running staged invariant checks..."
if bash "${CLI}" verify --staged; then
  echo "agentc pre-commit: PASS — commit allowed."
  exit 0
else
  echo "agentc pre-commit: FAIL — fix violations before committing."
  exit 1
fi
HOOK
chmod +x "${HOOKS_DIR}/pre-commit"

cat > "${HOOKS_DIR}/pre-push" << 'HOOK'
#!/usr/bin/env bash
set -eo pipefail
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${HOOK_DIR}/../.." && pwd)"
CLI="${REPO_ROOT}/cli/agentc"
if [ ! -f "${CLI}" ]; then
  echo "agentc CLI not found, skipping pre-push"
  exit 0
fi
echo "agentc pre-push: Running full verification..."
bash "${CLI}" verify
echo "agentc pre-push: PASS — push allowed."
HOOK
chmod +x "${HOOKS_DIR}/pre-push"

echo -e "${BOLD}${CYAN}======================================"
echo -e "  AGENTC-V2 GIT HOOKS INSTALLER"
echo -e "======================================${NC}"
echo -e "Git:   ${YELLOW}${GIT_DIR}${NC}"
echo -e "Hooks: ${YELLOW}${HOOKS_DIR}${NC}"
echo ""
echo -e "${GREEN}✓ pre-commit installed (fast staged check)${NC}"
echo -e "${GREEN}✓ pre-push installed   (full verify + schema safety)${NC}"
echo ""
echo -e "Uninstall: rm ${HOOKS_DIR}/pre-commit ${HOOKS_DIR}/pre-push"
