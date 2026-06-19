# NextChapter UI Design Addendum

Date: 2026-06-17
Status: Superseded 2026-06-19 by chat-first book inspector direction

Related documents:
- `docs/superpowers/specs/2026-06-17-nextchapter-requirements-design.md`
- `docs/superpowers/plans/2026-06-17-nextchapter-mvp-implementation.md`

## Supersession Note

This addendum is superseded by the revised requirements in `docs/superpowers/specs/2026-06-17-nextchapter-requirements-design.md`. The current product direction is **Chat-First With Book Inspector**:

- The chat transcript is the canonical recommendation surface.
- Assistant responses render recommended book titles as clickable links.
- The right-hand canvas defaults to selected-book detail: cover, metadata, shelf status, summary, recommendation rationale, user notes, and external source links.
- Library, Sessions, and Settings remain available as secondary utility views.
- The old Current Results card-board direction should not drive new implementation work unless explicitly reintroduced.

The historical wireframes below are retained only as background context.

## Purpose

This addendum locks the pre-coding UI direction for the NextChapter MVP. It defines the first usable app experience before React scaffolding begins.

The UI should feel like a quiet personal reading workspace: conversational enough for loose recommendation prompts, structured enough to preserve shelves, sessions, results, details, and settings without forcing the user to search through chat history.

## Desktop Wireframes

Desktop uses a two-pane workspace. Chat remains visible on the left. The canvas on the right holds durable app state and switches between primary work surfaces.

```text
+--------------------------------------------------------------------------------+
| NextChapter                                              Import  Settings  Save |
+-------------------------------+------------------------------------------------+
| CHAT                          | CANVAS                                         |
|                               | +--------------------------------------------+ |
| Session: Summer trip reads    | | Library | Sessions | Current | Detail | Settings | |
|                               | +--------------------------------------------+ |
| Assistant                     |                                                |
| "Tell me what you want next." | CURRENT RESULTS                                |
|                               |                                                |
| User                          | From your want-to-read shelf                   |
| "Something light but smart."  | +-------------------------+ +----------------+ |
|                               | | Book title               | | Book title    | |
| Assistant                     | | Author                   | | Author        | |
| "I found a few options..."    | | Rationale: ...           | | Rationale...  | |
|                               | | Caveat: ...              | | Caveat: ...   | |
| Pending preference suggestion | | [Shortlist] [Accept]     | | [Shortlist]   | |
| +---------------------------+ | | [Reject] [Detail] [...]  | | [Reject] [...]| |
| | Save preference?          | | +-------------------------+ +----------------+ |
| | [Approve] [Decline]       | |                                                |
| +---------------------------+ | New discoveries                                |
|                               | +-------------------------+ +----------------+ |
| Prompt input                  | | Book title               | | Book title    | |
| +-------------------------+   | | Author                   | | Author        | |
| | More literary, less bleak |  | | Match notes: ...         | | Match notes...| |
| +-------------------------+   | | Caveat: ...              | | Caveat: ...   | |
| [Send]                        | | [Add want] [Mark read]   | | [Add want]    | |
|                               | | [External] [Detail]      | | [External]    | |
+-------------------------------+------------------------------------------------+
```

Canvas tab responsibilities:

- **Library**: imported and manually added books, shelf filters, search, sort, import summary, add/edit actions.
- **Sessions**: saved recommendation sessions, prompts, rounds, accepted/rejected/shortlisted books, resume actions.
- **Current Results**: active recommendation round grouped into "From your want-to-read shelf" and "New discoveries".
- **Book Detail**: selected book metadata, user notes, shelf status, recommendation rationale, source links.
- **Settings**: reading preferences context, AI provider/model settings, external link source configuration.

Recommendation card actions must be inline and visible without opening the detail panel:

- Shortlist
- Accept
- Reject
- Add to want-to-read
- Mark read
- Open detail
- Open external links

Cards may hide less frequent actions behind a compact overflow menu at narrower desktop widths, but the primary recommendation decision actions, Shortlist, Accept, and Reject, should remain directly visible.

## Mobile Wireframes

Mobile uses a single-column shell with a clear Chat/Canvas switch. There must be no horizontal scrolling. Canvas tabs become a compact segmented control or horizontally scrollable tab row with stable tap targets.

```text
+--------------------------------+
| NextChapter              Menu  |
+--------------------------------+
| [ Chat ] [ Canvas ]             |
+--------------------------------+
| CHAT VIEW                       |
|                                |
| Session: Summer trip reads      |
|                                |
| Assistant message               |
| User message                    |
| Recommendation summary          |
|                                |
| Pending preference suggestion   |
| +----------------------------+  |
| | Save this preference?      |  |
| | [Approve] [Decline]        |  |
| +----------------------------+  |
|                                |
| +----------------------------+  |
| | Type a refinement...       |  |
| +----------------------------+  |
| [Send]                         |
+--------------------------------+
```

```text
+--------------------------------+
| NextChapter              Menu  |
+--------------------------------+
| [ Chat ] [ Canvas ]             |
+--------------------------------+
| Library Sessions Current       |
| Detail Settings                |
+--------------------------------+
| CURRENT RESULTS                 |
|                                |
| From your want-to-read shelf    |
| +----------------------------+  |
| | Book title                  |  |
| | Author                      |  |
| | Rationale                   |  |
| | 2-3 lines max before expand |  |
| | Caveat                      |  |
| | [Shortlist] [Accept]        |  |
| | [Reject] [Detail]           |  |
| | [Add want] [External]       |  |
| +----------------------------+  |
|                                |
| New discoveries                 |
| +----------------------------+  |
| | Book title                  |  |
| | Author                      |  |
| | Rationale                   |  |
| | Caveat                      |  |
| | [Shortlist] [Accept]        |  |
| | [Reject] [Detail]           |  |
| +----------------------------+  |
+--------------------------------+
```

Mobile behavior rules:

- Chat and canvas switch without losing scroll position in either view.
- The active session title remains visible near the top of both Chat and Current Results.
- Recommendation card text wraps naturally; no action row may require horizontal scrolling.
- Rationale and caveats are readable in the card. Longer metadata belongs in Book Detail.
- Book Detail opens as the Detail tab, not as a narrow modal that traps the user.
- Settings remains reachable but visually secondary to Library, Sessions, Current Results, and Book Detail.

## Core Flow

1. User enters a natural-language prompt in chat.
2. App creates a recommendation session if none is active, or continues the current session if the prompt is a refinement.
3. Chat shows a concise assistant summary and the canvas switches or updates to Current Results.
4. Current Results shows recommendation cards in two lanes: "From your want-to-read shelf" and "New discoveries".
5. User shortlists, accepts, rejects, adds to want-to-read, marks read, opens details, opens external links, or refines the request in chat.
6. A follow-up prompt creates another recommendation round inside the same saved session.
7. Sessions view lets the user return to prior prompts, rounds, accepted books, rejected books, and shortlists.

The chat is for intent, refinement, and concise narrative. The canvas is for durable state, comparison, decisions, settings, and book-level work.

## Interaction State Map

### Empty Library

- **Owner**: Library tab with supporting chat copy when the user asks for recommendations before importing.
- **Visible**: Empty shelf summary, Goodreads CSV import action, manual add action, explanation that recommendations improve after importing ratings and notes.
- **Primary actions**: Import Goodreads CSV, add a book manually, open Settings to edit preferences.
- **Copy**: Communicate that the app can still make broad recommendations, but personal fit will be limited until the library has books, ratings, notes, or preferences.

### Imported Library

- **Owner**: Library tab.
- **Visible**: Counts for read and want-to-read shelves, search input, shelf filter, sort control, book rows or compact cards, last import summary.
- **Primary actions**: Search, filter, sort, add book, edit book, remove book, move between shelves, start a recommendation from want-to-read.
- **Copy**: Confirm successful import with counts for imported, skipped, and attention-needed rows.

### Import Errors Or Skipped CSV Rows

- **Owner**: Library tab.
- **Visible**: Import summary banner, row-level issue list, skipped count, retained partial records count when applicable.
- **Primary actions**: Review skipped rows, retry import, continue with imported records, manually add missing books.
- **Copy**: Explain what happened and what the user can do next. Avoid implying the entire import failed when only some rows were skipped.

### No Active Recommendation Session

- **Owner**: Chat panel and Current Results tab.
- **Visible**: Chat prompt input, suggested prompt examples, Current Results empty state, Sessions access.
- **Primary actions**: Ask for recommendations, choose a prior session, import or edit library context.
- **Copy**: Encourage a natural-language request and mention examples such as mood, genre, theme, shelf-only, or comparison prompts.

### Active Recommendation Results

- **Owner**: Current Results tab with companion chat summary.
- **Visible**: Active session title, current prompt, round number, two result lanes, recommendation cards with rationale and caveats.
- **Primary actions**: Shortlist, accept, reject, add to want-to-read, mark read, open detail, open external links, refine in chat.
- **Copy**: Explain why recommendations fit and flag uncertainty or weak library context when relevant.

### Iterative Follow-Up Round

- **Owner**: Chat panel for refinement input; Current Results and Sessions tabs for durable state.
- **Visible**: Prior round context, new round results, indication that the same session continued.
- **Primary actions**: Compare rounds, refine again, accept/reject new results, return to prior round, shortlist across rounds.
- **Copy**: Confirm what changed, such as "Adjusted toward lighter pacing and less bleak tone."

### Pending Preference Suggestion

- **Owner**: Chat panel inline, with Settings retaining the approved result after confirmation.
- **Visible**: Suggested preference text, reason for suggestion, Approve and Decline actions.
- **Primary actions**: Approve preference, decline preference, edit preferences in Settings.
- **Copy**: Make clear that inferred preferences are not saved until approved.

### Selected Book Detail

- **Owner**: Book Detail tab.
- **Visible**: Title, author, shelf status, user rating, notes/review, metadata, recommendation rationale, caveats, source links.
- **Primary actions**: Edit book, change shelf/status, add to want-to-read, mark read, open external links, return to Current Results or Library.
- **Copy**: Separate known facts from recommendation inferences. If metadata is missing, say what is missing without blocking actions.

### Settings Edit And Save States

- **Owner**: Settings tab.
- **Visible**: Reading preferences context, AI provider/model configuration, external link source ordering and enabled flags.
- **Primary actions**: Edit preferences, save settings, cancel edits, reorder or toggle link sources, test or save AI settings.
- **Copy**: Confirm saved changes. On errors, preserve unsaved edits and explain what needs correction.

## Visual Direction

The MVP visual direction is a quiet personal reading workspace. It should feel warm, focused, bookish, and useful, without becoming a marketing page or decorative bookshelf simulation.

The interface should prioritize reading, comparison, and decision-making:

- Dense enough to scan several recommendations on desktop.
- Calm enough that rationales and caveats are easy to read.
- Warm enough to feel personal rather than administrative.
- Restrained enough that settings, import state, and errors stay clear.

Recommended palette:

- Background: warm off-white, `#f7f3ec`.
- Primary text: deep ink, `#27231f`.
- Secondary text: softened charcoal, `#625b52`.
- Surface: clean paper, `#fffdf8`.
- Border: muted parchment line, `#d8cfc0`.
- Primary accent: library green, `#2f6f5e`.
- Secondary accent: muted burgundy, `#8b3f4d`.
- Notice accent: amber, `#b7791f`.
- Error accent: clear red-brown, `#a33a2f`.

This palette should not collapse into a single beige theme. Green and burgundy should carry action and selection states, while the warm background stays quiet.

## Component Rules

### Typography Scale

- App title: 20-24px, medium or semibold.
- Primary screen headings: 18-22px.
- Section headings and lane labels: 15-17px, semibold.
- Body text and card text: 14-16px.
- Metadata, timestamps, and secondary labels: 12-13px.
- Avoid viewport-based font scaling. Text must wrap within controls and cards.

### Spacing Density

- Use an 8px spacing base.
- Desktop pane padding: 16-24px.
- Mobile view padding: 12-16px.
- Card internal spacing: 12-16px.
- Dense lists may use 8-12px vertical rhythm, but action rows need enough space for reliable tapping.

### Card And List Treatment

- Recommendation cards use a restrained paper surface, 1px border, and radius of 6-8px.
- Do not place cards inside decorative outer cards.
- Library and Sessions can use rows on desktop and compact cards on mobile.
- Rationale and caveat text must remain visible on recommendation cards; long descriptions move to Book Detail.
- Empty states should be plain, useful, and action-oriented rather than illustrated hero sections.

### Button Hierarchy

- Primary command: Send prompt, save settings, import CSV, accept recommendation.
- Secondary command: Shortlist, add to want-to-read, mark read, open detail.
- Destructive or negative command: Reject, remove book, decline suggestion.
- Link command: External book sources.
- Button labels should be concrete and short. Icons may accompany common actions when implementation begins, but text labels are required for MVP clarity.

### Responsive Behavior

- Desktop at wide widths: persistent left chat pane and right canvas pane.
- Tablet or narrow desktop: panes may rebalance width, with canvas retaining tab navigation.
- Mobile: single-column Chat/Canvas switch, then canvas tab switch.
- No horizontal scrolling for app layout, cards, forms, or action rows.
- The selected session and current canvas tab should remain legible on every viewport.

### Surface Priority

- Primary canvas surfaces: Library, Sessions, Current Results, Book Detail.
- Secondary surface: Settings.
- Settings must not dominate the everyday workflow. It should be easy to find, but visually quieter than recommendation and library tasks.

### Forms And Editing

- Book editing should use clear labels and predictable fields.
- Settings edits should preserve unsaved text if validation fails.
- Import review should separate file-level errors from row-level skipped records.
- Preference suggestion approval should be inline in chat, then persisted into Settings after approval.

## Approval

Status: Approved by user
