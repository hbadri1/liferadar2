# Liferadar brand starter

This folder contains a lightweight visual direction for `Liferadar`: a modern 3-color palette and ready-to-use SVG logo assets.

## Files

- `palette.md` — palette definitions, usage guidance, and CSS variables
- `liferadar-logo-primary.svg` — horizontal primary logo with icon + wordmark
- `liferadar-logo-mark.svg` — icon-only mark for app icons, avatars, and favicons
- `liferadar-palette-preview.svg` — quick visual swatch sheet
- `generate_brand_icons.py` — generates PNG app icons and `favicon.ico` for the web app

## Creative direction

The visual language combines:

- **clarity** from a deep slate base
- **guidance and calm** from a clean teal signal tone
- **energy and action** from a warm coral highlight

The logo mark uses concentric radar rings and an active pulse point to suggest awareness, progress, and life signals without feeling clinical.

## Suggested next use in the app

If you want to apply this branding later, the first places to update would be:

- `src/main/webapp/index.html` → `theme-color`
- `src/main/webapp/manifest.webapp` → `theme_color` and app icons
- navbar / loading screen / login screen imagery

## Recommended default asset

Use `liferadar-logo-primary.svg` for web headers and documentation.
Use `liferadar-logo-mark.svg` for compact placements such as app icons or favicons.

