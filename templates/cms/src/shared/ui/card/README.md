# Summary Card

`AppSummaryCard` là component dùng chung cho các chỉ số tóm tắt ở đầu page quản trị.

## Khi nào dùng

Dùng `AppSummaryCard` khi mỗi card biểu diễn:

- Một KPI hoặc một số đếm chính.
- Một nhãn ngắn, một giá trị nổi bật và một mô tả bổ trợ.
- Trạng thái tổng quan của một page hoặc một workspace.
- Dữ liệu có thể hiển thị độc lập và không cần thao tác trực tiếp trên card.

Nên đặt các card trong một `section` có `aria-label`, dùng grid responsive và giữ khoảng `2–4` card trong cùng một nhóm summary.

## Khi không dùng

- Không dùng cho bảng dữ liệu, biểu đồ hoặc nội dung chi tiết nhiều dòng.
- Không nhúng filter, form hoặc action chính vào card.
- Không dùng để hiển thị nhiều metric ngang hàng trong cùng một card.
- Nếu card cần click để mở detail, dùng `AppCard` và thêm interaction pattern riêng thay vì biến `AppSummaryCard` thành card link.

## API

```tsx
import { AppSummaryCard } from '@/shared/ui/card/AppSummaryCard';
import { CalendarDays } from 'lucide-react';

<section aria-label='Workspace overview' className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
  <AppSummaryCard
    icon={CalendarDays}
    label='Samples'
    value={String(totalSamples)}
    description='Sample records in the current workspace.'
    tone='primary'
    loading={isLoading}
  />
</section>;
```

### Props

- `icon`: icon Lucide đại diện cho metric.
- `label`: nhãn ngắn, viết theo sentence case.
- `value`: giá trị chính, nên format trước khi truyền vào component.
- `description`: mô tả ngắn, không nên dài hơn một dòng.
- `tone`: `primary`, `info`, `success`, `warning` hoặc `error`; chỉ dùng để thể hiện ngữ nghĩa.
- `loading`: hiển thị skeleton khi dữ liệu đang tải.
- `className`: chỉ dùng cho layout đặc thù của page, không override visual contract chung.

## Quy ước visual

- Giá trị dùng `tabular-nums` để các số trong cùng một grid dễ so sánh.
- Icon là decorative và không thay thế cho text label.
- Card không tự gọi API, không biết business domain và không chứa copy phụ thuộc feature.
- Dùng design token hiện có cho màu (`text-primary`, `text-info`, `text-success`, `text-warning`, `text-error`).

## Compatibility

`AppMetricCard` vẫn được export như alias tương thích cho các page cũ. Code mới phải dùng `AppSummaryCard`; khi chỉnh từng page, có thể đổi import và JSX sang tên canonical mà không cần thay đổi props.
