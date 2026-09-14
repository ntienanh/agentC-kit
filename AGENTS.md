# AGENTS.md — AgentC Kernel (v2.0-native)

> **Scope**: Repository-Wide | **Mode**: Always-On | **Target**: Antigravity Agents
> **Principle**: Mechanical Verification over LLM Delusion. Progressive Disclosure over Monolithic Context.

---

## 1. The 5 Core Axioms
1. **Zero-Code Orchestrator Axiom**: The Root Orchestrator MUST NEVER directly author application code or tests in `src/` or `tests/`. It coordinates, dispatches subagents, and triggers verification scripts.
2. **Progressive Disclosure Axiom**: Domain-specific architectures, role SOPs, and compliance rules are NEVER loaded statically. Agents discover and load skills JIT via `agents/skills/<name>/SKILL.md` matching task keywords.
3. **Mechanical Evidence Axiom**: No assertion is accepted without fresh command execution returning Exit Code `0`. Never trust "should work", "looks good", or static assumptions.
4. **Read-Only Test & Anti-Cheating Axiom**: Test suites at Gate 1 are sealed `READ-ONLY`. Developers must modify application code to satisfy tests, never weaken assertions.
5. **Context Budgeting Axiom**: Error logs fed to remediation loops must be compressed to <= 20 lines (<= 2000 tokens) anchored around root-cause keywords (`Error:`, `Failed:`, `Exception:`).

---

## 2. The 5-Gate Lifecycle
```
Gate 0: Spec & Challenge  ──> Gate 1: Contract & DB  ──> Gate 2: Wire-Up & Impl
                                                              │
Gate 4: Pack & Ship       <── Gate 3: Security & Audit <──────┘
```
- **Gate 0 (Spec)**: Socratic PRD (`kit-docs/specs/*.prd.md`) + 5W2H plan challenge (Complexity Score <= 4).
- **Gate 1 (Contract)**: Canonical DTOs (`@repo/contracts`), DB migrations + deterministic seed data.
- **Gate 2 (Wire-Up)**: Dual implementation (BE 4-layer + FE 7-zone) verified via live socket/browser E2E. Max 2 retries; 3rd failure escalates to single arbiter.
- **Gate 3 (Audit)**: SAST, secret leak audit, and actionable remediation patch diffs.
- **Gate 4 (Ship)**: Zombie port cleanup (`kill -9`), mechanical invariant scripts pass 100%.

---

## 3. Execution & Verification Protocol
1. **Dispatch Packet**: Orchestrator hands subagents only 3 items: `Inputs`, `Outputs`, and quantitative `Acceptance Criteria`.
2. **Skill Discovery**: Run `./cli/agentc match "<task>" --gate <n>` to retrieve machine-matched skill paths from `agents/index.yaml`. Never guess.
3. **Gate State Machine**: Run `./cli/agentc gate [status|advance|retry|reset|abort]` to manage pipeline state deterministically.
4. **Mechanical Enforcement**: Run `./cli/agentc verify` prior to handoff. Any failure emits Exit Code `1` and halts progression.
5. **HITL Gates**: Gates 0→1 (Spec), 1→2 (Schema), and 4→DONE (Ship) require human approval. See `docs/HITL_POLICY.md`.
6. **Emergency Abort**: Run `./cli/agentc abort` to immediately halt all background activity and stash uncommitted work.
7. **Completion Signal**: Emit `<!-- GOAL_COMPLETE -->` ONLY when 100% of gates pass with Exit Code `0`, audit report shows zero violations, and zero zombie processes.
