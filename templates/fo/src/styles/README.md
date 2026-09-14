# Front-Office Design System

## Overview

The Front-Office design system is built on **Tailwind CSS v4 CSS-First Architecture**, **OKLCH High-Fidelity Color Space**, and a **4-Tier Mobile-First Breakpoint Engine**. It embodies a modern, responsive **Enterprise SaaS** aesthetic.

---

## 1. 4-Tier Breakpoint Architecture

| Tier | Width Range | Tailwind Modifier | Ergonomics & Target Devices |
| :--- | :--- | :--- | :--- |
| **Mobile** | `< 768px` | `(default / base)` | iPhone 13-16, Samsung Galaxy, Pixel |
| **Tablet** | `768px – 1023px` | `md:` (`48rem` / 768px) | iPad Mini, iPad Air, iPad Pro 11" Portrait |
| **Desktop** | `1024px – 1439px` | `lg:` (`64rem` / 1024px) | MacBook Air/Pro 13"-14", Laptops 1080p |
| **Large Desktop** | `≥ 1440px` | `xl:` (`90rem` / 1440px) | 2K / 4K External Monitors |
| **Ultra-wide** | `≥ 1600px` | `2xl:` (`100rem` / 1600px) | Ultra-wide displays |

---

## 2. Core Color Palettes

### Primary Scales ([`palette.ts`](./palette.ts))
- **`accent`** (Terracotta Copper): `#99583E` (500), `#844731` (600 Press) — Primary CTA buttons, interactive links, brand accents.
- **`sand`** (Linen / Warm Neutral): `#FAF6F0` (100) — Main page canvas and card surfaces.
- **`espresso`** (Charcoal Luxury): `#2B241F` (900), `#6A615A` (500) — High-contrast typography and subtle borders.
- **`sage`** (Botanical Matcha): `#609062` (500) — Organic ingredients, nature highlights.
- **`roseDust`** (Zen Cherry Blossom): `#D77A74` (500) — Subtle romantic and floral accents.

### OKLCH Japanese Zen Sanctuary Tokens
- `sanctuaryBg`: `oklch(0.185 0.015 75)`
- `sanctuaryCard`: `oklch(0.24 0.025 70)`
- `sanctuaryGold`: `oklch(0.785 0.115 82)`
- `sanctuaryRose`: `oklch(0.88 0.045 45)`

---

## 3. Typography Hierarchy Matrix ([`typography.ts`](./typography.ts))

| Role | Tailwind Classes | Mobile | Tablet (`md:`) | Desktop (`lg:`) |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `font-display font-bold tracking-tight leading-[1.05]` | `text-3xl` | `md:text-5xl` | `lg:text-6xl xl:text-7xl` |
| **Section Heading** | `font-display font-light leading-tight tracking-tight` | `text-2xl` | `md:text-4xl` | `lg:text-5xl` |
| **Card Title** | `font-display font-bold text-foreground` | `text-lg` | `md:text-xl` | `md:text-xl` |
| **Accent Eyebrow** | `font-mono font-bold uppercase tracking-[0.2em] text-accent` | `text-[10px]` | `md:text-xs` | `md:text-xs` |
| **Body Copy** | `text-muted-foreground leading-relaxed` | `text-xs` | `md:text-sm` | `md:text-sm` |

---

## 4. Spacing & Rhythm Tokens ([`spacing.ts`](./spacing.ts))

- **Page Container (`container-premium`)**: `max-w-[1440px] px-5 md:px-8 lg:px-12 xl:px-16 mx-auto`
- **Section Spacing (`section-spacing`)**: `py-14 md:py-20 lg:py-24 xl:py-28`
- **Compact Section (`section-spacing-sm`)**: `py-8 md:py-11 lg:py-14 xl:py-16`

---

## 5. CSS Modules Architecture

1. [`design-system.css`](./design-system.css): Container & Layout utility tokens.
2. [`animations.css`](./animations.css): Ambient spa keyframes (`marquee`, `drift`, `rose-drift`, `squiggle`, `spin-around`) & WCAG reduced-motion rules.
3. [`utilities.css`](./utilities.css): Glassmorphic cards, solid dropdown overlays, selection & autofill styles.
4. [`globals.css`](../app/globals.css): CSS entrypoint with Tailwind v4 `@theme inline`.

---

## 6. Automated Quality Checks

Run all Design System verification suites:
```bash
npm --prefix front-page run test -- src/styles/
```
- **`palette.spec.ts`**: Color scales and token completeness.
- **`design-system.spec.ts`**: Breakpoint definitions, container bounds, manifest integrity.
- **`theme-contrast.spec.ts`**: WCAG 2.2 AA Contrast Ratio verification ($\ge 4.5:1$ for body, $\ge 3:1$ for large text).
