# 5W2H Debate & Complexity Score: Property Rental Management System

**Feature:** Property Rental Management E2E System  
**Upstream Artifact:** [docs/specs/property-rental-management.prd.md](../specs/property-rental-management.prd.md)  
**Role:** Chief Simplicity Officer (Plan Challenge)  

---

## 1. Complexity Score Calculation ($T + I + S + A$)

Công thức chuẩn: $Score = T + I + S + A$

| Chỉ Số | Tiêu Chí Đánh Giá | Điểm Đề Xuất Ban Đầu (Over-Engineered) | Điểm Sau Khi Áp Dụng Đòn Bẩy (Lean Plan B) | Rationale / Giải Pháp Tinh Giản |
| :---: | :--- | :---: | :---: | :--- |
| **$T$ (Database Schema)** | Số lượng bảng & quan hệ | 4 (Tạo >15 bảng vi mô phân mảnh cho từng mẩu dữ liệu) | **2** | Gom nhóm các thực thể gắn liền vòng đời: `LeaseTerm` & `RentSchedule` tích hợp trong `Lease`; `InspectionChecklistItem` dạng Embedded/JSON trong `Inspection`; `SettlementDeduction` nằm trong `DepositSettlement`. |
| **$I$ (Tích Hợp Bên Ngoài)** | SDK / Dịch vụ bên thứ 3 | 4 (Tích hợp Cổng thanh toán Stripe/Plaid, Khóa thông minh IoT Tuya, SMS Brandname Twilio, DocuSign API) | **0** | Giai đoạn MVP sử dụng cơ chế ghi nhận thanh toán chuyển khoản thủ công (Recorded Bank Transfer), thông báo In-app Events, ký điện tử nội bộ (Consent & Timestamped Audit). Triệt tiêu 100% rủi ro phụ thuộc bên ngoài. |
| **$S$ (State & Concurrency)** | State Machine & Khóa chống trùng | 4 (Dựng Kafka Event Sourcing + Redis Distributed Lock cụm Redlock) | **2** | Áp dụng DB Transaction với Unique Constraint + Optimistic Concurrency Control (Version Check) ngay trong tầng Persistence. Chống tuyệt đối Double-Leasing `(unitId, activeLeaseStatus)`. |
| **$A$ (Hạ Tầng & Công Nghệ)** | Stack công nghệ & Broker | 4 (Microservices, RabbitMQ, Elasticsearch, S3 minio cluster phức tạp) | **0** | Sử dụng toàn bộ hạ tầng hiện có trong `templates` (NestJS 11 + PostgreSQL 16 / In-Memory + Next.js 16). Không bổ sung bất kỳ công nghệ nào ngoài Tech Radar của dự án. |
| **TỔNG ĐIỂM** | **Complexity Score** | **16 (VÙNG ĐỎ - HARD VETO)** | **4 (VÙNG XANH - LEAN ĐỦ ĐIỀU KIỆN)** | **Đạt tiêu chuẩn $\le 4$, đủ điều kiện thông qua Gate 0.** |

- **Complexity Score:** 4 (Lean Vùng Xanh $\le$ 4)
- **Plan B / Phương Án B:** Lean Alternative Modular Monolith

---

## 2. Thẩm Định Đối Kháng 5W2H (Socratic Challenge)

### 1. Why (Tại sao phải xây dựng hệ thống này?)
- **Thách thức:** Doanh nghiệp quy mô 50 - 5,000 căn hộ có cần một hệ thống ERP bất động sản đồ sộ kiểu Yardi hay RealPage không?
- **Phán quyết:** Hoàn toàn không. Trọng tâm của Medium Business là giải quyết dứt điểm 4 điểm nghẽn thực tế:
  1. Loại bỏ 100% tình trạng nhầm lẫn phòng trống và trùng lịch thuê (Double-Leasing).
  2. Tự động hóa tính phạt trễ hạn và đôn đốc thu nợ tiền thuê định kỳ.
  3. Minh bạch hóa việc khấu trừ tiền cọc bằng đối chiếu hiện trạng nhận phòng vs trả phòng (Move-in vs Move-out Checklist).
  4. Quản lý lệnh sửa chữa (Work Order) và duyệt chi phí bảo trì dưới hạn mức cho phép.

### 2. What (Phần nào trong PRD là tưởng tượng tương lai cần cắt tỉa - YAGNI?)
- **Đã cắt tỉa:**
  - Bỏ tích hợp khóa thông minh IoT -> Bàn giao mã PIN/thẻ từ ghi nhận thủ công tại biên bản Move-in.
  - Bỏ cổng thanh toán tự động Auto-debit -> Dùng ghi nhận chuyển khoản ủy nhiệm chi có đối soát.
  - Bỏ cổng DocuSign trả phí đắt đỏ -> Dùng chữ ký điện tử nội bộ (Consent + Timestamp + Audit IP).
  - Bỏ hệ thống chấm điểm AI phức tạp -> Áp dụng tiêu chuẩn tỷ lệ thu nhập $3.0 \times$ tiền thuê cố định.

### 3. Where (Dữ liệu và Logic được thực thi ở đâu?)
- Tầng Contracts (`@repo/contracts`) làm Single Source of Truth cho toàn bộ DTOs, Enums và Response Envelope.
- Tầng Backend NestJS xử lý toàn bộ Invariant Validation, Transaction Locking và State Machine Transitions.
- Tầng CMS/Portal xử lý hiển thị phân quyền RBAC dựa trên CASL Ability.

### 4. When (Khi nào hệ thống kiểm soát xung đột dữ liệu?)
- Tại thời điểm `Approve Application`, `Create Lease` và `Activate Lease`: Khóa transaction để đảm bảo Unit không thể nhận thêm hợp đồng thứ hai.

### 5. Who (Ai được quyền làm gì?)
- **Owner:** Xem báo cáo dòng tiền, tỷ lệ lấp đầy; duyệt bảo trì vượt hạn mức (\$500).
- **Property Manager:** Vận hành toàn bộ quy trình: duyệt hồ sơ, ký hợp đồng, xuất hóa đơn, kiểm tra phòng, giao việc cho thợ.
- **Tenant:** Nộp đơn, ký hợp đồng, nộp tiền thuê, báo hỏng, yêu cầu chuyển đi, nhận hoàn cọc.
- **Vendor:** Nhận Work Order, cập nhật hiện trường, gửi hóa đơn thực tế.
- **Financial Auditor:** Phê duyệt hoàn cọc và miễn giảm phạt trễ hạn.

### 6. How (Triển khai thế nào cho an toàn và mượt mà?)
- Dùng mã nguồn sạch, tách lớp rõ ràng (Clean 4-Layer Architecture).
- Kiểm thử cơ học 100% bằng bộ invariant scripts và unit/integration tests, không comment thừa, không barrel leak.

### 7. How Much (Chi phí bảo trì lúc 3h sáng?)
- Nhờ loại bỏ các hạ tầng phân tán và dịch vụ SaaS bên thứ ba, hệ thống là một Modular Monolith thuần khiết, zero external point of failure, vận hành ổn định 24/7 với chi phí gần như bằng 0.

---

## 3. Phương Án B (Lean Alternative Plan) Đã Được Chốt

- **Kiến trúc:** Modular Monolith 4 tầng trong `templates/be` và Next.js Ant Design 6 trong `templates/cms`.
- **Cơ chế chống Double-Leasing:** Khóa cứng bằng Database Composite Unique Constraint và Transaction Locking trên trạng thái `ACTIVE` của Unit.
- **Quyết toán cọc an toàn:** Tách riêng dòng tiền cọc vào tài khoản ủy thác; cấm hoàn cọc khi chưa hoàn tất biên bản kiểm tra trả phòng và quyết toán công nợ.
