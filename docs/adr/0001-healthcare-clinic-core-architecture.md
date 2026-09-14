# ADR 0001: Healthcare Clinic Core Architecture & Anti-Double-Booking Strategy

**Status:** Accepted  
**Date:** 2026-09-14  
**Context:** [docs/specs/healthcare-clinic.prd.md](../specs/healthcare-clinic.prd.md)  
**Deciders:** Chief Simplicity Officer, Tech Lead Arbiter  

---

## 1. Context & Problem Statement
Phòng khám tư nhân cần một hệ thống quản lý khám chữa bệnh bao gồm toàn bộ vòng đời từ Đặt hẹn, Check-in, Hàng đợi, Thăm khám, Bệnh án, Đơn thuốc đến Thu ngân. Yêu cầu trọng tâm:
1. Ngăn chặn 100% tình trạng đặt trùng lịch (Double-booking) cho bác sĩ và bệnh nhân.
2. Bảo đảm tính bất biến của hồ sơ bệnh án và đơn thuốc y khoa sau khi hoàn thành buổi khám.
3. Giữ Complexity Score $\le 4$, tránh bẫy over-engineering (không dùng Redis Redlock phân tán, không dùng microservices, không tích hợp bên thứ 3 thiếu ổn định trong MVP).

---

## 2. Decision
Chúng tôi quyết định:
1. **Kiến trúc Tổng thể:** Áp dụng mô hình **Modular Monolith** tích hợp trong cấu trúc Starter Monorepo có sẵn (`templates/`):
   - `@repo/contracts`: Chứa toàn bộ DTOs, Enums, và Invariant Interfaces làm Single Source of Truth.
   - `templates/be`: Backend NestJS 11 với Clean Architecture 4 tầng (`presentation`, `application`, `domain`, `infrastructure`).
   - `templates/cms`: Giao diện quản trị Lễ tân, Bác sĩ và Admin bằng Ant Design 6 + Next.js 16 + TanStack Query v5.
   - `templates/fo`: Giao diện đặt hẹn và tra cứu hồ sơ dành cho Bệnh nhân.
2. **Chiến lược Chống Double-Booking:**
   - Sử dụng **Atomic Reservation Mechanism** với Composite Constraint `(doctorId, date, timeSlot)` cho các cuộc hẹn không ở trạng thái hủy.
   - Kiểm tra xung đột chéo lịch của bệnh nhân tại tầng Domain Application trước khi xác nhận lưu bản ghi.
3. **Bệnh án & Đơn thuốc Bất biến (Immutable Records):**
   - Consultation và Prescription được liên kết trực tiếp với Appointment ID theo quan hệ 1-1.
   - Khi trạng thái chuyển sang `COMPLETED`, bản ghi được đóng băng (`isLocked = true`). Bất kỳ thao tác PUT/PATCH nào sau đó đều bị chặn bởi Domain Rule Guard.

---

## 3. Consequences & Trade-offs
### Tích cực:
- **Zero External Point of Failure:** Không phụ thuộc hạ tầng phân tán, chạy mượt mà ngay cả khi offline hoặc local dev.
- **Tốc độ thực thi cực nhanh:** In-process validation loại trừ network latency giữa các microservices.
- **Tuân thủ Invariants:** Tận dụng 100% bộ Invariant Checkers của AgentC Kit.

### Đánh đổi (Mitigated):
- Thanh toán trong MVP là thu ngân tại quầy; các cổng thanh toán tự động (VNPay/Stripe) sẽ được bổ sung ở Phase 2 khi phòng khám mở rộng quy mô.
- Không dùng WebSocket realtime cho hàng đợi; dùng TanStack Query auto-refetch polling 5 giây cho bảng hàng đợi của phòng khám.

---

## 4. Alternatives Considered
- **Phương án A (Bị loại bỏ do Over-Engineering):** Dựng cụm Redis Redlock, Event Sourcing cho toàn bộ lifecycle, RabbitMQ cho hàng đợi. Điểm Complexity Score = 16 (Vùng đỏ). Đã bị Veto theo quy chế `plan-challenge`.
