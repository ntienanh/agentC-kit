# E2E Business Planning Specification: Hệ Thống Quản Lý Cho Thuê Bất Động Sản (Property Rental Management)

**Tài liệu:** E2E Business Specification & Domain Architecture  
**Quy mô hệ thống:** Medium-sized Business (50 – 5,000 Units)  
**Tác giả:** Senior Business Analyst + Domain Architect  
**Trọng tâm:** Business Architecture, Domain Lifecycle, Invariants, State Machines, Business Rules & Operations (Tech-agnostic)

---

## 1. Executive Summary

Hệ thống **Property Rental Management (PRM)** là nền tảng quản trị vòng đời cho thuê bất động sản khép kín, phục vụ các doanh nghiệp quản lý vận hành bất động sản cho thuê quy mô vừa (từ 50 đến 5,000 units, bao gồm căn hộ chung cư, tòa nhà dịch vụ, nhà phố thương mại và cụm văn phòng mini).

Hệ thống giải quyết triệt để các bài toán phân mảnh trong thực tế:
- **Xóa bỏ đứt gãy thông tin:** Kết nối liền mạch từ lúc căn hộ trống được niêm yết (Listing), tiếp nhận và thẩm định hồ sơ khách thuê (Application), thiết lập và ký kết hợp đồng (Lease), thu cọc và bàn giao (Move-in), vận hành thu tiền thuê và xử lý sự cố (Rent & Maintenance), cho đến kiểm tra trả phòng, đối soát cọc (Inspection & Deposit Settlement) và tái chuẩn bị căn hộ.
- **Bảo toàn tính toàn vẹn tài chính:** Tách bạch tuyệt đối giữa Tiền cọc an ninh (Security Deposit - tiền giữ hộ), Tiền thuê định kỳ (Rent Schedule/Invoice - doanh thu vận hành) và Chi phí bảo trì/sửa chữa (Maintenance Cost).
- **Hạn chế rủi ro pháp lý & gian lận:** Thiết lập quy trình thẩm định hồ sơ khách thuê khách quan, kiểm tra đối chiếu tình trạng tài sản có đối chứng hình ảnh (Move-in vs Move-out Inspection Checklist), ghi vết toàn bộ lịch sử biến động (Audit Log).
- **Tối ưu hóa công suất vận hành (Occupancy Rate) & Dòng tiền:** Giảm thời gian chết (Turnover Vacancy) giữa hai chu kỳ thuê, hạn chế nợ đọng tiền thuê thông qua cơ chế phạt trễ hạn và cảnh báo tự động.

---

## 2. Business Goals

### 2.1. Mục tiêu định lượng (Quantitative Goals)
1. **Triệt tiêu 100% Double-Leasing & Overbooking:** Không bao giờ cho phép 1 Unit có nhiều hơn 1 Hợp đồng thuê hiệu lực tại cùng một thời điểm.
2. **Rút ngắn thời gian xử lý hồ sơ (Application Turnaround Time):** Giảm từ trung bình 3-5 ngày làm việc xuống dưới 24 giờ kể từ khi Tenant nộp đầy đủ hồ sơ hợp lệ.
3. **Giảm tỷ lệ phòng trống giữa 2 chu kỳ (Turnover Time):** Rút ngắn thời gian chuẩn bị Unit từ khi khách dọn đi (Move-out) đến khi sẵn sàng đón khách mới (Available) xuống dưới 5 ngày làm việc.
4. **Tỷ lệ thu hồi công nợ đúng hạn (On-Time Collection Rate):** Đạt trên 95% tổng tiền thuê phát sinh mỗi kỳ, giảm nợ quá hạn (>30 ngày) xuống dưới 2%.
5. **Minh bạch hóa 100% khấu trừ tiền cọc (Deposit Dispute Rate):** Giảm tỷ lệ tranh chấp cọc xuống dưới 3% nhờ quy trình đối chiếu hiện trạng Move-in vs Move-out có bằng chứng số liệu và hình ảnh.

### 2.2. Mục tiêu định tính (Qualitative Goals)
1. **Trải nghiệm nhất quán cho mọi Actor:** Owner nắm bắt tức thời hiệu quả đầu tư; Property Manager điều hành thông suốt không sót việc; Tenant có kênh tương tác minh bạch, thuận tiện; Vendor nhận việc và thanh toán rõ ràng.
2. **Khách quan hóa thẩm định (Fair Housing & Non-discriminatory Compliance):** Tiêu chí duyệt/từ chối hồ sơ dựa hoàn toàn trên năng lực tài chính, lịch sử tín dụng/thuê nhà, loại bỏ hoàn toàn thiên kiến cảm tính.
3. **Chuẩn hóa quy trình bàn giao & bảo trì:** Mọi hư hỏng đều có cơ chế phân định trách nhiệm minh bạch (Hao mòn tự nhiên vs Lỗi người dùng).

---

## 3. Actors & Organizational Roles

Hệ thống PRM phân cấp và quản trị 5 nhóm Actor chính:

```
┌─────────────────────────────────────────────────────────────┐
│                      ORGANIZATION                           │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │   Property Owner      │       │   Property Manager    │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│              ▼                               ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  PROPERTY / UNIT                      │  │
│  └───────────────────────────────────────────────────────┘  │
│              ▲                               ▲              │
│              │                               │              │
│  ┌───────────┴───────────┐       ┌───────────┴───────────┐  │
│  │        Tenant         │       │   Vendor / Contractor │  │
│  └───────────────────────┘       └───────────────────────┘  │
│              │                               │              │
│              └───────────────┬───────────────┘              │
│                              ▼                              │
│                  ┌───────────────────────┐                  │
│                  │  Financial Auditor    │ (Đề xuất thêm)   │
│                  └───────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.1. Property Owner (Chủ sở hữu bất động sản)
- **Bản chất:** Cá nhân hoặc pháp nhân nắm quyền sở hữu tài sản pháp lý của Property/Unit, ủy quyền cho đơn vị quản lý vận hành.
- **Trách nhiệm & Quyền hạn:**
  - Ký kết hợp đồng quản lý ủy quyền với Property Manager.
  - Phê duyệt các hạng mục bảo trì có giá trị vượt hạn mức ủy quyền (Maintenance Threshold).
  - Giám sát tỷ lệ lấp đầy (Occupancy Rate), báo cáo doanh thu - chi phí và dòng tiền ròng định kỳ.
  - Không trực tiếp can thiệp vào các hoạt động vận hành vi mô hàng ngày (không trực tiếp chat với Tenant hoặc giao việc cho Vendor).

### 3.2. Property Manager (Đơn vị / Nhân sự quản lý vận hành)
- **Bản chất:** Nhân sự vận hành chuyên nghiệp đại diện cho ban quản lý tòa nhà/công ty quản lý bất động sản.
- **Trách nhiệm & Quyền hạn:**
  - Quản lý hồ sơ Property, Unit, niêm yết Listing.
  - Tiếp nhận, thẩm định và phê duyệt Tenant Application.
  - Soạn thảo, gửi ký và kích hoạt Lease.
  - Lập lịch và theo dõi Rent Schedule, xuất Invoice, đôn đốc thu nợ.
  - Tiếp nhận Maintenance Request, phân loại, phê duyệt chi phí nội bộ và điều phối Work Order cho Vendor.
  - Thực hiện kiểm tra hiện trạng (Move-in, Move-out, Routine Inspection).
  - Lập bảng tính đối soát cọc (Deposit Settlement) và giải phóng căn hộ.

### 3.3. Tenant (Khách thuê)
- **Bản chất:** Khách hàng cá nhân hoặc tổ chức thuê Unit để ở hoặc làm việc.
- **Trách nhiệm & Quyền hạn:**
  - Tìm kiếm thông tin niêm yết (Listing), tạo và nộp hồ sơ ứng tuyển (Application).
  - Ký hợp đồng điện tử (Lease), thanh toán tiền cọc an ninh (Security Deposit) và tiền thuê kỳ đầu.
  - Tham gia nghiệm thu bàn giao nhận phòng (Move-in Inspection) và ký biên bản.
  - Thanh toán tiền thuê định kỳ đúng hạn, nhận hóa đơn/phiếu thu.
  - Báo cáo sự cố hư hỏng (Maintenance Request), phối hợp mở cửa cho Vendor xử lý.
  - Gửi thông báo chuyển đi (Move-out Notice), phối hợp kiểm tra trả phòng (Move-out Inspection) và nhận lại cọc sau khi đối soát.

### 3.4. Vendor / Contractor (Nhà thầu / Đối tác dịch vụ)
- **Bản chất:** Đơn vị kỹ thuật chuyên môn thứ ba (điện, nước, điện lạnh, khóa, sơn sửa, dọn dẹp vệ sinh) được ban quản lý ký hợp đồng dịch vụ.
- **Trách nhiệm & Quyền hạn:**
  - Nhận lệnh công việc (Work Order) từ Property Manager.
  - Tiếp nhận/Từ chối lệnh làm việc dựa trên năng lực và lịch trống.
  - Lên lịch hẹn với Tenant/Manager, khảo sát, cập nhật tiến độ công việc tại hiện trường.
  - Gửi hình ảnh nghiệm thu hoàn thành (Completion Evidence) và đề xuất chi phí thực tế (Actual Invoice/Cost).

### 3.5. Đề xuất Actor bổ sung: Financial Auditor / Accountant (Kế toán / Kiểm toán nội bộ)
- **Lý do cần thiết cho Medium-sized Business:** 
  Khi vận hành từ 100 - 5,000 căn hộ, Property Manager không nên là người duy nhất vừa tạo bảng đối soát vừa trực tiếp duyệt lệnh xuất tiền hoàn cọc (Refund) hoặc xóa nợ (Waive Rent). Cần vai trò Financial Auditor để đảm bảo nguyên tắc bất kiêm nhiệm (Segregation of Duties):
  - Kiểm tra tính chính xác của bảng Settlement trước khi thực hiện chuyển tiền hoàn cọc.
  - Phê duyệt các khoản giảm trừ tiền phạt (Late Fee Waiver) hoặc điều chỉnh hóa đơn sai sót.
  - Thực hiện đối soát ngân hàng (Bank Reconciliation) giữa sổ phụ tài khoản và các khoản thanh toán đã ghi nhận.

---

## 4. Ubiquitous Language & Business Vocabulary

| Thuật ngữ | Khái niệm nghiệp vụ |
| :--- | :--- |
| **Property** | Thực thể Bất động sản cấp cha (tòa nhà, khu phức hợp, dãy nhà liền kề) có địa chỉ pháp lý độc lập. |
| **Unit** | Đơn vị không gian cho thuê độc lập (căn hộ, phòng, mặt bằng) trực thuộc Property, có mã định danh riêng. |
| **Listing** | Bản tin chào thuê công khai của một Unit ra thị trường, chứa thông tin giá, điều kiện và hình ảnh. |
| **Applicant** | Ứng viên gửi hồ sơ xin thuê một Unit cụ thể. |
| **Application** | Hồ sơ thẩm định năng lực pháp lý và tài chính của Applicant. |
| **Co-Signer / Guarantor** | Người bảo lãnh nghĩa vụ tài chính cho Tenant trong trường hợp Tenant không đáp ứng đủ điểm tín dụng/thu nhập độc lập. |
| **Lease** | Hợp đồng cho thuê ràng buộc pháp lý giữa Owner (hoặc PM đại diện) và Tenant đối với một Unit trong một khung thời gian cụ thể. |
| **Rent Schedule** | Lịch phát sinh nghĩa vụ tài chính tiền thuê xuyên suốt toàn bộ thời gian của Lease. |
| **Invoice** | Yêu cầu thanh toán tiền thuê hoặc chi phí phát sinh định kỳ được phát hành cho Tenant. |
| **Security Deposit** | Tiền đặt cọc bảo đảm thực hiện hợp đồng và bồi thường tổn thất tài sản, do bên cho thuê giữ hộ. |
| **Grace Period** | Khoảng thời gian ân hạn sau ngày Due Date mà Tenant chưa bị tính phí phạt trễ hạn. |
| **Late Fee** | Khoản tiền phạt phát sinh do Tenant thanh toán sau khi đã hết thời gian ân hạn. |
| **Maintenance Request** | Yêu cầu xử lý sự cố hư hỏng hoặc bảo dưỡng trang thiết bị do Tenant hoặc PM khởi tạo. |
| **Work Order** | Lệnh giao việc chi tiết được PM phát hành cho Vendor kèm theo mô tả kỹ thuật và dự toán ngân sách. |
| **Inspection Checklist** | Danh mục kiểm tra chi tiết tình trạng vật tư, thiết bị, kết cấu của Unit tại từng thời điểm. |
| **Normal Wear & Tear** | Hao mòn tự nhiên theo thời gian sử dụng thông thường không thuộc trách nhiệm bồi thường của Tenant. |
| **Deposit Settlement** | Biên bản quyết toán cọc cuối kỳ: đối trừ nợ đọng, chi phí hư hỏng và xác định số tiền hoàn trả hoặc thu thêm. |
| **Turnover Period** | Khoảng thời gian từ lúc Tenant cũ Move-out đến khi Unit sẵn sàng cho Tenant mới Move-in. |

---

## 5. Core Business Objects

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CORE BUSINESS OBJECTS                                │
│                                                                                  │
│   ┌──────────────┐          ┌──────────────┐          ┌──────────────────────┐   │
│   │    Owner     │◄─────────┤   Property   │◄─────────┤       Manager        │   │
│   └──────────────┘          └──────┬───────┘          └──────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│                             ┌──────────────┐                                     │
│                             │     Unit     │                                     │
│                             └──┬────────┬──┘                                     │
│                                │        │                                        │
│                 ┌──────────────┘        └──────────────┐                         │
│                 ▼                                      ▼                         │
│          ┌──────────────┐                       ┌──────────────┐                 │
│          │   Listing    │                       │    Lease     │                 │
│          └──────┬───────┘                       └──┬───┬───┬───┘                 │
│                 │                                  │   │   │                     │
│                 ▼                                  │   │   │                     │
│          ┌──────────────┐                          │   │   │                     │
│          │ Application  │                          │   │   │                     │
│          └──────────────┘                          │   │   │                     │
│                                                    │   │   │                     │
│            ┌───────────────────────────────────────┘   │   └────────────────┐    │
│            ▼                                           ▼                    ▼    │
│     ┌──────────────┐                            ┌──────────────┐     ┌─────────┐ │
│     │Rent Schedule │                            │ Maintenance  │     │Inspect- │ │
│     │  & Invoices  │                            │& Work Orders │     │  ions   │ │
│     └──────┬───────┘                            └──────┬───────┘     └────┬────┘ │
│            │                                           │                  │      │
│            ▼                                           ▼                  ▼      │
│     ┌──────────────┐                            ┌──────────────┐     ┌─────────┐ │
│     │ Rent Payment │                            │    Vendor    │     │ Deposit │ │
│     │ & Receipts   │                            │              │     │ Settle  │ │
│     └──────────────┘                            └──────────────┘     └─────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Property
- **Mục đích:** Định danh khối bất động sản vật lý, lưu trữ các thông tin chung về địa chỉ, năm xây dựng, chính sách chung tòa nhà (pet policy, quy định tiếng ồn).
- **Chủ sở hữu (Owner):** Thuộc về 1 Property Owner pháp lý.
- **Ai tạo:** Property Manager hoặc Owner.
- **Ai cập nhật:** Property Manager quản lý trực tiếp Property đó, hoặc Owner.
- **Ai được xem:** Owner (chỉ các Property của mình), Property Manager (các Property được phân công), Tenant/Vendor (chỉ thấy thông tin hiển thị cơ bản qua Unit liên quan).
- **Vòng đời:** `DRAFT` → `ACTIVE` → `INACTIVE` → `ARCHIVED`.
- **Trường dữ liệu quan trọng:** Property ID, Legal Name, Address, Total Units, Management Agreement Contract Ref, Year Built, Operating Hours, House Rules.
- **Quan hệ:** 1 Property có 1 Owner; 1 Property có N Units; 1 Property được gán cho 1 hoặc N Property Managers.

### 5.2. Unit
- **Mục đích:** Không gian cho thuê hạt nhân (atomic leasable unit). Đây là thực thể cốt lõi gắn liền với mọi giao dịch kinh tế.
- **Chủ sở hữu:** Kế thừa từ Owner của Property.
- **Ai tạo:** Property Manager.
- **Ai cập nhật:** Property Manager được phân công.
- **Ai được xem:** Owner, Property Manager, Tenant (khi xem Listing hoặc đã thuê), Vendor (khi có Work Order).
- **Vòng đời:** `UNAVAILABLE` → `AVAILABLE` → `RESERVED` → `OCCUPIED` → `UNDER_MAINTENANCE` → `DECOMMISSIONED`.
- **Trường dữ liệu quan trọng:** Unit ID, Property ID, Unit Number/Code, Floor, Usable Area, Bedrooms, Bathrooms, Base Rent Amount, Base Security Deposit, Meter Initial Readings (Điện, Nước), Current Condition Status.
- **Quan hệ:** 1 Unit thuộc về 1 Property; 1 Unit tại 1 thời điểm chỉ có tối đa 1 Active Lease; 1 Unit có N Listings (theo thời gian); 1 Unit có N Maintenance Requests.

### 5.3. Listing
- **Mục đích:** Đại diện cho thông tin chào thuê thương mại của một Unit ra bên ngoài thị trường.
- **Chủ sở hữu:** Thuộc về Unit và do Property Manager quản lý.
- **Ai tạo:** Property Manager.
- **Ai cập nhật:** Property Manager.
- **Ai được xem:** Public (mọi người dùng/Tenant tiềm năng), Property Manager, Owner.
- **Vòng đời:** `DRAFT` → `PUBLISHED` → `PAUSED` → `RENTED` → `ARCHIVED`.
- **Trường dữ liệu quan trọng:** Listing ID, Unit ID, Title, Marketing Description, Advertised Rent, Available Move-in Date, Lease Duration Options, Media Assets, Showing Instructions.
- **Quan hệ:** 1 Listing trỏ đến chính xác 1 Unit; 1 Unit tại 1 thời điểm chỉ có tối đa 1 Listing ở trạng thái `PUBLISHED`.

### 5.4. Tenant Application & Review
- **Mục đích:** Thu thập dữ liệu pháp nhân/cá nhân, chứng minh thu nhập, lịch sử cư trú của người xin thuê để đánh giá rủi ro.
- **Chủ sở hữu:** Thuộc về Applicant (Tenant tiềm năng) nộp cho một Unit cụ thể.
- **Ai tạo:** Applicant / Tenant.
- **Ai cập nhật:** Applicant (khi còn `DRAFT`), Property Manager (khi Review).
- **Ai được xem:** Applicant nộp đơn, Property Manager phụ trách, Owner (dạng tóm tắt không lộ dữ liệu PII nhạy cảm nếu có yêu cầu).
- **Vòng đời:** `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED` / `WITHDRAWN` / `EXPIRED` → `LEASE_CREATED`.
- **Trường dữ liệu quan trọng:** Application ID, Unit ID, Applicant Personal Info, Verified Monthly Income, Employment History, Rental References, Background Check Consent, Review Notes, Rejection Reason Code.
- **Quan hệ:** 1 Application liên kết với 1 Unit và 1 Applicant; 1 Unit có thể nhận N Applications cạnh tranh cùng lúc.

### 5.5. Lease (Hợp đồng thuê)
- **Mục đích:** Thỏa thuận pháp lý xác định quyền sử dụng Unit của Tenant đổi lấy nghĩa vụ trả tiền và tuân thủ nội quy.
- **Chủ sở hữu:** Liên kết song phương giữa Owner (ủy quyền cho PM) và Tenant.
- **Ai tạo:** Property Manager.
- **Ai cập nhật:** Property Manager (điều chỉnh trước khi ký), Tenant (ký), Owner/PM (ký).
- **Ai được xem:** Tenant đứng tên hợp đồng, Property Manager, Owner.
- **Vòng đời:** `DRAFT` → `PENDING_SIGNATURE` → `ACTIVE` → `EXPIRING` → `RENEWED` / `TERMINATED` → `CLOSED`.
- **Trường dữ liệu quan trọng:** Lease ID, Unit ID, Primary Tenant ID, Co-tenants, Start Date, End Date, Monthly Rent, Payment Due Day, Grace Period Days, Late Fee Amount/Rate, Deposit Required, Termination Notice Period Days, Executed Date, Signed Document Ref.
- **Quan hệ:** 1 Lease thuộc về 1 Unit; 1 Lease gắn liền với 1 Rent Schedule; 1 Lease gắn liền với 1 Move-in Inspection và 1 Move-out Inspection; 1 Lease gắn liền với 1 Deposit Settlement.

### 5.6. Rent Schedule & Invoice
- **Mục đích:** Bảng biểu thời gian tạo nghĩa vụ tài chính định kỳ và hóa đơn yêu cầu thanh toán cụ thể cho từng kỳ.
- **Chủ sở hữu:** Sinh ra tự động từ Lease.
- **Ai tạo:** Hệ thống sinh tự động dựa trên Lease Term, Property Manager có quyền phát hành thủ công khi cần.
- **Ai cập nhật:** Hệ thống cập nhật trạng thái thanh toán hoặc Property Manager ghi nhận miễn giảm/điều chỉnh.
- **Ai được xem:** Tenant, Property Manager, Owner, Auditor.
- **Vòng đời (Invoice):** `UPCOMING` → `ISSUED` → `DUE` → `PAID` / `PARTIALLY_PAID` / `OVERDUE` / `WAIVED` / `CANCELLED`.
- **Trường dữ liệu quan trọng:** Invoice ID, Lease ID, Billing Period (From - To), Due Date, Base Rent Amount, Utility Charges, Parking Charges, Late Fee Applied, Total Due, Balance Remaining.
- **Quan hệ:** 1 Lease có N Invoices (tương ứng các tháng); 1 Invoice có N Payments.

### 5.7. Payment & Receipt
- **Mục đích:** Bản ghi ghi nhận dòng tiền thực tế được chuyển giao để thanh toán cho một hoặc nhiều Invoice.
- **Chủ sở hữu:** Do Tenant thực hiện hoặc bên thứ ba trả thay.
- **Ai tạo:** Tenant (khởi tạo lệnh) hoặc Property Manager (ghi nhận thanh toán chuyển khoản/tiền mặt).
- **Ai cập nhật:** Property Manager / Kế toán (xác nhận đối soát). Không ai được xóa bản ghi thanh toán.
- **Ai được xem:** Tenant nộp tiền, Property Manager, Owner, Auditor.
- **Vòng đời:** `INITIATED` → `PENDING_CLEARANCE` → `CLEARED` → `RECONCILED` / `FAILED` / `REVERSED`.
- **Trường dữ liệu quan trọng:** Payment ID, Invoice ID, Amount Paid, Payment Method (Bank Transfer, Cash, Card, Gateway), Transaction Reference, Paid Timestamp, Payer Name, Bank Proof Attachment.

### 5.8. Security Deposit & Settlement
- **Mục đích:** Khoản tiền ký quỹ đảm bảo quyền lợi của chủ nhà, được quản lý tách biệt và quyết toán khi kết thúc hợp đồng.
- **Chủ sở hữu:** Tiền thuộc quyền sở hữu của Tenant nhưng bị phong tỏa/ủy thác cho Bên Cho Thuê giữ.
- **Ai tạo:** Property Manager lập biên bản thu cọc và biên bản quyết toán.
- **Ai cập nhật:** Property Manager tính toán đối trừ, Tenant phản hồi/khiếu nại, Auditor phê duyệt hoàn trả.
- **Ai được xem:** Tenant, Property Manager, Owner, Auditor.
- **Vòng đời (Settlement):** `DRAFT` → `PENDING_TENANT_REVIEW` → `DISPUTED` / `AGREED` → `APPROVED` → `REFUNDED` / `CLOSED`.
- **Trường dữ liệu quan trọng:** Deposit ID, Lease ID, Initial Deposit Amount, Damage Deductions, Unpaid Rent Deductions, Cleaning Deductions, Net Refund Amount / Amount Owed, Settlement Date, Evidence Report Ref.

### 5.9. Maintenance Request & Work Order
- **Mục đích:** `Maintenance Request` là tiếng nói của người dùng báo cáo sự cố. `Work Order` là chứng từ kỹ thuật giao việc và cam kết tài chính giữa BQL và Vendor.
- **Chủ sở hữu:** Request thuộc Tenant/Unit; Work Order thuộc Property Manager giao cho Vendor.
- **Ai tạo:** Tenant/PM tạo Request; PM tạo Work Order.
- **Ai cập nhật:** PM điều phối; Vendor cập nhật hiện trường và chi phí.
- **Ai được xem:** Tenant (chỉ xem Request của mình), PM, Vendor (chỉ xem Work Order được giao), Owner (xem các request vượt ngưỡng chi phí).
- **Vòng đời (Request):** `SUBMITTED` → `REVIEWING` → `APPROVED` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` → `CLOSED` (hoặc `REJECTED` / `CANCELLED`).
- **Vòng đời (Work Order):** `DRAFT` → `DISPATCHED` → `ACCEPTED` / `DECLINED` → `SCHEDULED` → `IN_PROGRESS` → `PENDING_APPROVAL` → `RESOLVED` → `BILLED`.
- **Trường dữ liệu quan trọng:** Work Order ID, Request ID, Assigned Vendor ID, Issue Category, Urgency Level (Emergency, Urgent, Normal), Estimated Cost, Actual Cost, Approval Status, Completion Sign-off.

### 5.10. Inspection
- **Mục đích:** Biên bản hiện trạng kỹ thuật chuẩn hóa, lập tại các mốc: Move-in, Move-out, hoặc kiểm tra định kỳ (Routine).
- **Chủ sở hữu:** Biên bản thỏa thuận chung giữa Property Manager và Tenant.
- **Ai tạo:** Property Manager.
- **Ai cập nhật:** Property Manager nhập checklist, Tenant đối chứng ký xác nhận.
- **Ai được xem:** Tenant, Property Manager, Owner, Auditor.
- **Vòng đời:** `SCHEDULED` → `IN_PROGRESS` → `PENDING_SIGNATURES` → `COMPLETED` / `DISPUTED`.
- **Trường dữ liệu quan trọng:** Inspection ID, Lease ID, Inspection Type (Move-in, Move-out, Routine), Conducted Date, Inspector Name, Checklist Items (Status: Good, Damaged, Dirty, Missing), Photo Evidence URLs, Tenant Signature, Manager Signature.

---

## 6. Property & Unit Domain

### 6.1. Bản chất phân cấp
- **Property (Tòa nhà / Cụm cư xá):** Đóng vai trò là vật chứa (container) quản lý các tiện ích chung, quy chuẩn xây dựng, giấy phép PCCC và chi phí vận hành chung (sảnh, thang máy, bảo vệ).
- **Unit (Căn hộ / Gian phòng):** Là đơn vị kinh doanh tạo doanh thu trực tiếp. Mọi hợp đồng thuê, đồng hồ điện nước, lịch bàn giao và bảo trì nội thất đều định danh chính xác đến từng Unit.

### 6.2. Ma trận chuyển đổi trạng thái Unit (Unit State Transitions)

```
                       ┌───────────────────────────────┐
                       │          UNAVAILABLE          │
                       │   (Mới tạo / Đang sửa lớn)   │
                       └──────────────┬────────────────┘
                                      │ Hoàn tất nghiệm thu
                                      ▼
                       ┌───────────────────────────────┐
            ┌─────────►│           AVAILABLE           │◄────────┐
            │          │      (Sẵn sàng cho thuê)      │         │
            │          └──────────────┬────────────────┘         │
            │                         │ Đã duyệt Application     │
            │                         ▼                          │
            │          ┌───────────────────────────────┐         │
            │          │           RESERVED            │         │
            │          │ (Chờ ký Lease & đóng cọc)    │         │
            │          └──────────────┬────────────────┘         │
            │                         │ Lease Active & Bàn giao  │
            │                         ▼                          │
            │          ┌───────────────────────────────┐         │
            │          │           OCCUPIED            │         │
            │          │   (Đang có người ở thực tế)   │         │
            │          └──────────────┬────────────────┘         │
            │                         │ Move-out hoàn tất        │
            │                         ▼                          │
            │          ┌───────────────────────────────┐         │
            │          │       UNDER_MAINTENANCE       │         │
            │          │ (Dọn dẹp, sửa chữa turnover)  │─────────┘
            │          └──────────────┬────────────────┘
            │                         │ Hỏng hóc nặng / Dừng KD
            │                         ▼
            │          ┌───────────────────────────────┐
            └──────────│        DECOMMISSIONED         │
                       │     (Ngừng khai thác vĩnh viễn)│
                       └───────────────────────────────┘
```

### 6.3. Điều kiện đưa Unit lên niêm yết (Listing Qualification)
Một Unit **CHỈ ĐƯỢC PHÉP** tạo Listing hoặc Publish Listing khi thỏa mãn đầy đủ các điều kiện:
1. Trạng thái Unit hiện tại là `AVAILABLE` (hoặc `OCCUPIED` nhưng Lease hiện tại đang ở trạng thái `EXPIRING` trong vòng 30-45 ngày và Tenant đã nộp thông báo không tái ký).
2. Không có lệnh đóng cửa xử lý pháp lý, tranh chấp quyền thừa kế giữa các Owners.
3. Không có Work Order khẩn cấp (Emergency) chưa giải quyết gây mất an toàn (cháy nổ, ngập nước, nứt kết cấu).

### 6.4. Phân bổ quản lý & Quyền hạn sở hữu
- **Owner Portfolio:** 1 Owner có thể sở hữu 1 hoặc nhiều Properties, với hàng trăm Units. Báo cáo tài chính cho Owner phải tổng hợp được cấp Portfolio và phân rã chi tiết từng Property/Unit.
- **Property Manager Assignment:** Một Property Manager được phân công quản lý một danh sách Property cụ thể bởi Super Admin / Organization Lead. Manager không có quyền can thiệp vào các Property ngoài phạm vi được chỉ định.

---

## 7. Listing Domain

### 7.1. Vòng đời của Listing (Listing Lifecycle)
- `DRAFT`: Đang chuẩn bị nội dung hình ảnh, mô tả, chưa công khai.
- `PUBLISHED`: Đang hiển thị công khai trên các kênh phân phối; cho phép ứng viên nộp Application.
- `PAUSED`: Tạm dừng hiển thị tiếp nhận ứng viên mới (ví dụ: đã nhận đủ 5 hồ sơ đang review, hoặc đang tổ chức ngày mở cửa xem nhà tập trung).
- `RENTED`: Đã chốt khách thuê (Lease đã được kích hoạt thành công).
- `ARCHIVED`: Listing đóng vĩnh viễn hoặc đã hết hạn chào thuê mà không thành công.

### 7.2. Các quy tắc tự động hóa Listing (Automation Rules)
1. **Auto-Pause upon Reservation:** Khi một Application cho Unit được Approved và chuyển sang trạng thái `RESERVED` cho ứng viên đó, Listing tự động chuyển sang `PAUSED` để ngăn chặn các ứng viên khác tiếp tục nộp hồ sơ mất phí thẩm định.
2. **Auto-Rented upon Lease Activation:** Khi Lease chuyển sang `ACTIVE`, Listing liên quan tự động chuyển sang `RENTED` và gỡ khỏi danh sách công khai.
3. **Republishing on Cancellation:** Nếu ứng viên ở trạng thái `RESERVED` từ chối ký hợp đồng hoặc không nộp cọc đúng hạn cam kết, Unit quay về `AVAILABLE` và Listing liên quan tự động được mở lại trạng thái `PUBLISHED`.

---

## 8. Tenant Application Domain

### 8.1. E2E Application Workflow

```
┌──────────────┐     Nộp đơn      ┌──────────────┐    PM tiếp nhận   ┌──────────────┐
│    DRAFT     │─────────────────►│  SUBMITTED   │──────────────────►│ UNDER_REVIEW │
└──────────────┘                  └──────┬───────┘                   └──────┬───────┘
                                         │                                  │
                   Hết hạn 72h           ▼ Rút đơn                          │
                   không bổ sung ┌──────────────┐                           │
                   hồ sơ         │  WITHDRAWN   │                           │
                                 └──────────────┘                           │
                                         ▲                                  │
                                         │                                  │
               ┌─────────────────────────┴────────────────────────┐         │
               │                                                  │         │
               ▼ Thẩm định Đạt                                    ▼ Từ chối │
        ┌──────────────┐                                   ┌──────────────┐ │
        │   APPROVED   │                                   │   REJECTED   │◄┘
        └──────┬───────┘                                   └──────────────┘
               │ Soạn Lease & Ký
               ▼
        ┌──────────────┐
        │LEASE_CREATED │
        └──────────────┘
```

### 8.2. Quy tắc thẩm định khách quan (Objective & Non-discriminatory Rules)
Hệ thống loại bỏ hoàn toàn các trường dữ liệu và đánh giá liên quan đến chủng tộc, tôn giáo, giới tính, tình trạng hôn nhân, nguồn gốc xuất thân. Việc thẩm định tuân thủ tiêu chuẩn chấm điểm tài chính khách quan:
1. **Tỷ lệ Thu nhập trên Tiền thuê (Rent-to-Income Ratio):** Tổng thu nhập chứng minh hàng tháng của tất cả người đứng tên phải đạt tối thiểu $2.5 \times$ hoặc $3.0 \times$ giá thuê niêm yết.
2. **Lịch sử cư trú (Rental History):** Không có tiền án trục xuất (Eviction record) trong vòng 3-5 năm gần nhất.
3. **Nếu ứng viên không đạt tiêu chuẩn thu nhập:** Hệ thống bắt buộc bổ sung **Co-Signer (Người bảo lãnh)** có thu nhập tối thiểu $4.0 - 5.0 \times$ tiền thuê và cam kết trách nhiệm liên đới pháp lý.

### 8.3. Xử lý hồ sơ đồng thời (Concurrent Applications for Single Unit)
- Một Unit cho phép nhận nhiều Application cùng lúc khi Listing đang `PUBLISHED`.
- **Nguyên tắc thẩm định:** Thứ tự xử lý hồ sơ ưu tiên theo quy tắc FIFO (First-In, First-Out) của hồ sơ đã nộp đầy đủ chứng từ (Fully-submitted).
- Khi một Application được `APPROVED` và người nộp xác nhận giữ chỗ: Các Application còn lại của Unit đó chuyển sang trạng thái `ON_HOLD`.
- Khi người được duyệt chính thức ký Lease và đóng cọc: Tất cả các Application khác đang `ON_HOLD` lập tức được hệ thống tự động thông báo hủy và hoàn phí xét duyệt (nếu có thu trước).

---

## 9. Lease Domain

### 9.1. Vòng đời Lease (Lease Lifecycle)

```
        ┌──────────────┐
        │    DRAFT     │  (PM thiết lập điều khoản, giá, kỳ hạn)
        └──────┬───────┘
               │ Gửi bản ký cho Tenant & PM/Owner
               ▼
        ┌──────────────┐
        │PENDING_SIGN  │  (Chờ hoàn tất ký điện tử đủ 2 bên)
        └──────┬───────┘
               │ 1. Ký xong
               │ 2. Đóng đủ Security Deposit & First Month Rent
               │ 3. Đến ngày Start Date
               ▼
        ┌──────────────┐
        │    ACTIVE    │  (Hợp đồng có hiệu lực pháp lý trọn vẹn)
        └──────┬───────┘
               │ Còn 60 ngày đến hạn kết thúc
               ▼
        ┌──────────────┐
        │   EXPIRING   │  (Giai đoạn đàm phán gia hạn hoặc thông báo trả phòng)
        └──────┬───────┘
               ├─────────────────────────────────────────┐
               │ Đồng thuận gia hạn                      │ Không gia hạn / Chấm dứt
               ▼                                         ▼
        ┌──────────────┐                          ┌──────────────┐
        │   RENEWED    │                          │  TERMINATED  │ (Dọn đi, thanh lý)
        └──────────────┘                          └──────┬───────┘
                                                         │ Hoàn tất Settlement & cọc
                                                         ▼
                                                  ┌──────────────┐
                                                  │    CLOSED    │ (Đóng sổ vĩnh viễn)
                                                  └──────────────┘
```

### 9.2. Bốn điều kiện tiên quyết kích hoạt Lease (Lease Activation Invariants)
Một Lease **KHÔNG BAO GIỜ** được phép chuyển trạng thái sang `ACTIVE` nếu thiếu bất kỳ điều kiện nào sau đây:
1. **Chữ ký hoàn tất (Full Execution):** Cả Tenant đại diện và Property Manager (hoặc Owner) đều đã ký số hợp lệ kèm dấu thời gian.
2. **Thu đủ tiền ký quỹ (Deposit Collected):** Khoản tiền Security Deposit đã được ghi nhận thanh toán `CLEARED` vào tài khoản ủy thác.
3. **Thu đủ tiền thuê kỳ đầu (First Period Rent Paid):** Tiền thuê của kỳ đầu tiên (hoặc số tiền tính theo tỷ lệ ngày ở thực tế - Prorated Rent) đã được thanh toán đủ.
4. **Mốc thời gian (Effective Date Reached):** Ngày hiện tại phải lớn hơn hoặc bằng `Start Date` ghi trên hợp đồng.

### 9.3. Gia hạn hợp đồng (Lease Renewal)
- Trước khi hết hạn 60 ngày, hệ thống kích hoạt thông báo tự động cho cả PM và Tenant.
- Nếu hai bên đồng thuận: Tạo một Lease phụ lục hoặc Lease mới kế thừa dữ liệu của Lease cũ. Tiền cọc an ninh từ Lease cũ được làm thủ tục kết chuyển (Carry-over) sang Lease mới mà không cần hoàn trả tiền mặt.

### 9.4. Chấm dứt hợp đồng trước hạn (Early Termination)
- Áp dụng khi một trong hai bên đơn phương chấm dứt hợp đồng trước `End Date`.
- **Yêu cầu:** Phải có văn bản thông báo trước (Notice Period, thông thường 30 hoặc 60 ngày).
- **Phí phạt vi phạm (Early Termination Fee):** Hệ thống tự động tính toán khoản phạt dựa trên điều khoản hợp đồng (thường tương đương 1-2 tháng tiền thuê) và đưa vào công nợ của Tenant.

---

## 10. Rent & Payment Domain

### 10.1. Cấu trúc tài chính định kỳ (Billing Structure)
Mỗi kỳ thanh toán, hệ thống tự động tổng hợp các thành phần tạo nên nghĩa vụ tài chính:

$$\text{Tổng nghĩa vụ kỳ này} = \text{Tiền thuê cơ bản} + \text{Phí tiện ích (Điện, Nước, Phí quản lý)} + \text{Phí dịch vụ phụ trợ (Gửi xe, Thú cưng)} + \text{Nợ cũ tồn đọng} + \text{Phí trễ hạn kỳ trước}$$

### 10.2. Vòng đời Hóa đơn tiền thuê (Invoice Lifecycle)
- `UPCOMING`: Tạo trước ngày bắt đầu kỳ thanh toán 5-7 ngày để Tenant chuẩn bị ngân sách.
- `ISSUED`: Chính thức gửi thông báo thanh toán cho Tenant.
- `DUE`: Đến ngày đến hạn thanh toán quy định (Ví dụ: Ngày 01 hàng tháng).
- `PAID`: Đã thanh toán đầy đủ 100% giá trị hóa đơn.
- `PARTIALLY_PAID`: Tenant thanh toán một phần giá trị hóa đơn; phần còn lại tiếp tục chịu hạn thanh toán.
- `OVERDUE`: Đã vượt qua `Due Date` cộng thêm `Grace Period` mà vẫn chưa trả đủ.
- `WAIVED`: Khoản tiền được miễn giảm đặc biệt (cần phê duyệt của Owner/Auditor).
- `CANCELLED`: Hóa đơn bị hủy do sai sót nghiệp vụ tính toán trước khi thanh toán.

### 10.3. Cơ chế phạt trễ hạn (Grace Period & Late Fee Engine)
- **Grace Period (Thời gian ân hạn):** Mặc định từ ngày 01 đến hết 23:59:59 ngày 05 hàng tháng. Trong thời gian này, hóa đơn hiển thị `DUE` nhưng không phát sinh bất kỳ khoản phạt nào.
- **Trigger Phạt (Late Fee Application):** Đúng 00:00:00 ngày 06 hàng tháng, mọi Invoice chưa thanh toán đủ số dư tự động chuyển sang `OVERDUE` và hệ thống tự động sinh một dòng chi phí (Late Fee Item) gắn vào hóa đơn:
  - Tùy chọn 1: Khoản cố định (ví dụ: \$50 / lần trễ).
  - Tùy chọn 2: Tỷ lệ phần trăm (ví dụ: 5% trên số dư nợ còn lại).
  - Tùy chọn 3: Lũy tiến theo ngày (ví dụ: \$10 cho mỗi ngày trễ tiếp theo).

### 10.4. Nguyên tắc cấn trừ thanh toán (Payment Waterfall Principle)
Khi Tenant chuyển tiền không ghi rõ nội dung hoặc thanh toán thiếu/dư, hệ thống bắt buộc áp dụng nguyên tắc cấn trừ theo thứ tự ưu tiên pháp lý (FIFO Waterfall):
1. Ưu tiên 1: Các khoản Phí phạt trễ hạn cũ nhất chưa trả (Late Fees).
2. Ưu tiên 2: Tiền nợ chi phí bảo trì do lỗi Tenant gây ra (Tenant Damage Fees).
3. Ưu tiên 3: Nợ tiền thuê gốc của các kỳ quá hạn cũ nhất (Oldest Unpaid Rent).
4. Ưu tiên 4: Tiền thuê gốc của kỳ hiện tại (Current Rent).
5. Ưu tiên 5: Tiền tiện ích / dịch vụ phát sinh kỳ này (Utilities).
6. Dư thừa (Overpayment): Tự động ghi có vào tài khoản khách hàng (Credit Balance) để giảm trừ cho kỳ hóa đơn tiếp theo, tuyệt đối không tự ý hoàn trả về tài khoản ngân hàng nếu chưa có lệnh đối soát.

---

## 11. Security Deposit Domain

### 11.1. Bản chất pháp lý của Tiền cọc an ninh
- Tiền cọc **KHÔNG PHẢI LÀ DOANH THU** của Chủ nhà hay Công ty quản lý tại thời điểm thu.
- Đây là khoản nợ phải trả (Liability) do Bên Cho Thuê nắm giữ dưới hình thức ký quỹ ủy thác (Escrow/Trust Fund).
- **Phân định ranh giới tuyệt đối:**
  - `Security Deposit`: Dùng để bảo đảm tổn thất tài sản hoặc trừ nợ cuối kỳ khi thanh lý hợp đồng.
  - `Rent Payment`: Tiền mua quyền sử dụng không gian hàng tháng, ghi nhận trực tiếp vào doanh thu vận hành.
  - `Maintenance Cost`: Chi phí sửa chữa tài sản thực tế phát sinh trong quá trình vận hành.

### 11.2. Quy trình quyết toán cọc (Deposit Settlement Workflow)

```
       ┌────────────────────────┐
       │   Move-out Inspection  │ ──► Lập danh sách hư hại tài sản
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Đối soát công nợ thuê  │ ──► Lấy số dư nợ tiền thuê, phạt, tiện ích chưa trả
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Lập Bảng Settlement    │
       │ (Deposit - Deductions) │
       └───────────┬────────────┘
                   │
                   ├──────────────────────────────────────┐
                   │ Số cọc > Tổng trừ                    │ Tổng trừ > Số cọc
                   ▼                                      ▼
       ┌────────────────────────┐             ┌────────────────────────┐
       │  Lệnh Hoàn Cọc Dư      │             │  Lệnh Thu Bổ Sung      │
       │  (Refund to Tenant)    │             │  (Invoice Tenant)      │
       └───────────┬────────────┘             └───────────┬────────────┘
                   │                                      │
                   └──────────────────┬───────────────────┘
                                      ▼
                         ┌────────────────────────┐
                         │   Tenant ký đồng thuận │
                         └────────────┬───────────┘
                                      ├─────────────────────────┐
                                      │ Đồng ý                  │ Khiếu nại (Dispute)
                                      ▼                         ▼
                         ┌────────────────────────┐ ┌──────────────────────┐
                         │ Duyệt xuất tiền/Đóng   │ │ Mở hồ sơ phân giải   │
                         └────────────────────────┘ └──────────────────────┘
```

### 11.3. Các khoản được phép và không được phép khấu trừ
- **ĐƯỢC PHÉP KHẤU TRỪ:**
  1. Tiền thuê nhà, tiện ích và phí phạt trễ hạn còn nợ tính đến ngày trả phòng.
  2. Chi phí sửa chữa các hư hỏng vượt quá mức hao mòn tự nhiên do hành vi bất cẩn hoặc cố ý của Tenant (ví dụ: vỡ kính, đục thủng tường, gãy cánh tủ, cháy nẹp bếp).
  3. Chi phí dọn dẹp vệ sinh chuyên sâu nếu Tenant trả phòng trong tình trạng ô uế, bừa bãi trái cam kết hợp đồng.
  4. Chi phí thay khóa/làm lại thẻ từ nếu Tenant làm mất hoặc không bàn giao đầy đủ.
- **TUYỆT ĐỐI CẤM KHẤU TRỪ:**
  1. Hao mòn tự nhiên do thời gian và sử dụng thông thường (Normal Wear & Tear) như: sơn tường phai màu nhẹ theo năm tháng, ron gạch cũ, thảm lún nhẹ tại vị trí kê đồ đạc.
  2. Chi phí sửa chữa các khiếm khuyết đã tồn tại từ trước thời điểm bàn giao (đã ghi nhận trong Move-in Inspection).
  3. Chi phí nâng cấp, cải tạo tài sản để phục vụ cho đợt cho thuê tiếp theo với giá cao hơn.

---

## 12. Maintenance Domain

### 12.1. Phân loại mức độ khẩn cấp & SLA xử lý

| Cấp độ | Định nghĩa sự cố | Thời gian phản hồi tối đa | Hành động xử lý |
| :--- | :--- | :--- | :--- |
| **EMERGENCY** (Khẩn cấp) | Đe dọa trực tiếp đến tính mạng, sức khỏe hoặc nguy cơ phá hủy kết cấu tài sản: vỡ ống nước chính ngập nhà, chập điện bốc khói, rò rỉ khí gas, hỏng khóa cửa chính không khóa được. | **30 - 60 phút** | PM có quyền điều phối Vendor tức thì mà không cần xin duyệt giá từ Owner; có quyền vào nhà khẩn cấp. |
| **URGENT** (Cấp bách) | Ảnh hưởng nghiêm trọng đến sinh hoạt thiết yếu nhưng chưa đe dọa kết cấu: hỏng tủ lạnh duy nhất giữa mùa hè, mất nước một phòng vệ sinh (nếu nhà có nhiều WC), hỏng máy nước nóng. | **12 - 24 giờ** | PM khảo sát, liên hệ Vendor lấy báo giá nhanh và triển khai trong ngày. |
| **NORMAL** (Tiêu chuẩn) | Hư hỏng nhỏ không ảnh hưởng trực tiếp đến an toàn: rèm cửa kẹt, vòi nước rỉ giọt nhỏ, bóng đèn hành lang cháy, tủ bếp xộc xệch. | **48 - 72 giờ** | Xử lý theo quy trình phê duyệt báo giá và xếp lịch thông thường. |

### 12.2. Vòng đời Work Order & Giới hạn phê duyệt ngân sách (Approval Thresholds)
- **Hạn mức ủy quyền của PM (PM Discretionary Limit):** Mặc định \$200 - \$500 (tùy thỏa thuận với Owner).
  - Chi phí ước tính $\le$ Hạn mức: PM có toàn quyền tự động duyệt lệnh (`APPROVED`) và xuất Work Order cho Vendor.
  - Chi phí ước tính $>$ Hạn mức: Hệ thống chuyển trạng thái `PENDING_OWNER_APPROVAL`. Owner nhận thông báo kèm 2-3 bảng báo giá để bấm duyệt điện tử.
- **Trường hợp Vendor phát sinh chi phí tại hiện trường:** Nếu chi phí thực tế vượt quá 10% so với dự toán đã duyệt, Vendor phải dừng thi công, chụp ảnh hiện trạng phát sinh và yêu cầu PM duyệt bổ sung (Change Order).

### 12.3. Trách nhiệm chi trả: Chủ nhà (Owner) vs Khách thuê (Tenant)
Hệ thống bắt buộc Property Manager phải gắn nhãn phân định trách nhiệm chi trả (`Billing Responsibility`) trước khi đóng Work Order:
- **Owner-responsibility:** Hư hỏng do hao mòn tự nhiên, thiết bị hết niên hạn sử dụng, sự cố ngầm trong tường/hộp kỹ thuật. Chi phí được cấn trừ vào doanh thu chuyển trả cho Owner.
- **Tenant-responsibility:** Hư hỏng do sử dụng sai hướng dẫn, tác động vật lý, dị vật làm nghẹt bồn cầu. Chi phí được lập thành một Hóa đơn dịch vụ (Service Invoice) gửi cho Tenant thanh toán trong kỳ kế tiếp.

---

## 13. Inspection Domain

### 13.1. Phân loại kiểm tra hiện trạng
1. **Move-in Inspection:** Thiết lập hiện trạng cơ sở ban đầu (Baseline) khi trao chìa khóa cho khách.
2. **Move-out Inspection:** Ghi nhận hiện trạng hoàn trả khi thu hồi chìa khóa.
3. **Routine / Periodic Inspection:** Kiểm tra định kỳ (mỗi 6 tháng) nhằm phát hiện sự cố rò rỉ ngầm, kiểm tra an toàn PCCC và đảm bảo Tenant không nuôi thú cưng trái phép hoặc cho thuê lại lén lút.

### 13.2. Thuật toán so sánh đối chứng (Differential Condition Engine)
Quyết định khấu trừ cọc dựa trên công thức đối chiếu cơ sở:

$$\Delta \text{Condition} = \text{Condition}(\text{Move-out}) - \text{Condition}(\text{Move-in})$$

```text
Item: Cánh cửa phòng ngủ chính
- Move-in Record: Tình trạng Tốt (Good), Sơn trắng đều, không vết nứt, có 2 ảnh chụp đính kèm.
- Move-out Record: Tình trạng Hỏng (Damaged), Thủng 1 lỗ đường kính 10cm, có 3 ảnh chụp đính kèm.
- Đánh giá: Có sự sai lệch hiện trạng (Discrepancy) ngoài phạm vi Normal Wear & Tear.
- Kết luận nghiệp vụ: Tenant chịu trách nhiệm bồi thường chi phí thay/sửa cửa.
```

### 13.3. Yêu cầu bằng chứng & Ký biên bản
- Biên bản nghiệm thu chỉ có giá trị pháp lý đầy đủ khi:
  1. 100% các hạng mục hư hỏng đều có ảnh chụp hiện trường rõ nét kèm tọa độ/dấu thời gian (Timestamped Photos).
  2. Có chữ ký điện tử trực tiếp của cả Inspector (PM) và Tenant.
  3. Nếu Tenant vắng mặt không lý do tại buổi nghiệm thu trả phòng đã hẹn trước: PM có quyền tiến hành đơn phương với sự chứng kiến của bên thứ ba độc lập (Bảo vệ tòa nhà / Tổ dân phố) và ghi hình liên tục toàn bộ quá trình.

---

## 14. Move-in Domain

### 14.1. Quy trình Move-in E2E

```
┌─────────────────────────────────────────────────────────────┐
│ 1. KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (PRE-REQUISITES)           │
│    - Lease = ACTIVE                                         │
│    - Security Deposit = 100% PAID                           │
│    - First Month Rent = 100% PAID                           │
│    - Giấy tờ định danh Tenant = Verified                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Đủ điều kiện
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. XẾP LỊCH BÀN GIAO (SCHEDULE HANDOVER)                    │
│    - Đặt hẹn giờ giữa PM và Tenant                          │
│    - Đăng ký ban quản lý tòa nhà slot thang máy chuyển đồ   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Tới ngày hẹn
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. THỰC HIỆN MOVE-IN INSPECTION TẠI HIỆN TRƯỜNG             │
│    - Đi theo danh mục checklist từng phòng                  │
│    - Chốt chỉ số ban đầu đồng hồ Điện / Nước                │
│    - Ghi nhận các vết xước/hư hại cũ sẵn có                 │
│    - Hai bên ký biên bản điện tử Move-in                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Hoàn tất ký
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BÀN GIAO QUYỀN TRUY CẬP (ACCESS HANDOVER)                │
│    - Bàn giao chìa khóa vật lý, thẻ từ thang máy, remote    │
│    - Cấp mã PIN khóa số điện tử / Kích hoạt vân tay         │
│    - Hướng dẫn nội quy phân loại rác và thoát hiểm          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. HOÀN TẤT & CẬP NHẬT TRẠNG THÁI                           │
│    - Trạng thái Move-in: COMPLETED                          │
│    - Trạng thái Unit: OCCUPIED                              │
│    - Kích hoạt thời gian 48h cho Tenant báo cáo lỗi phát    │
│      sinh thêm mà buổi kiểm tra chưa phát hiện ra           │
└─────────────────────────────────────────────────────────────┘
```

---

## 15. Move-out Domain

### 15.1. Quy trình Move-out E2E

```
┌─────────────────────────────────────────────────────────────┐
│ 1. TIẾP NHẬN THÔNG BÁO CHUYỂN ĐI (MOVE-OUT NOTICE)          │
│    - Tenant gửi yêu cầu chuyển đi                           │
│    - Kiểm tra thời gian báo trước (Tuân thủ Notice Period)  │
│    - Phân loại: Đúng hạn (End of Lease) hay Sớm (Early Term)│
└──────────────────────────────┬──────────────────────────────┘
                               │ Chấp thuận
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. TIỀN KIỂM TRA & HƯỚNG DẪN DỌN DẸP (PRE-INSPECTION)       │
│    - Gửi hướng dẫn dọn dẹp và tiêu chuẩn hoàn trả phòng     │
│    - Cảnh báo các hạng mục dễ bị trừ cọc                    │
│    - Xếp lịch kiểm tra trả phòng chính thức                 │
└──────────────────────────────┬──────────────────────────────┘
                               │ Ngày dọn đi
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. MOVE-OUT INSPECTION CHÍNH THỨC & THU HỒI TRUY CẬP        │
│    - Kiểm tra hiện trạng đối chiếu bản Move-in ban đầu      │
│    - Chốt chỉ số điện nước cuối cùng                        │
│    - Thu hồi toàn bộ chìa khóa, thẻ từ                      │
│    - Đổi mã khóa điện tử ngay lập tức (Key Deactivation)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ĐỐI SOÁT TÀI CHÍNH & QUYẾT TOÁN CỌC (SETTLEMENT)         │
│    - Tính tiền điện nước tiêu thụ đến ngày trả phòng        │
│    - Tính chi phí khắc phục hư hỏng (nếu có)                │
│    - Kiểm tra các hóa đơn tiền thuê cũ còn nợ               │
│    - Phát hành biên bản Settlement trong thời hạn luật định │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GIẢI PHÓNG CĂN HỘ & ĐÓNG HỢP ĐỒNG                        │
│    - Chuyển tiền hoàn cọc cho Tenant                        │
│    - Trạng thái Lease: CLOSED                               │
│    - Trạng thái Unit: UNDER_MAINTENANCE (Turnover cleaning) │
│    - Khởi tạo quy trình chuẩn bị cho đợt khách mới          │
└─────────────────────────────────────────────────────────────┘
```

---

## 16. Notification Matrix

| Sự kiện nghiệp vụ (Trigger Event) | Người nhận (Recipient) | Kênh (Channel) | Thời điểm gửi (Timing) | Lý do nghiệp vụ (Business Reason) |
| :--- | :--- | :--- | :--- | :--- |
| **Application Submitted** | Property Manager | In-app, Email | Tức thời | Thông báo có ứng viên mới cần tiếp nhận hồ sơ trong 24h. |
| **Application Approved** | Applicant | Email, SMS | Tức thời khi duyệt | Hướng dẫn ứng viên tiến hành xem hợp đồng và nộp tiền giữ chỗ. |
| **Application Rejected** | Applicant | Email | Tức thời khi từ chối | Thông báo trang trọng kèm lý do pháp lý hợp lệ (Adverse Action Notice). |
| **Lease Pending Signature** | Tenant, Owner/PM | In-app, Email | Khi Lease chuyển PENDING | Nhắc nhở các bên hoàn tất chữ ký điện tử. |
| **Upcoming Rent Notice** | Tenant | In-app, Push | 5 ngày trước Due Date | Cảnh báo nghĩa vụ tài chính sắp tới để tránh phát sinh nợ xấu. |
| **Rent Due Today** | Tenant | Push, SMS | Đúng 08:00 ngày Due Date | Nhắc thanh toán trong ngày. |
| **Payment Received** | Tenant | Email, In-app | Tức thời khi nhận tiền | Biên nhận xác nhận tiền đã vào tài khoản, minh bạch công nợ. |
| **Grace Period Expiring** | Tenant | Push, SMS, Email | Ngày cuối của Grace Period | Cảnh báo sau hôm nay sẽ bị áp phí phạt trễ hạn tự động. |
| **Late Fee Applied** | Tenant, PM | Email, In-app | Khi chuyển OVERDUE | Thông báo hóa đơn đã bị phạt trễ hạn, yêu cầu thanh toán ngay. |
| **Maintenance Assigned** | Vendor | In-app, SMS | Khi PM gán Vendor | Giao việc cho thợ kèm mô tả sự cố và số điện thoại liên hệ. |
| **Maintenance Work Completed** | Tenant, PM | In-app, Push | Khi Vendor báo xong | Nhắc Tenant kiểm tra nghiệm thu hiện trường và đánh giá dịch vụ. |
| **Lease Expiration Notice** | Tenant, PM, Owner | Email, In-app | 60 ngày & 30 ngày trước hết hạn | Đàm phán gia hạn hợp đồng hoặc chuẩn bị kế hoạch tìm khách mới. |
| **Move-out Notice Submitted** | PM, Owner | In-app, Email | Khi Tenant nộp đơn | Kích hoạt chu trình chuẩn bị trả phòng và xem xét đăng Listing mới. |
| **Settlement Ready for Review**| Tenant | Email, In-app | Khi PM lập xong bảng cọc | Yêu cầu Tenant xem xét và phản hồi bảng quyết toán cọc trong 7 ngày. |

---

## 17. Permission & Authorization Matrix

### 17.1. Bảng ma trận quyền hạn (RBAC)

| Nghiệp vụ / Thao tác | Property Owner | Property Manager | Tenant | Vendor | Financial Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Xem thông tin Property / Unit** | ✓ (Tài sản sở hữu) | ✓ (Được phân công) | Giới hạn (Unit đang thuê) | Giới hạn (Khi có việc) | ✓ (Toàn quyền đọc) |
| **Tạo / Chỉnh sửa Property & Unit** | Phê duyệt | ✓ | - | - | - |
| **Đăng tải / Quản lý Listing** | Xem | ✓ | - | - | - |
| **Nộp Tenant Application** | - | - | ✓ (Bản thân) | - | - |
| **Thẩm định & Duyệt Application** | Xem tóm tắt | ✓ | - | - | - |
| **Soạn thảo & Sửa đổi Lease** | Xem | ✓ | - | - | - |
| **Ký kết hợp đồng Lease** | ✓ (Nếu ủy quyền một phần) | ✓ (Đại diện) | ✓ | - | - |
| **Xem Hóa đơn & Bảng kê tiền thuê**| ✓ (Báo cáo doanh thu)| ✓ | ✓ (Chỉ của mình) | - | ✓ (Toàn hệ thống) |
| **Thanh toán tiền thuê / Ghi nhận thu**| - | ✓ (Ghi nhận thu) | ✓ (Thực hiện trả) | - | ✓ (Đối soát bank) |
| **Miễn giảm tiền thuê / Xóa phạt trễ**| Phê duyệt | Đề xuất | - | - | Phê duyệt |
| **Tạo Maintenance Request** | - | ✓ | ✓ | - | - |
| **Phát hành Work Order cho Vendor** | Phê duyệt (> Hạn mức)| ✓ | - | - | - |
| **Tiếp nhận & Cập nhật Work Order** | - | Giám sát | Xác nhận thợ đến | ✓ | - |
| **Thực hiện & Ký biên bản Inspection**| Xem | ✓ | ✓ (Ký biên bản) | - | - |
| **Lập bảng Deposit Settlement** | Xem | ✓ (Lập dự thảo) | Xem & Khiếu nại | - | Phê duyệt hoàn tiền |
| **Xem Báo cáo tài chính & Vận hành** | ✓ (Cấp tài sản mình) | ✓ (Cấp vận hành) | - | - | ✓ (Toàn bộ) |

### 17.2. Quy tắc phạm vi và ranh giới dữ liệu (Ownership Scoping Boundaries)
- **Quy tắc cách ly Chủ sở hữu (Owner Scoping):** Owner A tuyệt đối không thể xem báo cáo dòng tiền, danh sách người thuê, hoặc tình trạng phòng của Owner B, ngay cả khi hai Property này nằm chung một phường hoặc do cùng một công ty vận hành quản lý.
- **Quy tắc cách ly Khách thuê (Tenant Scoping):** Tenant A chỉ truy cập được dữ liệu thuộc về Lease, Invoice, Request của chính mình. Tuyệt đối không thể thấy danh tính hoặc thông tin của Tenant phòng bên cạnh.
- **Quy tắc cách ly Nhà thầu (Vendor Scoping):** Vendor X chỉ được truy cập vào các Work Order được chỉ định cho mình. Vendor không thể xem giá thuê phòng, thông tin cá nhân tài chính của Tenant, hay các Work Order của Vendor khác.
- **Quy tắc phân quyền Quản lý (Manager Scoping):** Quản lý phụ trách Cụm A không được duyệt hồ sơ hay phát hành hóa đơn cho Cụm B trừ khi được cấp quyền quản lý tạm thời (Acting Delegation).

---

## 18. Business State Machines

### 18.1. Listing State Machine
- **Trạng thái:** `DRAFT`, `PUBLISHED`, `PAUSED`, `RENTED`, `ARCHIVED`.
- **Transitions:**
  - `DRAFT` $\xrightarrow{\text{Publish}}$ `PUBLISHED` (Actor: PM | Precondition: Unit = AVAILABLE, đủ ảnh và giá | Side effect: Công khai tin).
  - `PUBLISHED` $\xrightarrow{\text{Pause}}$ `PAUSED` (Actor: PM / System | Precondition: Có Application được Approved / Đặt chỗ | Side effect: Ẩn khỏi trang tìm kiếm).
  - `PAUSED` $\xrightarrow{\text{Resume}}$ `PUBLISHED` (Actor: PM | Precondition: Ứng viên hủy đặt chỗ, Unit vẫn AVAILABLE | Side effect: Mở lại tin).
  - `PUBLISHED` / `PAUSED` $\xrightarrow{\text{Mark Rented}}$ `RENTED` (Actor: System | Precondition: Lease liên quan chuyển ACTIVE | Side effect: Đóng tin, Unit = OCCUPIED).
  - `RENTED` / `PAUSED` $\xrightarrow{\text{Archive}}$ `ARCHIVED` (Actor: PM | Precondition: Hết hạn chiến dịch tiếp thị | Side effect: Lưu trữ vĩnh viễn).
- **Invalid Transitions:** `DRAFT` $\rightarrow$ `RENTED` (Không thể chốt thuê khi chưa từng công khai hoặc chưa có Lease); `RENTED` $\rightarrow$ `PUBLISHED` (Phải tạo bản ghi Listing mới cho chu kỳ thuê tiếp theo).

### 18.2. Tenant Application State Machine
- **Trạng thái:** `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `LEASE_CREATED`.
- **Transitions:**
  - `DRAFT` $\xrightarrow{\text{Submit}}$ `SUBMITTED` (Actor: Tenant | Precondition: Đầy đủ thông tin bắt buộc | Side effect: Khóa sửa đổi của Tenant, báo PM).
  - `SUBMITTED` $\xrightarrow{\text{Start Review}}$ `UNDER_REVIEW` (Actor: PM | Precondition: Đã tiếp nhận hồ sơ | Side effect: Chuyển trạng thái xử lý).
  - `UNDER_REVIEW` $\xrightarrow{\text{Approve}}$ `APPROVED` (Actor: PM | Precondition: Thỏa mãn toàn bộ tiêu chuẩn tài chính/tín dụng | Side effect: Đổi Unit sang RESERVED, gửi thư mời ký hợp đồng).
  - `UNDER_REVIEW` $\xrightarrow{\text{Reject}}$ `REJECTED` (Actor: PM | Precondition: Không đạt tiêu chuẩn | Side effect: Gửi Adverse Action Notice, mở khóa Unit nếu cần).
  - `SUBMITTED` / `UNDER_REVIEW` $\xrightarrow{\text{Withdraw}}$ `WITHDRAWN` (Actor: Tenant | Precondition: Khi chưa ký Lease | Side effect: Kết thúc xử lý hồ sơ).
  - `SUBMITTED` $\xrightarrow{\text{Expire}}$ `EXPIRED` (Actor: System | Precondition: Quá 72h không cung cấp đủ chứng từ theo yêu cầu | Side effect: Tự động đóng hồ sơ).
  - `APPROVED` $\xrightarrow{\text{Generate Lease}}$ `LEASE_CREATED` (Actor: PM | Precondition: Tạo bản ghi Lease thành công | Side effect: Khóa Application).
- **Invalid Transitions:** `REJECTED` $\rightarrow$ `APPROVED` (Không được lật ngược quyết định từ chối trực tiếp; ứng viên phải nộp đơn mới hoặc bổ sung người bảo lãnh); `LEASE_CREATED` $\rightarrow$ `WITHDRAWN`.

### 18.3. Lease State Machine
- **Trạng thái:** `DRAFT`, `PENDING_SIGNATURE`, `ACTIVE`, `EXPIRING`, `RENEWED`, `TERMINATED`, `CLOSED`.
- **Transitions:**
  - `DRAFT` $\xrightarrow{\text{Send for Signing}}$ `PENDING_SIGNATURE` (Actor: PM | Precondition: Đủ điều khoản hợp đồng | Side effect: Gửi tài liệu ký số cho các bên).
  - `PENDING_SIGNATURE` $\xrightarrow{\text{Activate}}$ `ACTIVE` (Actor: System / PM | Precondition: Đủ chữ ký 2 bên, thu đủ Deposit, thu đủ tiền kỳ đầu, đến Start Date | Side effect: Unit = OCCUPIED, sinh Rent Schedule).
  - `ACTIVE` $\xrightarrow{\text{Trigger Expiration Window}}$ `EXPIRING` (Actor: System | Precondition: Thời gian hiện tại = End Date - 60 ngày | Side effect: Gửi thông báo gia hạn).
  - `EXPIRING` $\xrightarrow{\text{Renew}}$ `RENEWED` (Actor: PM | Precondition: Ký kết thành công hợp đồng gia hạn | Side effect: Kế thừa khoản cọc, gia hạn Rent Schedule).
  - `ACTIVE` / `EXPIRING` $\xrightarrow{\text{Notice to Move-out}}$ `TERMINATED` (Actor: PM / Tenant | Precondition: Đến End Date hoặc kết thúc sớm theo thỏa thuận | Side effect: Kích hoạt chu trình Move-out và kiểm tra phòng).
  - `TERMINATED` $\xrightarrow{\text{Finalize Settlement}}$ `CLOSED` (Actor: PM / Auditor | Precondition: Quyết toán cọc hoàn tất, nợ nần được xử lý xong | Side effect: Unit chuyển UNDER_MAINTENANCE, đóng hồ sơ lưu trữ).
- **Invalid Transitions:** `DRAFT` $\rightarrow$ `ACTIVE` (Bỏ qua ký số và thu cọc là vi phạm nghiêm trọng); `CLOSED` $\rightarrow$ `ACTIVE` (Không thể tái kích hoạt hợp đồng đã đóng sổ).

### 18.4. Rent Invoice State Machine
- **Trạng thái:** `UPCOMING`, `ISSUED`, `DUE`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `WAIVED`, `CANCELLED`.
- **Transitions:**
  - `UPCOMING` $\xrightarrow{\text{Issue}}$ `ISSUED` (Actor: System | Precondition: Trước kỳ thanh toán 5 ngày | Side effect: Gửi thông báo cho Tenant).
  - `ISSUED` $\xrightarrow{\text{Reach Due Date}}$ `DUE` (Actor: System | Precondition: Ngày hiện tại = Due Date | Side effect: Nhắc nợ).
  - `DUE` / `ISSUED` $\xrightarrow{\text{Full Payment Received}}$ `PAID` (Actor: System / PM | Precondition: Số tiền trả $\ge$ Tổng dư nợ | Side effect: Gửi biên nhận, xóa nợ kỳ).
  - `DUE` / `ISSUED` $\xrightarrow{\text{Partial Payment}}$ `PARTIALLY_PAID` (Actor: System / PM | Precondition: $0 < \text{Số tiền trả} < \text{Tổng dư nợ}$ | Side effect: Cập nhật số dư nợ còn lại).
  - `DUE` / `PARTIALLY_PAID` $\xrightarrow{\text{Grace Period Expired}}$ `OVERDUE` (Actor: System | Precondition: Quá Grace Period mà chưa trả đủ | Side effect: Áp phí phạt Late Fee, ghi nhận nợ xấu).
  - `DUE` / `OVERDUE` $\xrightarrow{\text{Waive}}$ `WAIVED` (Actor: Auditor / Owner | Precondition: Có văn bản miễn giảm đặc biệt | Side effect: Điều chỉnh doanh thu).
- **Invalid Transitions:** `PAID` $\rightarrow$ `OVERDUE`; `CANCELLED` $\rightarrow$ `PAID`.

### 18.5. Maintenance Request & Work Order State Machine
- **Trạng thái Request:** `SUBMITTED`, `REVIEWING`, `APPROVED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`, `REJECTED`, `CANCELLED`.
- **Transitions:**
  - `SUBMITTED` $\xrightarrow{\text{Review}}$ `REVIEWING` (Actor: PM | Precondition: Tiếp nhận yêu cầu | Side effect: Đánh giá phân loại).
  - `REVIEWING` $\xrightarrow{\text{Approve}}$ `APPROVED` (Actor: PM | Precondition: Hợp lệ thuộc phạm vi tòa nhà | Side effect: Chuẩn bị giao việc).
  - `REVIEWING` $\xrightarrow{\text{Reject}}$ `REJECTED` (Actor: PM | Precondition: Yêu cầu vô lý, vi phạm nội quy | Side effect: Báo lý do cho Tenant).
  - `APPROVED` $\xrightarrow{\text{Dispatch Work Order}}$ `ASSIGNED` (Actor: PM | Precondition: Đã chọn Vendor phù hợp | Side effect: Tạo Work Order gửi Vendor).
  - `ASSIGNED` $\xrightarrow{\text{Vendor Starts}}$ `IN_PROGRESS` (Actor: Vendor | Precondition: Vendor có mặt tại hiện trường | Side effect: Cập nhật tiến độ).
  - `IN_PROGRESS` $\xrightarrow{\text{Vendor Done}}$ `COMPLETED` (Actor: Vendor | Precondition: Đăng ảnh nghiệm thu & chi phí thực tế | Side effect: Báo PM và Tenant nghiệm thu).
  - `COMPLETED` $\xrightarrow{\text{Sign-off & Close}}$ `CLOSED` (Actor: PM | Precondition: Tenant hài lòng hoặc PM xác nhận đạt chuẩn | Side effect: Ghi nhận chi phí, phân định hóa đơn).

---

## 19. Business Rules Catalog

### Property & Unit Rules
- **BR-PR-001 (Unique Unit Code):** Mã định danh Unit (Unit Number/Code) phải là duy nhất trong phạm vi một Property.
- **BR-PR-002 (Decommissioning Safety):** Một Unit chỉ được phép chuyển sang trạng thái `DECOMMISSIONED` khi không có bất kỳ Lease nào đang `ACTIVE` hoặc `EXPIRING` và không có tranh chấp pháp lý đang mở.
- **BR-PR-003 (Owner Asset Boundary):** Một Property chỉ thuộc về duy nhất một chủ thể sở hữu chính (Primary Legal Owner) tại một thời điểm trên hệ thống hợp đồng.

### Listing Rules
- **BR-LS-001 (Available Before Publish):** Một Listing chỉ được chuyển sang `PUBLISHED` khi Unit liên kết đang ở trạng thái `AVAILABLE` (hoặc `OCCUPIED` nhưng Lease hiện tại đang ở trạng thái `EXPIRING` trong vòng 45 ngày).
- **BR-LS-002 (Pricing Integrity):** Giá thuê niêm yết (Advertised Rent) không được phép thấp hơn giá sàn quy định bởi Property Owner nếu chưa có sự phê duyệt bằng văn bản.
- **BR-LS-003 (Auto-Unpublish on Lease):** Ngay khi một Lease liên quan đến Unit chuyển sang `ACTIVE`, hệ thống bắt buộc tự động gỡ toàn bộ Listing của Unit đó khỏi tất cả các kênh công khai.

### Application Rules
- **BR-AP-001 (Income Multiplier Rule):** Tổng thu nhập chứng thực của người đứng đơn chính và người đồng thuê phải đạt tối thiểu $3.0 \times$ giá thuê hàng tháng. Nếu không đạt, bắt buộc phải có Co-Signer với thu nhập tối thiểu $5.0 \times$.
- **BR-AP-002 (Duplicate Application Lockout):** Cùng một Applicant không được phép nộp nhiều hơn 1 đơn ứng tuyển cho cùng một Unit trong vòng 30 ngày trừ khi đơn cũ đã được PM chuyển sang trạng thái `REJECTED` với lý do cho phép nộp lại.
- **BR-AP-003 (Application Expiry SLA):** Sau khi được thông báo `APPROVED`, nếu Tenant không tiến hành ký Lease và đóng tiền giữ chỗ trong vòng 48 giờ làm việc, trạng thái đơn tự động chuyển sang `EXPIRED` và quyền ưu tiên được chuyển cho người kế tiếp.

### Lease Rules
- **BR-LE-001 (No Dual Active Leases):** Một Unit tuyệt đối không thể có nhiều hơn một hợp đồng ở trạng thái `ACTIVE` tại cùng một thời điểm (Không cho phép chồng lấn ngày hiệu lực).
- **BR-LE-002 (Mandatory Security Deposit):** Giá trị tiền cọc an ninh trong hợp đồng không được nhỏ hơn $1.0 \times$ tiền thuê hàng tháng và không vượt quá $3.0 \times$ tiền thuê hàng tháng (theo quy định khống chế trần của luật địa phương).
- **BR-LE-003 (Grace Period Minimum):** Thời gian ân hạn đóng tiền thuê (Grace Period) tối thiểu là 3 ngày và tối đa là 7 ngày kể từ ngày Due Date.

### Rent & Payment Rules
- **BR-RP-001 (Advance Invoice Generation):** Hóa đơn tiền thuê định kỳ phải được hệ thống tự động sinh ra trước ngày Due Date tối thiểu 5 ngày.
- **BR-RP-002 (Late Fee Ceiling):** Tổng phí phạt trễ hạn trong một kỳ không được vượt quá 10% giá trị tiền thuê của kỳ đó nhằm bảo đảm tuân thủ luật bảo vệ người tiêu dùng.
- **BR-RP-003 (Irreversible Payment Records):** Bản ghi thanh toán khi đã chuyển sang trạng thái `CLEARED` hoặc `RECONCILED` tuyệt đối không thể bị sửa đổi hoặc xóa khỏi hệ thống. Mọi điều chỉnh kế toán bắt buộc phải thực hiện thông qua bút toán đảo (Reversal Transaction) hoặc ghi chú giảm trừ (Credit Note).

### Security Deposit Rules
- **BR-SD-001 (Escrow Fund Isolation):** Tiền cọc an ninh thu được phải được phân loại vào tài khoản ký quỹ riêng biệt, không được hạch toán gộp chung vào dòng tiền doanh thu vận hành của công ty quản lý.
- **BR-SD-002 (Settlement Time Limit):** Bảng quyết toán hoàn cọc (Deposit Settlement) phải được hoàn tất và gửi cho Tenant trong thời hạn tối đa 14 ngày (hoặc 30 ngày tùy quy định pháp lý địa phương) kể từ ngày Tenant hoàn tất bàn giao Move-out.
- **BR-SD-003 (Mandatory Itemized Evidence):** Mọi khoản khấu trừ tiền cọc do hư hại tài sản bắt buộc phải đính kèm: (1) Ảnh chụp đối chiếu Move-in vs Move-out, và (2) Hóa đơn sửa chữa thực tế hoặc bảng báo giá chuẩn của nhà thầu độc lập.

### Maintenance Rules
- **BR-MN-001 (Emergency Override):** Đối với các sự cố được gắn nhãn `EMERGENCY`, Property Manager được quyền điều động Vendor và thực hiện sửa chữa ngay lập tức mà không cần chờ sự đồng ý của Owner, miễn là chi phí ước tính dưới \$1,000.
- **BR-MN-002 (Vendor Independence):** Vendor thực hiện sửa chữa không được là người thân hoặc người có xung đột lợi ích trực tiếp với Property Manager mà không công khai bằng văn bản.
- **BR-MN-003 (Tenant Right to Entry Notice):** Ngoại trừ trường hợp khẩn cấp, mọi lịch hẹn sửa chữa tại căn hộ của Vendor phải được thông báo trước cho Tenant tối thiểu 24 giờ.

### Inspection Rules
- **BR-IN-001 (Dual Signature Requirement):** Biên bản kiểm tra phòng chỉ được xem là hoàn tất (`COMPLETED`) khi có đủ chữ ký của cả đại diện Property Manager và Tenant (trừ trường hợp Tenant đơn phương bỏ trốn được lập biên bản đặc biệt).
- **BR-IN-002 (Inspection Window):** Biên bản Move-in Inspection phải được thực hiện trong vòng 24 giờ trước hoặc sau thời điểm trao chìa khóa.

---

## 20. Business Invariants (Bất biến nghiệp vụ tối cao)

1. **INV-001:** Một Unit không bao giờ được tồn tại 2 hợp đồng thuê ở trạng thái `ACTIVE` cùng lúc.
2. **INV-002:** Một Lease không thể chuyển sang `ACTIVE` nếu thiếu chữ ký hợp lệ của các bên hoặc chưa thu đủ tiền cọc an ninh quy định.
3. **INV-003:** Không một khoản tiền cọc nào được phép hoàn trả cho Tenant trước khi biên bản quyết toán cọc (`Deposit Settlement`) được phê duyệt chính thức.
4. **INV-004:** Một hóa đơn ở trạng thái `PAID` không thể bị chỉnh sửa số tiền hoặc chuyển sang trạng thái `OVERDUE`.
5. **INV-005:** Tiền cọc an ninh không bao giờ được tự động cấn trừ vào tiền thuê hàng tháng khi hợp đồng đang trong thời hạn hiệu lực bình thường, trừ khi có thỏa thuận thanh lý đặc biệt.
6. **INV-006:** Tenant không thể bị tính phí phạt trễ hạn (`Late Fee`) nếu ngày thanh toán nằm trong khoảng thời gian ân hạn (`Grace Period`).
7. **INV-007:** Vendor không bao giờ được phép xem hoặc chỉnh sửa các Work Order không được giao cho chính họ.

---

## 21. Edge Cases & Exception Handling

### 21.1. Trường hợp Khách thuê bỏ trốn (Tenant Abandonment / Skip-out)
- **Tình huống:** Tenant đột ngột cắt liên lạc, mang đồ đạc rời đi mà không nộp thông báo Move-out, không trả chìa khóa và nợ tiền thuê quá 15 ngày.
- **Xử lý nghiệp vụ:**
  1. PM gửi thông báo nghi vấn bỏ nhà (Notice of Belief of Abandonment) dán tại cửa và gửi bảo đảm qua email/thư tín trong thời hạn 15 ngày theo luật định.
  2. Hết thời hạn, PM cùng nhân chứng độc lập tiến hành mở khóa vào căn hộ, lập biên bản kiểm kê tài sản còn sót lại (nếu có giá trị > \$500 phải đưa vào kho bảo quản 30 ngày).
  3. Đơn phương chuyển Lease sang `TERMINATED`.
  4. Lập biên bản Move-out đơn phương, tính toàn bộ nợ tiền thuê, tiền phạt và phí dọn dẹp vào bảng Deposit Settlement. Tịch thu toàn bộ tiền cọc để cấn trừ nợ.
  5. Phát hành hồ sơ nợ xấu chuyển sang đơn vị thu hồi nợ chuyên nghiệp.

### 21.2. Tranh chấp cọc gay gắt (Disputed Deposit Settlement)
- **Tình huống:** Tenant không đồng ý với khoản khấu trừ tiền sơn nhà \$300 và từ chối ký biên bản Settlement.
- **Xử lý nghiệp vụ:**
  1. Trạng thái Settlement chuyển sang `DISPUTED`.
  2. Khoản tiền cọc không tranh chấp (phần tiền thừa chắc chắn được hoàn trả) phải được giải ngân hoàn trả trước cho Tenant trong thời hạn quy định, không được giam toàn bộ số tiền cọc.
  3. Phần tiền tranh chấp (\$300) được giữ lại trong tài khoản ủy thác trong vòng 14 ngày làm việc để hai bên tiến hành hòa giải nội bộ có sự tham gia của Senior Property Manager.
  4. PM cung cấp đầy đủ bằng chứng ảnh Move-in và hóa đơn nhà thầu. Nếu hòa giải bất thành, hướng dẫn hai bên đưa vụ việc ra Tòa án Tranh chấp Nhỏ (Small Claims Court).

### 21.3. Sự cố khẩn cấp giữa đêm không liên hệ được Chủ nhà (Midnight Emergency)
- **Tình huống:** Lúc 02:00 sáng, đường ống nước chính bị bục làm nước tràn ngập sàn gỗ và nguy cơ rò rỉ xuống căn hộ tầng dưới, nhưng chi phí khắc phục khẩn cấp ước tính là \$1,200 (vượt hạn mức ủy quyền \$500 của PM), liên hệ Owner không bắt máy.
- **Xử lý nghiệp vụ:**
  1. Kích hoạt quy chế **Emergency Safety Exemption**.
  2. PM có quyền và nghĩa vụ điều động Vendor khóa van tổng, hút nước và sửa tạm đường ống để bảo tồn tài sản, không cần chờ Owner duyệt.
  3. Sáng hôm sau, PM gửi báo cáo khẩn cấp kèm video hiện trường, giải trình lý do can thiệp và biên bản chi phí thực tế cho Owner.

### 21.4. Thanh toán dư tiền hoặc sai mã tham chiếu (Unallocated Overpayment)
- **Tình huống:** Tenant nợ \$1,000 nhưng chuyển khoản nhầm \$1,500 không ghi rõ nội dung.
- **Xử lý nghiệp vụ:**
  1. Hệ thống tự động gạch nợ \$1,000 cho Invoice đến hạn.
  2. Số tiền thừa \$500 được ghi nhận vào mục `Tenant Credit Balance` (Số dư có).
  3. Hệ thống gửi thông báo cho Tenant: Xác nhận đã nhận thừa \$500, số tiền này sẽ tự động trừ vào hóa đơn tiền thuê tháng tiếp theo, hoặc Tenant có thể gửi yêu cầu hoàn tiền về tài khoản nguồn.

---

## 22. End-to-End Business Journeys

### Journey A — Tạo Bất động sản mới & Niêm yết (New Property to Published Listing)
```
Actor: Property Owner & Property Manager
1. Owner ký hợp đồng ủy quyền quản lý bất động sản với Property Management Company.
2. Property Manager đăng nhập hệ thống, tạo hồ sơ Property "Sunrise Tower" với địa chỉ và thông tin pháp lý.
3. PM cấu hình danh sách 20 Units trực thuộc Property (Số phòng, diện tích, nội thất, giá thuê cơ sở).
4. PM chọn Unit 302 đang ở trạng thái UNAVAILABLE, hoàn tất nghiệm thu kỹ thuật nội thất và chuyển sang AVAILABLE.
5. PM khởi tạo Listing cho Unit 302: tải lên 8 ảnh chất lượng cao, mô tả tiện ích, đặt giá chào thuê $1,200/tháng, ngày có thể vào ở là 01/10/2026.
6. PM bấm PUBLISH. Tin chào thuê xuất hiện công khai trên cổng thông tin tiếp thị.
```

### Journey B — Từ Tìm nhà đến Ký hợp đồng (Prospect to Executed Lease)
```
Actor: Tenant (Applicant) & Property Manager
1. Tenant tìm thấy Listing của Unit 302 trên website, điền đơn Tenant Application trực tuyến.
2. Tenant tải lên căn cước công dân, sao kê bảng lương 3 tháng gần nhất và thông tin chủ nhà cũ. Bấm nộp đơn.
3. Hệ thống chuyển Application sang SUBMITTED và thông báo cho PM.
4. PM tiếp nhận, kiểm tra: Thu nhập $4,000/tháng (đạt tỷ lệ 3.3x so với giá $1,200), lịch sử tín dụng tốt, không nợ xấu.
5. PM bấm APPROVE. Hệ thống tự động chuyển Unit 302 sang RESERVED, tạm dừng Listing sang PAUSED.
6. PM sinh hợp đồng Lease với các điều khoản chuẩn: kỳ hạn 12 tháng, cọc $1,200, đóng tiền ngày 01 hàng tháng.
7. Tenant và PM thực hiện ký số điện tử trên tài liệu Lease.
8. Tenant chuyển khoản thanh toán $1,200 tiền cọc an ninh và $1,200 tiền thuê tháng đầu tiên.
9. Tiền vào tài khoản kế toán xác nhận CLEARED. Hợp đồng chuyển sang ACTIVE.
```

### Journey C — Quy trình Bàn giao nhận phòng (Move-in Execution)
```
Actor: Tenant & Property Manager
1. Ngày 01/10/2026 (Start Date), PM và Tenant gặp nhau tại Unit 302.
2. PM mở ứng dụng kiểm tra phòng, cùng Tenant đi qua từng phòng theo Move-in Checklist.
3. Chụp ảnh chốt chỉ số công tơ điện (12,450 kWh), đồng hồ nước (342 m3).
4. Phát hiện góc chân tường phòng khách bị trầy sơn nhẹ: PM chụp ảnh ghi chú "vết xước sẵn có".
5. Cả hai bên ký tên vào biên bản Move-in Inspection trên máy tính bảng.
6. PM bàn giao 02 chìa khóa cơ, 02 thẻ thang máy và cấp mã PIN cửa số cho Tenant.
7. Trạng thái Move-in hoàn tất (COMPLETED), trạng thái Unit chính thức chuyển sang OCCUPIED.
```

### Journey D — Chu kỳ Thu tiền thuê hàng tháng (Monthly Rent Cycle)
```
Actor: Tenant & System & Property Manager
1. Ngày 25/10/2026, hệ thống tự động sinh hóa đơn Invoice tháng 11/2026 gửi cho Tenant: Tiền thuê $1,200, hạn trả (Due Date) là 01/11/2026.
2. Ngày 01/11/2026, hệ thống gửi tin nhắn nhắc nợ: "Hôm nay là ngày đến hạn thanh toán tiền nhà".
3. Đến hết ngày 05/11/2026 (hết Grace Period), Tenant vẫn chưa thanh toán.
4. 00:00:01 ngày 06/11/2026, hệ thống tự động đổi trạng thái Invoice sang OVERDUE, cộng thêm khoản phạt Late Fee $50 vào hóa đơn và gửi email cảnh báo.
5. Ngày 07/11/2026, Tenant chuyển khoản $1,250 kèm ảnh ủy nhiệm chi.
6. Hệ thống tự động khớp lệnh thanh toán: gạch $50 nợ phạt và $1,200 nợ tiền thuê gốc.
7. Trạng thái Invoice chuyển sang PAID. Hệ thống gửi biên nhận điện tử cho Tenant.
```

### Journey E — Yêu cầu & Xử lý Bảo trì (Maintenance Request to Resolution)
```
Actor: Tenant, Property Manager, Vendor
1. Bồn rửa chén Unit 302 bị nghẹt nước tràn ra sàn. Tenant mở ứng dụng, chụp 1 video và 2 ảnh, chọn danh mục "Plumbing", mức độ "Urgent" và gửi Request.
2. PM nhận thông báo, xem xét thấy cần thợ can thiệp. PM duyệt Request và phát hành Work Order chuyển cho "Vendor Thợ Nước Tuấn Phát" với hạn mức dự toán $80.
3. Thợ nước nhận thông báo trên điện thoại, bấm ACCEPT và liên hệ Tenant hẹn có mặt lúc 14:00 cùng ngày.
4. 14:00, thợ đến xử lý thông nghẹt, phát hiện do đường ống cũ đọng dầu mỡ lâu năm (Lỗi hao mòn tự nhiên).
5. Thợ hoàn thành công việc, chụp ảnh bồn rửa đã thoát nước tốt, gửi hóa đơn thanh toán thực tế $75 lên hệ thống.
6. Tenant bấm xác nhận thợ đã làm xong và đánh giá 5 sao.
7. PM nghiệm thu từ xa, đóng Work Order, phê duyệt thanh toán chi phí $75 cho Vendor (ghi nhận trách nhiệm chi trả là Owner-expense).
```

### Journey F — Chuyển đi & Quyết toán Cọc (Move-out to Deposit Refund)
```
Actor: Tenant, Property Manager, Financial Auditor
1. Ngày 01/08/2027 (trước khi hết hạn hợp đồng 60 ngày), Tenant nộp thông báo không gia hạn và xin Move-out vào ngày 30/09/2027.
2. Ngày 30/09/2027, PM và Tenant thực hiện Move-out Inspection:
   - So sánh với bản Move-in: Chân tường xước cũ không bị phạt.
   - Phát hiện mới: Cánh cửa tủ lạnh bị móp sâu do va đập vật nặng (Tenant Damage).
   - Chốt chỉ số điện nước cuối cùng.
3. PM thu hồi toàn bộ chìa khóa, thẻ từ và đổi mã cửa ngay lập tức. Unit chuyển sang UNDER_MAINTENANCE.
4. PM lấy báo giá thợ gò sơn lại tủ lạnh: $100. Tiền điện nước kỳ cuối còn nợ: $50.
5. PM tạo dự thảo Deposit Settlement:
   - Tiền cọc giữ: $1,200.
   - Khấu trừ tủ lạnh: -$100.
   - Khấu trừ điện nước cuối kỳ: -$50.
   - Tiền thực trả lại Tenant: $1,050.
6. Gửi dự thảo cho Tenant, Tenant đồng ý và ký xác nhận.
7. Financial Auditor kiểm tra chứng từ, duyệt lệnh thanh toán ngân hàng chuyển $1,050 về tài khoản của Tenant.
8. Hợp đồng Lease chính thức chuyển sang CLOSED. Đợt dọn dẹp vệ sinh turnover hoàn tất, Unit 302 sẵn sàng quay lại trạng thái AVAILABLE.
```

---

## 23. Cross-Domain Dependencies & State Cascades

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   APPLICATION   │       │      LEASE      │       │  RENT SCHEDULE  │
│    (APPROVED)   │──────►│    (ACTIVE)     │──────►│   & INVOICES    │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      UNIT       │       │     MOVE-IN     │       │     PAYMENT     │
│   (RESERVED)    │       │   INSPECTION    │       │    (CLEARED)    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   MAINTENANCE   │
                          │   WORK ORDER    │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │    MOVE-OUT     │
                          │   INSPECTION    │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │     DEPOSIT     │       │      UNIT       │
                          │   SETTLEMENT    │──────►│  (AVAILABLE /   │
                          └────────┬────────┘       │   MAINTENANCE)  │
                                   │                └─────────────────┘
                                   ▼
                          ┌─────────────────┐
                          │  LEASE CLOSED   │
                          └─────────────────┘
```

1. **Application Approval $\rightarrow$ Unit State Cascade:** Khi Application được `APPROVED`, hệ thống tự động khóa Unit từ `AVAILABLE` sang `RESERVED`, đồng thời kích hoạt việc tạm dừng (`PAUSED`) Listing tương ứng.
2. **Lease Activation $\rightarrow$ Financial & Operational Cascades:** Khi Lease chuyển sang `ACTIVE`, hệ thống kích hoạt đồng thời 3 luồng:
   - Sinh toàn bộ bảng lịch trình hóa đơn (`Rent Schedule`) cho toàn bộ chu kỳ 12 tháng.
   - Đổi trạng thái Unit thành `OCCUPIED`.
   - Sinh lịch hẹn công việc `Move-in Inspection`.
3. **Move-out Completion $\rightarrow$ Deposit & Turnover Cascades:** Khi biên bản `Move-out Inspection` được ký, hệ thống kích hoạt:
   - Thu hồi toàn bộ quyền truy cập (Access Revocation).
   - Đẩy dữ liệu sai lệch hiện trạng sang bảng dự thảo `Deposit Settlement`.
   - Chuyển trạng thái Unit sang `UNDER_MAINTENANCE` để chuẩn bị dọn dẹp bàn giao đợt sau.
4. **Deposit Settlement Finalized $\rightarrow$ Lease Closure:** Chỉ khi bảng Settlement được giải ngân hoàn tất và không còn nợ tồn đọng, Lease mới được phép chuyển sang trạng thái cuối cùng là `CLOSED`.

---

## 24. Audit & Activity History (Truy vết nghiệp vụ)

Mọi biến động mang tính ràng buộc pháp lý, tài chính hoặc hiện trạng tài sản đều phải lưu trữ bất biến (Immutable Audit Trail) theo cấu trúc chuẩn:

$$\text{Audit Record} = \langle \text{Timestamp, ActorID, ActorRole, ActionType, EntityID, OldState, NewState, Reason/Justification, ClientIP} \rangle$$

### Các hành động bắt buộc ghi nhận lịch sử (Mandatory Audited Actions)
1. **Thay đổi trạng thái Hợp đồng (Lease Status Change):** Ghi rõ ai duyệt kích hoạt hoặc ai hủy hợp đồng, kèm lý do.
2. **Điều chỉnh tài chính (Financial Override):** Miễn giảm tiền phạt trễ hạn (`Late Fee Waived`), điều chỉnh giảm số dư hóa đơn, hoàn cọc vượt mức.
3. **Phê duyệt hồ sơ ứng viên (Application Decision):** Ghi vết điểm thẩm định, người bấm duyệt/từ chối, mã lý do từ chối.
4. **Phân bổ chi phí bảo trì (Maintenance Cost Attribution):** Ghi vết việc quyết định ai là người chịu chi phí (Owner hay Tenant) và người duyệt báo giá.
5. **Chỉnh sửa biên bản kiểm tra (Inspection Alteration):** Sau khi đã ký biên bản hiện trường, mọi hành vi thêm/bớt ảnh hoặc thay đổi mô tả hư hỏng đều bị nghiêm cấm hoặc phải ghi log cảnh báo kiểm toán cấp độ đỏ.

---

## 25. Dashboards & Real-Time Visibility

### 25.1. Property Owner Dashboard
- **Tỷ lệ lấp đầy danh mục (Portfolio Occupancy Rate):** $\% = \frac{\text{Số Unit Occupied}}{\text{Tổng số Unit sở hữu}} \times 100$.
- **Dòng tiền ròng tháng này (Net Cash Flow):** $\text{Doanh thu tiền thuê đã thu thực tế} - \text{Chi phí bảo trì thuộc Owner} - \text{Phí quản lý ủy quyền}$.
- **Công nợ tiền thuê quá hạn (Total Delinquent Rent):** Tổng tiền thuê mà khách của các căn hộ thuộc sở hữu đang nợ quá hạn.
- **Hợp đồng sắp hết hạn trong 90 ngày (Upcoming Expirations):** Danh sách các phòng sắp đến hạn hợp đồng để dự báo rủi ro phòng trống.

### 25.2. Property Manager Operational Dashboard
- **Phễu phòng trống (Vacancy Funnel):** Số Unit Available $\rightarrow$ Số Listing đang Published $\rightarrow$ Số Application đang chờ duyệt $\rightarrow$ Số Unit Reserved.
- **Điểm nóng bảo trì (Maintenance Hotspots):** Số lượng sự cố `EMERGENCY` đang xử lý, số Work Order trễ hạn SLA, danh sách thợ đang ở hiện trường.
- **Đôn đốc thu nợ (Collection Pipeline):** Danh sách các Invoice đang trong Grace Period, danh sách các phòng đã bị phạt trễ hạn cần gọi điện đôn đốc.
- **Lịch sự kiện vận hành trong ngày (Daily Action Queue):** Lịch Move-in hôm nay, lịch Move-out hôm nay, lịch dẫn khách xem nhà.

### 25.3. Tenant Portal Dashboard
- **Trạng thái kỳ tiền thuê tiếp theo:** Số tiền cần đóng, ngày Due Date, số ngày còn lại trong Grace Period, nút bấm chuyển khoản nhanh.
- **Yêu cầu bảo trì hiện hành:** Trạng thái xử lý của sự cố đã báo, thông tin thợ dự kiến đến sửa và giờ hẹn.
- **Thời hạn hợp đồng:** Số ngày còn lại của hợp đồng thuê, nút yêu cầu thông báo chuyển đi hoặc đề xuất gia hạn sớm.

---

## 26. Business Reports Catalog

| Báo cáo | Mục đích nghiệp vụ | Đối tượng tiếp nhận | Chiều phân tích (Dimensions) | Chỉ số chính (Metrics) | Quyết định kinh doanh hỗ trợ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Occupancy & Vacancy Report** | Đo lường hiệu suất khai thác diện tích mặt bằng. | Owner, BQL | Property, Loại phòng, Tháng | Occupancy %, Vacancy Days, Turnover Duration. | Điều chỉnh giá thuê niêm yết; tối ưu hóa tốc độ dọn phòng. |
| **Rent Roll & Collection Report** | Bảng kê chi tiết tiền thuê từng căn hộ theo kỳ. | Kế toán, Owner | Property, Unit, Tenant, Trạng thái thanh toán | Tiền thuê hợp đồng, Đã thu, Còn nợ, Phí phạt. | Nhận diện khách nợ dai dẳng để ra quyết định cưỡng chế trục xuất. |
| **Aged Receivables (Báo cáo Tuổi nợ)** | Phân loại các khoản nợ theo độ tuổi quá hạn. | BQL, Auditor | Khoảng tuổi: 1-30 ngày, 31-60 ngày, >90 ngày | Tổng nợ từng nhóm, Tỷ lệ nợ khó đòi. | Trích lập dự phòng nợ xấu; chuyển hồ sơ sang bộ phận pháp lý. |
| **Maintenance Cost & SLA Report** | Đánh giá chi phí bảo dưỡng và chất lượng thợ. | BQL, Owner | Hạng mục hỏng, Vendor, Cấp độ khẩn cấp | Tổng chi phí, Chi phí TB/căn, Thời gian hoàn thành TB, % Đạt SLA. | Thay thế thợ tay nghề kém; dự toán ngân sách bảo trì tòa nhà năm sau. |
| **Deposit Reconciliation Report** | Kiểm toán quỹ tiền cọc an ninh giữ hộ. | Kế toán, Auditor | Ngân hàng ký quỹ, Lease, Trạng thái cọc | Tổng cọc nhận, Tổng cọc đã hoàn, Cọc đang tranh chấp. | Đảm bảo an toàn thanh khoản quỹ ủy thác theo luật định. |

---

## 27. MVP Implementation Roadmap (Business Capability Driven)

```text
Phase 1: Foundation ──► Phase 2: Acquisition ──► Phase 3: Lease & Move-in
   (Prop, Unit, Roles)     (Listing, Application)   (Lease, Handover)
                                                           │
                                                           ▼
Phase 6: Visibility  ◄── Phase 5: Operations  ◄── Phase 4: Money & Escrow
   (Dashboard, Reports)    (Maintenance, Inspect)   (Rent, Invoice, Deposit)
```

### Giai đoạn 1: Nền tảng Bất động sản & Quản trị chủ thể (Property Foundation)
- **Mục tiêu:** Định hình cây cấu trúc dữ liệu không gian và hồ sơ pháp lý các bên.
- **Năng lực bàn giao:** Khởi tạo Owner, Property Manager, hồ sơ Property và danh mục Units. Thiết lập trạng thái phòng cơ bản (`AVAILABLE`, `UNAVAILABLE`).

### Giai đoạn 2: Tiếp thị & Thu hút khách thuê (Rental Acquisition)
- **Mục tiêu:** Đưa phòng ra thị trường và số hóa việc tiếp nhận thẩm định hồ sơ.
- **Năng lực bàn giao:** Tạo và xuất bản Listing; Cổng nộp đơn trực tuyến cho Applicant; Quy trình xét duyệt chấm điểm tài chính khách quan cho PM.

### Giai đoạn 3: Hợp đồng thuê & Nhận phòng (Lease & Move-in)
- **Mục tiêu:** Chuyển hóa hồ sơ được duyệt thành ràng buộc pháp lý và thực hiện bàn giao.
- **Năng lực bàn giao:** Soạn thảo Lease, cơ chế ký số, Move-in Checklist cơ bản, chuyển trạng thái Unit sang `OCCUPIED`.

### Giai đoạn 4: Dòng tiền & Quản lý Tiền cọc (Money & Escrow)
- **Mục tiêu:** Thu đúng, thu đủ và minh bạch hóa công nợ.
- **Năng lực bàn giao:** Động cơ sinh Rent Schedule tự động, xuất Invoice hàng tháng, quản lý Grace Period & Late Fee, tiếp nhận thanh toán cọc và hạch toán tài khoản ký quỹ.

### Giai đoạn 5: Vận hành Bảo trì & Thanh lý Trả phòng (Operations & Turnover)
- **Mục tiêu:** Khép kín vòng đời vận hành thực địa.
- **Năng lực bàn giao:** Cổng tiếp nhận Maintenance Request, phân quyền phát hành Work Order cho Vendor, Move-out Inspection và Bảng tính quyết toán cọc (Deposit Settlement).

### Giai đoạn 6: Giám sát, Đối soát & Báo cáo nâng cao (Visibility & Compliance)
- **Mục tiêu:** Cung cấp bức tranh toàn cảnh và bảo đảm tuân thủ kiểm toán.
- **Năng lực bàn giao:** Dashboards thời gian thực cho từng Actor, hệ thống 5 báo cáo tài chính/vận hành cốt lõi, cơ chế lưu vết Audit Log bất biến.

---

## 28. Future Feature Extensions

| Tính năng mở rộng | Giá trị nghiệp vụ mang lại | Phụ thuộc nghiệp vụ | Độ phức tạp |
| :--- | :--- | :--- | :---: |
| **Automated Lease Renewal** | Tự động hóa gửi đề xuất gia hạn dựa trên thuật toán giá thị trường linh hoạt. | Lease Domain, Market Index Data | Medium |
| **Direct Debit / Auto-pay** | Tự động trừ tiền từ tài khoản ngân hàng Tenant khi đến hạn để triệt tiêu nợ quá hạn. | Payment Domain, Banking Gateways | High |
| **IoT Smart Lock Integration** | Tự động sinh mã PIN cửa vào ngày Move-in và vô hiệu hóa mã đúng giờ Move-out. | Move-in/Move-out, Vendor Domain | High |
| **Tenant Scoring AI** | Dự báo xác suất rủi ro bùng tiền thuê dựa trên hồ sơ quá khứ và mô hình rủi ro tín dụng. | Application Domain | High |
| **Vendor Marketplace & Bidding**| Đấu thầu báo giá tự động giữa nhiều Vendor cho các sự cố bảo trì lớn. | Maintenance Domain | Medium |

---

## 29. Domain Complexity & Criticality Map

| Domain | Độ phức tạp nghiệp vụ (Complexity) | Tầm quan trọng (Criticality) | Phụ thuộc chính (Dependencies) | Thách thức nghiệp vụ cốt lõi |
| :--- | :---: | :---: | :--- | :--- |
| **Property & Unit** | Medium | Critical | Nền tảng gốc | Quản lý đúng trạng thái phòng thực tế vs trên giấy tờ. |
| **Listing** | Low | Medium | Unit | Đồng bộ tức thời tránh dẫn khách xem phòng đã chốt. |
| **Application** | Medium | High | Listing, Tenant | Tiêu chí xét duyệt công bằng, bảo mật dữ liệu định danh. |
| **Lease** | **Very High** | **Critical** | Application, Unit | Ràng buộc pháp lý, quản lý điều khoản ngoại lệ, thời điểm kích hoạt. |
| **Rent & Invoice** | High | **Critical** | Lease | Xử lý ngày ân hạn, tính phạt trễ hạn, cấn trừ thanh toán thiếu/dư. |
| **Payment & Billing** | High | **Critical** | Invoice | Đối soát dòng tiền ngân hàng, chống gạch nợ khống. |
| **Security Deposit** | **Very High** | **Critical** | Lease, Inspection, Rent | Phân định hao mòn vs hư hại, xử lý khiếu nại cọc minh bạch. |
| **Maintenance** | High | High | Unit, Lease, Vendor | Kiểm soát gian lận giá của Vendor; phân định trách nhiệm chi trả. |
| **Inspection** | Medium | High | Lease, Unit | Tính đối chứng khách quan giữa 2 thời điểm bàn giao bằng chứng cứ ảnh. |
| **Move-in / Move-out**| High | High | Lease, Inspection, Deposit | Điều phối đúng thời gian thực địa và thu hồi quyền truy cập an ninh. |

---

## 30. Master End-to-End Business Map

```text
PROPERTY OWNER
  │
  └── (Ủy quyền vận hành)
        │
        ▼
  PROPERTY MANAGEMENT ORGANIZATION
        │
        ├── PROPERTY (Khối nhà, Địa chỉ pháp lý)
        │     │
        │     └── UNIT (Căn hộ độc lập)
        │           │
        │           ├── [Trạng thái: AVAILABLE]
        │           │     │
        │           │     └── LISTING (Tiếp thị, Chào thuê)
        │           │           │
        │           │           └── TENANT APPLICATION (Nộp hồ sơ thẩm định)
        │           │                 │
        │           │                 ├── Đạt chuẩn tín dụng & thu nhập (Approved)
        │           │                 │
        │           │                 ▼
        │           │           [Trạng thái: RESERVED]
        │           │                 │
        │           │                 └── LEASE (Soạn thảo & Ký kết hợp đồng)
        │           │                       │
        │           │                       ├── Thu đủ cọc (Security Deposit)
        │           │                       ├── Thu đủ tiền kỳ đầu (First Rent)
        │           │                       │
        │           │                       ▼
        │           ├── [Trạng thái: OCCUPIED] ◄── LEASE ACTIVE
        │           │     │
        │           │     ├── MOVE-IN INSPECTION (Biên bản hiện trạng ban đầu, Giao chìa khóa)
        │           │     │
        │           │     ├── RENT SCHEDULE (Lịch hóa đơn hàng tháng)
        │           │     │     │
        │           │     │     └── INVOICES ──► PAYMENTS (Thu nợ, Phạt trễ hạn nếu có)
        │           │     │
        │           │     └── MAINTENANCE REQUEST (Báo sự cố hư hỏng)
        │           │           │
        │           │           └── WORK ORDER ──► VENDOR (Khảo sát, Sửa chữa, Nghiệm thu)
        │           │
        │           └── [Trạng thái: UNDER_MAINTENANCE] ◄── MOVE-OUT NOTICE (Báo chuyển đi)
        │                 │
        │                 ├── MOVE-OUT INSPECTION (Đối chiếu hư hại so với ban đầu, Thu hồi chìa)
        │                 │
        │                 └── DEPOSIT SETTLEMENT (Quyết toán: Cọc - Hư hại - Nợ tiền thuê)
        │                       │
        │                       ├── Hoàn trả phần cọc còn lại / Thu thêm phần thâm hụt
        │                       │
        │                       └── LEASE CLOSED (Hợp đồng đóng vĩnh viễn)
        │                             │
        │                             └── Chuẩn bị phòng (Turnover Cleaning)
        │                                   │
        │                                   └── Unit quay lại [AVAILABLE]
        │
        └── AUDIT HISTORY & EXECUTIVE REPORTING (Doanh thu, Tỷ lệ lấp đầy, Dòng tiền)
```

### Diễn giải dòng chảy kinh doanh tổng thể:
Toàn bộ hoạt động kinh doanh cho thuê bất động sản là một cỗ máy trạng thái tuần hoàn liên tục:
1. **Khởi tạo & Tiếp thị:** Khởi đầu bằng tài sản vật lý của **Owner**, được chia nhỏ thành các **Unit** độc lập do **Property Manager** quản lý. Khi Unit trống (`AVAILABLE`), nó được đẩy ra thị trường qua **Listing** để đón nhận **Tenant Application**.
2. **Chọn lọc & Ký kết:** Ứng viên trải qua quy trình chấm điểm năng lực tài chính khách quan. Ứng viên vượt qua kỳ thẩm định sẽ làm chuyển đổi Unit sang trạng thái giữ chỗ (`RESERVED`), tiến tới ký kết văn bản pháp lý **Lease**.
3. **Kích hoạt & Vận hành thực địa:** Hợp đồng chỉ chính thức có hiệu lực (`ACTIVE`) khi tiền cọc bảo đảm và tiền thuê đầu kỳ đã vào tài khoản ủy thác an toàn. Ngày vào ở (`Move-in`), biên bản hiện trạng ban đầu được chốt làm thước đo cơ sở, chìa khóa trao tay và Unit chính thức có người ở (`OCCUPIED`).
4. **Vận hành định kỳ:** Suốt chu kỳ hợp đồng, hệ thống vận hành hai cỗ máy song song: cỗ máy dòng tiền (phát hành hóa đơn định kỳ, kiểm soát thời gian ân hạn, áp phạt trễ hạn) và cỗ máy bảo trì (tiếp nhận báo hỏng từ Tenant, phát lệnh Work Order cho Vendor, kiểm soát ngân sách theo hạn mức).
5. **Thanh lý & Tái sinh chu kỳ:** Khi đến hạn kết thúc hoặc có thông báo chuyển đi, căn hộ trải qua đợt kiểm tra trả phòng (`Move-out Inspection`). Khoản chênh lệch hư hại thực tế ngoài hao mòn tự nhiên sẽ được đưa vào bảng quyết toán cọc (`Deposit Settlement`). Sau khi cọc được thanh toán đối trừ sòng phẳng, hợp đồng đóng lại vĩnh viễn (`CLOSED`), căn hộ được đưa vào bảo dưỡng dọn dẹp cấp tốc (`Turnover`) để tái sinh trở lại trạng thái sẵn sàng cho thuê (`AVAILABLE`), bắt đầu một vòng đời kinh doanh mới.

---

## 31. Definition of Business Complete

Một tính năng, quy trình hoặc hành động trong hệ thống Property Rental Management chỉ được công nhận là **Business Complete** khi thỏa mãn đầy đủ 12 tiêu chuẩn sau:

```
[✓] ACTOR IDENTIFIED:
    Xác định tường minh ai là người thực hiện hành động, ai là người thụ hưởng và ai là người giám sát.

[✓] BUSINESS OBJECT SCOPED:
    Xác định rõ ràng thực thể nào bị tác động, thuộc quyền sở hữu của ai, phạm vi dữ liệu (Scope) tới đâu.

[✓] LIFECYCLE ALIGNED:
    Thực thể phải nằm trong một vòng đời cụ thể, có trạng thái bắt đầu và trạng thái kết thúc xác định.

[✓] STATE TRANSITION VALIDATED:
    Mô tả chính xác trạng thái nguồn (Current State), hành động kích hoạt (Action), trạng thái đích (Next State) và chỉ rõ các bước nhảy bất hợp lệ (Invalid Transitions).

[✓] BUSINESS RULES ENFORCED:
    Mọi điều kiện nghiệp vụ ràng buộc (Pre-conditions, Validations, Approvals) phải được định nghĩa rõ ràng kèm mã lỗi/hậu quả khi vi phạm.

[✓] PERMISSION & SCOPING SECURED:
    Xác thực quyền hạn theo vai trò (RBAC) kết hợp với ranh giới sở hữu (ví dụ: Manager chỉ quản lý Property được phân công; Tenant chỉ xem dữ liệu của mình).

[✓] INVARIANTS PROTECTED:
    Đảm bảo 100% không bao giờ phá vỡ các bất biến nghiệp vụ tối cao (ví dụ: cấm 2 Active Leases trên 1 Unit, cấm hoàn cọc khi chưa có Settlement).

[✓] EXCEPTIONS & EDGE CASES ADDRESSED:
    Quy định rõ phương án xử lý khi xảy ra bất thường (khách bỏ trốn, sự cố khẩn cấp nửa đêm, tranh chấp tiền cọc).

[✓] SIDE EFFECTS SPECIFIED:
    Liệt kê đầy đủ mọi hiệu ứng phụ lan tỏa sang các domain khác (ví dụ: Duyệt đơn $\rightarrow$ Khóa Unit $\rightarrow$ Pause Listing).

[✓] AUDIT TRAIL LOGGED:
    Ghi nhận đầy đủ dấu vết bất biến: Ai làm gì, lúc nào, từ giá trị nào sang giá trị nào, với lý do nghiệp vụ là gì.

[✓] NOTIFICATION DISPATCHED:
    Phát tín hiệu thông báo kịp thời đến đúng đối tượng thụ hưởng qua đúng kênh giao tiếp phù hợp.

[✓] FINANCIAL & REPORTING IMPACT MEASURED:
    Hành động phản ánh chính xác vào các chỉ số thời gian thực trên Dashboard và các báo cáo định kỳ liên quan.
```

---
*Tài liệu này là đặc tả nghiệp vụ chuẩn mực nền tảng (Domain Specification Baseline), sẵn sàng chuyển giao cho giai đoạn System Architecture, Domain-Driven Design (Bounded Contexts, Aggregates, Domain Events) và triển khai kỹ thuật.*
