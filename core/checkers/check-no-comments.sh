#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 CHECKER: ZERO COMMENTS (INVARIANT 31)
# Enforces Invariant 31: Pure Self-Documenting & Zero-Comment Invariant.
# Exit code: 0 = PASS, 1 = FAIL.
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/check-no-comments.mjs" "$@"
