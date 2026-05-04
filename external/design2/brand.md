# LifeRadar Brand Guidelines

Version: 1.0  
Status: Working draft

## 1) Brand Intent

LifeRadar helps people and families navigate life with clarity, trust, and momentum.

### Brand attributes

- Trustworthy
- Clear
- Intelligent
- Human
- Calm under complexity

### Visual tone

- Clean and modern
- Strong contrast and legibility
- Purposeful use of color (signal over decoration)

---

## 2) Core Color System

### Primary Colors

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary (Authority) | Deep Navy | `#0B1F3B` | Main brand surfaces, navbar, primary backgrounds, strong text on light surfaces |
| Primary Accent (Signal) | Electric Cyan | `#00C2FF` | CTA emphasis, links, focus accents, progress highlights |
| Secondary Accent (Depth) | Indigo Blue | `#1E3A8A` | Hover states, supporting emphasis, gradient depth |

### Supporting Colors

| Role | Hex | Usage |
|---|---|---|
| Success | `#22C55E` | Success states, confirmations, positive KPIs |
| Warning | `#F59E0B` | Warnings, caution states |
| Error | `#EF4444` | Error states, destructive actions |
| Neutral Dark | `#0F172A` | Primary body text, dark UI regions |
| Neutral Mid | `#64748B` | Secondary text, borders, muted icons |
| Neutral Light | `#F1F5F9` | Background blocks, soft containers |
| White | `#FFFFFF` | Page background, text on dark surfaces |

---

## 3) Color Usage Rules

### Functional mapping

- **Authority surfaces**: `#0B1F3B`
- **Action signal**: `#00C2FF`
- **Interactive depth / hover**: `#1E3A8A`
- **Semantic status**: success/warning/error colors only for status, not branding

### Suggested gradients

Use gradients sparsely on hero sections, key cards, and premium-like highlight regions.

1. Deep brand gradient: `linear-gradient(135deg, #0B1F3B 0%, #1E3A8A 100%)`
2. Signal gradient: `linear-gradient(135deg, #1E3A8A 0%, #00C2FF 100%)`

### Contrast guidance

- Prefer `#0F172A` text on light backgrounds.
- Use `#FFFFFF` text on `#0B1F3B` or `#1E3A8A` surfaces.
- Avoid long body text in Electric Cyan.
- Keep interactive text contrast WCAG-compliant (4.5:1 for normal text).

---

## 4) UI Application Guidelines

### Navbar and shell

- Navbar base: Deep Navy (`#0B1F3B`)
- Active item / subtle emphasis: Indigo (`#1E3A8A`)
- Notification and interactive indicator accents: Electric Cyan (`#00C2FF`) or semantic colors where appropriate

### Buttons

- **Primary button**: background `#0B1F3B`, text white
- **Primary hover**: background `#1E3A8A`
- **Accent button/link**: use `#00C2FF` with dark text if needed for readability
- **Destructive**: `#EF4444`

### Cards and surfaces

- Main page background: white
- Section background: Neutral Light (`#F1F5F9`)
- Borders/dividers: Neutral Mid at low opacity
- Card headers can use deep gradient only for high-priority sections

### Form controls

- Focus ring/accent: Electric Cyan (`#00C2FF`)
- Error state: `#EF4444`
- Success state: `#22C55E`

### Data visualization (future)

- Primary series: `#00C2FF`
- Secondary series: `#1E3A8A`
- Tertiary series: `#22C55E`
- Alert overlays: warning/error palette

---

## 5) Typography System

### 5.1 Font Families

#### English

- **Primary:** Inter
- **Why:**
  - Built for UI
  - Highly readable at all sizes
  - Neutral style that does not fight product content
- **Usage:** UI, dashboard, buttons, forms

- **Secondary (optional branding):** Space Grotesk
- **Why:**
  - Adds slight personality
  - Modern tech feel
- **Usage:** Headings and landing pages only

#### Arabic

- **Primary:** IBM Plex Sans Arabic
- **Why:**
  - Professional and non-decorative
  - Works well in enterprise/government contexts
  - Balanced geometry with Latin fonts

- **Alternative:** Tajawal
- **Use when:** a slightly lighter, more digital tone is desired

### 5.2 Type Scale (Strict)

- **H1:** 32px-36px, weight 600-700
- **H2:** 24px-28px, weight 600
- **H3:** 20px, weight 500
- **Body:** 14px-16px, weight 400
- **Caption:** 12px

### 5.3 Line Height

- Default range: **1.4-1.6**
- Recommended baseline:
  - Headings: 1.3-1.4
  - Body text: 1.5-1.6
  - Caption: 1.4

### 5.4 Implementation Guidance

- Use **Inter + IBM Plex Sans Arabic** as default application fonts.
- Use **Space Grotesk** only for hero/marketing headings.
- Keep hierarchy consistent across screens; do not invent one-off sizes.
- Prefer weight changes over color changes to express hierarchy.

---

## 6) Iconography and Motion

### Iconography

- Use simple, filled/solid icon style for consistency
- Icons should support actions, not replace labels
- Keep icon color aligned with text color or semantic state

### Motion

- Subtle transitions (150ms–250ms)
- Motion should indicate state change, not decoration
- Avoid heavy or continuous animations on core workflows

---

## 7) Accessibility Requirements

- Ensure text contrast meets WCAG AA minimums.
- Do not rely on color alone for status; pair with icon/text.
- Preserve visible focus states across all interactive components.
- Validate dark-on-light and light-on-dark combinations before release.

---

## 8) Implementation Tokens (CSS Variables)

Use these tokens as the single source of truth in app styling.

```css
:root {
  --lr-primary: #0B1F3B;
  --lr-primary-accent: #00C2FF;
  --lr-secondary-accent: #1E3A8A;

  --lr-success: #22C55E;
  --lr-warning: #F59E0B;
  --lr-error: #EF4444;

  --lr-neutral-dark: #0F172A;
  --lr-neutral-mid: #64748B;
  --lr-neutral-light: #F1F5F9;
  --lr-white: #FFFFFF;

  --lr-gradient-brand: linear-gradient(135deg, #0B1F3B 0%, #1E3A8A 100%);
  --lr-gradient-signal: linear-gradient(135deg, #1E3A8A 0%, #00C2FF 100%);

  --lr-font-en: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --lr-font-en-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --lr-font-ar: 'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', sans-serif;

  --lr-text-h1: clamp(2rem, 1.7rem + 1.2vw, 2.25rem); /* 32-36px */
  --lr-text-h2: clamp(1.5rem, 1.35rem + 0.7vw, 1.75rem); /* 24-28px */
  --lr-text-h3: 1.25rem; /* 20px */
  --lr-text-body: 1rem; /* 16px default */
  --lr-text-body-sm: 0.875rem; /* 14px */
  --lr-text-caption: 0.75rem; /* 12px */
}
```

---

## 9) Do / Don’t

### Do

- Use Deep Navy as the visual anchor.
- Use Electric Cyan as an intentional signal.
- Keep layouts clean and readable.
- Use semantic colors only for semantic meaning.

### Don’t

- Overuse gradients on every section.
- Use Electric Cyan for long paragraphs.
- Mix too many saturated colors in one screen.
- Use red/orange/green as decorative accents.

---

## 10) Rollout Checklist

- [ ] Add tokens to global stylesheet/theme variables.
- [ ] Update navbar, buttons, and links to brand palette.
- [ ] Align status alerts to semantic palette.
- [ ] Verify contrast and focus states.
- [ ] Capture before/after screenshots for key pages.
- [ ] Update this document after implementation decisions.

---

## 11) Full Visual System

### A) Layout and Spacing

- **Base unit:** 8px system
- **Key spacing rules:**
  - Section spacing: 48px-64px
  - Card padding: 16px-24px
  - Component gaps: 12px-16px

### B) UI Components Style

#### Cards

- Background: `#FFFFFF`
- Border: `#E2E8F0`
- Radius: `12px`
- Shadow (very soft): `0 4px 12px rgba(0, 0, 0, 0.05)`

#### Buttons

- **Primary**
  - Background: `#00C2FF`
  - Text: `#FFFFFF`
  - Hover: `#00A8E0`

- **Secondary**
  - Outline: `#1E3A8A`
  - Text: `#1E3A8A`

#### Inputs

- Border: `#CBD5E1`
- Focus state:
  - Border: `#00C2FF`
  - Glow: subtle cyan shadow

### C) Iconography

- **Style direction:** Outline or duotone
- **Stroke weight:** 1.5px-2px
- **Theme language:**
  - Signals
  - Radar waves
  - Circles / tracking / nodes

### D) Logo Direction (Important Constraint)

- **Core direction:**
  - Shape: circular radar
  - Motion concept: waves / pulse
  - Style: minimal geometric

- **Avoid:**
  - Complex icons
  - Literal life symbols (hearts, etc.)

### E) Dark Mode

- Background: `#020617`
- Cards: `#0F172A`
- Text: `#E2E8F0`
- Accent remains: `#00C2FF`

### F) Brand Feel Summary

When someone sees LifeRadar, the product should communicate:

- "This is a system, not an app"
- "It helps me monitor and control things"
- "Clean, precise, not emotional"
