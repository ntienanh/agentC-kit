# Đề Xuất Kỹ Thuật: Session Handoff & Zero-Kit Portability

> **Mã đề xuất:** RFC-2026-09-HANDOFF  
> **Trạng thái:** 🟡 **DRAFT / DEFERRED (Lưu trữ chờ kích hoạt)**  
> **Chủ đề:** Bảo toàn ngữ cảnh phiên làm việc khi chuyển máy hoặc bàn giao cho các Agent không có AgentC-Kit  
> **Tham chiếu gốc:** [skills.sh/mattpocock/skills/handoff](https://www.skills.sh/mattpocock/skills/handoff)

---

## 1. Bối Cảnh & Vấn Đề Cốt Lõi

Khi phát triển dự án với **AgentC-Kit**, hệ thống vận hành trơn tru nhờ vào 5-Gate Lifecycle, CLI `agentc`, JIT Skill Matcher và bộ Invariant Checkers.

Tuy nhiên, trong thực tế phát sinh tình huống chuyển giao:
1. **Chuyển máy không có Kit (Move machine without kit):** Lập trình viên push code và clone sang máy khác chưa cài đặt môi trường AgentC-Kit.
2. **Đa dạng hóa Agent (Agent-Agnostic Handoff):** Dự án được mở bởi các Agent khác (Claude Code thuần, Cursor Composer, Windsurf Cascade, GitHub Copilot, Codex, ChatGPT) hoặc lập trình viên con người.
3. **Gián đoạn phiên làm việc (Session Interruption):** Công việc đang dở dang (WIP) giữa chừng tại Gate 1 hoặc Gate 2, context trong bộ nhớ chat bị mất hoặc nén quá mức.

### Điểm nghẽn của kỹ năng `handoff` gốc (Matt Pocock):
- **Lưu file vào `/tmp` của OS:** Mất hoàn toàn khi chuyển máy vì `/tmp` nằm cục bộ trên máy cũ, không đi theo git repo.
- **Phụ thuộc vào Claude Code `Skill` tool:** Các agent khác ngoài Claude Code không hiểu chỉ thị này.

---

## 2. Kiến Trúc Đề Xuất: 2 Cấp Độ Bảo Toàn Ngữ Cảnh

```text
Cấp độ 1: Static Foundation (Tri thức tĩnh từ đầu dự án)
├── AGENTS.md (hoặc CLAUDE.md) -> Luật chơi, tech stack, quy tắc cốt lõi
├── CONTEXT.md                 -> Từ điển thuật ngữ nghiệp vụ (Ubiquitous Language)
└── docs/adr/                  -> Lịch sử và lý do ra quyết định kiến trúc

Cấp độ 2: Dynamic Checkpoint (Ngữ cảnh động của phiên làm việc)
└── docs/HANDOFF.md            -> Tệp Git-tracked tóm tắt trạng thái dở dang & domino tiếp theo
```

### Cấp độ 1: Chuẩn Bị Sẵn Khi Bắt Đầu Dự Án (Onboarding Baseline)
- **`AGENTS.md` / `CLAUDE.md`:** Chứa System Constraints, Tech Stack và lệnh chạy cơ bản. Mọi agent hiện đại đều tự động nạp file này.
- **`CONTEXT.md`:** Khóa định nghĩa thuật ngữ domain, ngăn agent lạ hallucinate hoặc dùng sai jargon.
- **`docs/adr/`:** Lưu vết quyết định kiến trúc, ngăn việc refactor ẩu phá vỡ giải pháp cũ.

### Cấp độ 2: Cơ Chế Checkpoint Trong Flows (Session Snapshot)
Xuất bản tệp **`docs/HANDOFF.md`** (được Git theo dõi) khi kết thúc session hoặc trước khi chuyển máy.

---

## 3. Cấu Trúc Chuẩn Của `docs/HANDOFF.md` (Zero-Kit Compatible)

Tệp handoff phải được thiết kế để một Agent "mồ côi" (không có kit) đọc vào là làm việc được ngay:

```markdown
# 🧭 SESSION HANDOFF CHECKPOINT
> **Timestamp**: <ISO_8601> | **Branch**: `<branch-name>`
> **Active Gate**: Gate <0..4> (<Gate Name>) | **Tiến độ**: ~<X>%

## 1. What Was Accomplished (Việc đã hoàn thành trong phiên)
- [Liệt kê các module, migration, component, test đã hoàn thiện]

## 2. Current State & In-Flight Work (Trạng thái dở dang)
- Task đang dang dở: [Mô tả cụ thể seam đang nối]
- Các file vừa chỉnh sửa: [Đường dẫn file]
- Lỗi/Test đang fail (nếu có): [Trích xuất lỗi ngắn gọn <= 10 dòng]

## 3. The Next Immediate Domino (Hành động kế tiếp duy nhất)
- 👉 **Mục tiêu ưu tiên**: [Hành động cụ thể tiếp theo để thông luồng]
- 👉 **Lệnh kiểm tra độc lập (Without Kit)**:
  ```bash
  npm test <path-to-test>
  npm run lint
  ```

## 4. Key Repository Context (Chỉ dẫn cho Agent tiếp theo)
- Đọc [CONTEXT.md](./CONTEXT.md) để nắm chuẩn thuật ngữ domain.
- Đọc [docs/adr/](./docs/adr) để hiểu các quyết định kiến trúc đã khóa.
- Đọc [docs/specs/<feature>.prd.md](./docs/specs) để xem Acceptance Criteria.
```

---

## 4. Kế Hoạch Triển Khai Trong Tương Lai (Khi Kích Hoạt)

Khi quyết định đưa vào áp dụng chính thức, lộ trình gồm:

1. **Soạn thảo Skill chuẩn 5 phần:**
   - Tạo `agents/skills/session-handoff/SKILL.md` (tuân thủ `skill-intake`, gắn Gate 0..4).
   - Đăng ký vào `agents/index.yaml` với keywords: `[handoff, checkpoint, session context, transfer, zero-kit, switch machine]`.

2. **Bổ sung lệnh CLI hỗ trợ:**
   - Thêm lệnh `./cli/agentc handoff "<lý do hoặc task tiếp theo>"`:
     - Tự động quét git diff, active gate, và điền template `docs/HANDOFF.md`.
     - Tự động commit hoặc nhắc nhở push trước khi rời máy.

3. **Hướng dẫn cho Agent máy mới:**
   - Prompt mẫu khi mở repo ở máy mới:
     > *"Đọc file `docs/HANDOFF.md`, `CONTEXT.md` và `AGENTS.md` rồi tiếp tục thực hiện công việc tại mục Next Immediate Domino."*
