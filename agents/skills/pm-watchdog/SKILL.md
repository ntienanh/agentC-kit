---
name: pm-watchdog
description: >-
  Kỹ năng Giám sát Tiến độ & Chống Lệch Đặc tả Trong Thi công (Milestone-First Dual-Mode Watchdog).
  Kích hoạt tại Gate 2 (Wire-Up) để giám sát song mã Backend DTO Inventory (Milestone 1) và Frontend
  TARGET_UI_MANIFEST 5-State UI (Milestone 2). Phát hiện Spec Drift tức thì, kích hoạt SPEC_DRIFT_ALERT,
  vận hành lưới an toàn liveness timer (1200s), và leo thang trọng tài sau tối đa 2 lần chỉnh sửa.
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả PRD chuẩn Gherkin làm hệ quy chiếu chân lý"
  - path: "src/contracts/<feature>.contract.ts"
    required: true
    description: "Hợp đồng DTO đã ký khóa tại Gate 1"
outputs:
  - path: "docs/specs/watchdog-audit.json"
    description: "Báo cáo thẩm định độ khớp Milestone 1 & Milestone 2 và lịch sử phát hiện lệch spec"
tools:
  - view_file
  - find_by_name
  - schedule
  - manage_task
  - send_message
---

# Section 1: Overview & Objective

Kỹ năng `pm-watchdog` cung cấp cơ chế giám sát thực thi theo sự kiện cột mốc (Milestone-First Event-Driven) nhằm triệt tiêu hiện tượng "Lệch Hướng Âm Thầm" (Silent Spec Drift) giữa Backend và Frontend trong suốt Gate 2. Mục tiêu là khóa cứng chất lượng DTOs ở Milestone 1 trước khi mở khóa cho Frontend hoàn tất 5 trạng thái UI ở Milestone 2, đảm bảo 100% hợp đồng dữ liệu và kịch bản người dùng được tuân thủ nghiêm ngặt trước khi tiến vào kiểm thử E2E.

---

# Section 2: Decision Matrix

| Sự Kiện / Tín Hiệu Nhận Được | Điều Kiện Thẩm Định | Hành Động Bắt Buộc | Điểm Dừng / Bàn Giao |
| :--- | :--- | :--- | :--- |
| **`[MILESTONE_1_READY]` từ Backend** | Code đạt `tsc --noEmit` exit 0; DTO khớp 100% Contract & Gherkin PRD. | Phát thông điệp `[MILESTONE_1_APPROVED]`, mở khóa Frontend M2, kích hoạt Liveness Timer cho Frontend. | Chuyển sang chờ Milestone 2. |
| **Phát hiện DTO sai casing / thiếu trường** | Thuộc tính dùng `snake_case`, thiếu `@IsNotEmpty()`, hoặc sai HTTP code. | Gửi `[SPEC_DRIFT_ALERT]` (Lượt 1 hoặc 2) chỉ rõ vị trí file:line và trích dẫn PRD. | Backend sửa và báo lại M1. |
| **Bế tắc quá 2 lượt chỉnh sửa** | Sau 2 lượt `SPEC_DRIFT_ALERT` mà Backend hoặc Frontend vẫn không khớp. | Leo thang trực tiếp lên Tech Lead làm trọng tài phán quyết tối cao (Invariant 8). | Tech Lead ra phán quyết. |
| **`[MILESTONE_2_READY]` từ Frontend** | Đủ 5 trạng thái UI (Loading, Empty, Error, Success, Form) theo TARGET_UI_MANIFEST. | Phát `[MILESTONE_2_APPROVED]`, hủy toàn bộ scheduled liveness timers. | Mở cổng cho Gate 2 Wire-Up E2E. |
| **Hết hạn Liveness Timer (1200s)** | Không nhận được tín hiệu milestone sau 20 phút. | Gửi thông điệp kiểm tra tiến trình (Ping probe) để giải cứu subagent bị deadlock. | Đánh thức điều phối viên. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Động Lưới An Toàn Backend (Arming Backend Liveness Net):**
   - Thiết lập `schedule(DurationSeconds=1200, TimerCondition="04-backend")` nhằm chống treo tiến trình hoặc vòng lặp vô tận.

2. **Thẩm Định Cột Mốc 1 (Backend DTO Inventory Check):**
   - Tiếp nhận thông điệp `[MILESTONE_1_READY]` khi Backend đã tự kiểm tra `tsc --noEmit` exit code 0.
   - Sử dụng native tool `find_by_name` và `view_file` để duyệt toàn bộ `src/modules/<feature>/dto/*.dto.ts`.
   - Đối chiếu 4 tiêu chuẩn: Tên trường `camelCase`, decorators validation đầy đủ, bọc response envelope (`ApiSuccessResponseDto`), và bao phủ các kịch bản lỗi biên trong PRD.
   - Nếu đạt: Gửi `[MILESTONE_1_APPROVED]` và tái vũ trang timer `schedule(DurationSeconds=1200, TimerCondition="05-frontend")`.

3. **Thẩm Định Cột Mốc 2 (Frontend 5-State UI Check):**
   - Tiếp nhận `[MILESTONE_2_READY]` từ Frontend sau khi đã xác nhận `MILESTONE_1_APPROVED`.
   - Duyệt các components trong danh mục `TARGET_UI_MANIFEST` qua `view_file`.
   - Kiểm tra đủ 5 trạng thái: Skeleton/Spinner (`isLoading`), Empty (`data.length === 0`), Error banner (`isError`), Form mutation (`isSubmitting`), Success view.
   - Nếu đạt: Gửi `[MILESTONE_2_APPROVED]`.

4. **Xử Lý Lệch Đặc Tả & Bế Tắc (Spec Drift & Deadlock Escalation):**
   - Gửi cảnh báo `[SPEC_DRIFT_ALERT]` với độ nén cao ($\le 200$ tokens).
   - Tối đa 2 vòng chỉnh sửa. Lượt 3 tự động chuyển Tech Lead phân xử dứt điểm theo Invariant 8.

5. **Thu Hồi Tiến Trình Định Thời (Clean Teardown):**
   - Khi hoàn tất Gate 2, gọi `manage_task(Action="kill")` hủy toàn bộ các tác vụ hẹn giờ còn lại.

---

# Section 4: Mechanical Verification Checklist

- [ ] Toàn bộ việc soi file thực hiện bằng native tools (`find_by_name`, `view_file`), không dùng bash git CLI: Exit Code `0`.
- [ ] Backend DTOs tồn tại đầy đủ trong `src/modules/<feature>/dto/` và khớp Contract: `test -d src/modules/<feature>/dto`.
- [ ] Không có tác vụ hẹn giờ zombie nào bị bỏ quên sau khi duyệt: `manage_task(Action="list")` không còn watchdog timers.
- [ ] Báo cáo audit được ghi nhận: `test -f docs/specs/watchdog-audit.json`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `docs/specs/<feature>.prd.md` và `src/contracts/<feature>.contract.ts`.
- **Đầu ra (Downstream Seam):** `[MILESTONE_1_APPROVED]` và `[MILESTONE_2_APPROVED]` báo hiệu hoàn tất spec validation, sẵn sàng cho `wireup-e2e-verification`.
