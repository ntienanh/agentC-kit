# Shared Architecture

`src/shared` chứa foundation code dùng chung cho nhiều features và app shell. Đây là nơi đặt infrastructure, generic UI, providers, hooks, constants, utilities và cross-cutting concerns.

## Mục tiêu

- Cung cấp building blocks ổn định cho `src/app`, `src/layouts`, và `src/features`.
- Giữ shared code không phụ thuộc vào business feature cụ thể.
- Tránh duplicate logic nền tảng như HTTP, RBAC, error handling, theme, i18n, providers.
- Giữ API dùng chung có boundary rõ ràng qua `index.ts` ở từng module.

## Cấu trúc hiện tại

```text
src/shared/
├── components/       # Components dùng chung nếu không thuộc design section/ui cụ thể
├── constants/        # HTTP constants, shared cache tags/keys, permission constants
├── hooks/            # Generic hooks theo nhóm data/error/navigation/permissions/ui
├── i18n/             # next-intl routing, message loading, navigation helpers
├── lib/              # Infrastructure: HTTP, error, validation, cookies, config, logging
├── models/           # Base/shared TypeScript models
├── providers/        # App-level providers: QueryClient, theme, antd, breadcrumb, error
├── rbac/             # Permission model, guards, hooks, query protection
├── sections/         # Reusable page sections/pattern components
├── stores/           # Global Zustand stores
├── styles/           # Global CSS, generated theme CSS, typography/spacing utilities
├── themes/           # Theme config/switcher/demo
├── ui/               # Low-level reusable UI primitives
├── utils/            # Generic pure utilities
└── README.md
```

## Dependency Direction

Shared là layer nền tảng nên dependency direction phải đi một chiều:

```text
src/app + src/layouts + src/features
                ↓
             src/shared
```

Rules:

- `src/shared` không import từ `src/features`.
- `src/shared` không chứa business-specific assumptions của một feature.
- Feature có thể import shared hooks/libs/ui.
- Nếu shared cần behavior khác nhau theo feature, truyền config/callback thay vì import feature code.

## Module Guide

### `constants/`

Dùng cho constants thật sự cross-feature:

- HTTP methods/status/config constants.
- Shared cache tags/keys.
- Permission action constants nếu dùng bởi nhiều feature.

Không đặt endpoint hoặc query key của feature ở đây nếu chỉ feature đó dùng.

### `hooks/`

Chứa generic hooks theo nhóm:

```text
hooks/
├── data/          # debounce, default options, query select helpers
├── error/         # global error handling hooks
├── navigation/    # router/breadcrumb helpers
├── permissions/   # permission hooks legacy/compat layer
└── ui/            # message, notification, responsive hooks
```

Nếu hook biết về domain như `user`, `media`, `role`, hãy đặt trong feature tương ứng.

### `lib/`

Chứa infrastructure code:

- `http/`: client/server fetcher, auth header, response adapter, query builder.
- `error/` và `error-handler/`: app error model, mapping, recovery, logger.
- `validation/`: generic validation utilities/schemas.
- `cookie-manager/`, `cookies.server.ts`, `cookies.util.ts`: cookie helpers.
- `config.ts`: shared app timing/config constants như `STALE_TIME`.

`lib` không nên render UI và không nên phụ thuộc React trừ khi module đó được thiết kế rõ là client helper.

### `providers/`

App-level providers được compose trong app/layout shell:

- `QueryClientWrapperProvider` cho TanStack Query.
- `AntdConfigProvider` cho Ant Design config/theme bridge.
- `ThemeProvider` và `ThemeCssVars` cho theme state/CSS variables.
- `BreadcrumbProvider`, `NavigationLoadingProvider`, `ErrorContext` cho shell behavior.

Provider nên giữ trách nhiệm rõ, tránh nhồi business flow của feature vào đây.

### `rbac/`

Nguồn chính cho permission checks:

- `permissionKey()` để build permission string chuẩn.
- Permission constants/subjects/actions.
- Guard components và hooks như `usePermissions`, `useProtectedQuery`, `useCan`.
- Ability compatibility layer nếu cần CASL-style checks.

Feature nên dùng RBAC shared thay vì tự parse permission string rải rác.

### `sections/`

Reusable page-level patterns, lớn hơn UI primitive:

- `breadcrumb`, `not-found`.

Nếu component chứa business wording/data riêng của feature, đặt ở `features/[feature]/components`.

### `ui/`

Low-level UI primitives có thể dùng ở nhiều nơi:

- Button wrappers.
- Query-aware select.
- Generic upload UI.
- Card primitives, including `AppCard` and `AppSummaryCard`; see `ui/card/README.md` for usage rules.

UI primitive nên nhận props/config, không tự gọi API feature cụ thể.

### `stores/`

Global Zustand stores:

- `user.store.ts` cho authenticated user state dùng xuyên app.
- `theme.store.ts` cho theme state.

State chỉ phục vụ một feature nên đặt trong `features/[feature]/stores`.

### `utils/`

Pure utilities không phụ thuộc React và không chứa business side-effect:

- `cn.util.ts` cho class name merge.
- `date.util.ts`, `dayjs.util.ts` cho date helpers.
- `string.util.ts`, `regex.util.ts`, `valid.util.ts` cho formatting/validation helpers.
- `media.util.ts`, `theme.util.ts` cho helper generic tương ứng.

## Public API Rules

Ưu tiên import từ barrel file gần nhất:

```ts
import { clientFetcher } from '@/shared/lib/http';
import { useAppRouter } from '@/shared/hooks';
import { permissionKey, useProtectedQuery } from '@/shared/rbac';
```

## Component API Design Guide (Vercel Composition Patterns)

Khi thiết kế UI primitives (`src/shared/ui/`) hoặc composite components:

1. **Avoid Boolean Prop Proliferation**: Không lạm dụng cờ boolean (`hasIcon`, `isCompact`, `showFooter`, `withBorder`). Mỗi cờ boolean nhân đôi số trạng thái ($2^n$). Thay thế bằng Composition hoặc Explicit Variants.
2. **Compound Components with Shared Context**: Tổ chức component đa phần (Card, Modal, Dialog, Sheet, Table) theo dạng Compound Components chia sẻ Context nội bộ:
   ```tsx
   <Card>
     <Card.Header>
       <Card.Title>{title}</Card.Title>
     </Card.Header>
     <Card.Body>{children}</Card.Body>
     <Card.Footer>
       <Button variant="primary">{actionLabel}</Button>
     </Card.Footer>
   </Card>
   ```
3. **Children over Render Props**: Ưu tiên slot `children` để consumer kiểm soát layout và DOM tree thay vì truyền `renderX` props (`renderHeader`, `renderActions`).
4. **Explicit Variants**: Tạo các biến thể rõ ràng (`variant="outline" | "ghost" | "solid"`) hoặc tách subcomponents thay vì lồng ghép nhiều cờ boolean cấu hình.

## Khi Nào Đưa Code Vào Shared

Đưa vào `src/shared` khi code:

- Được dùng bởi ít nhất 2 features hoặc app shell.
- Không phụ thuộc business domain cụ thể.
- Có API generic và ổn định.
- Có thể test/hiểu độc lập với feature.

Giữ trong feature khi code:

- Chỉ phục vụ một business domain.
- Biết endpoint, model, query key, permission, hoặc copywriting riêng của feature.
- Có khả năng thay đổi theo requirement của feature đó.

## Checklist Khi Thêm Shared Module

1. Xác nhận logic thật sự cross-feature.
2. Đặt vào đúng nhóm: `hooks`, `lib`, `ui`, `sections`, `utils`, `providers`, hoặc `rbac`.
3. Export qua `index.ts` gần nhất nếu muốn public API.
4. Không import từ `src/features`.
5. Viết API generic bằng props/config/callback.
6. Cập nhật README hoặc docs module con nếu behavior quan trọng.
7. Chạy check nhỏ nhất có ý nghĩa sau khi thay đổi.
