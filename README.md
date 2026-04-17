# CCI Vehicle Allowance

Design artifacts for the CCI Vehicle Allowance Power Platform solution — a
Power Apps Code App (employee self-service + admin) that replaces the existing
spreadsheet-and-PDF process for the 1/1/2026 policy refresh.

This repo holds the **design brief, reference policies, brand skills, and
wireframes**. No app code lives here — the Code App itself is built separately
via the Code App MCP in VS Code, working from `design-brief.md`.

## Layout

```
design-brief.md         Spec the Code App is built from
docs/policy/            Source policy PDFs (effective 1.1.2026)
skills/                 Skills to load when implementing against the brief
  clyde-style-guide/      Clyde Companies brand standards
  frontend-design/        Production-grade frontend aesthetics
wireframes/             Static HTML/CSS walkthrough of both apps
  index.html              Hub — pick a device width and preview any screen
  employee/               Employee self-service screens (E1–E14)
  admin/                  Admin / reviewer / payroll screens (A1–A13)
  assets/                 Shared stylesheet + hub script
```

## Where to start

- **Product & scope** — `design-brief.md`
- **Walk the app** — open `wireframes/index.html` in a browser (also deployed
  via GitHub Pages on push to `main`)
- **Brand rules** — `skills/clyde-style-guide/SKILL.md`
- **Source policy** — `docs/policy/`
