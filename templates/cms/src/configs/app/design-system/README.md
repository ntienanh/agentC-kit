# Modern Slate Design System

## Overview

The CMS uses a token-based design system built on CSS custom properties, Tailwind utilities, and Ant Design component tokens. `modern` is the default theme; existing `light`, `dark`, and `claude` theme IDs remain supported for stored user preferences.

## Design Direction

- Neutral colors occupy most of the interface.
- `#4F6EF7` is the single primary accent for actions, links, and active states.
- Borders and spacing provide structure before shadows.
- Cards use soft elevation, `18px` radii, and `20px–24px` internal spacing.
- Inputs and buttons use `12px` radii with a `40px` default height.
- Typography uses a compact sans-serif hierarchy optimized for long CMS sessions.

## Core Palette

| Role                | Value     |
| ------------------- | --------- |
| Primary interaction | `#4561E5` |
| Primary hover       | `#4B68F0` |
| Brand reference     | `#4F6EF7` |
| Background          | `#F6F8FB` |
| Surface             | `#FFFFFF` |
| Border              | `#D6DEE9` |
| Divider             | `#E3E8F0` |
| Heading             | `#111827` |
| Text                | `#374151` |
| Secondary text      | `#6B7280` |
| Success foreground  | `#15803D` |
| Warning foreground  | `#B45309` |
| Error foreground    | `#B91C1C` |
| Info foreground     | `#0369A1` |

Primitive colors live in `src/shared/styles/palette.ts`. Semantic mappings for every theme live in `theme.config.ts`.

The brighter reference colors from the supplied palette remain in `modernSlatePalette` for charts and decorative accents. Runtime interaction and status foregrounds use slightly darker shades so normal text, selected navigation, tags, and solid buttons meet a minimum `4.5:1` contrast ratio.

## Semantic Tokens

Use semantic utilities instead of hardcoded product colors:

```tsx
<section className='bg-background text-foreground'>
  <h1 className='text-heading'>Dashboard</h1>
  <div className='border-border bg-card shadow-card rounded-lg border' />
  <div className='border-divider border-t' />
</section>
```

Important tokens include:

- `background`, `card`, `popover`
- `foreground`, `heading`, `mutedForeground`, `textSubtle`
- `primary`, `primaryHover`, `accent`
- `border`, `divider`, `input`, `focus`
- `success`, `warning`, `error`, `info` and their soft backgrounds

## Typography

The typography system follows Modern Slate's compact sans-serif hierarchy:

| Role            | Utility                            | Size / weight / leading            | Typical use                  |
| --------------- | ---------------------------------- | ---------------------------------- | ---------------------------- |
| Display         | `text-4xl font-bold leading-tight` | 32 / 700 / 1.25                    | Rare marketing or hero title |
| Page title      | `AppPageHeader`                    | 28 desktop, 24 mobile / 700 / 1.25 | One `h1` per page            |
| Section heading | `heading-2`                        | 24 / 600 / 1.25                    | Major content section        |
| Card heading    | `heading-3`                        | 20 / 600 / 1.25                    | Card or panel title          |
| Label           | `label`                            | 14 / 500 / 1.5                     | Form labels and controls     |
| Body            | `body-sm`                          | 14 / 400 / 1.5                     | Standard CMS copy            |
| Compact body    | `body-compact`                     | 13 / 400 / 1.5                     | Supporting metadata          |
| Caption         | `caption`                          | 12 / 400 / 1.5                     | Non-critical supporting copy |
| Eyebrow         | `eyebrow`                          | 12 / 500 / 1.5                     | Uppercase contextual label   |
| KPI             | `metric-label`, `metric-value`     | 13 / 500 and 28 / 700              | Summary cards and metrics    |

- Use `font-medium` for labels, controls, table headers, and tags; reserve `font-semibold` for headings and `font-bold` for page titles, KPI values, or deliberate emphasis.
- Keep body copy at `leading-normal` (`1.5`) and long-form content at `leading-relaxed` (`1.625`). Only headings and dense metadata should use `leading-tight`.
- Avoid arbitrary `text-[8px]`–`text-[11px]` classes for essential content. Existing compact metadata remains a planned migration area; new interactive labels must use a documented role.
- See [`docs/design-system/typography.md`](../../../../docs/design-system/typography.md) for the full standard and audit notes.

## Theme Presets

1. **Modern Slate** — default premium CMS theme.
2. **Slate Light** — compatible light theme using the same neutral-first palette.
3. **Dark** — low-light Modern Slate variant.
4. **Claude Legacy** — retained for previously persisted preferences.

```tsx
import { useThemeStore } from '@/shared/stores';

function ThemeAction() {
  const { setMode } = useThemeStore();

  return <button onClick={() => setMode('modern')}>Use Modern Slate</button>;
}
```

## Component Guidance

- Use `AppCard`, `AppButton`, and `AppTable` instead of recreating shared primitives.
- Keep the shared layout contract: `AppCard` defaults to 24px padding (`sm` is 16px for dense KPI cards), controls are 40px high, and `AppTable` rows target 48–56px.
- Use one primary button per action group; secondary actions should use default or text buttons.
- Use semantic badge/icon backgrounds instead of tinting entire table rows.
- Keep page content within `1200px–1600px`; form workflows should target `720px–960px`.
- Prefer `gap-4`, `gap-5`, or `gap-6` for card grids and major sections.
- Avoid strong gradients, heavy shadows, and hardcoded palette values in feature components.

## Architecture

- `tokens.manifest.json` defines semantic token names and primitive scales.
- `tokens.config.ts` exposes typed token helpers.
- `theme.config.ts` maps semantic tokens to each theme.
- `ThemeCssVars.tsx` emits SSR-safe CSS variables.
- `AntdConfigProvider.tsx` maps the same tokens to Ant Design.
- `generated-theme-inline.css` exposes semantic Tailwind utilities.

## Adding Colors

Before adding a hardcoded color to feature code:

1. Check whether an existing semantic token matches the intent.
2. Add a primitive to `modernSlatePalette` only when the color is reusable.
3. Add a semantic entry to `tokens.manifest.json` when the role is distinct.
4. Map the token in every theme in `theme.config.ts`.
5. Expose the Tailwind variable in `generated-theme-inline.css`.
6. Run `npm run color:check`, `npm run typecheck`, and the relevant UI tests.
