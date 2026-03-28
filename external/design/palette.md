# Liferadar palette

## Core 3-color palette

| Role | Name | Hex | RGB | Suggested use |
|---|---|---:|---:|---|
| Primary | Signal Teal | `#1FB7A6` | `31, 183, 166` | Main brand color, buttons, active states, radar lines |
| Accent | Pulse Coral | `#FF6B5E` | `255, 107, 94` | Highlights, notifications, active nodes, CTAs |
| Neutral | Midnight Slate | `#142033` | `20, 32, 51` | Headings, navigation, backgrounds, wordmark |

## Why this works

- **Modern:** teal + deep slate feels digital, trustworthy, and clean.
- **Appealing:** coral adds warmth so the brand feels human rather than cold.
- **Flexible:** the palette works for dashboards, wellness experiences, and family-oriented product moments.

## Usage ratio

A balanced starting point:

- `Midnight Slate` — 55%
- `Signal Teal` — 30%
- `Pulse Coral` — 15%

## Suggested UI roles

- App shell / navbar: `#142033`
- Primary action: `#1FB7A6`
- Hover / active glow: `#FF6B5E`
- Light surfaces: white or very pale tints of slate
- Charts: teal for baseline, coral for key insight / alert points

## CSS variables

```css
:root {
  --lr-primary: #1fb7a6;
  --lr-accent: #ff6b5e;
  --lr-neutral: #142033;
}
```

## Accessibility notes

- Use `Midnight Slate` text on white or very light backgrounds.
- Use white text on `Midnight Slate` and often on `Signal Teal` for strong contrast.
- Reserve `Pulse Coral` for emphasis instead of large text blocks.

