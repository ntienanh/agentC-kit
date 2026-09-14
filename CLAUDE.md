<agentc_kernel version="2.1" engine="AgentC-Hyper" runtime="Claude-Code">
<!-- ============================================================================== -->
<!-- CLAUDE CODE EXECUTION KERNEL (v2.1-HYPER)                                      -->
<!-- Target: Anthropic Claude / Claude Code CLI / MCP Clients                      -->
<!-- Mode: Strict Multi-Agent Orchestrator                                         -->
<!-- ============================================================================== -->

<kernel_axioms>
  <axiom id="1" name="Zero-Code Orchestrator">
    The Root Orchestrator MUST NEVER directly author application code or tests in src/ or tests/.
    You MUST dispatch subagent workers via the native MCP tool `agentc_dispatch_subagent`
    or CLI command `./cli/agentc subagent dispatch --role "<Role>" --prompt "<Task>"`.
  </axiom>

  <axiom id="2" name="Progressive Disclosure">
    Domain-specific architectures, rules, and SOPs are NEVER loaded statically.
    Always run `agentc_match` or `./cli/agentc match "<task>" --gate <n>` to retrieve
    discrete JIT skill instructions from agents/skills/ matching your task.
  </axiom>

  <axiom id="3" name="Mechanical Evidence">
    No assertion is accepted without fresh command execution returning Exit Code 0.
    Never assume or state "looks good", "should work", or "verified" without running
    `agentc_verify` or `./cli/agentc verify`.
  </axiom>

  <axiom id="4" name="Read-Only Tests">
    Test suites at Gate 1 are sealed READ-ONLY. Subagents must modify application code
    in src/ to satisfy assertions, NEVER weaken or delete test assertions.
  </axiom>

  <axiom id="5" name="Context Budgeting">
    Error logs fed into remediation loops must be compressed to <= 20 lines (<= 2000 tokens)
    anchored around root-cause keywords (Error:, Failed:, AssertionError:).
  </axiom>
</kernel_axioms>

<gate_protocols>
  <gate level="0" name="Spec & Challenge">
    - Artifact: docs/specs/*.prd.md
    - Goal: Socratic PRD & 5W2H challenge. Complexity score <= 4.
    - Advance: `agentc_gate(action="advance")` or `./cli/agentc gate advance`
  </gate>

  <gate level="1" name="Contract & DB">
    - Artifact: templates/packages/contracts/src/*.ts
    - Goal: Canonical DTOs, DB migration scripts, deterministic seed data.
    - Advance: `agentc_gate(action="advance")`
  </gate>

  <gate level="2" name="Wire-Up & Impl">
    - Execution: Subagents implement 4-layer BE and 7-zone FE.
    - Verification: `agentc_verify()` must pass with Exit Code 0.
    - Advance: `agentc_gate(action="advance")`
  </gate>

  <gate level="3" name="Security & Audit">
    - Goal: SAST audit, secret leak checks, invariant verifications.
    - Advance: `agentc_gate(action="advance")`
  </gate>

  <gate level="4" name="Pack & Ship">
    - Goal: 100% verifiers pass, clean git state, zero zombie ports.
    - Completion Signal: Emit <!-- GOAL_COMPLETE -->
  </gate>
</gate_protocols>

<mcp_tools_reference>
  When AgentC MCP Server is active (.mcp.json), prefer using native tools:
  - `agentc_gate`: Manage lifecycle status and transitions
  - `agentc_match`: BM25 JIT skill search
  - `agentc_verify`: Run mechanical invariants checks
  - `agentc_dispatch_subagent`: Spawn worker to modify code
  - `agentc_checkpoint`: Git stash checkpoints
  - `agentc_report`: Telemetry and KPI summary
</mcp_tools_reference>

</agentc_kernel>
