# PRD — Healthcare Clinic Management System (E2E)

**Status:** APPROVED (Gate 0 Draft)  
**Author:** Antigravity Orchestrator (PM Discovery)  
**Target Gate:** Gate 0 → Gate 1 Checkpoint A  
**Ubiquitous Language Source:** [CONTEXT.md](../../CONTEXT.md)  

---

## 1. Executive Summary & Business Goals

Hệ thống Quản lý Phòng khám Đa khoa Tư nhân (Healthcare Clinic) số hóa toàn diện quy trình vận hành khám chữa bệnh ngoại trú, thay thế hoàn toàn các thao tác thủ công (đặt hẹn qua điện thoại/Zalo, bảng tính Excel, bệnh án giấy và sổ thu ngân).

### Mục tiêu kinh doanh định lượng:
1. **Triệt tiêu 100% Double-Booking:** Bảo vệ bác sĩ và bệnh nhân khỏi tình trạng trùng lịch khám.
2. **Khép kín Vòng đời Khám bệnh (Full Patient Journey):** Từ tra cứu bác sĩ, đặt hẹn, check-in, xếp hàng đợi, thăm khám, ghi nhận bệnh án, kê đơn đến thu ngân.
3. **Bảo mật & Bất biến Bệnh án:** Hồ sơ y bạ và đơn thuốc được bảo vệ theo phân quyền RBAC nghiêm ngặt và không thể bị sửa chữa tùy tiện sau khi hoàn tất.
4. **Báo cáo Vận hành Trực quan:** Cung cấp Dashboard thời gian thực cho Lễ tân và Bác sĩ cùng hệ thống báo cáo doanh thu, sản lượng khám.

---

## 2. Actors & Permission Matrix

| Quyền hạn / Nghiệp vụ | Patient | Receptionist | Doctor | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Đăng ký / Quản lý Profile cá nhân | ✓ (Own) | ✓ | - | ✓ |
| Tra cứu Bác sĩ & Xem Slot trống | ✓ | ✓ | ✓ | ✓ |
| Đặt hẹn (Book Appointment) | ✓ (Self) | ✓ (On-behalf) | - | ✓ |
| Hủy hẹn (Cancel Appointment) | ✓ (>= 2h) | ✓ | - | ✓ |
| Đổi lịch hẹn (Reschedule Appointment) | ✓ (BOOKED/CONFIRMED) | ✓ | - | ✓ |
| Tiếp nhận Check-in bệnh nhân | - | ✓ | - | ✓ |
| Điều phối Hàng đợi (WaitingQueue) | - | ✓ | ✓ (Call next) | ✓ |
| Thăm khám & Ghi nhận Bệnh án (Consultation) | - | - | ✓ | - |
| Kê đơn thuốc y khoa (Prescription) | - | - | ✓ | - |
| Xem lịch sử bệnh án (Medical History) | ✓ (Own) | Limited | ✓ (Assigned) | Controlled |
| Thu ngân & Xác nhận Thanh toán | - | ✓ | - | ✓ |
| Quản lý Danh mục (Doctor, Service, Room, Schedule) | - | - | - | ✓ |
| Xem Báo cáo Vận hành & Doanh thu | - | Limited | Limited | ✓ |

---

## 3. Functional Requirements & Gherkin Scenarios

### Feature 1: Quản trị Lịch làm việc Bác sĩ & Tính toán Khung giờ Trống (Doctor Schedule & Availability)

#### Scenario 1.1: Tính toán chính xác các khung giờ trống khả dụng
```gherkin
Scenario: Tính toán chính xác các khung giờ trống khả dụng
Given bác sĩ "Dr. Nguyen" có lịch làm việc ngày "2026-09-20" từ "09:00" đến "17:00"
And có khoảng nghỉ trưa (Break Time) từ "12:00" đến "13:00"
And bác sĩ không có đơn nghỉ phép (DoctorLeave) trong ngày
And dịch vụ "Khám tổng quát" có thời lượng là 30 phút
When bệnh nhân yêu cầu tra cứu danh sách slot trống ngày "2026-09-20"
Then hệ thống trả về các slot 30 phút khả dụng: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
And các slot trong khoảng "12:00" đến "13:00" không xuất hiện trong danh sách khả dụng
```

#### Scenario 1.2: Bác sĩ nghỉ phép khóa hoàn toàn slot
```gherkin
Given bác sĩ "Dr. Tran" có đơn nghỉ phép cả ngày "2026-09-21" đã được Admin phê duyệt
When bệnh nhân tra cứu lịch khám của "Dr. Tran" ngày "2026-09-21"
Then hệ thống trả về danh sách slot trống rỗng
And thông báo bác sĩ đang trong lịch nghỉ phép
```

---

### Feature 2: Đặt lịch Hẹn & Ngăn chặn Trùng lịch (Booking & Anti-Double-Booking)

#### Scenario 2.1: Đặt lịch hẹn hợp lệ thành công
```gherkin
Given bệnh nhân "Nguyen Van A" đã đăng nhập vào hệ thống
And bác sĩ "Dr. Nguyen" đang ở trạng thái ACTIVE
And dịch vụ "Khám chuyên khoa" đang ở trạng thái ACTIVE có thời lượng 30 phút
And khung giờ "09:30 - 10:00" ngày "2026-09-22" của "Dr. Nguyen" đang trống
And bệnh nhân "Nguyen Van A" không có cuộc hẹn nào khác trong khung giờ "09:30 - 10:00" ngày "2026-09-22"
When bệnh nhân gửi yêu cầu đặt lịch hẹn cho khung giờ "09:30 - 10:00" ngày "2026-09-22"
Then hệ thống tạo cuộc hẹn mới với trạng thái "CONFIRMED"
And khung giờ "09:30 - 10:00" của "Dr. Nguyen" chuyển sang trạng thái đã đặt (BOOKED)
And một thông báo "CONFIRMATION" được tạo cho bệnh nhân
```

#### Scenario 2.2: Từ chối hai yêu cầu đặt hẹn cùng một slot (Anti-Double-Booking)
```gherkin
Given khung giờ "10:00 - 10:30" ngày "2026-09-22" của bác sĩ "Dr. Nguyen" đang trống
When bệnh nhân "Patient A" và "Patient B" đồng thời gửi yêu cầu đặt đúng khung giờ này
Then hệ thống chỉ chấp thuận duy nhất một yêu cầu thành công
And yêu cầu còn lại bị từ chối với mã lỗi "OPTIMISTIC_LOCK_CONFLICT" hoặc "SLOT_ALREADY_BOOKED"
And lịch làm việc của bác sĩ chỉ ghi nhận duy nhất 1 cuộc hẹn
```

#### Scenario 2.3: Từ chối bệnh nhân đặt trùng lịch với chính mình
```gherkin
Given bệnh nhân "Nguyen Van A" đã có cuộc hẹn từ "09:00 - 09:30" ngày "2026-09-22" với bác sĩ "Dr. Nguyen"
When bệnh nhân cố gắng đặt thêm cuộc hẹn từ "09:15 - 09:45" ngày "2026-09-22" với bác sĩ "Dr. Tran"
Then hệ thống từ chối yêu cầu đặt hẹn
And trả về lỗi "PATIENT_SCHEDULE_CONFLICT"
```

---

### Feature 3: Hủy hẹn & Đổi lịch (Cancellation & Rescheduling)

#### Scenario 3.1: Hủy lịch hẹn trước giờ hẹn >= 2 tiếng hợp lệ
```gherkin
Given cuộc hẹn #101 đang ở trạng thái "CONFIRMED" vào lúc "14:00" ngày "2026-09-22"
And thời điểm hiện tại là "10:00" ngày "2026-09-22" (còn 4 tiếng trước giờ hẹn)
When bệnh nhân gửi yêu cầu hủy cuộc hẹn #101
Then trạng thái cuộc hẹn #101 chuyển sang "CANCELLED"
And khung giờ "14:00 - 14:30" được giải phóng trở lại trạng thái AVAILABLE
And hệ thống gửi thông báo hủy lịch thành công cho bệnh nhân
```

#### Scenario 3.2: Xử lý hủy lịch muộn (< 2 tiếng)
```gherkin
Given cuộc hẹn #102 diễn ra vào lúc "14:00" ngày "2026-09-22"
And thời điểm hiện tại là "13:00" ngày "2026-09-22" (còn 1 tiếng)
When bệnh nhân gửi yêu cầu hủy cuộc hẹn #102
Then hệ thống ghi nhận trạng thái hủy là "LATE_CANCELLATION"
And ghi chú lý do hủy muộn vào nhật ký hệ thống
```

#### Scenario 3.3: Đổi lịch hợp lệ giải phóng slot cũ và giữ slot mới
```gherkin
Given cuộc hẹn #103 đang ở trạng thái "CONFIRMED" vào lúc "09:00" ngày "2026-09-22"
When bệnh nhân yêu cầu đổi sang khung giờ "15:00" ngày "2026-09-22"
And khung giờ "15:00" đang AVAILABLE
Then cuộc hẹn #103 được cập nhật sang giờ mới "15:00"
And khung giờ cũ "09:00" được trả về trạng thái AVAILABLE
And khung giờ mới "15:00" được khóa
```

---

### Feature 4: Tiếp nhận, Check-in & Điều phối Hàng đợi (Check-in & Queue Management)

#### Scenario 4.1: Bệnh nhân đến phòng khám check-in hợp lệ
```gherkin
Given cuộc hẹn #201 đang ở trạng thái "CONFIRMED" cho ngày hôm nay
And bệnh nhân đến quầy lễ tân
When lễ tân nhấn xác nhận "Check-in"
Then trạng thái cuộc hẹn chuyển sang "CHECKED_IN"
And bệnh nhân được cấp số thứ tự hàng đợi (Queue Ticket) tăng dần trong ngày (ví dụ: #01)
And trạng thái hàng đợi là "WAITING"
```

#### Scenario 4.2: Bác sĩ gọi bệnh nhân vào phòng khám
```gherkin
Given bệnh nhân #01 đang ở trạng thái hàng đợi "WAITING"
When bác sĩ nhấn "Call Next Patient" tại Dashboard bác sĩ
Then trạng thái hàng đợi chuyển sang "CALLED"
When bệnh nhân bước vào phòng khám và bác sĩ bắt đầu khám
Then trạng thái cuộc hẹn chuyển sang "IN_CONSULTATION"
And trạng thái hàng đợi chuyển sang "IN_CONSULTATION"
```

---

### Feature 5: Thăm khám, Bệnh án & Đơn thuốc (Consultation, Medical Record & Prescription)

#### Scenario 5.1: Bác sĩ hoàn thành phiên khám và kê đơn
```gherkin
Given cuộc hẹn đang ở trạng thái "IN_CONSULTATION" với bác sĩ "Dr. Nguyen"
When bác sĩ nhập:
  | Chief Complaint | Đau đầu dữ dội vùng thái dương |
  | Symptoms        | Chóng mặt, buồn nôn khi nhìn ánh sáng mạnh |
  | Blood Pressure  | 120/80 mmHg |
  | Heart Rate      | 75 bpm |
  | Temperature     | 37.0 C |
  | Diagnosis       | Đau nửa đầu Migraine cơn cấp |
  | Treatment Plan  | Nghỉ ngơi, dùng thuốc giảm đau đặc hiệu |
  | Follow-up Days  | 7 |
And bác sĩ kê đơn thuốc:
  | Medicine        | Paracetamol 500mg |
  | Dosage          | 1 viên |
  | Frequency       | 2 lần / ngày sau ăn |
  | Duration        | 5 ngày |
And bác sĩ nhấn "Hoàn thành buổi khám"
Then trạng thái cuộc hẹn chuyển sang "COMPLETED"
And một bản ghi mới được bổ sung vào Medical Record của bệnh nhân
And bản ghi Consultation và Prescription được khóa vĩnh viễn (Immutable)
```

---

### Feature 6: Thu ngân & Thanh toán (Payment)

#### Scenario 6.1: Thu ngân ghi nhận thanh toán sau buổi khám
```gherkin
Given cuộc hẹn #301 đã "COMPLETED" với dịch vụ "Khám tổng quát" giá "300,000 VND"
And trạng thái thanh toán hiện tại là "UNPAID"
When lễ tân nhận tiền mặt hoặc chuyển khoản và nhấn "Xác nhận đã thanh toán"
Then trạng thái thanh toán chuyển sang "PAID"
And giao diện cập nhật trạng thái thanh toán thành công
```

---

### Feature 7: Báo cáo Vận hành & Doanh thu (Operational Dashboards & Reports)

#### Scenario 7.1: Dashboard Lễ tân tổng hợp theo ngày
```gherkin
Given ngày hiện tại có 10 cuộc hẹn: 5 COMPLETED, 2 WAITING, 1 IN_CONSULTATION, 1 CANCELLED, 1 NO_SHOW
When lễ tân mở Dashboard phòng khám
Then các thẻ KPI hiển thị chính xác số liệu:
  | Total Expected  | 10 |
  | Completed       | 5  |
  | In Queue        | 2  |
  | In Consultation | 1  |
  | Cancelled       | 1  |
  | No-show         | 1  |
```

---

## 4. Non-Functional Requirements (NFRs)

1. **Hiệu năng & Thời gian phản hồi:**
   - API tra cứu slot trống của bác sĩ phản hồi $< 200$ms.
   - Thao tác đặt hẹn và kiểm tra khóa trùng lịch xử lý trong $< 500$ms.
2. **Toàn vẹn Dữ liệu & Concurrency:**
   - Cơ chế Transaction ACID hoặc Optimistic Concurrency Control bảo đảm tuyệt đối không xảy ra Race Condition khi 2 bệnh nhân cùng nhấn book 1 slot.
3. **Bảo mật & Quyền riêng tư Y tế (HIPAA / Y tế cơ sở):**
   - Chỉ bác sĩ phụ trách và bệnh nhân sở hữu mới được xem chi tiết chẩn đoán và đơn thuốc.
   - Token JWT được bảo vệ qua HttpOnly Cookie hoặc Bearer Header với cơ chế phân quyền CASL ở Frontend và Guards ở Backend.
4. **Trải nghiệm Người dùng (UX & 5 States):**
   - Mọi bảng dữ liệu và form phải có đầy đủ 5 trạng thái: `INITIAL`, `LOADING`, `EMPTY`, `ERROR`, `SUCCESS`.

---

## 5. Quantitative Acceptance Criteria (Cơ Học)

- [ ] **AC-1:** 100% các bảng dữ liệu lõi (`ClinicService`, `Doctor`, `Room`, `Schedule`, `Appointment`, `Consultation`, `Prescription`, `Payment`) được khai báo DTOs đồng bộ tại `@repo/contracts`.
- [ ] **AC-2:** Cơ chế chống Double-booking được kiểm chứng bằng Unit/Integration Test kịch bản 2 request đặt cùng 1 slot.
- [ ] **AC-3:** Vòng đời Appointment chuyển trạng thái đúng 100% theo State Machine; từ chối mọi chuyển dịch bất hợp lệ (`COMPLETED` -> `CANCELLED` ném lỗi HTTP 400).
- [ ] **AC-4:** Bộ Invariant Checkers (`verify-invariants.sh`) đạt kết quả Exit Code `0` (Zero comments, Zero barrels, Zero unmapped i18n, Zero orphaned hooks).
- [ ] **AC-5:** Giao diện CMS Admin (Ant Design 6) và Front Office phục vụ đầy đủ 4 luồng: Admin/Lễ tân quản lý, Bác sĩ khám bệnh, và Bệnh nhân đặt lịch.
