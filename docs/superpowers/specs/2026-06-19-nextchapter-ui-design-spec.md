# NextChapter — UI Design Specification

> **Audience:** Codex (or any AI agent / contributor) adding features to NextChapter.
> Read this before writing any new UI. Every pattern in this document is extracted
> directly from the live codebase; nothing is aspirational.

---

## 1. Stack & Tooling

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite (TypeScript) |
| Styling | Tailwind CSS v4 (utility-first, no `tailwind.config.js`) |
| Theme tokens | `@theme {}` block in `src/styles.css` — consumed as CSS custom properties |
| Fonts | Google Fonts via `<link>` in `index.html` — **Inter** (sans) and **Lora** (serif) |
| Icons | Inline SVG only — no icon library |
| Component library | None — all UI is hand-written |
| State | React `useState` / `useMemo`; persisted to `localStorage` via `src/storage/localRepository.ts` |

---

## 2. Color Palette

All colors are defined as CSS custom properties in `src/styles.css` inside `@theme {}`.
**Always reference them with the `--color-*` syntax** (e.g., `bg-[--color-espresso]`).
Never hard-code hex values in components.

### 2.1 Surface Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-cream` | `#f7f3ec` | App background (`<main>`), list-item hover tint, cover placeholder |
| `--color-parchment` | `#fffdf8` | Chat panel background, light foreground text on dark |
| `--color-panel` | `#faf7f2` | Right inspector column background, tab bar, settings footer |
| `--color-input-bg` | `#fef9f2` | All text inputs, textareas, selects |
| `--color-ghost-btn` | `#ddd4c4` | Ghost/secondary button fill, user chat bubble, suggestion chips |

### 2.2 Border Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-border` | `#d8cfc0` | Standard dividers, scrollbar thumb, `<hr>`, cover thumbnail border |
| `--color-border-mid` | `#c5b9a5` | Ghost button hover state, active session left-border |
| `--color-tan` | `#b5a48a` | Suggestion section label, empty stars in star rating |

### 2.3 Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#2a1f14` | Primary body text, headings |
| `--color-ink-muted` | `#625b52` | Secondary / supporting text, field labels |
| `--color-ink-light` | `#8c8278` | Tertiary text, placeholders, metadata micro-copy |

### 2.4 Brand / Action Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-espresso` | `#3d2b1f` | Primary CTA fill (Ask, Save, active tab, active filter pill, form submit) |
| `--color-espresso-hover` | `#2e1f14` | Hover state for espresso backgrounds |

### 2.5 Semantic Status Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-green` | `#2f6f5e` | "Read" badge text, book-link text, active session badge, status message text |
| `--color-green-bg` | `#eef4f1` | "Read" badge fill, "Active" badge fill |
| `--color-green-hover` | `#245a4b` | Hover state for green text links |
| `--color-amber` | `#7a5a2e` | "Want to read" badge text, all section-label overlines, eyebrow text |
| `--color-amber-bg` | `#fdf4e3` | "Want to read" badge fill, preference-suggestion card background |
| `--color-error` | `#9f1239` | Inline error messages |

### 2.6 Color Usage Rules

- The **espresso → parchment** pairing is the only dark-on-light primary action surface.
- The **ghost-btn → ink** pairing is used for secondary / ghost actions at every callout level.
- **Amber** is reserved exclusively for labels and overlines — never use it as a button color.
- **Green** is reserved for positive/confirmation states and in-text book hyperlinks.
- Do not add new colors. Extend by combining existing tokens.

---

## 3. Typography

### 3.1 Font Families

| CSS variable | Value | Tailwind class | When to use |
|---|---|---|---|
| `--font-sans` | Inter, ui-sans-serif… | `font-sans` (default) | All UI chrome: labels, buttons, inputs, metadata, badges |
| `--font-serif` | Lora, ui-serif… | `font-serif` | Content-forward text: assistant messages, book summaries, user notes, empty-state prose, panel headings |

The body default is `font-sans` at `15px / 1.6`. Serif text signals "content" rather than "chrome."

### 3.2 Type Scale (as used in the codebase)

| Role | Classes | Example usage |
|---|---|---|
| App title / hero | `font-serif text-[1.75rem] font-semibold leading-tight` | "NextChapter" wordmark in ChatPanel header |
| Panel / section heading | `font-serif text-xl font-semibold leading-snug` | Book title in BookDetailPanel |
| Empty-state heading | `font-serif text-xl leading-relaxed` | "What would you like to read next?" |
| Body serif | `font-serif text-base leading-[1.75]` | Assistant message, book summary |
| Body sans | `text-sm leading-relaxed` | General body copy, button labels |
| Field label | `text-sm font-medium text-[--color-ink-muted]` | Form field labels in SettingsView |
| Small label | `text-xs font-medium` | Metadata rows, secondary info |
| Section overline | `text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber]` | "Details", "Summary", "Past conversations", all section headers |
| Eyebrow (chat) | `text-xs font-semibold uppercase tracking-[0.1em] text-[--color-amber]` | "Personal reading advisor" above app title |
| Micro-copy | `text-[0.7rem] text-[--color-ink-light]` | Page count, date label in library list item |
| Error / status | `text-sm font-medium text-[--color-error]` or `text-[--color-green]` | Inline feedback beneath message list |

### 3.3 Typography Rules

- Section overlines always use: `text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber]` — do not invent new heading hierarchies.
- Use `text-balance` or `text-pretty` on multi-line titles (e.g., book titles).
- Never put body copy smaller than `text-xs` (12 px effective).
- Serif is for *reading* content; sans is for *navigating* the UI.

---

## 4. Spacing & Layout

### 4.1 Two-Column App Shell

```
┌──────────────────────────┬───────────────────────────┐
│  Chat Panel              │  Inspector (Canvas)        │
│  flex-[1.18]             │  flex-[0.82]               │
│  min-w-[380px]           │  min-w-[320px]             │
│  max-w-[680px]           │  (no max-width)            │
│  bg-[--color-parchment]  │  bg-[--color-panel]        │
└──────────────────────────┴───────────────────────────┘
```

The shell is `<main className="flex h-screen overflow-hidden bg-[--color-cream]">`.
Both columns are `flex flex-col h-screen overflow-hidden`.
The right column has a tab bar pinned at the top (`shrink-0`) and a scrollable content area (`flex-1 overflow-y-auto`).

### 4.2 Panel Internal Padding

| Panel | Horizontal padding | Vertical padding |
|---|---|---|
| ChatPanel header | `px-8 pt-8 pb-6` | — |
| ChatPanel message list | `px-8 py-4` | — |
| ChatPanel prompt form | `px-8 pb-8 pt-4` | — |
| BookDetailPanel | `px-7 py-6` | `space-y-6` between sections |
| LibraryView header strip | `px-6 pt-5 pb-4` | — |
| LibraryView search + filter | `px-6 pt-4 pb-3` | — |
| LibraryView book list | `px-3 pb-6` | — |
| SettingsView content | `px-7 py-6` | `space-y-7` between sections |
| RecommendationSessionsView | `px-7 py-6` | — |

### 4.3 Standard Spacing Tokens

Use Tailwind's 4 px grid. Common values:
- `gap-1.5` (6 px) — tight button groups
- `gap-2` (8 px) — pill/badge groups
- `gap-3` / `gap-3.5` (12–14 px) — list item internal layout
- `gap-4` (16 px) — form field stacks, horizontal action groups
- `gap-5` (20 px) — cover + identity block in BookDetailPanel
- `space-y-6` (24 px) — section spacing inside panels
- `space-y-7` (28 px) — section spacing in SettingsView

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Custom checkbox (`rounded`) |
| `--radius-md` | `8px` | Cover thumbnail (`rounded-xl` = 12 px in Tailwind, but see below) |
| `--radius-lg` | `12px` | — (available, not heavily used directly) |
| `--radius-pill` | `9999px` | Pill buttons, badges, filter chips, scrollbar thumb |

**In practice the codebase uses Tailwind shorthand:**
- `rounded-full` — all pill buttons, all badge chips, all filter pills
- `rounded-2xl` — chat bubbles (user message, suggestion card, prompt textarea, suggestion prompt buttons)
- `rounded-xl` — inputs, selects, textareas, list-item hover areas, cover thumbnail
- `rounded-md` — library list cover thumbnail (`rounded-md`)
- `rounded` — custom checkbox

---

## 6. Shadows & Elevation

The app uses only **subtle, warm shadows**. There is no elevation system with multiple levels.

```css
/* Applied globally to inputs/textareas/selects in styles.css */
box-shadow: 0 1px 3px rgba(42, 31, 20, 0.08);
```

In Tailwind, this maps to `shadow-sm`. Use `shadow-sm` on:
- Pill buttons (Save, New chat, Import CSV, ghost action buttons)
- Filter chips in their default state
- Active tab pill in CanvasTabs
- Active CTA button (Ask, Save settings)
- Source link pills in BookDetailPanel

Never use `shadow-md`, `shadow-lg`, or drop shadows on panels or containers.
The saved-confirmation toast uses `shadow-md` — that is the one exception.

---

## 7. Component Patterns

### 7.1 Buttons

There are three button variants. **Always use `<button type="button">` or `<button type="submit">` — never `<a>` styled as a button.**

#### Primary (espresso pill)
```
px-4 py-1.5 rounded-full bg-[--color-espresso] text-[--color-parchment]
text-sm font-medium shadow-sm
hover:bg-[--color-espresso-hover] transition-colors
disabled:opacity-40 disabled:cursor-not-allowed
```
Used for: Ask, Save (chat), active preference suggestion "Save preference", Settings Save, BookForm submit.

#### Ghost (warm tan pill)
```
px-4 py-1.5 rounded-full bg-[--color-ghost-btn] text-[--color-ink]
text-sm shadow-sm
hover:bg-[--color-border-mid] transition-colors
disabled:opacity-35 disabled:cursor-not-allowed
```
Used for: New chat, Save (when no session = disabled), Import CSV, "Decline" preference, Discard settings.

#### Icon / inline text button
```
inline font-semibold text-[--color-green]
underline underline-offset-2 decoration-[--color-green]/40
hover:text-[--color-green-hover] hover:decoration-[--color-green-hover]/60
transition-colors border-0 bg-transparent p-0 cursor-pointer
```
Used exclusively for book-link references inside assistant messages.

#### Full-width submit (form)
Same as Primary but `w-full text-sm px-4 py-2` (slightly taller padding).
Used in BookForm.

### 7.2 Filter / Tab Pills

Two states — active and default:

```
/* Active */
bg-[--color-espresso] text-[--color-parchment] font-medium shadow-sm

/* Default */
bg-transparent text-[--color-ink-muted] font-normal
hover:bg-[--color-ghost-btn] hover:text-[--color-ink]
```

Shared base: `py-1.5 px-3.5 rounded-full text-sm border-0 cursor-pointer transition-all duration-150`

Used for: CanvasTabs tab bar, LibraryView shelf filter chips.

### 7.3 Badges / Status Pills

All badges are non-interactive `<span>` elements with `rounded-full`.

| Variant | Classes |
|---|---|
| Read | `text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-green] bg-[--color-green-bg]` |
| Want to read | `text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-amber] bg-[--color-amber-bg]` |
| Not in library | `text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full text-[--color-ink-light] bg-[--color-cream]` |
| Active (session) | `text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-green] bg-[--color-green-bg]` |

### 7.4 Text Inputs, Textareas, and Selects

All share the same visual treatment (defined as `inputClass` in multiple components):

```
w-full rounded-xl bg-[--color-input-bg] shadow-sm
text-[--color-ink] placeholder:text-[--color-ink-light]
px-3 py-2 text-sm focus:outline-none transition-colors
```

- `resize-y` is added to textareas that should be user-resizable.
- `resize-none` is added to the chat prompt textarea (it has a fixed row count).
- The prompt textarea uses `rounded-2xl px-5 pt-4 pb-12` to accommodate the floating action row inside it.
- Never add a visible border — the `shadow-sm` provides the affordance.
- Never change `focus:outline-none` — there is no focus ring in this design (accessibility is handled at the label/ARIA level).

### 7.5 Section Labels (Overlines)

All section headings inside panel content use the same pattern:

```
text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-2 mt-0
```

In SettingsView this is stored as `const sectionLabel = "..."`.
In BookDetailPanel it is a `<SectionLabel>` component wrapping a `<p>`.
Always use `<p>` or `<span>`, never `<h2>`–`<h6>` for these overlines — the actual heading hierarchy is handled by the panel's `<h2>` book title.

### 7.6 Form Field Labels

```
block text-sm font-medium text-[--color-ink-muted] mb-1
```

Used directly above `<input>`, `<select>`, and `<textarea>`. Always pair with a matching `htmlFor` / `id`.

### 7.7 Chat Message Bubbles

**User message:**
```
max-w-sm bg-[--color-ghost-btn] rounded-2xl px-4 py-3
text-[--color-ink] text-sm leading-relaxed
```
Wrapped in `<div className="flex justify-end">`.

**Assistant message:**
```
font-serif text-[--color-ink] text-base leading-[1.75]
```
Rendered as a `<p>` with inline `<button>` children for book links (see Section 7.1 icon button variant).
Wrapped in `<div className="max-w-[42rem]">`.

**Preference suggestion card:**
```
max-w-[42rem] bg-[--color-amber-bg] rounded-2xl px-5 py-4
```
Contains suggestion text (`text-sm text-[--color-ink] leading-relaxed`) and two action buttons (Primary + Ghost).

### 7.8 Suggestion Prompt Chips (Empty State)

```
text-left text-sm text-[--color-ink] rounded-2xl px-4 py-3
bg-[--color-ghost-btn] shadow-sm hover:bg-[--color-border-mid] transition-colors
```

### 7.9 Thinking Indicator

Three bouncing dots + text:
```jsx
<div className="flex items-center gap-2 text-sm text-[--color-ink-muted]" aria-live="polite">
  <span className="inline-flex gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[--color-tan] animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
  <span>Thinking…</span>
</div>
```

### 7.10 Library Book List Item

Each item is a `<button>` with:
```
w-full text-left flex items-start gap-3.5 px-3 py-3
rounded-xl hover:bg-[--color-cream] transition-colors group
```

Internal structure:
1. **Cover thumbnail** — `w-9 h-[54px] rounded-md overflow-hidden bg-[--color-cream] border border-[--color-border]`
2. **Title** — `text-sm font-semibold text-[--color-ink] leading-snug group-hover:text-[--color-espresso] line-clamp-2`
3. **Author** — `text-xs text-[--color-ink-muted] mt-0.5`
4. **Metadata row** — `flex items-center gap-3 mt-1.5 flex-wrap` containing StarRating + date micro-copy + page count

### 7.11 Sessions List Item

Each item is a `<button>` with a left-border accent:

```
/* Default */
w-full text-left flex items-start justify-between gap-4
px-3.5 py-3 rounded-xl border-l-2 border-transparent
hover:bg-[--color-cream] transition-colors group

/* Active */
w-full text-left flex items-start justify-between gap-4
pl-3 pr-3.5 py-3 rounded-xl border-l-2 border-[--color-border-mid]
bg-[--color-cream] transition-colors group
```

### 7.12 Custom Checkbox

The `<input type="checkbox">` is visually hidden (`className="sr-only"`). A custom `<span>` renders:

```jsx
<span
  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
  style={{
    backgroundColor: source.enabled ? "#3d2b1f" : "#ddd4c4",
  }}
>
  {source.enabled && (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l2.5 2.5L9 1" stroke="#fffdf8" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )}
</span>
```

Note: This is the one place hex colors appear inline (mirroring the CSS variables `--color-espresso` and `--color-ghost-btn`). Future work should switch to CSS vars here too.

### 7.13 Source Link Pills (BookDetailPanel)

```
text-xs font-medium text-[--color-ink] bg-[--color-ghost-btn] shadow-sm
rounded-full px-3 py-1.5 hover:bg-[--color-border-mid] transition-colors no-underline
```
These are `<a target="_blank" rel="noreferrer">` tags.

### 7.14 Save Confirmation Toast

```
fixed bottom-5 left-1/2 -translate-x-1/2 z-50
px-4 py-2 rounded-full text-sm font-medium shadow-md
bg-[--color-espresso] text-[--color-parchment]
flex items-center gap-2 pointer-events-none
transition-all duration-300
```
Toggled with opacity + translate: `opacity-100 translate-y-0` (visible) vs `opacity-0 translate-y-2` (hidden).
Always pair with `role="status" aria-live="polite" aria-atomic="true"`.

### 7.15 Dirty-State Footer Bar (Settings)

```
flex-shrink-0 px-7 py-4 flex items-center justify-between gap-3
bg-[--color-panel] border-t border-[--color-border]
transition-all duration-200
```
Toggled: `opacity-100 translate-y-0` vs `opacity-0 pointer-events-none translate-y-1`.
Set `aria-hidden={!isDirty}`.

### 7.16 Scrollbar Styling

Defined globally in `src/styles.css`:
- Width/height: `5px`
- Track: transparent
- Thumb: `bg-[--color-border] rounded-full`

Do not override scrollbar styles in individual components.

### 7.17 Dividers

Use `<hr className="border-[--color-border]">` for section dividers in Settings.
Use `border-b border-[--color-border]` on the header strip in LibraryView.

---

## 8. Metadata Grid Pattern

Used in BookDetailPanel for key–value pairs:

```html
<dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
  <dt className="text-[--color-ink-muted] font-medium whitespace-nowrap">Publisher</dt>
  <dd className="text-[--color-ink] m-0">…</dd>
</dl>
```

`max-content` in the first column makes the label column hug its text naturally.

---

## 9. Empty States

Two patterns are used:

**Serif prose (left-aligned):**
```html
<div className="flex flex-col items-start px-3 pt-8 gap-3">
  <p className="font-serif text-base text-[--color-ink-muted] leading-relaxed">
    Your library is empty. Import a Goodreads CSV to get started.
  </p>
</div>
```

**Detail-panel centered prose:**
```html
<div className="flex flex-col items-start justify-center h-full px-8 py-12">
  <p className="font-serif text-lg text-[--color-ink-muted] leading-relaxed max-w-xs">
    Select a book in chat to inspect its details…
  </p>
</div>
```

Empty states use `font-serif`, `text-[--color-ink-muted]`, and `leading-relaxed`. They are never centered horizontally — always `items-start`.

---

## 10. Accessibility Conventions

- Every `<section>` used as a landmark has an `aria-label`.
- Every icon SVG has `aria-hidden="true"`.
- Every interactive element that shows a count or state has an explicit `aria-label` (e.g., star rating).
- The thinking indicator uses `aria-live="polite" aria-label="Thinking"`.
- The save toast uses `role="status" aria-live="polite" aria-atomic="true"`.
- Hidden-but-accessible labels use Tailwind's `sr-only` class.
- Filter buttons use `aria-pressed={isActive}`.
- Tab buttons use `role="tab"` and `aria-selected={isActive}`.
- Custom checkboxes hide the native input with `className="sr-only"` while keeping it in the DOM.
- Form fields always have a `<label>` with matching `htmlFor`/`id`.

---

## 11. Animation

Only two animation patterns are used:

| Effect | Classes |
|---|---|
| Bounce dots (thinking indicator) | `animate-bounce` with staggered `animationDelay` (0s, 0.15s, 0.30s) |
| Catalog-loading pulse | `animate-pulse` on the "Looking up catalog data…" text |

Transition utility: `transition-colors` or `transition-all duration-200/300`. No keyframe animations beyond the above.

---

## 12. Inline SVG Icon Conventions

- All icons are 20×20 viewBox drawn with `fill="currentColor"` (or `stroke="currentColor"` for stroke-based icons).
- Use Tailwind `w-4 h-4` (16 px) or `w-3 h-3` (12 px) for small inline icons.
- Color is always inherited via `text-[--color-*]` on a parent or directly on the `<svg>`.
- No icon font, no external sprite — inline SVG only.

---

## 13. Panel Structure Template

When adding a new right-column panel (a new `CanvasTab` view), follow this structure:

```tsx
// New panel: always a direct child of the `flex-1 overflow-y-auto` div in App.tsx

export default function MyNewView(props: MyNewViewProps) {
  return (
    <div className="px-7 py-6">
      {/* Section overline */}
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-4">
        Section title
      </p>

      {/* Content */}
      <div className="space-y-4">
        {/* … */}
      </div>
    </div>
  );
}
```

If the panel needs a sticky footer (e.g., a save bar), wrap the whole thing in `flex flex-col h-full overflow-hidden` and use `flex-1 overflow-y-auto` for the scrollable region and `flex-shrink-0` for the footer.

---

## 14. New-Feature Checklist

Before submitting any UI change, verify:

- [ ] All colors use `--color-*` tokens — no raw hex values, no Tailwind named colors (e.g., `text-white`, `bg-gray-100`)
- [ ] Buttons are pill-shaped (`rounded-full`) and use either the Primary or Ghost variant
- [ ] Section headers use the amber overline pattern (`text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber]`)
- [ ] Prose / reading content uses `font-serif`; UI chrome uses `font-sans` (the default)
- [ ] No new colors, font families, or shadow levels introduced
- [ ] All interactive SVG icons have `aria-hidden="true"`
- [ ] All new `<section>` landmark elements have an `aria-label`
- [ ] Custom interactive controls (checkboxes, toggles) keep a visually-hidden native element for accessibility
- [ ] Empty states use `font-serif text-[--color-ink-muted] leading-relaxed` and are left-aligned
- [ ] Inputs/textareas/selects use `rounded-xl bg-[--color-input-bg] shadow-sm focus:outline-none`
- [ ] The scrollable content region does not have a hardcoded height — use `flex-1 overflow-y-auto`
