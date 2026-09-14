#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 CHECKER: ANTI-BARREL PROLIFERATION (INVARIANT 33)
# Enforces Invariant 33: Direct Import & Anti-Barrel Proliferation.
# Exit code: 0 = PASS, 1 = FAIL.
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/check-no-barrels.mjs" "$@"
