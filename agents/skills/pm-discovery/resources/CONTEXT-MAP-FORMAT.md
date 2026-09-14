# Canonical CONTEXT-MAP.md Format

Áp dụng cho các dự án đa domain (Multi-Domain Repositories) có nhiều Bounded Contexts độc lập (như Auth, Player, Billing, Casino, Sport, KYC, Rewards...).

Tệp `CONTEXT-MAP.md` đặt tại **thư mục gốc (root)** của repository, làm mục lục điều hướng và mô tả quan hệ liên kết giữa các domain.

---

## Cấu Trúc Chuẩn

```markdown
# Context Map

Bản đồ liên kết các Bounded Contexts trong hệ thống.

## Bounded Contexts

- **[Player](./docs/domains/player/CONTEXT.md)**: Quản lý hồ sơ người chơi, xác thực định danh (KYC) và bảo mật tài khoản.
- **[Payment](./docs/domains/payment/CONTEXT.md)**: Xử lý nạp/rút tiền, liên kết cổng thanh toán và đối soát số dư ví.
- **[Casino](./docs/domains/casino/CONTEXT.md)**: Tích hợp sảnh game, điều phối phiên cược (game sessions) và lịch sử ván chơi.
- **[Rewards](./docs/domains/rewards/CONTEXT.md)**: Quản lý chương trình khuyến mãi, vòng quay miễn phí và điều kiện doanh thu cược (turnover).

## Domain Relationships

- **Player → Payment**: Player phát sinh sự kiện `PlayerVerifiedEvent`; Payment cho phép mở khóa hạn mức nạp/rút cấp độ 2.
- **Casino → Payment**: Casino phát sinh sự kiện `BetSettledEvent`; Payment thực hiện ghi có/ghi nợ vào ví chính.
- **Rewards → Casino**: Rewards cấp phát vé quay thưởng `FreeSpinIssuedEvent`; Casino ghi nhận quyền chơi miễn phí trên game chỉ định.
- **Shared Kernel**: Định nghĩa kiểu dữ liệu dùng chung `@repo/contracts` cho `Money`, `CurrencyCode`, `TenantId`.
```
