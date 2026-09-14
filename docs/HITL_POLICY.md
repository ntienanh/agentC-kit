# HITL Policy — Human-in-the-Loop Intervention Policy

**Scope:** agentc-v2 Pipeline Governance  
**Version:** 2.0  
**Tôn chỉ:** Trao quyền tự hành tối đa cho máy; con người giữ quyền phê duyệt ở các điểm có tác động không thể đảo ngược.

---

## 1. Nguyên Tắc Phân Định (Intervention Taxonomy)

Chính sách này phân chia toàn bộ pipeline thành 3 vùng rõ ràng:

| Vùng | Ký hiệu | Mô tả |
| :--- | :---: | :--- |
| **Mandatory Checkpoint** | 🔴 STOP | Con người BẮT BUỘC phê duyệt trước khi tiếp tục. Không có approval = pipeline bị chặn. |
| **Zero-Interruption Zone** | 🟢 AUTO | Máy tự hành hoàn toàn 100%. Cấm làm phiền con người trừ khi Circuit Breaker kích hoạt. |
| **Emergency Override** | ⚡ ABORT | Con người có thể can thiệp bất cứ lúc nào để dừng, rollback, hoặc override. |

---

## 2. Mandatory Checkpoints (🔴 Con Người PHẢI Phê Duyệt)

### Checkpoint A: Gate 0 → Gate 1 (Spec Approval)
- **Thời điểm:** Sau khi PM Discovery và Plan Challenge hoàn tất, PRD Gherkin + 5W2H Debate đã được soạn xong.
- **Artifact cần phê duyệt:** `docs/specs/<feature>.prd.md` và `docs/debates/<feature>.debate.md`.
- **Cơ chế phê duyệt:** Implementation Plan với nút `Proceed` trong Antigravity IDE.
- **Lý do bắt buộc:** Spec quyết định 90% kiến trúc; sai từ đây, mọi thứ phía sau đều sai theo.
- **Kết quả approve:** Gate Runner ghi nhận `gate: 1` và checkpoint git stash `agentc/gate-1/`.

### Checkpoint B: Gate 1 → Gate 2 (Schema Migration Approval)
- **Thời điểm:** Sau khi DBA hoàn tất migration files và seed data deterministic.
- **Artifact cần phê duyệt:** Các file migration SQL/TypeORM và `src/contracts/<feature>.contract.ts`.
- **Cơ chế phê duyệt:** Chạy `bash scripts/check-schema-safety.sh --approve` để phát token phê duyệt.
- **Lý do bắt buộc:** Schema migrations có thể gây mất dữ liệu production không thể phục hồi.
- **Kết quả approve:** `.agentc/schema-approval.json` được tạo; Gate Runner tiến sang Gate 2.

### Checkpoint C: Gate 4 → DONE (Production Release Approval)
- **Thời điểm:** Sau khi tất cả invariants pass (Exit Code 0) và zero zombie processes.
- **Artifact cần phê duyệt:** Kết quả `audit-report.sh`, Dockerfile, CI/CD config.
- **Cơ chế phê duyệt:** Con người xác nhận bằng tay trước khi trigger deployment.
- **Lý do bắt buộc:** Deploy production là hành động không thể rollback nhanh; cần con người xác nhận lần cuối.

---

## 3. Zero-Interruption Zones (🟢 Tự Hành Hoàn Toàn)

### Zone 1: Gate 2 — Coding & Wire-Up
- **Phạm vi:** Backend 4-layer implementation + Frontend 7-zone implementation + Unit tests.
- **Vận hành:** PM Watchdog giám sát milestone. Tối đa 2 retries. Circuit Breaker kích hoạt lần 3.
- **Con người KHÔNG được làm phiền** trừ khi Circuit Breaker tripped (deadlock-arbitration).

### Zone 2: Gate 3 — Security Audit
- **Phạm vi:** SAST scanning, secret leak detection, OWASP top-10 check, remediation patching.
- **Vận hành:** Security Officer agent tự chạy, tự tạo patch diff.
- **Con người KHÔNG được làm phiền** trừ khi phát hiện vulnerability mức Critical/High không có remediation tự động.

---

## 4. Emergency Override (⚡ Can Thiệp Khẩn Cấp)

Con người có thể kích hoạt Emergency Abort bất cứ lúc nào:

```bash
bash scripts/agentc-abort.sh
```

Hành động này sẽ:
1. Ngắt mọi background process của agentc.
2. Giải phóng tất cả ports (3000, 4000, 5432...).
3. Stash uncommitted changes vào `agentc/emergency-abort/<timestamp>`.
4. Ghi trạng thái `ABORTED` vào `.agentc/state.json`.

**Để khôi phục sau abort:**
```bash
bash scripts/gate-runner.sh status          # Kiểm tra trạng thái
bash scripts/git-checkpoint.sh list         # Xem các checkpoint có thể rollback
bash scripts/git-checkpoint.sh rollback gate-1  # Rollback về gate cụ thể
bash scripts/gate-runner.sh reset           # Reset pipeline về Gate 0
```

---

## 5. Escalation Path (Khi Circuit Breaker Kích Hoạt)

Khi retry count >= 3 tại Gate 2, hệ thống tự động:
1. Ghi trạng thái `CIRCUIT_BREAKER` vào `.agentc/state.json`.
2. Kích hoạt skill `deadlock-arbitration` để phán quyết kỹ thuật.
3. Sau khi Tech Lead ra phán quyết, pipeline được reset retry về 0 và tiếp tục.
4. Nếu deadlock-arbitration cũng thất bại → Mandatory Checkpoint: Con người phải can thiệp trực tiếp.

---

## 6. Bảng Tổng Hợp Nhanh

| Gate | Giai Đoạn | Loại | Điều Kiện Mở Gate |
| :---: | :--- | :---: | :--- |
| Gate -1 | Pre-flight Check | 🟢 AUTO | `devops-lifecycle-and-reaper` pass |
| Gate 0 | Spec & Challenge | 🔴 STOP | Human approves PRD + 5W2H |
| Gate 1 | Contract & DB | 🔴 STOP | Human approves schema migration |
| Gate 2 | Wire-Up & Impl | 🟢 AUTO | E2E tests pass (max 2 retries) |
| Gate 3 | Security & Audit | 🟢 AUTO | No Critical/High unpatched vulns |
| Gate 4 | Pack & Ship | 🔴 STOP | Human approves production release |
