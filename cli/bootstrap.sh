#!/usr/bin/env bash
# ==============================================================================
# AGENTC BOOTSTRAPPER — Clean Inject Engine into any Blank Repo
# ==============================================================================
set -eo pipefail

# Resolve KIT_ROOT dynamically (works both local and inside npx node_modules)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/../AGENTS.md" ]; then
  KIT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
elif [ -f "${SCRIPT_DIR}/../agentc-kit/AGENTS.md" ]; then
  KIT_ROOT="$(cd "${SCRIPT_DIR}/../agentc-kit" && pwd)"
else
  KIT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

TARGET_DIR="."
TEMPLATE_OPTION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template|-t)
      TEMPLATE_OPTION="$2"
      shift 2
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

TARGET_DIR_ABS="$(cd "${TARGET_DIR}" && pwd)"

echo "🚀 Bootstrapping AgentC Kernel Governance into: ${TARGET_DIR_ABS}"

# 1. Create .agentc-kit directory (CORE ENGINE)
AGENTC_DIR="${TARGET_DIR_ABS}/.agentc-kit"
mkdir -p "${AGENTC_DIR}"
mkdir -p "${AGENTC_DIR}/cli"
mkdir -p "${AGENTC_DIR}/core"
mkdir -p "${AGENTC_DIR}/agents"

# Copy Core files into .agentc-kit
cp "${KIT_ROOT}/AGENTS.md" "${AGENTC_DIR}/AGENTS.md"
cp -r "${KIT_ROOT}/cli/"* "${AGENTC_DIR}/cli/"
cp -r "${KIT_ROOT}/core/"* "${AGENTC_DIR}/core/"
cp -r "${KIT_ROOT}/agents/"* "${AGENTC_DIR}/agents/"
chmod +x "${AGENTC_DIR}/cli/agentc"

# Function to draw interactive arrow-key select menu in terminal
select_menu() {
  local options=("$@")
  local selected=0
  local key=""

  # Hide cursor
  tput civis 2>/dev/null || true

  # Handle cleanup on exit
  trap 'tput cnorm 2>/dev/null || true' EXIT

  while true; do
    echo -e "\n📦 Select a Starter Boilerplate Template (Use ↑/↓ Arrow Keys & Enter):" >&2
    for i in "${!options[@]}"; do
      if [ "$i" -eq "$selected" ]; then
        echo -e "  \033[1;36m❯ ${options[$i]}\033[0m" >&2
      else
        echo -e "    ${options[$i]}" >&2
      fi
    done

    # Read arrow keys (3 bytes sequence \033[A or \033[B)
    read -rsn1 key
    if [[ $key == $'\x1b' ]]; then
      read -rsn2 key
      if [[ $key == "[A" ]]; then # Up arrow
        ((selected--))
        if [ $selected -lt 0 ]; then selected=$((${#options[@]} - 1)); fi
      elif [[ $key == "[B" ]]; then # Down arrow
        ((selected++))
        if [ $selected -ge ${#options[@]} ]; then selected=0; fi
      fi
    elif [[ $key == "" ]]; then # Enter key
      break
    fi

    # Move cursor back up to redraw menu
    local lines=$((${#options[@]} + 2))
    tput cuu $lines 2>/dev/null || printf "\033[%dA" "$lines" >&2
  done

  # Restore cursor
  tput cnorm 2>/dev/null || true
  echo "$selected"
}

# 2. Interactive Template Selection Prompt (Arrow Keys)
if [ -z "${TEMPLATE_OPTION}" ] && [ -t 0 ]; then
  MENU_ITEMS=(
    "NestJS Enterprise Backend (be)"
    "Next.js CMS Admin (cms)"
    "Front Office Client Portal (fo)"
    "None (Pure Governance & Engine Only)"
  )
  CHOICE_IDX=$(select_menu "${MENU_ITEMS[@]}")
  case "${CHOICE_IDX}" in
    0) TEMPLATE_OPTION="be" ;;
    1) TEMPLATE_OPTION="cms" ;;
    2) TEMPLATE_OPTION="fo" ;;
    *) TEMPLATE_OPTION="" ;;
  esac
fi

# Inject Boilerplate Template if selected
if [ -n "${TEMPLATE_OPTION}" ]; then
  SRC_TEMPLATE_DIR=""
  case "${TEMPLATE_OPTION}" in
    be|nestjs|backend)
      SRC_TEMPLATE_DIR="${KIT_ROOT}/templates/be"
      ;;
    cms|admin)
      SRC_TEMPLATE_DIR="${KIT_ROOT}/templates/cms"
      ;;
    fo|frontend)
      SRC_TEMPLATE_DIR="${KIT_ROOT}/templates/fo"
      ;;
    *)
      echo "⚠️ Unknown template '${TEMPLATE_OPTION}'. Available options: be (nestjs), cms, fo"
      ;;
  esac

  if [ -n "${SRC_TEMPLATE_DIR}" ] && [ -d "${SRC_TEMPLATE_DIR}" ]; then
    echo "📦 Injecting Starter Template '${TEMPLATE_OPTION}' into ${TARGET_DIR_ABS}..."
    rsync -aq --exclude='node_modules' --exclude='dist' --exclude='.next' "${SRC_TEMPLATE_DIR}/" "${TARGET_DIR_ABS}/" 2>/dev/null || \
    cp -r "${SRC_TEMPLATE_DIR}/"* "${TARGET_DIR_ABS}/" 2>/dev/null
    echo "✅ Boilerplate Template '${TEMPLATE_OPTION}' injected successfully!"
  fi
fi

# 3. Create Root AGENTS.md Pointer for universal AI Agent auto-discovery
cat << 'ROOT_AGENTS' > "${TARGET_DIR_ABS}/AGENTS.md"
# 🤖 AgentC Governance & Execution Pointer

> **ATTENTION ALL AI AGENTS (Antigravity, Claude Code, Cursor, Windsurf, Roo):**
> This repository is strictly governed by the **AgentC Autonomous Kernel (v2.0)**.

### 🔴 MANDATORY INSTRUCTIONS FOR AI AGENTS:
1. **READ MASTER RULES:** Always refer to `/.agentc-kit/AGENTS.md` for the 5 Core Axioms and 5-Gate Lifecycle.
2. **JIT SKILL DISCOVERY:** Execute `./.agentc-kit/cli/agentc match "<task>"` to discover JIT skills before starting tasks.
3. **MECHANICAL EVIDENCE:** Run `./.agentc-kit/cli/agentc verify` after code changes. Never claim success without Exit Code `0`.
4. **RUNTIME CONTEXT & SPECS:** Store PRDs, domain context, and scratch logs under `/kit-docs/` (GitIgnored).
ROOT_AGENTS

# 4. Create kit-docs/ directory (LOCAL RUNTIME & CONTEXT)
KIT_DOCS_DIR="${TARGET_DIR_ABS}/kit-docs"
mkdir -p "${KIT_DOCS_DIR}/specs"
mkdir -p "${KIT_DOCS_DIR}/scratch"

# Copy template CONTEXT.md if not present
if [ ! -f "${KIT_DOCS_DIR}/CONTEXT.md" ] && [ -f "${KIT_ROOT}/templates/kit-docs/CONTEXT.md.example" ]; then
  cp "${KIT_ROOT}/templates/kit-docs/CONTEXT.md.example" "${KIT_DOCS_DIR}/CONTEXT.md"
fi

# 5. Automatically append AgentC Auto-Generated Resources to Target Repo's .gitignore
GITIGNORE_PATH="${TARGET_DIR_ABS}/.gitignore"
cat << 'GITIGNORE_ENTRIES' >> "${GITIGNORE_PATH}.tmp"
# AgentC Local Runtime Resources & Auto-Generated Artifacts
/kit-docs/
/kit-docs/scratch/
/kit-docs/audits/
*.log
.agentc-state.json
GITIGNORE_ENTRIES

if [ -f "${GITIGNORE_PATH}" ]; then
  if ! grep -q "kit-docs" "${GITIGNORE_PATH}"; then
    echo "" >> "${GITIGNORE_PATH}"
    cat "${GITIGNORE_PATH}.tmp" >> "${GITIGNORE_PATH}"
    echo "✅ Appended AgentC Runtime Resources to .gitignore"
  fi
  rm -f "${GITIGNORE_PATH}.tmp"
else
  cat "${GITIGNORE_PATH}.tmp" > "${GITIGNORE_PATH}"
  rm -f "${GITIGNORE_PATH}.tmp"
  echo "✅ Created .gitignore with AgentC Runtime Resources"
fi

echo -e "\n🎉 Done! AgentC Kit is now active in ${TARGET_DIR_ABS}"
echo "--------------------------------------------------------"
echo "🤖 Root Pointer: AGENTS.md (Auto-read by all AI Agents)"
echo "⚙️ Core Engine:  .agentc-kit/ (Rules, Engine & CLI)"
echo "📝 Local Docs:   kit-docs/ (CONTEXT.md, specs, scratch - GitIgnored)"
if [ -n "${TEMPLATE_OPTION}" ]; then
  echo "📦 Template:     ${TEMPLATE_OPTION}"
fi
echo "--------------------------------------------------------"
echo "👉 Usage command in target repo: ./.agentc-kit/cli/agentc verify"
