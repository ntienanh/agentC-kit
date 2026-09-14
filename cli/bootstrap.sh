#!/usr/bin/env bash
# ==============================================================================
# AGENTC BOOTSTRAPPER — Clean Inject Engine into any Blank Repo
# ==============================================================================
set -eo pipefail

KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${1:-.}"

TARGET_DIR_ABS="$(cd "${TARGET_DIR}" && pwd)"

echo "🚀 Bootstrapping AgentC Kernel Governance into: ${TARGET_DIR_ABS}"

# 1. Tạo thư mục .agentc-kit (CORE ENGINE)
AGENTC_DIR="${TARGET_DIR_ABS}/.agentc-kit"
mkdir -p "${AGENTC_DIR}"
mkdir -p "${AGENTC_DIR}/cli"
mkdir -p "${AGENTC_DIR}/core"
mkdir -p "${AGENTC_DIR}/agents"

# Copy Core files vào .agentc-kit
cp "${KIT_ROOT}/AGENTS.md" "${AGENTC_DIR}/AGENTS.md"
cp -r "${KIT_ROOT}/cli/"* "${AGENTC_DIR}/cli/"
cp -r "${KIT_ROOT}/core/"* "${AGENTC_DIR}/core/"
cp -r "${KIT_ROOT}/agents/"* "${AGENTC_DIR}/agents/"
chmod +x "${AGENTC_DIR}/cli/agentc"

# 2. Tạo thư mục kit-docs/ (LOCAL RUNTIME & CONTEXT)
KIT_DOCS_DIR="${TARGET_DIR_ABS}/kit-docs"
mkdir -p "${KIT_DOCS_DIR}/specs"
mkdir -p "${KIT_DOCS_DIR}/scratch"

# Copy mẫu CONTEXT.md nếu chưa có
if [ ! -f "${KIT_DOCS_DIR}/CONTEXT.md" ] && [ -f "${KIT_ROOT}/templates/kit-docs/CONTEXT.md.example" ]; then
  cp "${KIT_ROOT}/templates/kit-docs/CONTEXT.md.example" "${KIT_DOCS_DIR}/CONTEXT.md"
fi

# 3. Tự động thêm /kit-docs/ vào .gitignore của Target Repo
GITIGNORE_PATH="${TARGET_DIR_ABS}/.gitignore"
if [ -f "${GITIGNORE_PATH}" ]; then
  if ! grep -q "kit-docs" "${GITIGNORE_PATH}"; then
    echo "" >> "${GITIGNORE_PATH}"
    echo "# AgentC Local Runtime Resources" >> "${GITIGNORE_PATH}"
    echo "/kit-docs/" >> "${GITIGNORE_PATH}"
    echo "✅ Appended /kit-docs/ to .gitignore"
  fi
else
  cat << GITIGNORE > "${GITIGNORE_PATH}"
# AgentC Local Runtime Resources
/kit-docs/
GITIGNORE
  echo "✅ Created .gitignore with /kit-docs/"
fi

echo -e "\n🎉 Done! AgentC Kit is now active in ${TARGET_DIR_ABS}"
echo "--------------------------------------------------------"
echo "🤖 Core Engine:  .agentc-kit/ (AGENTS.md & CLI)"
echo "📝 Local Docs:   kit-docs/ (CONTEXT.md, specs, scratch - GitIgnored)"
echo "--------------------------------------------------------"
echo "👉 Lệnh sử dụng ở target repo: ./.agentc-kit/cli/agentc verify"
