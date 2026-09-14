#!/usr/bin/env bash
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

find_git_root() {
  local dir="${KIT_ROOT}"
  for i in $(seq 1 5); do
    if [ -d "${dir}/.git" ]; then
      echo "${dir}"
      return 0
    fi
    dir="$(dirname "${dir}")"
  done
  echo ""
}

GIT_ROOT="$(find_git_root)"

cmd_save() {
  local label="${1:-checkpoint}"
  local stash_name="agentc/${label}/$(date -u +%Y%m%dT%H%M%SZ)"

  if [ -z "${GIT_ROOT}" ]; then
    echo -e "${YELLOW}No git repository found. Checkpoint skipped.${NC}"
    exit 0
  fi

  cd "${GIT_ROOT}"
  if git status --porcelain | grep -q .; then
    git stash push --include-untracked -m "${stash_name}" 2>/dev/null || true
    echo -e "${GREEN}✓ Checkpoint saved: ${stash_name}${NC}"
    local AGENTC_DIR="${KIT_ROOT}/.agentc"
    mkdir -p "${AGENTC_DIR}"
    local stash_ref
    stash_ref="$(git stash list --format='%gd %s' | grep "${stash_name}" | head -1 | awk '{print $1}')"
    echo "{\"label\":\"${label}\",\"stash\":\"${stash_name}\",\"ref\":\"${stash_ref}\",\"created_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" >> "${AGENTC_DIR}/checkpoints.jsonl"
  else
    echo -e "${CYAN}No uncommitted changes. Checkpoint skipped (working tree clean).${NC}"
  fi
}

cmd_list() {
  if [ -z "${GIT_ROOT}" ]; then
    echo -e "${YELLOW}No git repository found.${NC}"
    exit 0
  fi
  cd "${GIT_ROOT}"
  echo -e "${CYAN}AgentC Checkpoints (git stash list | agentc):${NC}"
  git stash list --format='%gd %s' | grep "agentc/" || echo "No agentc checkpoints found."
}

cmd_rollback() {
  local label="${1:-}"
  if [ -z "${GIT_ROOT}" ]; then
    echo -e "${RED}No git repository found.${NC}"
    exit 1
  fi
  if [ -z "${label}" ]; then
    echo -e "${RED}Error: Specify a gate label to roll back to (e.g. gate-1)${NC}"
    exit 1
  fi
  cd "${GIT_ROOT}"
  local stash_ref
  stash_ref="$(git stash list --format='%gd %s' | grep "agentc/${label}/" | head -1 | awk '{print $1}')"
  if [ -z "${stash_ref}" ]; then
    echo -e "${RED}No checkpoint found for label: ${label}${NC}"
    cmd_list
    exit 1
  fi
  echo -e "${YELLOW}Rolling back to checkpoint: ${stash_ref} (agentc/${label}/...)${NC}"
  git checkout -- . 2>/dev/null || true
  git stash pop "${stash_ref}" 2>/dev/null || git stash apply "${stash_ref}" 2>/dev/null || true
  echo -e "${GREEN}✓ Rollback complete to ${label}${NC}"
}

ACTION="${1:-list}"
LABEL="${2:-}"

case "${ACTION}" in
  save)     cmd_save "${LABEL}" ;;
  list)     cmd_list ;;
  rollback) cmd_rollback "${LABEL}" ;;
  *)
    echo "Usage: git-checkpoint.sh [save <label>|list|rollback <label>]"
    echo "Examples:"
    echo "  git-checkpoint.sh save gate-1"
    echo "  git-checkpoint.sh list"
    echo "  git-checkpoint.sh rollback gate-1"
    exit 1
    ;;
esac
