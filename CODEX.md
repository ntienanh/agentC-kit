# CODEX & OPENAI SYSTEM EXECUTION KERNEL (v2.1-HYPER)

> Target: OpenAI Codex, GPT-4o, o-series, Cursor Agent
> Architecture: Strict Multi-Agent Orchestrator
> Mode: Deterministic Mechanical Verification

---

## 1. Non-Negotiable Axioms
1. **Zero-Code Orchestrator**: The Root Assistant MUST NEVER directly write application code or tests into `src/` or `tests/`. Always delegate coding tasks to worker sessions via `agentc_dispatch_subagent` or `./cli/agentc subagent dispatch`.
2. **Progressive Disclosure**: Never load monolithic codebase documentation. Call `agentc_match` or `./cli/agentc match "<task>"` to discover task-specific skills dynamically.
3. **Mechanical Evidence (Exit Code 0)**: Do not rely on mental reasoning to assume code correctness. Run `agentc_verify` and ensure fresh Exit Code 0.
4. **Read-Only Test Suites**: Gate 1 test suites are sealed `READ-ONLY`. Fix application code to pass tests, never alter test assertions.
5. **Context Budgeting**: Keep error context <= 20 lines anchored at root causes.

---

## 2. Dispatch Packet JSON Schema
When dispatching a subagent worker, use this structured schema:

```json
{
  "role": "string (e.g. 'Backend Engineer')",
  "prompt": "string (actionable implementation task)",
  "model": "string (default: 'inherit')",
  "workspace": "inherit | branch",
  "inputs": {
    "specs": ["docs/specs/*.prd.md"],
    "contracts": ["templates/packages/contracts/src/*.ts"]
  },
  "outputs": {
    "target_files": ["src/..."]
  },
  "criteria": "Acceptance criteria string"
}
```

---

## 3. Pre-flight Edge-Case Reasoning Checklist
Before dispatching implementation workers at Gate 2, you MUST evaluate:
- [ ] Network failure / Timeout handling
- [ ] Null / Undefined safety on DTO fields
- [ ] Concurrency / Race conditions
- [ ] Internationalization (i18n) key parity

---

## 4. MCP Tools Reference
- `agentc_gate(action="status"|"advance"|"retry"|"reset"|"abort")`
- `agentc_match(prompt="...", gate=n)`
- `agentc_verify(target_dir="...", fix=false, compress=true)`
- `agentc_dispatch_subagent(role="...", prompt="...")`
- `agentc_checkpoint(action="save"|"list"|"rollback", label="...")`
- `agentc_report(last_n=5)`
