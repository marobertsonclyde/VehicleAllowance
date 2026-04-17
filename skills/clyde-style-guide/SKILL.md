---
name: clyde-style-guide
description: >
  Clyde Companies brand style guide for all designed outputs: Power BI dashboards, Word docs,
  Excel spreadsheets, PowerPoint decks, HTML/React artifacts, and any visual or written deliverable
  for Clyde Companies or its subsidiaries (Geneva Rock, Suncore, Sunpro, WW Clyde, Beehive Insurance,
  Bridgesource, CCG Management, HomeBuilt). Use this skill whenever creating, formatting, or reviewing
  anything that needs Clyde brand colors, fonts, layout, or voice — including Power BI themes, KPI cards,
  DAX formatting, Word reports, memos, Excel workbooks, PowerPoint decks, email templates, or styled
  HTML/CSS output. Trigger when the user says "make it look right," "use our colors," "brand it,"
  "on-brand," or "Clyde style." Also trigger for theme JSON, .docx templates, .pptx, or styled .xlsx.
  For subsidiary-specific branding, read references/subsidiaries.md.
---

# Clyde Companies Brand Style Guide

Apply these standards whenever producing any designed output for Clyde Companies. This skill covers colors, typography, voice, and format-specific rules for Power BI, Word, Excel, PowerPoint, HTML, and general design.

---

## 1. Brand Voice

- Straightforward in a conversational manner
- Clear, concise, warm, and friendly
- Thoughtful and engaging; professional but not stiff
- No jargon unless the audience is technical
- Tagline: **"Building a Better Community"**

---

## 2. Brand Colors

### 2.1 Core Palette

| Role | Name | Hex | RGB | PMS |
|------|------|-----|-----|-----|
| Primary | Clyde Blue | #0033A1 | 0, 51, 161 | 286 |
| Secondary | Medium Gray | #98989A | 152, 152, 154 | Cool Gray 7 |
| Accent | Yellow | #FFCD00 | 255, 205, 0 | 116 |
| Background | Pearl Gray | #E6E7E8 | 230, 231, 232 | — |
| Dark Neutral | Charcoal | #636569 | 99, 101, 105 | Cool Gray 10 |
| Light Neutral | Light Gray | #BBBBBB | 187, 187, 187 | — |
| Accent | Orange | #EE7623 | 238, 118, 35 | 158 |
| Accent | Sky Blue | #3CB4E5 | 60, 180, 229 | 298 |
| Accent | Green | #93D800 | 147, 216, 0 | 375 |
| Accent | Burgundy | #7F2346 | 127, 35, 70 | — |
| Accent | Red | #CE0E2D | 206, 14, 45 | 186 |
| Text | Black | #000000 | 0, 0, 0 | — |
| Watermark | Watermark Gray | #E6E7E8 | 230, 231, 232 | 18% Cool Gray 7 |

### 2.2 Multi-Series Color Order

When assigning colors to chart series, table rows, or any categorical color coding, use this order:

1. #0033A1 — Clyde Blue
2. #EE7623 — Orange
3. #3CB4E5 — Sky Blue
4. #93D800 — Green
5. #7F2346 — Burgundy
6. #CE0E2D — Red
7. #FFCD00 — Yellow
8. #98989A — Medium Gray
9. #636569 — Charcoal

For 2-3 series, use: Blue → Orange → Sky Blue.

### 2.3 Conditional Formatting / Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Positive / Good | Green | #93D800 |
| Caution / Watch | Yellow | #FFCD00 |
| Negative / Bad | Red | #CE0E2D |
| Neutral / Baseline | Medium Gray | #98989A |

### 2.4 Subsidiary Brand Colors

Each subsidiary has an **internal color** used when showing companies side by side in cross-company dashboards and reports. They also have their own brand palette for subsidiary-specific output. For full subsidiary brand details (voice, email signature overrides, PowerPoint themes, unique design elements), read `references/subsidiaries.md`.

| # | Abbrev | Subsidiary | Internal Color | Hex |
|---|--------|-----------|---------------|-----|
| 1 | CAS | Clyde Companies, Inc. | Clyde Blue | #0033A1 |
| 2 | WWC | W.W. Clyde & Co. | Charcoal | #636569 |
| 3 | GRP | Geneva Rock Products | Yellow | #FFCD00 |
| 4 | SCR | Suncore Construction and Materials | Burgundy | #8C1E2F |
| 6 | BIA | Beehive Insurance | Sky Blue | #3CB4E5 |
| 8 | SPC | Sunpro Corporation | Orange | #EE7623 |
| 13 | BSL | Bridgesource | Green | #93D800 |
| 14 | CCM | CCG Management | Gray | #98989A |
| 15 | HBL | HomeBuilt Hardware and Design | Navy | #395276 |

**Note**: "Sunroc" has been renamed to **Suncore** (SCR). Update any legacy references accordingly.

---

## 3. Typography

### 3.1 Font Hierarchy

| Priority | Font | Use When |
|----------|------|----------|
| 1 (preferred) | Futura Std (Bold, Heavy, Medium, Regular, Light) | Print, high-end collateral, any context where installed |
| 2 (web/digital) | Open Sans (Regular, SemiBold, ExtraBold) | Power BI, web, HTML, dashboards, Google Fonts contexts |
| 3 (fallback) | Trebuchet MS (Bold, Regular, Italic) | Word, PowerPoint, Excel, email — when Futura/Open Sans unavailable |

### 3.2 Headline Rules

- Headlines and report titles: **ALL CAPS**
- Font: Futura Std Bold (or Open Sans SemiBold / Trebuchet MS Bold as fallback)
- Color: Clyde Blue #0033A1

### 3.3 Body Copy Rules

- Font: Futura Std Medium/Regular (print) or Open Sans Regular (digital) or Trebuchet MS Regular (Office fallback)
- Color: Charcoal #636569 or Black #000000
- Size: 11pt for Word/email body text (Trebuchet MS)

### 3.4 Rule of Two

Never mix more than two font families in a single document or report.

---

## 4. Format-Specific Guidelines

### 4.1 Power BI Dashboards

**Fonts:**
- Report title: Open Sans SemiBold, ALL CAPS, #0033A1
- Visual titles: Open Sans SemiBold, Title Case, #0033A1
- Axis labels: Open Sans Regular, #636569
- Data labels: Open Sans Regular, #636569
- KPI / Card values: Open Sans Bold, large, #0033A1
- Card captions: Open Sans Regular, smaller, #636569
- Tooltips: Open Sans Regular, #000000

**Layout:**
- Page background: White (#FFFFFF) or Pearl Gray (#E6E7E8)
- Card/visual backgrounds: White with subtle Pearl Gray borders
- Gridlines: #E6E7E8 or #BBBBBB — never heavy dark lines
- Borders: 1px #98989A when needed
- Top of page: Clyde Blue accent bar or banner
- Give visuals breathing room (mirrors logo clear-space rules)

**Theme JSON** — use this as the baseline when generating a .json theme file:

```json
{
  "name": "Clyde Companies",
  "dataColors": [
    "#0033A1", "#EE7623", "#3CB4E5", "#93D800",
    "#8C1E2F", "#CE0E2D", "#FFCD00", "#98989A", "#636569"
  ],
  "background": "#FFFFFF",
  "foreground": "#636569",
  "tableAccent": "#0033A1",
  "textClasses": {
    "callout": { "fontFace": "Open Sans", "color": "#0033A1" },
    "title": { "fontFace": "Open Sans", "color": "#0033A1" },
    "header": { "fontFace": "Open Sans", "color": "#636569" },
    "label": { "fontFace": "Open Sans", "color": "#636569" }
  }
}
```

### 4.2 Word Documents (.docx)

**Fonts:**
- Body text: Trebuchet MS Regular, 11pt, Black
- Headings: Trebuchet MS Bold, ALL CAPS, Clyde Blue #0033A1
- Subheadings: Trebuchet MS Bold, Title Case, Clyde Blue #0033A1

**Layout:**
- First page: 2" top margin (for letterhead logo space), 1" sides and bottom
- Subsequent pages: 1" margins all sides
- When sharing as PDF, use the Word letterhead template with built-in logo/branding

**Tables:**
- Header row: Clyde Blue (#0033A1) background, white text, Trebuchet MS Bold
- Alternating rows: White and Pearl Gray (#E6E7E8)
- Border: 1px Medium Gray (#98989A)
- Data text: Trebuchet MS Regular, 10-11pt, #636569

**Accent elements:**
- Horizontal rule / divider: Clyde Blue (#0033A1) or Medium Gray (#98989A)
- Callout boxes: Pearl Gray (#E6E7E8) background with Clyde Blue left border

### 4.3 Excel Spreadsheets (.xlsx)

**Fonts:**
- Header row: Trebuchet MS Bold, 11pt, White text on Clyde Blue (#0033A1) fill
- Data cells: Trebuchet MS Regular, 11pt, Charcoal (#636569) or Black
- Sheet title: Trebuchet MS Bold, 14pt, Clyde Blue (#0033A1)

**Cell formatting:**
- Header fill: Clyde Blue #0033A1
- Alternating row fill: White / Pearl Gray #E6E7E8
- Borders: Thin, Medium Gray #98989A
- Freeze top row (header)
- Column widths: Auto-fit with some padding

**Conditional formatting:**
- Use the status color scale: Green #93D800 → Yellow #FFCD00 → Red #CE0E2D
- For data bars: Clyde Blue #0033A1

**Charts in Excel:**
- Follow the same multi-series color order as Power BI (Section 2.2)
- Chart title: Trebuchet MS Bold, #0033A1
- No 3D effects, no gradients

### 4.4 PowerPoint Presentations (.pptx)

**Fonts:**
- Slide title: Trebuchet MS Bold (or Open Sans SemiBold), ALL CAPS, 60pt on title slides
- Presenter name / subtitle: 48pt, ALL CAPS
- Body text: Trebuchet MS Regular (or Open Sans Regular), 42pt for text blocks
- Bullets: Trebuchet MS Bold, 46pt

**Slide backgrounds:**
- Title slide: Clyde Blue (#0033A1) full background, white text and logo
- Content slides: White background with Clyde Blue accent bar at top or bottom
- Section divider slides: Clyde Blue background with white text

**Charts/visuals in slides:**
- Same color order as Section 2.2
- No 3D, no gradients, no drop shadows on chart elements

**Logo placement:**
- Clyde logo mark in bottom-right corner of content slides (small, subtle)
- Full logo on title slide
- Watermark version can be used as a subtle background element (18% Cool Gray 7)

### 4.5 HTML, React Artifacts & Web Output

**CSS variables** — use these when generating HTML or React:

```css
:root {
  --clyde-blue: #0033A1;
  --clyde-gray: #98989A;
  --clyde-charcoal: #636569;
  --clyde-yellow: #FFCD00;
  --clyde-orange: #EE7623;
  --clyde-sky-blue: #3CB4E5;
  --clyde-green: #93D800;
  --clyde-burgundy: #7F2346;
  --clyde-red: #CE0E2D;
  --clyde-pearl: #E6E7E8;
  --clyde-light-gray: #BBBBBB;
  --clyde-black: #000000;
  --clyde-white: #FFFFFF;

  --font-primary: 'Open Sans', 'Trebuchet MS', sans-serif;
  --font-heading: 'Open Sans', 'Trebuchet MS', sans-serif;
}
```

**Layout patterns:**
- Page/card background: White or Pearl Gray
- Primary headings: Clyde Blue, uppercase, font-weight 600+
- Body text: Charcoal #636569
- Links: Clyde Blue #0033A1, no underline; underline on hover
- Buttons (primary): Clyde Blue background, white text, slight border-radius (4px)
- Buttons (secondary): White background, Clyde Blue border and text
- Tables: same header/alternating-row pattern as Excel (Blue header, Pearl Gray stripes)
- Cards: White background, 1px #E6E7E8 border or subtle shadow, rounded corners (4-8px)
- Top accent: thin Clyde Blue bar across the top of the page or component

### 4.6 Email

- Body font: Trebuchet MS, 11pt, Black
- No additional colors, fonts, designs, or graphics in the email body
- Signature: see below

**Email signature format:**
- Name: Trebuchet MS Bold, 11pt, Clyde Blue #0033A1, Title Case
- Job title and other info: Trebuchet MS Regular, 10pt, ALL CAPS, Clyde Blue #0033A1
- Phone labels (O, C): Trebuchet MS Bold, Medium Gray #98989A
- Divider lines: Medium Gray #98989A

---

## 5. Universal Do's and Don'ts

**Do:**
- Use Clyde Blue (#0033A1) as the dominant brand color in every deliverable
- Use Pearl Gray (#E6E7E8) for subtle backgrounds, alternating rows, and card fills
- Use ALL CAPS for top-level titles, section headers, and slide titles
- Keep color usage consistent across pages/sheets/slides in the same deliverable
- Apply conditional formatting with Green/Yellow/Red when showing status or performance
- Provide generous white space and padding (mirrors logo clear-space rules)
- Use the approved 2-color logo on white/light backgrounds
- Use the 1-color gray or white logo on dark backgrounds

**Don't:**
- Use colors outside the brand palette
- Add drop shadows, gradients, bevels, or 3D effects to any brand element or chart
- Rotate, stretch, or modify the logo in any way
- Change the logo typeface or remove portions of the logo
- Use more than 6-7 colors in a single chart — aggregate smaller categories
- Mix more than two font families in one deliverable
- Use Yellow (#FFCD00) as a primary data series color (poor contrast on white) — reserve for accents/alerts
- Place elements edge-to-edge with no padding or breathing room
- Add effects (glow, outline, texture) to any brand element

---

## 6. Logo Usage Reference

This skill does not embed logo image files, but here are the rules for when logo placement is relevant:

- **Preferred**: 2-color logo (blue + gray) on white or light backgrounds
- **Dark backgrounds**: 1-color reversed logo in white or gray
- **Watermark**: 18% Cool Gray 7 version; side-by-side layout preferred over stacked
- **Clear space**: minimum padding equal to the "C bolt" element in the logo on all sides
- **Never**: rotate, stretch, add shadows, change colors, change typeface, remove parts, or add effects
- **Family of brands**: when showing multiple subsidiaries, Clyde Companies logo goes on top as the umbrella with subsidiary logos stacked below, centered
