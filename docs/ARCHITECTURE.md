# Cẩm Nang Kiến Trúc & Vận Hành Kỹ Thuật (AgentC Dev Architecture)

> **Dành cho:** Lập trình viên & Kỹ sư Vận hành Hệ thống Tác tử  
> **Phiên bản:** v2.1.0-hyper  
> **Tôn chỉ:** Cơ giới hóa kiểm chứng (Mechanical Verification), nạp lũy tiến (Progressive Disclosure) & Không lãng phí ngữ cảnh (Zero Context Waste).

---

## 🗺️ 1. Bản Đồ Phân Vùng Không Gian Làm Việc (4-Zone Layout)

Repository được tổ chức theo 4 phân vùng chức năng rõ ràng, tách bạch giữa **Bộ não quy chuẩn (Agents)**, **Dự án đích (Templates)**, **Điểm điều khiển (CLI)** và **Hạ tầng kiểm định (Core Engine)**:

```text
agentC-kit/
├── AGENTS.md                  # Kernel bất biến tối giản (38 dòng, < 60 lines)
├── .mcp.json                  # Cấu hình AST Code Intelligence (code-review-graph)
│
├── 📁 agents/                 # [1] NĂNG LỰC TÁC TỬ (Cognitive & Skills Layer)
│   ├── index.yaml             # Registry chỉ mục JIT (21 skills kèm keywords & gates)
│   └── skills/                # 21 tệp SKILL.md độc lập tuân thủ Progressive Disclosure
│       ├── backend-clean-module/SKILL.md
│       ├── frontend-unified-architecture/SKILL.md
│       ├── wireup-e2e-verification/SKILL.md
│       └── ...
│
├── 📁 templates/              # [2] KHUNG DỰ ÁN MẪU (Target Monorepo)
│   ├── be/                    # NestJS Clean Architecture 4 tầng (Domain/App/Infra/Pres)
│   ├── cms/                   # Back-office Next.js 16 + Antd 6 + FSD 7-zone
│   ├── fo/                    # Front-office React/Next.js
│   ├── packages/              # Shared packages: @repo/contracts, @repo/design-tokens
│   └── docker-compose.yml     # DB & Cache daemons cho testing local
│
├── 📁 cli/                    # [3] ĐIỂM CHẠM ĐIỀU KHIỂN & TRIGGERS (Control Plane)
│   ├── agentc                 # Executable CLI thống nhất (gate, match, verify, report, abort)
│   ├── skill-matcher.mjs      # Thuật toán BM25 ghép prompt tác vụ -> đúng tệp SKILL.md
│   └── hooks/                 # Bộ cài đặt Git pre-commit & pre-push tự động
│       └── install-hooks.sh
│
├── 📁 core/                   # [4] ĐỘNG CƠ VẬN HÀNH & KIỂM ĐỊNH (Execution & Verification)
│   ├── mcp/                   # Máy chủ AST: code-review-graph.mjs (blast radius, context slice)
│   ├── gate/                  # Quản trị Gate Pipeline, State Machine & Failure Recovery
│   │   ├── gate-runner.sh     # Điều phối chuyển Gate & Circuit Breaker (retry <= 2)
│   │   ├── git-checkpoint.sh  # Tạo checkpoint git stash & rollback tự động
│   │   ├── agentc-abort.sh    # Emergency kill-switch giải phóng port & process
│   │   ├── run-audit-logger.sh# Bọc lệnh ghi JSON run record
│   │   ├── audit-report.sh    # Tổng hợp KPI & bảng lịch sử chạy
│   │   └── metrics-collector.sh # Thu thập telemetry vào metrics.jsonl
│   └── checkers/              # Bộ 6 POSIX Invariant Verifiers (Exit Code 0/1)
│       ├── verify-invariants.sh   # Master runner
│       ├── check-no-comments.sh / .mjs
│       ├── check-no-barrels.sh / .mjs
│       ├── check-wireup-integrity.sh / .mjs
│       ├── check-i18n-parity.sh / .mjs
│       ├── check-clean-arch.sh / .mjs
│       └── check-schema-safety.sh # Chặn DROP/TRUNCATE schema trái phép
│
├── 📁 docs/                   # [5] TÀI LIỆU CHÍNH SÁCH & ĐỐI CHUẨN
│   ├── HITL_POLICY.md         # Quy chế can thiệp Người - Máy (Mandatory vs Auto)
│   ├── BENCHMARK.md           # Báo cáo đo lường định lượng token & latency
│   └── ARCHITECTURE.md        # Cẩm nang này
│
├── 📁 tests/                  # [6] TEST SUITE ĐỘC LẬP (142 E2E Tests)
│   ├── run-all-tests.sh       # Runner chạy toàn bộ Tiers 1-4
│   └── tier[1-4]-*.sh
│
├── 📁 .agentc/                # [7] RUNTIME STATE (Gitignored)
│   ├── state.json             # Trạng thái hiện tại của Pipeline
│   ├── runs/                  # JSON logs chi tiết từng lượt chạy
│   └── metrics/               # metrics.jsonl
│
└── 📁 agentC-v1-legacy/       # [8] KHO LƯU TRỮ V1 CŨ (Gitignored)
    ├── .agents/               # 180 files pods cũ
    ├── AGENTS.md              # File kernel 27KB cũ
    └── docs/                  # Tài liệu tracking cũ
```

---

## 🔄 2. Nguyên Lý Hoạt Động & Mối Liên Hệ Giữa Các Phân Vùng

### 2.1 Mối liên hệ: `cli/` $\longrightarrow$ `agents/` (Skill Routing)
* Thay vì nạp toàn bộ tri thức vào context window (gây tràn token và hallucination), hệ thống dùng **cơ chế Progressive Disclosure**:
* Lập trình viên hoặc Orchestrator gõ:
  ```bash
  ./cli/agentc match "viết module auth nestjs và repository" --gate 2
  ```
* `cli/skill-matcher.mjs` dùng thuật toán **BM25** so khớp với `agents/index.yaml` và chỉ định chính xác:
  `agents/skills/backend-clean-module/SKILL.md`.
* Subagent chỉ đọc đúng 1 file này (~1,300 tokens) để thực thi nhiệm vụ, giữ context window luôn sạch 98%.

### 2.2 Mối liên hệ: `agents/` $\longrightarrow$ `templates/` (Design Contracts)
* `agents/skills/` không chứa code chạy, nó chứa **khế ước kiến trúc bắt buộc thi hành trên `templates/`**:
  * `backend-clean-module`: Ép code sinh ra trong [`templates/be/`](file:///Users/tienanhnguyen/Desktop/Image/agentC-kit/templates/be) phải có đủ 4 tầng `domain/`, `application/`, `infrastructure/`, `presentation/`. Cấm import ORM vào tầng Domain.
  * `frontend-unified-architecture`: Ép code UI trong [`templates/cms/`](file:///Users/tienanhnguyen/Desktop/Image/agentC-kit/templates/cms) phải tuân theo 7 phân vùng, dùng TanStack Query trong `src/logic/`, cấm `useState(loading)`.
  * `contract-first-design`: Ép DTOs và DIP Tokens phải khai báo tại `templates/packages/contracts/`.

### 2.3 Mối liên hệ: `templates/` $\longleftrightarrow$ `core/checkers/` (Mechanical Gate)
* Khi Subagent hoàn thành việc gõ code vào `templates/`, chất lượng không được đánh giá bằng lời nói mà bằng **Exit Code nhị phân**:
  ```bash
  ./cli/agentc verify
  ```
* 6 scripts kiểm tra độc lập sẽ quét trực tiếp mã nguồn:
  1. `check-no-comments.sh`: Bắt sạch comment dư thừa trong `src/` (Invariant 31).
  2. `check-no-barrels.sh`: Bắt các barrel imports trái phép (Invariant 33).
  3. `check-wireup-integrity.sh`: Bắt các route mồ côi chưa đăng ký menu (Invariant 32).
  4. `check-i18n-parity.sh`: Bắt lệch key từ điển đa ngôn ngữ (Invariant 36).
  5. `check-clean-arch.sh`: Bắt magic numbers và vi phạm kiến trúc 4 tầng (Invariant 29, 41).
  6. `check-schema-safety.sh`: Chặn các câu lệnh SQL hủy diệt (`DROP`, `TRUNCATE`) (Pillar 6 Guardrail).
* Nếu **Exit Code = 0**: Gate Runner cho phép chuyển Gate tiếp theo.
* Nếu **Exit Code = 1**: Log lỗi được nén $\le 20$ dòng gửi ngược lại cho Subagent sửa (tối đa 2 lần retry).

---

## ⚡ 3. Hướng Dẫn Sử Dụng Unified CLI (`cli/agentc`)

Tất cả các tác vụ thường ngày của lập trình viên được gói gọn trong 1 lệnh duy nhất:

| Lệnh CLI | Chức Năng Kỹ Thuật |
| :--- | :--- |
| `./cli/agentc gate status` | Kiểm tra trạng thái hiện tại (Gate 0-4, số lần retry, timestamp). |
| `./cli/agentc gate advance` | Chuyển sang Gate tiếp theo (tự động kiểm tra điều kiện tiên quyết). |
| `./cli/agentc match "<task>" [--gate N]` | Tìm kiếm JIT skill phù hợp nhất cho tác vụ. |
| `./cli/agentc verify [--fix] [--staged]` | Chạy bộ kiểm tra Invariants; cờ `--fix` tự dọn comment. |
| `./cli/agentc checkpoint save <label>` | Lưu checkpoint an toàn qua Git Stash. |
| `./cli/agentc checkpoint rollback <label>` | Rollback mã nguồn về checkpoint sạch gần nhất. |
| `./cli/agentc abort` | **Emergency Kill-Switch**: Dừng pipeline, giải phóng port, stash code. |
| `./cli/agentc report [--last-n N]` | Xem bảng điều khiển KPI (tỷ lệ pass, thời gian chạy, token). |
| `./cli/agentc hooks` | Cài đặt Git pre-commit & pre-push hooks vào repo. |

---

## 🛡️ 4. Quy Chế Can Thiệp Người - Máy (HITL Summary)

Chi tiết đầy đủ tại [`docs/HITL_POLICY.md`](file:///Users/tienanhnguyen/Desktop/Image/agentC-kit/docs/HITL_POLICY.md):

* **🔴 Điểm dừng Bắt buộc (Con người PHẢI duyệt):**
  * **Gate 0 $\to$ 1 (Spec Approval):** Duyệt PRD Gherkin & 5W2H trước khi code.
  * **Gate 1 $\to$ 2 (Schema Approval):** Duyệt migration SQL trước khi tác động DB.
  * **Gate 4 $\to$ DONE (Release Approval):** Duyệt lần cuối trước khi deploy.
* **🟢 Vùng Tự Hành Hoàn Toàn (Cấm làm phiền con người):**
  * **Gate 2 (Coding & Testing):** Subagents tự code, tự test, tự retry tối đa 2 lần.
  * **Gate 3 (Security Audit):** Tự quét SAST và tự sinh bản vá patch.
* **⚡ Ngắt khẩn cấp (Emergency Override):**
  * Con người có thể gõ `./cli/agentc abort` bất kỳ lúc nào để lấy lại toàn quyền kiểm soát.
