#!/usr/bin/env bash
# ============================================================================
# AGENTC-V2 CHECKER: WIRE-UP INTEGRITY (INVARIANTS 32, 35, 40)
# Enforces Invariants 32, 35, 40:
# Whole-lifecycle wire-up, navigation registration, logic decoupling, AppTable
# Exit code: 0 = PASS, 1 = FAIL.
# ============================================================================
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/check-wireup-integrity.mjs" "$@"
