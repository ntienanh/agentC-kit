#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 CHECKER: I18N PARITY & ZERO HARDCODED LITERALS (INVARIANT 36)
# Enforces Invariant 36: Domain-Scoped i18n & Zero Hardcoded Literals.
# Exit code: 0 = PASS, 1 = FAIL.
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/check-i18n-parity.mjs" "$@"
