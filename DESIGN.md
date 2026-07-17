---
name: AntiNgutang
description: Foto struk. Tap siapa pesen apa. Selesai.
colors:
  primary: "#10b981"
  primary-dark: "#059669"
  primary-light: "#d1fae5"
  neutral-bg: "#f9fafb"
  neutral-surface: "#ffffff"
  neutral-text: "#374151"
  neutral-text-light: "#6b7280"
  neutral-text-muted: "#9ca3af"
  neutral-border: "#e5e7eb"
  danger: "#ef4444"
  danger-bg: "#fef2f2"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  full: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-small:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  chip:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary-dark}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---
# Design System: AntiNgutang

## 1. Overview

**Creative North Star: "The Split Jar"**

Everyone tosses their share into the jar — casual, communal, done. AntiNgutang's visual system is a clean, mobile-first interface that feels like a helpful friend handling the math. White surfaces, a fresh green accent, and generous rounded corners create a space that's approachable without being childish, efficient without feeling cold.

The system explicitly rejects: gamified or cartoonish bill splitters, corporate banking aesthetics, and generic SaaS dashboard layouts. Every screen is built for one-handed use at a restaurant table — big tap targets, bottom-sheet modals, minimal scroll.

**Key Characteristics:**
- Clean white surfaces with a single fresh green accent
- Generous rounded corners (12px default) for approachability
- Flat by default — borders and spacing create hierarchy, not shadows
- Mobile-first, thumb-friendly tap targets
- Indonesian warmth in tone, not in decoration

## 2. Colors

A restrained palette built around a single fresh green accent on clean white surfaces. The green signals completion, clarity, and the "done" state — never decorative, always meaningful.

### Primary
- **Fresh Green** (#10b981 / oklch(0.62 0.19 160)): Primary actions, active states, and the brand's signature. Used on buttons, focus rings, and the app header. Never decorative — green always means "do this" or "done."
- **Fresh Green Dark** (#059669 / oklch(0.55 0.17 160)): Hover state for primary buttons. Deeper, more grounded.
- **Fresh Green Light** (#d1fae5 / oklch(0.92 0.06 160)): Subtle background tint for selected states, participant tags, and success banners.

### Neutral
- **Clean White** (#ffffff): Surface color for cards, modals, and input backgrounds.
- **Cool Off-White** (#f9fafb): Page background. A barely-there cool tint that separates the canvas from the cards.
- **Ink** (#374151): Primary body text. High-contrast and readable.
- **Ink Light** (#6b7280): Secondary text for subtotals, details, and breakdowns.
- **Ink Muted** (#9ca3af): Placeholder text, hints, and footer copy.
- **Border Light** (#e5e7eb): Card borders, input strokes, dividers.

### Named Rules
**The One Accent Rule.** Fresh Green is the only accent color. It appears on ≤15% of any screen — buttons, tags, focus rings. Its rarity is the point: when green appears, it means "act here" or "this is done."

## 3. Typography

**Display & Body Font:** System UI Stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)

**Character:** Clean, neutral, and highly legible. The system font stack ensures native feel on every platform — San Francisco on iOS, Roboto on Android. No custom fonts to load, no FOUT, no performance cost. The personality comes from weight and spacing, not from a bespoke typeface.

### Hierarchy
- **Display** (700, 28px, 1.2): App header only. Letter-spacing -0.5px for a tighter, more confident lockup.
- **Headline** (700, 20px, 1.3): Section titles in guest view and modals.
- **Title** (600, 15px, 1.4): Card section headers (Daftar Item, Peserta, Ringkasan).
- **Body** (400, 16px, 1.5): Primary reading text. Max line length 65ch.
- **Body Small** (500, 14px, 1.4): Item names, button labels, body copy in tight spaces.
- **Label** (500, 13px, 1.4): Participant tags, status text, hints, and secondary labels.
- **Caption** (400, 12px, 1.4): Footer copy, breakdown details, timestamps.

## 4. Elevation

Flat by default. Depth is conveyed through borders and spacing, not shadows. Cards sit flush on the off-white background with a 1px border to define their boundary. The only exception is the summary card, which uses a slightly stronger shadow (0 10px 25px rgba(0,0,0,0.1)) to signal it as the final action zone — the "pay here" moment.

### Shadow Vocabulary
- **Card Rest** (`0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`): Subtle definition for cards on the off-white background. Barely perceptible — the border does the work.
- **Summary Lift** (`0 10px 25px rgba(0,0,0,0.1)`): The summary card only. Signals this is the final action zone.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Borders create card boundaries; shadows appear only as a deliberate signal (the summary card's lift). No shadow on hover, no shadow on cards.

## 5. Components

### Buttons
- **Shape:** Generous rounded corners (12px). Full-width on mobile, inline on desktop.
- **Primary:** Fresh Green background, white text, 12px 24px padding. Hover: Fresh Green Dark. Disabled: 50% opacity.
- **Outline:** White background, Ink text, 1.5px Fresh Green border. Hover: Fresh Green Light background.
- **Small variant:** 8px 16px padding, 13px font. Used inline (e.g., Tambah button in participant form).
- **Transition:** 0.15s all — color, background, border. No transform, no lift.

### Cards / Containers
- **Corner Style:** Generous rounded corners (12px).
- **Background:** Clean White.
- **Border:** 1px solid Border Light. This is the primary boundary mechanism — no shadow at rest.
- **Internal Padding:** 16px.

### Inputs / Fields
- **Style:** 1px solid Border Light stroke, 8px radius, Clean White background.
- **Focus:** Border shifts to Fresh Green with a 2px Fresh Green Light box-shadow ring.
- **Placeholder:** Ink Muted (#9ca3af) — note: this needs ≥4.5:1 contrast against the white input background to meet WCAG AA.
- **Error:** No dedicated error state in the current system; errors surface as banners, not inline validation.

### Chips / Tags
- **Style:** Fresh Green Light background, Fresh Green Dark text, 20px (full) radius, 4px 10px padding.
- **State:** Used for participant tags and progress indicators. No hover state — they're static labels.

### Modals
- **Style:** Bottom-sheet pattern. Full-width overlay with a dark backdrop (rgba(0,0,0,0.4)). Content panel slides up from the bottom with 16px top radius.
- **Animation:** 0.15s fadeIn for overlay, 0.2s slideUp for content.

### Navigation
- **Style:** No persistent navigation. The app is a single-page flow: scan → assign → share. The header is presentational only.

## 6. Do's and Don'ts

### Do:
- **Do** use Fresh Green as the single accent — on buttons, focus rings, tags, and selected states only.
- **Do** keep cards flat with a 1px border. Let the border define the card boundary.
- **Do** use bottom-sheet modals for mobile interactions — they feel native and keep the user in context.
- **Do** use the system font stack for maximum performance and native feel.
- **Do** keep tap targets at least 44px for thumb-friendly interaction.
- **Do** use proportional spacing (16px card padding, 12px between items) for consistent rhythm.

### Don't:
- **Don't** use green decoratively — it must always signal action or completion.
- **Don't** add shadows to cards at rest. Borders define boundaries.
- **Don't** use gradient text, glassmorphism, or side-stripe borders.
- **Don't** gamify the interface — no badges, progress bars, or animations that feel like a game.
- **Don't** use numbered section markers (01 / 02 / 03) or tiny uppercase tracked eyebrows.
- **Don't** use gray text on colored backgrounds — use a darker shade of the background's own hue instead.
- **Don't** nest cards — cards are single-layer containers.
