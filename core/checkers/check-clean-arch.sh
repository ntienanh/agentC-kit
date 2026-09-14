#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 CHECKER: CLEAN ARCHITECTURE & SCOPING (INVARIANTS 29, 34, 37, 38, 41)
# Enforces Invariants 29, 34, 37, 38, 41:
# Clean architecture 4-layer, spec co-location, utility scoping, canonical enums
# Exit code: 0 = PASS, 1 = FAIL.
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/check-clean-arch.mjs" "$@"
