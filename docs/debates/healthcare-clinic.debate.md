# 5W2H Debate & Complexity Score: Healthcare Clinic Management System

**Feature:** Healthcare Clinic E2E System  
**Upstream Artifact:** [docs/specs/healthcare-clinic.prd.md](../specs/healthcare-clinic.prd.md)  
**Role:** Chief Simplicity Officer (Plan Challenge)  

---

## 1. Complexity Score Calculation ($T + I + S + A$)

Công thức chuẩn: $Score = T + I + S + A$

| Chỉ Số | Tiêu Chí Đánh Giá | Điểm Đề Xuất Ban Đầu (Over-Engineered) | Điểm Sau Khi Áp Dụng Đòn Bẩy (Lean Plan B) | Rationale / Giải Pháp Tinh Giản |
| :---: | :--- | :---: | :---: | :--- |
| **$T$ (Database Schema)** | Số lượng bảng & quan hệ | 4 (Tạo >8 bảng riêng biệt kèm phân mảnh audit) | **2** | Gom nhóm thực thể liên đới chặt chẽ: `Vitals` và `FollowUp` lưu cấu trúc `JSONB`/Embedded trong `Consultation`; `PrescriptionItem` lưu mảng `items` trong `Prescription`. |
| **$I$ (Tích Hợp Bên Ngoài)** | SDK / Dịch vụ bên thứ 3 | 4 (Tích hợp Cổng thanh toán VNPay/Stripe, SMS Brandname OTP, S3 multipart) | **0** | Giai đoạn MVP sử dụng thanh toán thủ công tại quầy (Recorded Payment) và In-app Event Notifications nội bộ. Triệt tiêu toàn bộ phụ thuộc bên ngoài. |
| **$S$ (State & Concurrency)** | State Machine & Khóa chống trùng | 4 (Dựng cụm Redis Distributed Lock Redlock, Event Sourcing) | **2** | Áp dụng DB Transaction với Unique Constraint + Optimistic Concurrency Control (Version Check) ngay trong tầng Persistence. Đơn giản, độ tin cậy tuyệt đối, không phát sinh zombie lock. |
| **$A$ (Hạ Tầng & Công Nghệ)** | Stack công nghệ & Broker | 4 (RabbitMQ / BullMQ cho queue, Elasticsearch cho tra cứu bệnh nhân) | **0** | Sử dụng toàn bộ hạ tầng hiện có trong `templates` (NestJS 11 + In-Memory / PostgreSQL 16 + Next.js 16). Không thêm bất kỳ công nghệ mới nào ngoài Tech Radar. |
| **TỔNG ĐIỂM** | **Complexity Score** | **16 (VÙNG ĐỎ - HARD VETO)** | **4 (VÙNG XANH - LEAN ĐỦ ĐIỀU KIỆN)** | **Đạt tiêu chuẩn $\le 4$, sẵn sàng phê duyệt Gate 0.** |

- Complexity Score: 4 (Lean Vùng Xanh <= 4)
- Plan B / Phương Án B: Lean Alternative Modular Monolith

---

## 2. Thẩm Định Đối Kháng 5W2H (Socratic Challenge)

### 1. Why (Tại sao phải làm hệ thống này?)
- **Thách thức:** Phòng khám nhỏ có thực sự cần hệ thống lớn phức tạp như bệnh viện Bạch Mai hay Vinmec không?
- **Phán quyết:** Tuyệt đối không. Mục tiêu cốt lõi là giải phóng 3 điểm nghẽn hành chính hàng ngày:
  1. Hết cảnh lễ tân nghe điện thoại ghi sổ tay bị trùng giờ bác sĩ.
  2. Bác sĩ mở hồ sơ bệnh nhân là thấy ngay tiền sử bệnh và toa thuốc lần trước.
  3. Lễ tân và chủ phòng khám nhìn thấy ngay danh sách chờ khám và doanh thu trong ngày.

### 2. What (Phần nào trong PRD là tưởng tượng cho tương lai cần cắt tỉa - YAGNI?)
- **Đã cắt tỉa:**
  - Bỏ cổng thanh toán trực tuyến (VNPay/MoMo) -> Dùng thu ngân tại quầy.
  - Bỏ SMS Brandname / Zalo ZNS tốn chi phí -> Dùng In-App Notification Log.
  - Bỏ hồ sơ bệnh án liên viện (HL7/FHIR) phức tạp hóa schema -> Dùng cấu trúc bệnh án chuẩn phòng khám ngoại trú.

### 3. Where (Dữ liệu và Logic được thực thi ở đâu?)
- Tầng Contracts (`@repo/contracts`) làm Single Source of Truth cho cả Backend và CMS/Front Office.
- Tầng Backend NestJS xử lý toàn bộ Invariant Validation và State Transition.
- Tầng Frontend hiển thị giao diện phân vai theo CASL RBAC.

### 4. When (Khi nào hệ thống kiểm soát xung đột?)
- Tại thời điểm `Book Appointment` và `Reschedule`: khóa transaction để xác thực availability trước khi insert.

### 5. Who (Ai được quyền làm gì?)
- Bác sĩ: Chỉ truy cập bệnh án khi phụ trách khám; là người duy nhất ký toa thuốc.
- Lễ tân: Điều phối hàng đợi, check-in, thu ngân; không xem chi tiết chẩn đoán sâu.
- Bệnh nhân: Xem slot trống, đặt/hủy/đổi hẹn của chính mình.

### 6. How (Triển khai thế nào cho an toàn và mượt mà?)
- Dùng Vertical Slice Generator (`gen-slice.mjs`) để dựng các phân hệ CMS.
- Kiểm thử cơ học 100% bằng bộ invariant scripts không comment, không barrel leak.

### 7. How Much (Chi phí bảo trì lúc 3h sáng?)
- Nhờ loại bỏ Redis distributed lock và external webhooks, hệ thống là một Modular Monolith thuần khiết, zero point of external failure, chi phí vận hành bảo trì gần như bằng 0.

---

## 3. Phương Án B (Lean Alternative Plan) Đã Được Chốt

- **Kiến trúc:** Modular Monolith 4 tầng trong `templates/be` và Next.js Ant Design trong `templates/cms`.
- **Cơ chế chống Double-booking:** Composite Unique Index / In-memory Atomic Mutex trên `(doctorId, appointmentDate, timeSlot)` loại trừ hoàn toàn race conditions mà không cần Redis cụm.
- **Hồ sơ bệnh án & Đơn thuốc:** Lưu trữ gắn liền với ID cuộc hẹn, bảo vệ bằng cờ `isLocked` và mã kiểm tra tính bất biến sau khi hoàn tất.
