# ProductLobby Brand Style Guide

**Version:** 1.0
**Last Updated:** February 2026
**Owner:** Sophie (amy@categoryleaders.co.uk)

---

## 1. Brand Overview

ProductLobby is a consumer platform where people pitch product ideas, rally community support ("Lobby for this!"), and brands respond. The brand should feel warm, accessible, and community-driven — never corporate or enterprise.

**Brand personality:** Friendly, empowering, optimistic, community-first.
**Tone of voice:** Encouraging, conversational, never patronising. We speak as peers, not authorities.

---

## 2. Logo

### 2.1 Primary Logo (E1-B)

The ProductLobby logo consists of two elements: the **icon** (people + speech bubble + upvote arrow) and the **wordmark** (productlobby in Baloo 2).

The icon represents three people united under a shared voice (speech bubble), with the lime upvote arrow symbolising collective action and support.

**Locked values:**
- Font: Baloo 2
- Letter spacing: Tight (-0.06em)
- "product" weight: 700
- "lobby" weight: 800
- Gap between icon and wordmark: 8% of font size (minimum 3px)

### 2.2 Logo Variants

| File | Use case |
|------|----------|
| `logo/productlobby-logo-full-colour.svg` | Primary — light backgrounds |
| `logo/productlobby-logo-full-white.svg` | Dark backgrounds, overlays |
| `logo/productlobby-logo-full-mono-dark.svg` | Print, fax, watermarks |
| `icon/productlobby-icon-colour.svg` | App icon, avatar, standalone |
| `icon/productlobby-icon-white.svg` | Dark background icon |
| `icon/productlobby-icon-mono-dark.svg` | Monochrome icon |
| `icon/productlobby-favicon.svg` | Favicon (simplified) |

### 2.3 Logo Sizing

| Context | Minimum size | Recommended |
|---------|-------------|-------------|
| Navbar | 32px font | 40px font |
| Hero / splash | 48–64px font | 56px font |
| Footer | 24px font | 32px font |
| Favicon | 16x16 | 32x32 |
| App icon | 48x48 | 192x192 |
| Social / OG | — | 1200x630 |

### 2.4 Clear Space

Always maintain clear space around the logo equal to the height of the upvote arrow (approximately 40% of the icon height). No other elements should intrude into this zone.

### 2.5 Logo Don'ts

- Never rotate or skew the logo
- Never change the colours of individual elements
- Never place the colour logo on a busy or low-contrast background
- Never stretch or compress the logo disproportionately
- Never add drop shadows, outlines, or effects
- Never separate the icon and wordmark when both are visible (except icon-only usage)

---

## 3. Colour Palette

### 3.1 Primary Colours

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Violet** (Primary) | `#7C3AED` | 124, 58, 237 | Buttons, headings, links, brand elements |
| **Lime** (Accent) | `#84CC16` | 132, 204, 22 | CTAs, success, upvotes, highlights |
| **Dark** (Text) | `#1a1a2e` | 26, 26, 46 | Body text, headings on light backgrounds |

### 3.2 Violet Scale

| Weight | Hex | Usage |
|--------|-----|-------|
| 50 | `#f8f5ff` | Page background tint, hover states |
| 100 | `#f3e8ff` | Light backgrounds, selection highlight |
| 200 | `#e9d5ff` | Borders, dividers on violet backgrounds |
| 300 | `#d8b4fe` | Decorative, inactive states |
| 400 | `#c084fc` | Secondary buttons, tags |
| 500 | `#a855f7` | Medium emphasis elements |
| 600 | `#9333ea` | Primary buttons, active states |
| 700 | `#7e22ce` | Button hover, strong emphasis |
| 800 | `#6b21a8` | Dark UI elements |
| 900 | `#581c87` | Dark backgrounds |

### 3.3 Lime Scale

| Weight | Hex | Usage |
|--------|-----|-------|
| 50 | `#f7fee7` | Success backgrounds |
| 100 | `#ecfccf` | Light success |
| 500 | `#84cc16` | Primary accent, upvote arrows |
| 600 | `#65a30d` | Accent hover |

### 3.4 Neutral Grays

| Weight | Hex | Usage |
|--------|-----|-------|
| 50 | `#f9fafb` | Page backgrounds |
| 100 | `#f3f4f6` | Card backgrounds, alternating rows |
| 200 | `#e5e7eb` | Borders, dividers |
| 300 | `#d1d5db` | Disabled borders |
| 400 | `#9ca3af` | Placeholder text |
| 500 | `#6b7280` | Muted text, captions |
| 600 | `#4b5563` | Secondary text |
| 700 | `#374151` | Strong secondary text |
| 800 | `#1f2937` | Near-black text |
| 900 | `#111827` | Maximum contrast |

### 3.5 Semantic Colours

| Purpose | Colour | Hex |
|---------|--------|-----|
| Success | Green | `#22C55E` |
| Warning | Amber | `#F59E0B` |
| Error | Red | `#EF4444` |
| Info | Blue | `#3B82F6` |

### 3.6 Colour Usage Rules

- **Never use Violet 600+ for body text** — too saturated for readability
- **Lime is accent only** — never as a background for text areas
- **Dark (#1a1a2e) for all body text** — never pure black (#000)
- **Minimum contrast ratio:** 4.5:1 for body text, 3:1 for large text (WCAG AA)
- **Violet-on-white** passes WCAG AA at 600+ weight
- **Lime-on-dark** passes WCAG AA — never lime on white (fails contrast)

---

## 4. Typography

### 4.1 Font Stack

| Role | Font | Fallback | Weight(s) |
|------|------|----------|-----------|
| **Logo / Brand** | Baloo 2 | cursive, system-ui | 700, 800 |
| **Headings** | Poppins | system-ui, sans-serif | 600, 700 |
| **Body** | Inter | system-ui, sans-serif | 400, 500, 600 |
| **Code** | JetBrains Mono | monospace | 400 |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
```

### 4.2 Type Scale

| Element | Size | Weight | Font | Letter Spacing | Line Height |
|---------|------|--------|------|----------------|-------------|
| **H1** | 36–48px | 700 | Poppins | -0.02em | 1.2 |
| **H2** | 30–36px | 700 | Poppins | -0.02em | 1.25 |
| **H3** | 24–30px | 600 | Poppins | -0.01em | 1.3 |
| **H4** | 20–24px | 600 | Poppins | -0.01em | 1.35 |
| **H5** | 18px | 600 | Poppins | 0 | 1.4 |
| **Body** | 16px | 400 | Inter | 0 | 1.6 |
| **Body Small** | 14px | 400 | Inter | 0 | 1.5 |
| **Caption** | 12px | 500 | Inter | 0.02em | 1.4 |
| **Label** | 12px | 600 | Inter | 0.05em | 1 |
| **Logo text** | 40px* | 700/800 | Baloo 2 | -0.06em | 1.1 |

*Logo text size varies by context (see Logo Sizing above)

### 4.3 Typography Rules

- **Headings are Poppins, body is Inter** — never mix these roles
- **Baloo 2 is logo-only** — never use for headings or body text
- **Maximum line length:** 65–75 characters for body text
- **Paragraph spacing:** 1em (16px) between paragraphs
- **No underlined text** except hyperlinks
- **Bold for emphasis**, not italics (italic Inter is less readable at small sizes)

---

## 5. Buttons & Interactive Elements

### 5.1 Button Hierarchy

| Type | Background | Text | Border | Use |
|------|-----------|------|--------|-----|
| **Primary** | Violet 600 | White | None | Main CTA per section |
| **Secondary** | Violet 100 | Violet 700 | None | Supporting actions |
| **Accent** | Lime 500 | Dark | None | Special CTAs ("Lobby for this!") |
| **Ghost** | Transparent | Gray 700 | None | Tertiary actions |
| **Outline** | Transparent | Violet 600 | Violet 300 | Alternative to ghost |
| **Destructive** | Red 500 | White | None | Delete, remove actions |

### 5.2 Button Sizing

| Size | Padding | Font Size | Border Radius | Min Height |
|------|---------|-----------|---------------|------------|
| **Small** | 8px 12px | 13px | 6px | 32px |
| **Default** | 10px 20px | 14px | 8px | 40px |
| **Large** | 12px 28px | 16px | 10px | 48px |

### 5.3 Button States

| State | Change |
|-------|--------|
| **Hover** | Darken background one shade (600 → 700) |
| **Active** | Darken two shades, scale 0.98 |
| **Disabled** | Opacity 0.5, cursor not-allowed |
| **Focus** | 2px violet ring, 2px offset |
| **Loading** | Spinner replaces text, maintain width |

### 5.4 Button Rules

- **One primary button per viewport** — if you need two CTAs, make one secondary
- **Minimum touch target:** 44x44px (mobile)
- **Button text is always sentence case** ("Start a campaign", not "START A CAMPAIGN")
- **Icon + text buttons:** icon left, 8px gap
- **Full-width buttons** only on mobile (< 640px)
- **No disabled buttons without explanation** — always show why

---

## 6. Cards & Containers

### 6.1 Card Styles

| Type | Background | Border | Shadow | Radius | Use |
|------|-----------|--------|--------|--------|-----|
| **Default** | White | Gray 100 | card | 8px | Campaign cards, list items |
| **Elevated** | White | None | elevated | 12px | Modals, dropdowns |
| **Highlighted** | Violet 50 | Violet 200 | None | 8px | Featured campaigns |
| **Interactive** | White | Gray 100 | card → card-hover | 8px | Clickable cards |

### 6.2 Card Padding

| Context | Padding |
|---------|---------|
| Compact (list) | 12px |
| Default | 16–24px |
| Spacious (feature) | 24–32px |

### 6.3 Shadows

| Token | CSS | Use |
|-------|-----|-----|
| `card` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Default cards |
| `card-hover` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` | Hover state |
| `elevated` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` | Modals, dropdowns |
| `elevated-lg` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | Hero cards |

---

## 7. Dividers, Lines & Borders

### 7.1 Dividers

| Type | Style | Colour | Use |
|------|-------|--------|-----|
| **Section divider** | 1px solid | Gray 200 | Between major sections |
| **Subtle divider** | 1px solid | Gray 100 | Inside cards, lists |
| **Brand divider** | 2px solid | Violet 200 | Under section headers |
| **Accent divider** | 3px solid | Lime 500 | Hero section accents |

### 7.2 Borders

| Type | Style | Use |
|------|-------|-----|
| **Card border** | 1px solid Gray 100 | Default card outline |
| **Input border** | 1px solid Gray 300 | Form fields |
| **Input focus** | 2px solid Violet 600 | Focused input + 3px violet-100 glow |
| **Highlighted border** | 2px solid Violet 400 | Featured / selected items |
| **Error border** | 2px solid Red 500 | Validation errors |

### 7.3 Border Radius Scale

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 4px | Tags, badges, small elements |
| `md` | 6px | Inputs, small buttons |
| `lg` | 8px | Cards, buttons |
| `xl` | 12px | Modals, large cards |
| `2xl` | 16px | Hero sections, feature cards |
| `full` | 9999px | Avatars, pills, round buttons |

---

## 8. Spacing System

### 8.1 Base Unit: 4px

All spacing uses multiples of 4px.

| Token | Value | Use |
|-------|-------|-----|
| 1 | 4px | Tight gaps, icon padding |
| 2 | 8px | Between related elements |
| 3 | 12px | Card internal padding (compact) |
| 4 | 16px | Default card padding, paragraph gap |
| 5 | 20px | Section padding (small) |
| 6 | 24px | Comfortable card padding |
| 8 | 32px | Section gaps |
| 10 | 40px | Major section padding |
| 12 | 48px | Page section spacing |
| 16 | 64px | Hero / splash padding |
| 20 | 80px | Major page breaks |
| 24 | 96px | Full section spacing |

### 8.2 Page Layout

| Property | Value |
|----------|-------|
| Max content width | 1152px (max-w-6xl) |
| Page padding (desktop) | 32px (px-8) |
| Page padding (tablet) | 24px (px-6) |
| Page padding (mobile) | 16px (px-4) |

---

## 9. Icons & Imagery

### 9.1 Icon System

Use **Lucide React** icons throughout the platform. They are clean, consistent, and match the brand's friendly tone.

| Property | Value |
|----------|-------|
| Default size | 20px |
| Stroke width | 2px |
| Colour | Inherit from text colour |
| Button icons | 16–18px |
| Feature icons | 24–32px |

### 9.2 Imagery Style

- **Illustrations over photos** where possible — the brand is about ideas, not products
- **Warm, diverse** — always represent a range of people
- **No stock photography cliches** — no handshakes, no pointing at screens
- **Flat or semi-flat illustration style** — matches the icon-based logo

---

## 10. Motion & Animation

| Type | Duration | Easing | Use |
|------|----------|--------|-----|
| **Hover** | 150ms | ease | Colour changes, shadows |
| **Expand/collapse** | 200ms | ease-out | Dropdowns, accordions |
| **Slide** | 300ms | ease-out | Modals, drawers |
| **Page transitions** | 400ms | ease-out | Route changes |
| **Pulse** | 2s | cubic-bezier(0.4, 0, 0.6, 1) | Loading, attention |
| **Bounce** | 2s | ease-in-out | Floating elements |

**Rules:**
- **Never animate layout properties** (width, height, margin) — use transform/opacity
- **Respect prefers-reduced-motion** — disable non-essential animations
- **No animation longer than 500ms** for UI interactions
- **Loading spinners** are violet with lime accent

---

## 11. Forms & Inputs

### 11.1 Input Styles

| Property | Value |
|----------|-------|
| Height | 40px (default), 48px (large) |
| Padding | 10px 14px |
| Border | 1px solid Gray 300 |
| Border radius | 6px |
| Font size | 16px (prevents iOS zoom) |
| Focus border | 2px solid Violet 600 |
| Focus shadow | 0 0 0 3px Violet 100 |
| Error border | 2px solid Red 500 |
| Placeholder colour | Gray 400 |

### 11.2 Labels

| Property | Value |
|----------|-------|
| Font | Inter 500 |
| Size | 14px |
| Colour | Gray 700 |
| Margin bottom | 6px |

### 11.3 Form Rules

- **Labels always above inputs** (never floating or inline)
- **Required fields** marked with a violet asterisk (*)
- **Error messages** below input, Red 500, 13px, appear on blur
- **Help text** below input, Gray 500, 13px
- **Maximum form width:** 560px

---

## 12. Responsive Breakpoints

| Name | Min Width | Use |
|------|-----------|-----|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Wide screens |

**Mobile-first approach:** Start with mobile styles, add complexity at larger breakpoints.

---

## 13. Accessibility Standards

- **WCAG 2.1 AA** compliance minimum
- **Colour contrast:** 4.5:1 for normal text, 3:1 for large text
- **Focus indicators:** Always visible, 2px violet ring
- **Touch targets:** Minimum 44x44px
- **Alt text:** Required for all images
- **Semantic HTML:** Use proper heading hierarchy (h1 → h2 → h3)
- **Keyboard navigation:** All interactive elements must be keyboard accessible
- **Screen reader labels:** All icon-only buttons need aria-label

---

## 14. File Naming Conventions

All brand assets follow this pattern:
```
productlobby-[type]-[variant]-[size?].[ext]
```

Examples:
- `productlobby-logo-full-colour.svg`
- `productlobby-icon-white.svg`
- `productlobby-icon-192x192.png`
- `productlobby-og-1200x630.png`
- `productlobby-favicon.svg`

---

## 15. Asset Inventory

```
public/brand/
├── BRAND-STYLE-GUIDE.md          ← You are here
├── logo/
│   ├── productlobby-logo-full-colour.svg
│   ├── productlobby-logo-full-white.svg
│   └── productlobby-logo-full-mono-dark.svg
├── icon/
│   ├── productlobby-icon-colour.svg
│   ├── productlobby-icon-white.svg
│   ├── productlobby-icon-mono-dark.svg
│   ├── productlobby-favicon.svg
│   ├── productlobby-icon-16x16.png
│   ├── productlobby-icon-32x32.png
│   ├── productlobby-icon-48x48.png
│   ├── productlobby-icon-64x64.png
│   ├── productlobby-icon-128x128.png
│   ├── productlobby-icon-192x192.png
│   ├── productlobby-icon-256x256.png
│   ├── productlobby-icon-512x512.png
│   └── apple-touch-icon-180x180.png
└── og/
    ├── productlobby-og-default.svg
    └── productlobby-og-1200x630.png

src/components/brand/
└── Logo.tsx                       ← React component

public/
└── favicon.ico                    ← Multi-resolution favicon
```

---

## 16. CSS Variables Reference

All brand colours are available as CSS custom properties in `globals.css`:

```css
var(--color-primary)        /* Violet 600 - #7C3AED */
var(--color-primary-light)  /* Violet 100 */
var(--color-accent)         /* Lime 500 - #84CC16 */
var(--color-background)     /* #FAFAFA */
var(--color-foreground)     /* #1F2937 */
var(--color-focus-ring)     /* Violet 600 */
```

## 17. Tailwind Tokens Reference

```
text-violet-600     → Primary brand
bg-violet-600       → Primary button
text-lime-500       → Accent
bg-lime-500         → Accent button
text-gray-900       → Body text
bg-gray-50          → Page background
border-gray-200     → Default borders
shadow-card         → Card shadow
shadow-elevated     → Modal shadow
rounded-lg          → Default radius (8px)
font-sans           → Inter (body)
font-display        → Poppins (headings)
```
