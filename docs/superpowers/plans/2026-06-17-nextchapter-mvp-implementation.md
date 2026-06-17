# NextChapter MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable single-user NextChapter web app: import/edit books, chat for explainable recommendations, save iterative sessions, and configure preferences/model/link settings.

**Architecture:** Use a browser-first React app with TypeScript domain modules underneath. Domain logic owns library records, Goodreads CSV parsing, recommendation session state, prompt/context construction, and local persistence; React components render chat, canvas tabs, book cards, forms, and settings. The first implementation stores data in `localStorage` through a typed repository so a server or database can replace it without rewriting UI behavior.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, Papa Parse for CSV parsing, localStorage persistence, provider-agnostic AI adapter with a deterministic mock provider first and OpenAI-compatible provider shape.

---

## File Structure

- Create `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`: approved wireframes, interaction state map, visual direction, and UI implementation rules. This file must exist and be approved before app scaffolding starts.
- Create `package.json`: scripts and dependencies.
- Create `index.html`: Vite HTML entry.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.setup.ts`: TypeScript, Vite, and test configuration.
- Create `src/main.tsx`: React entry.
- Create `src/App.tsx`: top-level app composition and state wiring.
- Create `src/styles.css`: app layout, responsive chat/canvas UI, forms, cards.
- Create `src/domain/types.ts`: shared domain types for books, shelves, sessions, recommendations, preferences, settings, and app state.
- Create `src/domain/ids.ts`: deterministic ID helper.
- Create `src/domain/library.ts`: book create/update/delete, shelf transitions, library selectors.
- Create `src/domain/goodreadsCsv.ts`: Goodreads CSV parsing and import summary creation.
- Create `src/domain/externalLinks.ts`: configurable external link generation.
- Create `src/domain/recommendationContext.ts`: relevant context selection for AI requests.
- Create `src/domain/recommendationSessions.ts`: session creation, round appending, accept/reject/shortlist behavior, preference suggestion decisions.
- Create `src/domain/defaultState.ts`: initial settings, preferences, and empty app state.
- Create `src/storage/localRepository.ts`: typed localStorage load/save with migration guard.
- Create `src/ai/types.ts`: provider-agnostic AI request/response contract.
- Create `src/ai/mockProvider.ts`: deterministic recommendation provider for tests and offline use.
- Create `src/ai/openAiCompatibleProvider.ts`: configurable provider shell that calls an OpenAI-compatible chat completions endpoint.
- Create `src/components/ChatPanel.tsx`: prompt entry, message history, preference suggestion confirmation.
- Create `src/components/CanvasTabs.tsx`: canvas tab navigation.
- Create `src/components/LibraryView.tsx`: library import, search/filter/sort, add/edit book form.
- Create `src/components/RecommendationSessionsView.tsx`: saved sessions and session detail summary.
- Create `src/components/CurrentResultsView.tsx`: grouped recommendation cards and actions.
- Create `src/components/BookDetailPanel.tsx`: richer book metadata, notes, status, links.
- Create `src/components/SettingsView.tsx`: preferences context, AI model settings, link source ordering/enabled flags.
- Create `src/components/BookForm.tsx`: reusable add/edit form.
- Create `src/components/RecommendationCard.tsx`: recommendation display and actions.
- Create `src/test/fixtures/goodreads-export.csv`: representative Goodreads CSV fixture.
- Create `src/test/testUtils.tsx`: React test helpers.
- Create tests beside modules as `*.test.ts` or `*.test.tsx`.

## Pre-Coding UI Design Tasks

These tasks are required before `Task 1: Scaffold Tooling And App Shell`. They produce design artifacts only; do not scaffold React, write app code, or create implementation files until the user has approved the UI design addendum.

### Pre-Coding Task A: Product Flow Wireframes

**Files:**
- Create: `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`

- [x] **Step 1: Create low-fidelity desktop wireframes**

Add a `## Desktop Wireframes` section to `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`.

The desktop wireframes must show:

- Chat panel on the left.
- Canvas on the right.
- Canvas navigation for Library, Sessions, Current Results, Book Detail, and Settings.
- Current Results grouped into "From your want-to-read shelf" and "New discoveries".
- Inline actions for shortlist, accept, reject, add to want-to-read, mark read, open detail, and external links.

- [x] **Step 2: Create low-fidelity mobile wireframes**

Add a `## Mobile Wireframes` section to the UI design addendum.

The mobile wireframes must show:

- Chat and canvas reachable without horizontal scrolling.
- A clear way to switch between chat and canvas views.
- The same primary canvas surfaces as desktop: Library, Sessions, Current Results, Book Detail, and Settings.
- Recommendation cards that keep rationale, caveats, and actions readable on a narrow screen.

- [x] **Step 3: Document the core recommendation flow**

Add a `## Core Flow` section to the UI design addendum.

Document this sequence:

1. User enters a natural-language prompt in chat.
2. App creates or continues a recommendation session.
3. Current Results shows recommendation cards in the two required lanes.
4. User shortlists, accepts, rejects, opens details, or refines in chat.
5. Follow-up prompt creates another round in the same saved session.
6. Sessions view lets the user return to prior rounds and shortlists.

### Pre-Coding Task B: Interaction State Map

**Files:**
- Modify: `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`

- [x] **Step 1: Define required UI states**

Add a `## Interaction State Map` section to the UI design addendum.

It must cover these states:

- Empty library.
- Imported library.
- Import errors or skipped CSV rows.
- No active recommendation session.
- Active recommendation results.
- Iterative follow-up round.
- Pending preference suggestion.
- Selected book detail.
- Settings edit and save states.

- [x] **Step 2: Add acceptance notes for each state**

For each state in `## Interaction State Map`, include:

- What must be visible.
- What primary actions must be available.
- What empty, error, or confirmation copy must communicate.
- Which canvas tab or chat area owns the state.

### Pre-Coding Task C: Visual Direction And Component Rules

**Files:**
- Modify: `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`

- [x] **Step 1: Choose the MVP visual direction**

Add a `## Visual Direction` section to the UI design addendum.

The selected direction must describe the app as a quiet personal reading workspace: warm, focused, bookish, useful, and not a marketing page.

- [x] **Step 2: Define component rules**

Add a `## Component Rules` section to the UI design addendum.

Define:

- Typography scale.
- Spacing density.
- Color palette.
- Card and list treatment.
- Button hierarchy.
- Responsive behavior.
- Settings as a secondary surface.
- Library, Sessions, Current Results, and Book Detail as primary canvas surfaces.

### Pre-Coding Task D: UI Approval Gate

**Files:**
- Modify: `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`

- [x] **Step 1: Add approval status**

Add an `## Approval` section to the UI design addendum with:

```md
## Approval

Status: Pending user approval

Implementation must not begin until this status is changed to:

Status: Approved by user
```

- [x] **Step 2: Request user review**

Ask the user to review `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md`. If the user requests changes, revise the addendum before Task 1 starts.

- [x] **Step 3: Lock the design gate**

After user approval, update the addendum approval section to:

```md
## Approval

Status: Approved by user
```

Only after this status is present may implementation proceed to `Task 1: Scaffold Tooling And App Shell`.

## Implementation Tasks

### Task 1: Scaffold Tooling And App Shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.setup.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Test: `src/App.test.tsx`

- [x] **Step 0: Confirm approved UI design addendum**

Open `docs/superpowers/specs/2026-06-17-nextchapter-ui-design-addendum.md` and verify it contains:

```md
Status: Approved by user
```

Expected: the approval status is present before any app scaffolding or React implementation begins. If it is missing, stop and complete the Pre-Coding UI Design Tasks first.

- [x] **Step 1: Create the package manifest**

Create `package.json`:

```json
{
  "name": "nextchapter",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  },
  "dependencies": {
    "papaparse": "^5.5.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^24.0.0",
    "@types/papaparse": "^5.3.16",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^5.0.0",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.3",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

- [x] **Step 2: Add Vite and TypeScript config**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NextChapter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.setup.ts", "src"]
}
```

Create `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true
  }
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [x] **Step 3: Write the failing shell render test**

Create `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the chat-first app shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NextChapter" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Ask for book recommendations" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Library" })).toBeInTheDocument();
  });
});
```

- [x] **Step 4: Run test to verify it fails**

Run: `npm install`

Run: `npm test -- src/App.test.tsx`

Expected: dependency installation succeeds, then the test fails because `src/App.tsx` does not exist.

- [x] **Step 5: Implement the app shell**

Create `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="Recommendation chat">
        <header className="app-header">
          <p className="eyebrow">Personal reading advisor</p>
          <h1>NextChapter</h1>
        </header>
        <div className="message-list" aria-label="Conversation">
          <p className="assistant-message">
            Ask for a mood, genre, theme, shelf pick, or reading goal.
          </p>
        </div>
        <form className="prompt-form">
          <label htmlFor="recommendation-prompt">Ask for book recommendations</label>
          <textarea
            id="recommendation-prompt"
            name="prompt"
            rows={4}
            placeholder="Find me a post-apocalyptic novel that fits what I have liked before..."
          />
          <button type="submit">Recommend</button>
        </form>
      </section>

      <section className="canvas-panel" aria-label="Library canvas">
        <div role="tablist" aria-label="Canvas views" className="tabs">
          <button role="tab" aria-selected="true">Library</button>
          <button role="tab" aria-selected="false">Sessions</button>
          <button role="tab" aria-selected="false">Current Results</button>
          <button role="tab" aria-selected="false">Book Detail</button>
          <button role="tab" aria-selected="false">Settings</button>
        </div>
        <div className="canvas-body">
          <h2>Library</h2>
          <p>Import Goodreads CSV data or add books manually.</p>
        </div>
      </section>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #1f2933;
  background: #f7f2ea;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
textarea,
input,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.3fr);
  gap: 1px;
  background: #d6d3cc;
}

.chat-panel,
.canvas-panel {
  background: #fffdf8;
  min-width: 0;
}

.chat-panel {
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 24px;
  gap: 20px;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.eyebrow {
  margin: 0 0 4px;
  color: #7a5a2e;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.message-list {
  overflow: auto;
}

.assistant-message {
  max-width: 42rem;
  padding: 14px 16px;
  border: 1px solid #e5ded2;
  border-radius: 8px;
  background: #faf6ee;
}

.prompt-form {
  display: grid;
  gap: 10px;
}

.prompt-form label {
  font-weight: 700;
}

textarea,
input,
select {
  width: 100%;
  border: 1px solid #c9c2b8;
  border-radius: 6px;
  padding: 10px 12px;
  background: white;
  color: #1f2933;
}

button {
  border: 1px solid #57412a;
  border-radius: 6px;
  padding: 10px 14px;
  color: white;
  background: #57412a;
  cursor: pointer;
}

button[role="tab"] {
  color: #2d3748;
  background: transparent;
  border-color: transparent;
}

button[aria-selected="true"] {
  color: white;
  background: #57412a;
}

.canvas-panel {
  display: grid;
  grid-template-rows: auto 1fr;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid #e5ded2;
}

.canvas-body {
  padding: 24px;
  overflow: auto;
}

@media (max-width: 820px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
}
```

- [x] **Step 6: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

- [x] **Step 7: Run build**

Run: `npm run build`

Expected: PASS and Vite writes `dist/`.

- [x] **Step 8: Commit**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.setup.ts src/main.tsx src/App.tsx src/styles.css src/App.test.tsx
git commit -m "feat: scaffold NextChapter app shell"
```

### Task 2: Add Domain Types, Defaults, And Local Persistence

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/ids.ts`
- Create: `src/domain/defaultState.ts`
- Create: `src/storage/localRepository.ts`
- Test: `src/storage/localRepository.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Create `src/storage/localRepository.test.ts`:

```ts
import { createDefaultAppState } from "../domain/defaultState";
import type { AppState } from "../domain/types";
import { loadAppState, saveAppState } from "./localRepository";

describe("localRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default state when storage is empty", () => {
    const state = loadAppState();

    expect(state.books).toEqual([]);
    expect(state.settings.ai.provider).toBe("mock");
    expect(state.preferences.text).toContain("Use my reading history");
  });

  it("persists and reloads valid state", () => {
    const state: AppState = {
      ...createDefaultAppState(),
      books: [
        {
          id: "book-1",
          title: "Station Eleven",
          author: "Emily St. John Mandel",
          shelf: "read",
          userRating: 5,
          userNotes: "Loved the reflective post-apocalyptic tone.",
          dateRead: "2022-01-10",
          isbn: "9780385353304",
          isbn13: "9780385353304",
          goodreadsId: "20170404",
          sourceLinks: [],
          metadata: {
            genres: ["Post-apocalyptic"],
            themes: ["art", "memory"],
            description: "A literary post-apocalyptic novel.",
            pageCount: 333,
            publicationYear: 2014
          }
        }
      ]
    };

    saveAppState(state);

    expect(loadAppState().books).toHaveLength(1);
    expect(loadAppState().books[0].title).toBe("Station Eleven");
  });

  it("falls back to defaults when stored JSON is invalid", () => {
    localStorage.setItem("nextchapter.appState.v1", "{bad json");

    expect(loadAppState().books).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/storage/localRepository.test.ts`

Expected: FAIL because the domain and storage modules do not exist.

- [ ] **Step 3: Implement shared types**

Create `src/domain/types.ts`:

```ts
export type Shelf = "read" | "want-to-read" | "none";

export interface SourceLink {
  id: string;
  label: string;
  url: string;
  enabled: boolean;
}

export interface BookMetadata {
  genres: string[];
  themes: string[];
  description: string;
  pageCount?: number;
  publicationYear?: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  shelf: Shelf;
  userRating?: number;
  userNotes: string;
  dateRead?: string;
  isbn?: string;
  isbn13?: string;
  goodreadsId?: string;
  sourceLinks: SourceLink[];
  metadata: BookMetadata;
}

export interface ReadingPreferences {
  text: string;
  approvedInferences: string[];
}

export type RecommendationLane = "shelf" | "discovery";
export type RecommendationDecision = "undecided" | "accepted" | "rejected" | "shortlisted";

export interface Recommendation {
  id: string;
  lane: RecommendationLane;
  title: string;
  author: string;
  rationale: string;
  matchNotes: string[];
  caveats: string[];
  linkedBookId?: string;
  decision: RecommendationDecision;
  sourceLinks: SourceLink[];
}

export interface PreferenceSuggestion {
  id: string;
  text: string;
  status: "pending" | "accepted" | "declined";
}

export interface RecommendationRound {
  id: string;
  prompt: string;
  createdAt: string;
  recommendations: Recommendation[];
  assistantSummary: string;
  preferenceSuggestions: PreferenceSuggestion[];
}

export interface RecommendationSession {
  id: string;
  title: string;
  originalPrompt: string;
  createdAt: string;
  updatedAt: string;
  constraints: string[];
  feedback: string[];
  rounds: RecommendationRound[];
}

export interface AiSettings {
  provider: "mock" | "openai-compatible";
  model: string;
  endpoint: string;
  apiKey: string;
}

export interface LinkSourceSetting {
  id: "goodreads" | "open-library" | "google-books" | "amazon";
  label: string;
  enabled: boolean;
  order: number;
}

export interface AppSettings {
  ai: AiSettings;
  linkSources: LinkSourceSetting[];
}

export interface AppState {
  books: Book[];
  sessions: RecommendationSession[];
  activeSessionId?: string;
  selectedBookId?: string;
  preferences: ReadingPreferences;
  settings: AppSettings;
}
```

- [ ] **Step 4: Implement IDs, default state, and repository**

Create `src/domain/ids.ts`:

```ts
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
```

Create `src/domain/defaultState.ts`:

```ts
import type { AppState, AppSettings } from "./types";

export const defaultSettings: AppSettings = {
  ai: {
    provider: "mock",
    model: "mock-personal-reader-v1",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: ""
  },
  linkSources: [
    { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
    { id: "open-library", label: "Open Library", enabled: true, order: 2 },
    { id: "google-books", label: "Google Books", enabled: true, order: 3 },
    { id: "amazon", label: "Amazon", enabled: true, order: 4 }
  ]
};

export function createDefaultAppState(): AppState {
  return {
    books: [],
    sessions: [],
    preferences: {
      text: "Use my reading history, ratings, notes, and current mood to recommend books. Explain the fit clearly and call out caveats.",
      approvedInferences: []
    },
    settings: defaultSettings
  };
}
```

Create `src/storage/localRepository.ts`:

```ts
import { createDefaultAppState } from "../domain/defaultState";
import type { AppState } from "../domain/types";

export const STORAGE_KEY = "nextchapter.appState.v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAppState(value: unknown): value is AppState {
  return (
    isObject(value) &&
    Array.isArray(value.books) &&
    Array.isArray(value.sessions) &&
    isObject(value.preferences) &&
    isObject(value.settings)
  );
}

export function loadAppState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultAppState();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isAppState(parsed)) {
      return createDefaultAppState();
    }

    return parsed;
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/storage/localRepository.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/types.ts src/domain/ids.ts src/domain/defaultState.ts src/storage/localRepository.ts src/storage/localRepository.test.ts
git commit -m "feat: add typed app state persistence"
```

### Task 3: Implement Library Domain And External Links

**Files:**
- Create: `src/domain/library.ts`
- Create: `src/domain/externalLinks.ts`
- Test: `src/domain/library.test.ts`
- Test: `src/domain/externalLinks.test.ts`

- [ ] **Step 1: Write failing library and link tests**

Create `src/domain/library.test.ts`:

```ts
import type { Book } from "./types";
import { addBook, removeBook, updateBook, booksByShelf, upsertBook } from "./library";

const baseBook: Book = {
  id: "book-1",
  title: "Parable of the Sower",
  author: "Octavia E. Butler",
  shelf: "want-to-read",
  userNotes: "",
  sourceLinks: [],
  metadata: { genres: [], themes: [], description: "" }
};

describe("library", () => {
  it("adds a book with trimmed title and author", () => {
    const books = addBook([], { ...baseBook, title: "  Dune  ", author: " Frank Herbert " });

    expect(books[0].title).toBe("Dune");
    expect(books[0].author).toBe("Frank Herbert");
  });

  it("updates existing book fields without losing metadata", () => {
    const books = updateBook([baseBook], "book-1", { shelf: "read", userRating: 5 });

    expect(books[0].shelf).toBe("read");
    expect(books[0].userRating).toBe(5);
    expect(books[0].metadata).toEqual(baseBook.metadata);
  });

  it("removes a book by id", () => {
    expect(removeBook([baseBook], "book-1")).toEqual([]);
  });

  it("groups books by shelf", () => {
    expect(booksByShelf([baseBook], "want-to-read")).toEqual([baseBook]);
    expect(booksByShelf([baseBook], "read")).toEqual([]);
  });

  it("upserts by title and author case-insensitively", () => {
    const books = upsertBook([baseBook], { ...baseBook, id: "book-2", title: "parable of the sower" });

    expect(books).toHaveLength(1);
    expect(books[0].id).toBe("book-1");
  });
});
```

Create `src/domain/externalLinks.test.ts`:

```ts
import { buildSourceLinks } from "./externalLinks";
import type { LinkSourceSetting } from "./types";

const settings: LinkSourceSetting[] = [
  { id: "amazon", label: "Amazon", enabled: true, order: 4 },
  { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
  { id: "open-library", label: "Open Library", enabled: true, order: 2 },
  { id: "google-books", label: "Google Books", enabled: false, order: 3 }
];

describe("externalLinks", () => {
  it("builds ordered enabled links from book data", () => {
    const links = buildSourceLinks(
      {
        title: "Station Eleven",
        author: "Emily St. John Mandel",
        goodreadsId: "20170404",
        isbn13: "9780385353304"
      },
      settings
    );

    expect(links.map((link) => link.label)).toEqual(["Goodreads", "Open Library", "Amazon"]);
    expect(links[0].url).toContain("20170404");
    expect(links[1].url).toContain("9780385353304");
    expect(links[2].url).toContain("Station%20Eleven");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/domain/library.test.ts src/domain/externalLinks.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement library helpers**

Create `src/domain/library.ts`:

```ts
import type { Book, Shelf } from "./types";

function normalizeText(value: string): string {
  return value.trim();
}

function sameBook(a: Pick<Book, "title" | "author">, b: Pick<Book, "title" | "author">): boolean {
  return (
    a.title.trim().toLowerCase() === b.title.trim().toLowerCase() &&
    a.author.trim().toLowerCase() === b.author.trim().toLowerCase()
  );
}

export function cleanBook(book: Book): Book {
  return {
    ...book,
    title: normalizeText(book.title),
    author: normalizeText(book.author),
    userNotes: book.userNotes.trim()
  };
}

export function addBook(books: Book[], book: Book): Book[] {
  return [...books, cleanBook(book)];
}

export function updateBook(books: Book[], id: string, patch: Partial<Book>): Book[] {
  return books.map((book) => (book.id === id ? cleanBook({ ...book, ...patch }) : book));
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function booksByShelf(books: Book[], shelf: Shelf): Book[] {
  return books.filter((book) => book.shelf === shelf);
}

export function upsertBook(books: Book[], incoming: Book): Book[] {
  const existing = books.find((book) => sameBook(book, incoming));
  if (!existing) {
    return addBook(books, incoming);
  }

  return updateBook(books, existing.id, {
    ...incoming,
    id: existing.id,
    sourceLinks: incoming.sourceLinks.length > 0 ? incoming.sourceLinks : existing.sourceLinks,
    metadata: {
      ...existing.metadata,
      ...incoming.metadata,
      genres: incoming.metadata.genres.length > 0 ? incoming.metadata.genres : existing.metadata.genres,
      themes: incoming.metadata.themes.length > 0 ? incoming.metadata.themes : existing.metadata.themes
    }
  });
}
```

- [ ] **Step 4: Implement external link generation**

Create `src/domain/externalLinks.ts`:

```ts
import type { LinkSourceSetting, SourceLink } from "./types";

interface LinkBookInput {
  title: string;
  author: string;
  goodreadsId?: string;
  isbn?: string;
  isbn13?: string;
}

function query(book: LinkBookInput): string {
  return encodeURIComponent(`${book.title} ${book.author}`.trim());
}

export function buildSourceLinks(book: LinkBookInput, settings: LinkSourceSetting[]): SourceLink[] {
  return [...settings]
    .filter((setting) => setting.enabled)
    .sort((a, b) => a.order - b.order)
    .map((setting) => {
      const isbn = book.isbn13 || book.isbn;
      if (setting.id === "goodreads") {
        return {
          id: "goodreads",
          label: setting.label,
          enabled: true,
          url: book.goodreadsId
            ? `https://www.goodreads.com/book/show/${encodeURIComponent(book.goodreadsId)}`
            : `https://www.goodreads.com/search?q=${query(book)}`
        };
      }

      if (setting.id === "open-library") {
        return {
          id: "open-library",
          label: setting.label,
          enabled: true,
          url: isbn
            ? `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}`
            : `https://openlibrary.org/search?q=${query(book)}`
        };
      }

      if (setting.id === "google-books") {
        return {
          id: "google-books",
          label: setting.label,
          enabled: true,
          url: `https://www.google.com/search?tbm=bks&q=${query(book)}`
        };
      }

      return {
        id: "amazon",
        label: setting.label,
        enabled: true,
        url: `https://www.amazon.com/s?k=${query(book)}`
      };
    });
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/domain/library.test.ts src/domain/externalLinks.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/library.ts src/domain/externalLinks.ts src/domain/library.test.ts src/domain/externalLinks.test.ts
git commit -m "feat: add library domain helpers"
```

### Task 4: Implement Goodreads CSV Import

**Files:**
- Create: `src/domain/goodreadsCsv.ts`
- Create: `src/test/fixtures/goodreads-export.csv`
- Test: `src/domain/goodreadsCsv.test.ts`

- [ ] **Step 1: Add CSV fixture and failing tests**

Create `src/test/fixtures/goodreads-export.csv`:

```csv
Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Average Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review
20170404,Station Eleven,Emily St. John Mandel,"Mandel, Emily St. John",,"=""0385353308""","=""9780385353304""",5,4.07,Knopf,Hardcover,333,2014,2014,2022/01/10,2021/12/01,post-apocalyptic,"post-apocalyptic (#1)",read,Loved the quiet aftermath.
41160292,The Ministry for the Future,Kim Stanley Robinson,"Robinson, Kim Stanley",,"=""0316300136""","=""9780316300131""",0,4.19,Orbit,Hardcover,576,2020,2020,,2023/06/08,climate,"climate (#2)",to-read,
44767458,Dune Messiah,Frank Herbert,"Herbert, Frank",,"=""""","=""9780593098233""",4,3.89,Ace,Paperback,352,1969,1969,2020/05/05,2020/04/01,sci-fi,"sci-fi (#3)",read,
```

Create `src/domain/goodreadsCsv.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseGoodreadsCsv } from "./goodreadsCsv";

describe("goodreadsCsv", () => {
  it("imports read and want-to-read books with preserved Goodreads fields", () => {
    const csv = readFileSync(join(process.cwd(), "src/test/fixtures/goodreads-export.csv"), "utf8");

    const summary = parseGoodreadsCsv(csv, {
      linkSources: [
        { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
        { id: "open-library", label: "Open Library", enabled: true, order: 2 },
        { id: "google-books", label: "Google Books", enabled: true, order: 3 },
        { id: "amazon", label: "Amazon", enabled: true, order: 4 }
      ]
    });

    expect(summary.imported).toHaveLength(3);
    expect(summary.skipped).toEqual([]);
    expect(summary.imported[0]).toMatchObject({
      title: "Station Eleven",
      author: "Emily St. John Mandel",
      shelf: "read",
      userRating: 5,
      dateRead: "2022-01-10",
      goodreadsId: "20170404",
      isbn: "0385353308",
      isbn13: "9780385353304"
    });
    expect(summary.imported[1].shelf).toBe("want-to-read");
    expect(summary.imported[0].sourceLinks.map((link) => link.label)).toEqual([
      "Goodreads",
      "Open Library",
      "Google Books",
      "Amazon"
    ]);
  });

  it("reports skipped rows without a title or author", () => {
    const summary = parseGoodreadsCsv("Title,Author,Exclusive Shelf\n,Someone,read\nBook,,read", {
      linkSources: []
    });

    expect(summary.imported).toEqual([]);
    expect(summary.skipped).toEqual([
      { rowNumber: 2, reason: "Missing title" },
      { rowNumber: 3, reason: "Missing author" }
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/domain/goodreadsCsv.test.ts`

Expected: FAIL because `goodreadsCsv.ts` does not exist.

- [ ] **Step 3: Implement parser**

Create `src/domain/goodreadsCsv.ts`:

```ts
import Papa from "papaparse";
import { buildSourceLinks } from "./externalLinks";
import { createId } from "./ids";
import type { Book, LinkSourceSetting, Shelf } from "./types";

interface GoodreadsRow {
  "Book Id"?: string;
  Title?: string;
  Author?: string;
  ISBN?: string;
  ISBN13?: string;
  "My Rating"?: string;
  "Date Read"?: string;
  Bookshelves?: string;
  "Exclusive Shelf"?: string;
  "My Review"?: string;
  "Number of Pages"?: string;
  "Original Publication Year"?: string;
  "Year Published"?: string;
}

export interface ImportSkippedRow {
  rowNumber: number;
  reason: string;
}

export interface GoodreadsImportSummary {
  imported: Book[];
  skipped: ImportSkippedRow[];
}

interface ParseOptions {
  linkSources: LinkSourceSetting[];
}

function cleanIsbn(value?: string): string | undefined {
  const cleaned = (value || "").replace(/[="]/g, "").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function parseRating(value?: string): number | undefined {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating : undefined;
}

function parseDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const match = trimmed.match(/^(\\d{4})\\/(\\d{2})\\/(\\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : trimmed;
}

function parseShelf(value?: string): Shelf {
  if (value === "read") {
    return "read";
  }
  if (value === "to-read" || value === "want-to-read") {
    return "want-to-read";
  }
  return "none";
}

function parseNumber(value?: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseGoodreadsCsv(csv: string, options: ParseOptions): GoodreadsImportSummary {
  const result = Papa.parse<GoodreadsRow>(csv, {
    header: true,
    skipEmptyLines: true
  });

  const imported: Book[] = [];
  const skipped: ImportSkippedRow[] = [];

  result.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const title = (row.Title || "").trim();
    const author = (row.Author || "").trim();

    if (!title) {
      skipped.push({ rowNumber, reason: "Missing title" });
      return;
    }
    if (!author) {
      skipped.push({ rowNumber, reason: "Missing author" });
      return;
    }

    const isbn = cleanIsbn(row.ISBN);
    const isbn13 = cleanIsbn(row.ISBN13);
    const publicationYear = parseNumber(row["Original Publication Year"]) || parseNumber(row["Year Published"]);
    const pageCount = parseNumber(row["Number of Pages"]);
    const book = {
      id: createId("book"),
      title,
      author,
      shelf: parseShelf(row["Exclusive Shelf"]),
      userRating: parseRating(row["My Rating"]),
      userNotes: (row["My Review"] || "").trim(),
      dateRead: parseDate(row["Date Read"]),
      isbn,
      isbn13,
      goodreadsId: (row["Book Id"] || "").trim() || undefined,
      sourceLinks: [],
      metadata: {
        genres: (row.Bookshelves || "")
          .split(",")
          .map((shelf) => shelf.trim())
          .filter(Boolean),
        themes: [],
        description: "",
        pageCount,
        publicationYear
      }
    } satisfies Book;

    imported.push({
      ...book,
      sourceLinks: buildSourceLinks(book, options.linkSources)
    });
  });

  return { imported, skipped };
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/domain/goodreadsCsv.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/goodreadsCsv.ts src/domain/goodreadsCsv.test.ts src/test/fixtures/goodreads-export.csv
git commit -m "feat: import Goodreads CSV data"
```

### Task 5: Implement Recommendation Sessions And Context Selection

**Files:**
- Create: `src/domain/recommendationContext.ts`
- Create: `src/domain/recommendationSessions.ts`
- Test: `src/domain/recommendationContext.test.ts`
- Test: `src/domain/recommendationSessions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/domain/recommendationContext.test.ts`:

```ts
import type { Book, RecommendationSession, ReadingPreferences } from "./types";
import { buildRecommendationContext } from "./recommendationContext";

const books: Book[] = [
  {
    id: "book-read",
    title: "Station Eleven",
    author: "Emily St. John Mandel",
    shelf: "read",
    userRating: 5,
    userNotes: "Loved the quiet post-apocalyptic tone.",
    sourceLinks: [],
    metadata: { genres: ["post-apocalyptic"], themes: ["art"], description: "After a pandemic." }
  },
  {
    id: "book-want",
    title: "The Dog Stars",
    author: "Peter Heller",
    shelf: "want-to-read",
    userNotes: "",
    sourceLinks: [],
    metadata: { genres: ["post-apocalyptic"], themes: ["survival"], description: "A pilot after collapse." }
  }
];

const preferences: ReadingPreferences = {
  text: "I like reflective, character-driven speculative fiction.",
  approvedInferences: ["Post-apocalyptic books should not be pure action."]
};

describe("recommendationContext", () => {
  it("selects relevant books and preference text for a prompt", () => {
    const context = buildRecommendationContext({
      prompt: "post-apocalyptic but not too bleak",
      books,
      preferences,
      activeSession: undefined
    });

    expect(context.prompt).toBe("post-apocalyptic but not too bleak");
    expect(context.readBooks.map((book) => book.title)).toEqual(["Station Eleven"]);
    expect(context.wantToReadBooks.map((book) => book.title)).toEqual(["The Dog Stars"]);
    expect(context.preferenceText).toContain("reflective");
    expect(context.preferenceText).toContain("pure action");
  });
});
```

Create `src/domain/recommendationSessions.test.ts`:

```ts
import type { Recommendation } from "./types";
import {
  appendRecommendationRound,
  createRecommendationSession,
  decideRecommendation,
  resolvePreferenceSuggestion
} from "./recommendationSessions";

const recommendation: Recommendation = {
  id: "rec-1",
  lane: "shelf",
  title: "The Dog Stars",
  author: "Peter Heller",
  rationale: "Reflective post-apocalyptic fiction.",
  matchNotes: ["Matches your Station Eleven note."],
  caveats: ["More survival-focused."],
  decision: "undecided",
  sourceLinks: []
};

describe("recommendationSessions", () => {
  it("creates a named session from the first prompt", () => {
    const session = createRecommendationSession("Find post-apocalyptic fiction");

    expect(session.title).toBe("Find post-apocalyptic fiction");
    expect(session.originalPrompt).toBe("Find post-apocalyptic fiction");
    expect(session.rounds).toEqual([]);
  });

  it("appends rounds and stores preference suggestions", () => {
    const session = createRecommendationSession("Find post-apocalyptic fiction");
    const updated = appendRecommendationRound(session, {
      prompt: "Find post-apocalyptic fiction",
      recommendations: [recommendation],
      assistantSummary: "Try this.",
      preferenceSuggestions: [{ id: "pref-1", text: "Prefers reflective collapse stories.", status: "pending" }]
    });

    expect(updated.rounds).toHaveLength(1);
    expect(updated.rounds[0].recommendations[0].title).toBe("The Dog Stars");
  });

  it("records recommendation decisions", () => {
    const session = appendRecommendationRound(createRecommendationSession("Find post-apocalyptic fiction"), {
      prompt: "Find post-apocalyptic fiction",
      recommendations: [recommendation],
      assistantSummary: "Try this.",
      preferenceSuggestions: []
    });

    expect(decideRecommendation(session, "rec-1", "rejected").rounds[0].recommendations[0].decision).toBe("rejected");
  });

  it("resolves preference suggestions", () => {
    const session = appendRecommendationRound(createRecommendationSession("Find post-apocalyptic fiction"), {
      prompt: "Find post-apocalyptic fiction",
      recommendations: [recommendation],
      assistantSummary: "Try this.",
      preferenceSuggestions: [{ id: "pref-1", text: "Prefers reflective collapse stories.", status: "pending" }]
    });

    expect(resolvePreferenceSuggestion(session, "pref-1", "accepted").rounds[0].preferenceSuggestions[0].status).toBe("accepted");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/domain/recommendationContext.test.ts src/domain/recommendationSessions.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement context builder**

Create `src/domain/recommendationContext.ts`:

```ts
import type { Book, RecommendationSession, ReadingPreferences } from "./types";

export interface RecommendationContextInput {
  prompt: string;
  books: Book[];
  preferences: ReadingPreferences;
  activeSession?: RecommendationSession;
}

export interface RecommendationContext {
  prompt: string;
  preferenceText: string;
  readBooks: Book[];
  wantToReadBooks: Book[];
  sessionFeedback: string[];
}

function scoreBook(prompt: string, book: Book): number {
  const haystack = [
    book.title,
    book.author,
    book.userNotes,
    book.metadata.description,
    ...book.metadata.genres,
    ...book.metadata.themes
  ]
    .join(" ")
    .toLowerCase();
  const terms = prompt.toLowerCase().split(/\\W+/).filter((term) => term.length > 3);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function selectRelevant(prompt: string, books: Book[], shelf: Book["shelf"]): Book[] {
  return books
    .filter((book) => book.shelf === shelf)
    .map((book) => ({ book, score: scoreBook(prompt, book) }))
    .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title))
    .slice(0, 12)
    .map(({ book }) => book);
}

export function buildRecommendationContext(input: RecommendationContextInput): RecommendationContext {
  const approved = input.preferences.approvedInferences.join("\\n");
  return {
    prompt: input.prompt,
    preferenceText: [input.preferences.text, approved].filter(Boolean).join("\\n"),
    readBooks: selectRelevant(input.prompt, input.books, "read"),
    wantToReadBooks: selectRelevant(input.prompt, input.books, "want-to-read"),
    sessionFeedback: input.activeSession?.feedback || []
  };
}
```

- [ ] **Step 4: Implement session helpers**

Create `src/domain/recommendationSessions.ts`:

```ts
import { createId } from "./ids";
import type {
  PreferenceSuggestion,
  Recommendation,
  RecommendationDecision,
  RecommendationRound,
  RecommendationSession
} from "./types";

function now(): string {
  return new Date().toISOString();
}

function titleFromPrompt(prompt: string): string {
  return prompt.trim().slice(0, 72) || "Recommendation session";
}

export function createRecommendationSession(prompt: string): RecommendationSession {
  const createdAt = now();
  return {
    id: createId("session"),
    title: titleFromPrompt(prompt),
    originalPrompt: prompt.trim(),
    createdAt,
    updatedAt: createdAt,
    constraints: [],
    feedback: [],
    rounds: []
  };
}

interface AppendRoundInput {
  prompt: string;
  recommendations: Recommendation[];
  assistantSummary: string;
  preferenceSuggestions: PreferenceSuggestion[];
}

export function appendRecommendationRound(
  session: RecommendationSession,
  input: AppendRoundInput
): RecommendationSession {
  const timestamp = now();
  const round: RecommendationRound = {
    id: createId("round"),
    prompt: input.prompt.trim(),
    createdAt: timestamp,
    recommendations: input.recommendations,
    assistantSummary: input.assistantSummary,
    preferenceSuggestions: input.preferenceSuggestions
  };

  return {
    ...session,
    updatedAt: timestamp,
    feedback: session.rounds.length > 0 ? [...session.feedback, input.prompt.trim()] : session.feedback,
    rounds: [...session.rounds, round]
  };
}

export function decideRecommendation(
  session: RecommendationSession,
  recommendationId: string,
  decision: RecommendationDecision
): RecommendationSession {
  return {
    ...session,
    updatedAt: now(),
    rounds: session.rounds.map((round) => ({
      ...round,
      recommendations: round.recommendations.map((recommendation) =>
        recommendation.id === recommendationId ? { ...recommendation, decision } : recommendation
      )
    }))
  };
}

export function resolvePreferenceSuggestion(
  session: RecommendationSession,
  suggestionId: string,
  status: "accepted" | "declined"
): RecommendationSession {
  return {
    ...session,
    updatedAt: now(),
    rounds: session.rounds.map((round) => ({
      ...round,
      preferenceSuggestions: round.preferenceSuggestions.map((suggestion) =>
        suggestion.id === suggestionId ? { ...suggestion, status } : suggestion
      )
    }))
  };
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/domain/recommendationContext.test.ts src/domain/recommendationSessions.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/domain/recommendationContext.ts src/domain/recommendationSessions.ts src/domain/recommendationContext.test.ts src/domain/recommendationSessions.test.ts
git commit -m "feat: model recommendation sessions"
```

### Task 6: Implement AI Provider Contracts

**Files:**
- Create: `src/ai/types.ts`
- Create: `src/ai/mockProvider.ts`
- Create: `src/ai/openAiCompatibleProvider.ts`
- Test: `src/ai/mockProvider.test.ts`

- [ ] **Step 1: Write failing mock provider tests**

Create `src/ai/mockProvider.test.ts`:

```ts
import { createMockRecommendationProvider } from "./mockProvider";

describe("mockProvider", () => {
  it("returns shelf and discovery recommendations with explanations", async () => {
    const provider = createMockRecommendationProvider();

    const response = await provider.recommend({
      context: {
        prompt: "post-apocalyptic but reflective",
        preferenceText: "I like character-driven speculative fiction.",
        readBooks: [
          {
            id: "book-read",
            title: "Station Eleven",
            author: "Emily St. John Mandel",
            shelf: "read",
            userRating: 5,
            userNotes: "Loved the quiet tone.",
            sourceLinks: [],
            metadata: { genres: ["post-apocalyptic"], themes: [], description: "" }
          }
        ],
        wantToReadBooks: [
          {
            id: "book-want",
            title: "The Dog Stars",
            author: "Peter Heller",
            shelf: "want-to-read",
            userNotes: "",
            sourceLinks: [],
            metadata: { genres: ["post-apocalyptic"], themes: [], description: "" }
          }
        ],
        sessionFeedback: []
      },
      linkSources: [
        { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
        { id: "open-library", label: "Open Library", enabled: true, order: 2 }
      ]
    });

    expect(response.assistantSummary).toContain("post-apocalyptic");
    expect(response.recommendations.some((rec) => rec.lane === "shelf")).toBe(true);
    expect(response.recommendations.some((rec) => rec.lane === "discovery")).toBe(true);
    expect(response.recommendations[0].rationale).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ai/mockProvider.test.ts`

Expected: FAIL because AI modules do not exist.

- [ ] **Step 3: Implement provider contracts and mock provider**

Create `src/ai/types.ts`:

```ts
import type { LinkSourceSetting, PreferenceSuggestion, Recommendation } from "../domain/types";
import type { RecommendationContext } from "../domain/recommendationContext";

export interface RecommendationRequest {
  context: RecommendationContext;
  linkSources: LinkSourceSetting[];
}

export interface RecommendationResponse {
  assistantSummary: string;
  recommendations: Recommendation[];
  preferenceSuggestions: PreferenceSuggestion[];
}

export interface RecommendationProvider {
  recommend(request: RecommendationRequest): Promise<RecommendationResponse>;
}
```

Create `src/ai/mockProvider.ts`:

```ts
import { buildSourceLinks } from "../domain/externalLinks";
import { createId } from "../domain/ids";
import type { RecommendationProvider, RecommendationResponse } from "./types";

export function createMockRecommendationProvider(): RecommendationProvider {
  return {
    async recommend(request): Promise<RecommendationResponse> {
      const shelfRecommendations = request.context.wantToReadBooks.slice(0, 3).map((book) => ({
        id: createId("rec"),
        lane: "shelf" as const,
        title: book.title,
        author: book.author,
        rationale: `This is already on your want-to-read shelf and matches the request for ${request.context.prompt}.`,
        matchNotes: [
          request.context.preferenceText,
          book.metadata.genres.length > 0 ? `Known genres: ${book.metadata.genres.join(", ")}.` : "Shelf match from your library."
        ].filter(Boolean),
        caveats: book.metadata.description ? [] : ["Metadata is limited, so this match leans on shelf and title context."],
        linkedBookId: book.id,
        decision: "undecided" as const,
        sourceLinks: book.sourceLinks.length > 0 ? book.sourceLinks : buildSourceLinks(book, request.linkSources)
      }));

      const discoveries = [
        {
          title: "Severance",
          author: "Ling Ma",
          rationale: "A sharp, literary post-collapse novel with a lighter satirical edge than many survival stories.",
          matchNotes: ["Fits reflective speculative fiction and mood-aware post-apocalyptic prompts."],
          caveats: ["Its workplace satire may feel more surreal than traditional genre fiction."]
        },
        {
          title: "A Psalm for the Wild-Built",
          author: "Becky Chambers",
          rationale: "A gentle, hopeful speculative pick when the prompt asks for something lighter.",
          matchNotes: ["Useful when you ask for softer tone, warmth, or a quick read."],
          caveats: ["Less post-apocalyptic than post-scarcity and philosophical."]
        }
      ].map((book) => ({
        id: createId("rec"),
        lane: "discovery" as const,
        title: book.title,
        author: book.author,
        rationale: book.rationale,
        matchNotes: book.matchNotes,
        caveats: book.caveats,
        decision: "undecided" as const,
        sourceLinks: buildSourceLinks(book, request.linkSources)
      }));

      return {
        assistantSummary: `Here are a few explainable matches for "${request.context.prompt}", split between your shelf and new discoveries.`,
        recommendations: [...shelfRecommendations, ...discoveries],
        preferenceSuggestions: request.context.prompt.toLowerCase().includes("not too bleak")
          ? [
              {
                id: createId("pref"),
                text: "When asking for post-apocalyptic fiction, prefer reflective books that are not relentlessly bleak.",
                status: "pending"
              }
            ]
          : []
      };
    }
  };
}
```

- [ ] **Step 4: Implement OpenAI-compatible provider shell**

Create `src/ai/openAiCompatibleProvider.ts`:

```ts
import type { AiSettings } from "../domain/types";
import type { RecommendationProvider, RecommendationRequest, RecommendationResponse } from "./types";

function systemPrompt(): string {
  return [
    "You are NextChapter, a personal book recommendation assistant.",
    "Return only JSON with assistantSummary, recommendations, and preferenceSuggestions.",
    "Recommendations must include lane, title, author, rationale, matchNotes, caveats, decision, and sourceLinks.",
    "Separate user facts from inferences and include caveats when confidence is limited."
  ].join("\\n");
}

export function createOpenAiCompatibleProvider(settings: AiSettings): RecommendationProvider {
  return {
    async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
      if (!settings.apiKey.trim()) {
        throw new Error("Missing API key for the configured AI provider.");
      }

      const response = await fetch(settings.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt() },
            { role: "user", content: JSON.stringify(request) }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`AI provider request failed with status ${response.status}.`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new Error("AI provider returned an unreadable response.");
      }

      return JSON.parse(content) as RecommendationResponse;
    }
  };
}
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/ai/mockProvider.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ai/types.ts src/ai/mockProvider.ts src/ai/openAiCompatibleProvider.ts src/ai/mockProvider.test.ts
git commit -m "feat: add configurable recommendation providers"
```

### Task 7: Build React State Wiring And Chat Flow

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/CanvasTabs.tsx`
- Create: `src/test/testUtils.tsx`
- Test: `src/components/ChatPanel.test.tsx`

- [ ] **Step 1: Write failing chat interaction test**

Create `src/test/testUtils.tsx`:

```tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

export function renderWithUser(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(ui)
  };
}
```

Create `src/components/ChatPanel.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import type { RecommendationSession } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import ChatPanel from "./ChatPanel";

describe("ChatPanel", () => {
  it("submits a recommendation prompt", async () => {
    const submitted: string[] = [];
    const { user } = renderWithUser(
      <ChatPanel
        activeSession={undefined}
        isLoading={false}
        error=""
        onSubmitPrompt={(prompt) => submitted.push(prompt)}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    await user.type(screen.getByLabelText("Ask for book recommendations"), "light post-apocalyptic fiction");
    await user.click(screen.getByRole("button", { name: "Recommend" }));

    expect(submitted).toEqual(["light post-apocalyptic fiction"]);
  });

  it("shows preference suggestions for the active session", () => {
    const session: RecommendationSession = {
      id: "session-1",
      title: "Post-apocalyptic",
      originalPrompt: "Post-apocalyptic",
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
      constraints: [],
      feedback: [],
      rounds: [
        {
          id: "round-1",
          prompt: "Post-apocalyptic",
          createdAt: "2026-06-17T00:00:00.000Z",
          assistantSummary: "Try these.",
          recommendations: [],
          preferenceSuggestions: [{ id: "pref-1", text: "Prefers reflective collapse stories.", status: "pending" }]
        }
      ]
    };

    renderWithUser(
      <ChatPanel
        activeSession={session}
        isLoading={false}
        error=""
        onSubmitPrompt={() => undefined}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    expect(screen.getByText("Prefers reflective collapse stories.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/ChatPanel.test.tsx`

Expected: FAIL because `ChatPanel.tsx` does not exist.

- [ ] **Step 3: Implement ChatPanel and CanvasTabs**

Create `src/components/ChatPanel.tsx`:

```tsx
import { useState } from "react";
import type { RecommendationSession } from "../domain/types";

interface ChatPanelProps {
  activeSession?: RecommendationSession;
  isLoading: boolean;
  error: string;
  onSubmitPrompt: (prompt: string) => void;
  onResolvePreferenceSuggestion: (suggestionId: string, status: "accepted" | "declined") => void;
}

export default function ChatPanel({
  activeSession,
  isLoading,
  error,
  onSubmitPrompt,
  onResolvePreferenceSuggestion
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("");
  const rounds = activeSession?.rounds || [];
  const pendingSuggestions = rounds.flatMap((round) =>
    round.preferenceSuggestions.filter((suggestion) => suggestion.status === "pending")
  );

  return (
    <section className="chat-panel" aria-label="Recommendation chat">
      <header className="app-header">
        <p className="eyebrow">Personal reading advisor</p>
        <h1>NextChapter</h1>
      </header>

      <div className="message-list" aria-label="Conversation">
        {rounds.length === 0 ? (
          <p className="assistant-message">Ask for a mood, genre, theme, shelf pick, or reading goal.</p>
        ) : (
          rounds.map((round) => (
            <article className="message-thread" key={round.id}>
              <p className="user-message">{round.prompt}</p>
              <p className="assistant-message">{round.assistantSummary}</p>
            </article>
          ))
        )}

        {pendingSuggestions.map((suggestion) => (
          <article className="preference-suggestion" key={suggestion.id}>
            <p>{suggestion.text}</p>
            <div className="inline-actions">
              <button type="button" onClick={() => onResolvePreferenceSuggestion(suggestion.id, "accepted")}>
                Save preference
              </button>
              <button type="button" onClick={() => onResolvePreferenceSuggestion(suggestion.id, "declined")}>
                Decline
              </button>
            </div>
          </article>
        ))}

        {error ? <p className="error-message">{error}</p> : null}
      </div>

      <form
        className="prompt-form"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = prompt.trim();
          if (trimmed) {
            onSubmitPrompt(trimmed);
            setPrompt("");
          }
        }}
      >
        <label htmlFor="recommendation-prompt">Ask for book recommendations</label>
        <textarea
          id="recommendation-prompt"
          name="prompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Find me a post-apocalyptic novel that fits what I have liked before..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Recommend"}
        </button>
      </form>
    </section>
  );
}
```

Create `src/components/CanvasTabs.tsx`:

```tsx
export type CanvasTab = "library" | "sessions" | "results" | "detail" | "settings";

const tabs: Array<{ id: CanvasTab; label: string }> = [
  { id: "library", label: "Library" },
  { id: "sessions", label: "Sessions" },
  { id: "results", label: "Current Results" },
  { id: "detail", label: "Book Detail" },
  { id: "settings", label: "Settings" }
];

interface CanvasTabsProps {
  activeTab: CanvasTab;
  onChange: (tab: CanvasTab) => void;
}

export default function CanvasTabs({ activeTab, onChange }: CanvasTabsProps) {
  return (
    <div role="tablist" aria-label="Canvas views" className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Wire App state and recommendation flow**

Replace `src/App.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import { createMockRecommendationProvider } from "./ai/mockProvider";
import CanvasTabs, { type CanvasTab } from "./components/CanvasTabs";
import ChatPanel from "./components/ChatPanel";
import { buildRecommendationContext } from "./domain/recommendationContext";
import {
  appendRecommendationRound,
  createRecommendationSession,
  resolvePreferenceSuggestion
} from "./domain/recommendationSessions";
import type { AppState, RecommendationSession } from "./domain/types";
import { loadAppState, saveAppState } from "./storage/localRepository";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<CanvasTab>("library");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const activeSession = useMemo(
    () => state.sessions.find((session) => session.id === state.activeSessionId),
    [state.activeSessionId, state.sessions]
  );

  async function submitPrompt(prompt: string) {
    setIsLoading(true);
    setError("");

    try {
      const session = activeSession || createRecommendationSession(prompt);
      const context = buildRecommendationContext({
        prompt,
        books: state.books,
        preferences: state.preferences,
        activeSession: session
      });
      const provider = createMockRecommendationProvider();
      const response = await provider.recommend({
        context,
        linkSources: state.settings.linkSources
      });
      const updatedSession = appendRecommendationRound(session, {
        prompt,
        recommendations: response.recommendations,
        assistantSummary: response.assistantSummary,
        preferenceSuggestions: response.preferenceSuggestions
      });

      setState((current) => ({
        ...current,
        activeSessionId: updatedSession.id,
        sessions: upsertSession(current.sessions, updatedSession)
      }));
      setActiveTab("results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Recommendation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function resolveSuggestion(suggestionId: string, status: "accepted" | "declined") {
    if (!activeSession) {
      return;
    }
    const updated = resolvePreferenceSuggestion(activeSession, suggestionId, status);
    const acceptedSuggestion = activeSession.rounds
      .flatMap((round) => round.preferenceSuggestions)
      .find((suggestion) => suggestion.id === suggestionId);

    setState((current) => ({
      ...current,
      sessions: upsertSession(current.sessions, updated),
      preferences:
        status === "accepted" && acceptedSuggestion
          ? {
              ...current.preferences,
              approvedInferences: [...current.preferences.approvedInferences, acceptedSuggestion.text]
            }
          : current.preferences
    }));
  }

  return (
    <main className="app-shell">
      <ChatPanel
        activeSession={activeSession}
        isLoading={isLoading}
        error={error}
        onSubmitPrompt={submitPrompt}
        onResolvePreferenceSuggestion={resolveSuggestion}
      />

      <section className="canvas-panel" aria-label="Library canvas">
        <CanvasTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className="canvas-body">
          <h2>{tabTitle(activeTab)}</h2>
          <p>{canvasPlaceholder(activeTab, activeSession)}</p>
        </div>
      </section>
    </main>
  );
}

function upsertSession(sessions: RecommendationSession[], session: RecommendationSession): RecommendationSession[] {
  const exists = sessions.some((candidate) => candidate.id === session.id);
  return exists
    ? sessions.map((candidate) => (candidate.id === session.id ? session : candidate))
    : [session, ...sessions];
}

function tabTitle(tab: CanvasTab): string {
  const titles: Record<CanvasTab, string> = {
    library: "Library",
    sessions: "Recommendation Sessions",
    results: "Current Results",
    detail: "Book Detail",
    settings: "Settings"
  };
  return titles[tab];
}

function canvasPlaceholder(tab: CanvasTab, activeSession?: RecommendationSession): string {
  if (tab === "results" && activeSession) {
    const count = activeSession.rounds.at(-1)?.recommendations.length || 0;
    return `${count} recommendations in the latest round.`;
  }
  return "This view is implemented in the next tasks.";
}
```

- [ ] **Step 5: Add CSS for chat messages and actions**

Append to `src/styles.css`:

```css
.message-thread {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.user-message {
  justify-self: end;
  max-width: 42rem;
  padding: 14px 16px;
  border-radius: 8px;
  background: #e8efe3;
}

.preference-suggestion {
  border: 1px solid #d3c6a6;
  background: #fff8e6;
  border-radius: 8px;
  padding: 14px;
  margin-top: 14px;
}

.inline-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.error-message {
  color: #9f1239;
  font-weight: 700;
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/components/ChatPanel.test.tsx src/App.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/ChatPanel.tsx src/components/CanvasTabs.tsx src/components/ChatPanel.test.tsx src/test/testUtils.tsx src/styles.css
git commit -m "feat: add recommendation chat flow"
```

### Task 8: Build Library Import And Edit UI

**Files:**
- Create: `src/components/BookForm.tsx`
- Create: `src/components/LibraryView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/components/LibraryView.test.tsx`

- [ ] **Step 1: Write failing LibraryView test**

Create `src/components/LibraryView.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import type { Book, LinkSourceSetting } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import LibraryView from "./LibraryView";

const linkSources: LinkSourceSetting[] = [
  { id: "goodreads", label: "Goodreads", enabled: true, order: 1 }
];

describe("LibraryView", () => {
  it("adds a manual want-to-read book", async () => {
    const added: Book[] = [];
    const { user } = renderWithUser(
      <LibraryView books={[]} linkSources={linkSources} onBooksChange={(books) => added.push(...books)} onSelectBook={() => undefined} />
    );

    await user.type(screen.getByLabelText("Title"), "The Dog Stars");
    await user.type(screen.getByLabelText("Author"), "Peter Heller");
    await user.selectOptions(screen.getByLabelText("Shelf"), "want-to-read");
    await user.click(screen.getByRole("button", { name: "Add book" }));

    expect(added[0]).toMatchObject({ title: "The Dog Stars", author: "Peter Heller", shelf: "want-to-read" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/LibraryView.test.tsx`

Expected: FAIL because `LibraryView.tsx` does not exist.

- [ ] **Step 3: Implement BookForm and LibraryView**

Create `src/components/BookForm.tsx`:

```tsx
import { useState } from "react";
import { buildSourceLinks } from "../domain/externalLinks";
import { createId } from "../domain/ids";
import type { Book, LinkSourceSetting, Shelf } from "../domain/types";

interface BookFormProps {
  linkSources: LinkSourceSetting[];
  submitLabel: string;
  initialBook?: Book;
  onSubmit: (book: Book) => void;
}

export default function BookForm({ linkSources, submitLabel, initialBook, onSubmit }: BookFormProps) {
  const [title, setTitle] = useState(initialBook?.title || "");
  const [author, setAuthor] = useState(initialBook?.author || "");
  const [shelf, setShelf] = useState<Shelf>(initialBook?.shelf || "want-to-read");
  const [userNotes, setUserNotes] = useState(initialBook?.userNotes || "");

  return (
    <form
      className="book-form"
      onSubmit={(event) => {
        event.preventDefault();
        const book = {
          id: initialBook?.id || createId("book"),
          title,
          author,
          shelf,
          userNotes,
          sourceLinks: [],
          metadata: initialBook?.metadata || { genres: [], themes: [], description: "" }
        } satisfies Book;
        onSubmit({
          ...book,
          sourceLinks: buildSourceLinks(book, linkSources)
        });
        if (!initialBook) {
          setTitle("");
          setAuthor("");
          setUserNotes("");
          setShelf("want-to-read");
        }
      }}
    >
      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Author
        <input value={author} onChange={(event) => setAuthor(event.target.value)} required />
      </label>
      <label>
        Shelf
        <select value={shelf} onChange={(event) => setShelf(event.target.value as Shelf)}>
          <option value="want-to-read">Want to read</option>
          <option value="read">Read</option>
          <option value="none">No shelf</option>
        </select>
      </label>
      <label>
        Notes
        <textarea value={userNotes} onChange={(event) => setUserNotes(event.target.value)} rows={3} />
      </label>
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
```

Create `src/components/LibraryView.tsx`:

```tsx
import { useMemo, useState } from "react";
import { parseGoodreadsCsv } from "../domain/goodreadsCsv";
import { addBook, booksByShelf, upsertBook } from "../domain/library";
import type { Book, LinkSourceSetting, Shelf } from "../domain/types";
import BookForm from "./BookForm";

interface LibraryViewProps {
  books: Book[];
  linkSources: LinkSourceSetting[];
  onBooksChange: (books: Book[]) => void;
  onSelectBook: (bookId: string) => void;
}

export default function LibraryView({ books, linkSources, onBooksChange, onSelectBook }: LibraryViewProps) {
  const [query, setQuery] = useState("");
  const [shelf, setShelf] = useState<Shelf | "all">("all");
  const [importMessage, setImportMessage] = useState("");

  const visibleBooks = useMemo(() => {
    return books
      .filter((book) => shelf === "all" || book.shelf === shelf)
      .filter((book) => `${book.title} ${book.author} ${book.userNotes}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, query, shelf]);

  async function importFile(file: File) {
    const csv = await file.text();
    const summary = parseGoodreadsCsv(csv, { linkSources });
    const merged = summary.imported.reduce((current, book) => upsertBook(current, book), books);
    onBooksChange(merged);
    setImportMessage(`Imported ${summary.imported.length} books. Skipped ${summary.skipped.length}.`);
  }

  return (
    <div className="library-view">
      <section className="toolbar">
        <label>
          Import Goodreads CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void importFile(file);
              }
            }}
          />
        </label>
        {importMessage ? <p>{importMessage}</p> : null}
      </section>

      <section className="panel-grid">
        <div>
          <h3>Add book</h3>
          <BookForm
            linkSources={linkSources}
            submitLabel="Add book"
            onSubmit={(book) => onBooksChange(addBook(books, book))}
          />
        </div>
        <div>
          <h3>Browse library</h3>
          <div className="filters">
            <label>
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <label>
              Shelf
              <select value={shelf} onChange={(event) => setShelf(event.target.value as Shelf | "all")}>
                <option value="all">All</option>
                <option value="read">Read ({booksByShelf(books, "read").length})</option>
                <option value="want-to-read">Want to read ({booksByShelf(books, "want-to-read").length})</option>
                <option value="none">No shelf</option>
              </select>
            </label>
          </div>
          <div className="book-list">
            {visibleBooks.map((book) => (
              <button className="book-row" type="button" key={book.id} onClick={() => onSelectBook(book.id)}>
                <strong>{book.title}</strong>
                <span>{book.author}</span>
                <small>{book.shelf}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Wire LibraryView into App**

Modify `src/App.tsx` imports:

```tsx
import LibraryView from "./components/LibraryView";
```

Replace the `.canvas-body` contents in `src/App.tsx` with:

```tsx
<div className="canvas-body">
  {activeTab === "library" ? (
    <LibraryView
      books={state.books}
      linkSources={state.settings.linkSources}
      onBooksChange={(books) => setState((current) => ({ ...current, books }))}
      onSelectBook={(bookId) => {
        setState((current) => ({ ...current, selectedBookId: bookId }));
        setActiveTab("detail");
      }}
    />
  ) : (
    <>
      <h2>{tabTitle(activeTab)}</h2>
      <p>{canvasPlaceholder(activeTab, activeSession)}</p>
    </>
  )}
</div>
```

- [ ] **Step 5: Add CSS for library forms and lists**

Append to `src/styles.css`:

```css
.toolbar {
  margin-bottom: 20px;
}

.panel-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(320px, 1.2fr);
  gap: 24px;
}

.book-form,
.filters {
  display: grid;
  gap: 12px;
}

.book-list {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}

.book-row {
  display: grid;
  gap: 2px;
  text-align: left;
  color: #1f2933;
  background: #fff;
  border-color: #e5ded2;
}

.book-row small {
  color: #6b7280;
}

@media (max-width: 980px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/components/LibraryView.test.tsx src/domain/goodreadsCsv.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/BookForm.tsx src/components/LibraryView.tsx src/components/LibraryView.test.tsx src/styles.css
git commit -m "feat: add editable library and Goodreads import"
```

### Task 9: Build Results, Sessions, Book Detail, And Settings Views

**Files:**
- Create: `src/components/RecommendationCard.tsx`
- Create: `src/components/CurrentResultsView.tsx`
- Create: `src/components/RecommendationSessionsView.tsx`
- Create: `src/components/BookDetailPanel.tsx`
- Create: `src/components/SettingsView.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Test: `src/components/CurrentResultsView.test.tsx`
- Test: `src/components/SettingsView.test.tsx`

- [ ] **Step 1: Write failing view tests**

Create `src/components/CurrentResultsView.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import type { RecommendationSession } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import CurrentResultsView from "./CurrentResultsView";

const session: RecommendationSession = {
  id: "session-1",
  title: "Post-apocalyptic",
  originalPrompt: "Post-apocalyptic",
  createdAt: "2026-06-17T00:00:00.000Z",
  updatedAt: "2026-06-17T00:00:00.000Z",
  constraints: [],
  feedback: [],
  rounds: [
    {
      id: "round-1",
      prompt: "Post-apocalyptic",
      createdAt: "2026-06-17T00:00:00.000Z",
      assistantSummary: "Try these.",
      preferenceSuggestions: [],
      recommendations: [
        {
          id: "rec-1",
          lane: "shelf",
          title: "The Dog Stars",
          author: "Peter Heller",
          rationale: "Already on your shelf.",
          matchNotes: ["Post-apocalyptic"],
          caveats: [],
          decision: "undecided",
          sourceLinks: []
        }
      ]
    }
  ]
};

describe("CurrentResultsView", () => {
  it("renders grouped recommendations and sends decisions", async () => {
    const decisions: string[] = [];
    const { user } = renderWithUser(
      <CurrentResultsView session={session} onDecideRecommendation={(id) => decisions.push(id)} onSelectBook={() => undefined} />
    );

    expect(screen.getByText("From your want-to-read shelf")).toBeInTheDocument();
    expect(screen.getByText("The Dog Stars")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Shortlist The Dog Stars" }));
    expect(decisions).toEqual(["rec-1"]);
  });
});
```

Create `src/components/SettingsView.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import { defaultSettings } from "../domain/defaultState";
import type { ReadingPreferences } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import SettingsView from "./SettingsView";

describe("SettingsView", () => {
  it("saves edited reading preferences and model settings", async () => {
    const preferences: ReadingPreferences = { text: "Original", approvedInferences: [] };
    const saved: string[] = [];
    const { user } = renderWithUser(
      <SettingsView
        preferences={preferences}
        settings={defaultSettings}
        onPreferencesChange={(next) => saved.push(next.text)}
        onSettingsChange={() => undefined}
      />
    );

    await user.clear(screen.getByLabelText("Reading preferences context"));
    await user.type(screen.getByLabelText("Reading preferences context"), "I like reflective science fiction.");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(saved).toEqual(["I like reflective science fiction."]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/CurrentResultsView.test.tsx src/components/SettingsView.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement result card and results view**

Create `src/components/RecommendationCard.tsx`:

```tsx
import type { Recommendation, RecommendationDecision } from "../domain/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDecide: (recommendationId: string, decision: RecommendationDecision) => void;
  onSelectBook: (bookId: string) => void;
}

export default function RecommendationCard({ recommendation, onDecide, onSelectBook }: RecommendationCardProps) {
  return (
    <article className="recommendation-card">
      <h4>{recommendation.title}</h4>
      <p>{recommendation.author}</p>
      <p>{recommendation.rationale}</p>
      <ul>
        {recommendation.matchNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      {recommendation.caveats.length > 0 ? <p className="caveat">Caveat: {recommendation.caveats.join(" ")}</p> : null}
      <div className="inline-actions">
        <button type="button" onClick={() => onDecide(recommendation.id, "shortlisted")}>
          Shortlist {recommendation.title}
        </button>
        <button type="button" onClick={() => onDecide(recommendation.id, "accepted")}>
          Accept
        </button>
        <button type="button" onClick={() => onDecide(recommendation.id, "rejected")}>
          Reject
        </button>
        {recommendation.linkedBookId ? (
          <button type="button" onClick={() => onSelectBook(recommendation.linkedBookId || "")}>
            Open detail
          </button>
        ) : null}
      </div>
      <div className="external-links">
        {recommendation.sourceLinks.map((link) => (
          <a href={link.url} key={link.id} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
```

Create `src/components/CurrentResultsView.tsx`:

```tsx
import type { RecommendationDecision, RecommendationSession } from "../domain/types";
import RecommendationCard from "./RecommendationCard";

interface CurrentResultsViewProps {
  session?: RecommendationSession;
  onDecideRecommendation: (recommendationId: string, decision: RecommendationDecision) => void;
  onSelectBook: (bookId: string) => void;
}

export default function CurrentResultsView({ session, onDecideRecommendation, onSelectBook }: CurrentResultsViewProps) {
  const latestRound = session?.rounds.at(-1);
  if (!session || !latestRound) {
    return <p>Ask for a recommendation to see current results.</p>;
  }

  const shelf = latestRound.recommendations.filter((recommendation) => recommendation.lane === "shelf");
  const discovery = latestRound.recommendations.filter((recommendation) => recommendation.lane === "discovery");

  return (
    <div className="results-view">
      <h2>Current Results</h2>
      <p>{latestRound.assistantSummary}</p>
      <section>
        <h3>From your want-to-read shelf</h3>
        <div className="card-grid">
          {shelf.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onDecide={onDecideRecommendation}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      </section>
      <section>
        <h3>New discoveries</h3>
        <div className="card-grid">
          {discovery.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onDecide={onDecideRecommendation}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Implement sessions, detail, and settings views**

Create `src/components/RecommendationSessionsView.tsx`:

```tsx
import type { RecommendationSession } from "../domain/types";

interface RecommendationSessionsViewProps {
  sessions: RecommendationSession[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

export default function RecommendationSessionsView({
  sessions,
  activeSessionId,
  onSelectSession
}: RecommendationSessionsViewProps) {
  if (sessions.length === 0) {
    return <p>No recommendation sessions yet.</p>;
  }

  return (
    <div className="book-list">
      {sessions.map((session) => (
        <button className="book-row" type="button" key={session.id} onClick={() => onSelectSession(session.id)}>
          <strong>{session.title}</strong>
          <span>{session.rounds.length} rounds</span>
          <small>{session.id === activeSessionId ? "Active" : new Date(session.updatedAt).toLocaleString()}</small>
        </button>
      ))}
    </div>
  );
}
```

Create `src/components/BookDetailPanel.tsx`:

```tsx
import type { Book } from "../domain/types";

interface BookDetailPanelProps {
  book?: Book;
}

export default function BookDetailPanel({ book }: BookDetailPanelProps) {
  if (!book) {
    return <p>Select a book to see details.</p>;
  }

  return (
    <article className="detail-panel">
      <h2>{book.title}</h2>
      <p>{book.author}</p>
      <p>Shelf: {book.shelf}</p>
      {book.userRating ? <p>Rating: {book.userRating}/5</p> : null}
      {book.userNotes ? <p>{book.userNotes}</p> : null}
      {book.metadata.description ? <p>{book.metadata.description}</p> : null}
      <div className="external-links">
        {book.sourceLinks.map((link) => (
          <a href={link.url} key={link.id} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
```

Create `src/components/SettingsView.tsx`:

```tsx
import { useState } from "react";
import type { AppSettings, ReadingPreferences } from "../domain/types";

interface SettingsViewProps {
  preferences: ReadingPreferences;
  settings: AppSettings;
  onPreferencesChange: (preferences: ReadingPreferences) => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export default function SettingsView({
  preferences,
  settings,
  onPreferencesChange,
  onSettingsChange
}: SettingsViewProps) {
  const [preferenceText, setPreferenceText] = useState(preferences.text);
  const [model, setModel] = useState(settings.ai.model);
  const [provider, setProvider] = useState(settings.ai.provider);
  const [endpoint, setEndpoint] = useState(settings.ai.endpoint);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);

  return (
    <div className="settings-view">
      <section>
        <h2>Reading Preferences</h2>
        <label>
          Reading preferences context
          <textarea rows={8} value={preferenceText} onChange={(event) => setPreferenceText(event.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => onPreferencesChange({ ...preferences, text: preferenceText.trim() })}
        >
          Save preferences
        </button>
      </section>

      <section>
        <h2>AI Settings</h2>
        <label>
          Provider
          <select value={provider} onChange={(event) => setProvider(event.target.value as AppSettings["ai"]["provider"])}>
            <option value="mock">Mock</option>
            <option value="openai-compatible">OpenAI-compatible</option>
          </select>
        </label>
        <label>
          Model
          <input value={model} onChange={(event) => setModel(event.target.value)} />
        </label>
        <label>
          Endpoint
          <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} />
        </label>
        <label>
          API key
          <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" />
        </label>
        <button
          type="button"
          onClick={() =>
            onSettingsChange({
              ...settings,
              ai: { provider, model: model.trim(), endpoint: endpoint.trim(), apiKey }
            })
          }
        >
          Save AI settings
        </button>
      </section>

      <section>
        <h2>External Links</h2>
        {settings.linkSources.map((source) => (
          <label className="checkbox-row" key={source.id}>
            <input
              type="checkbox"
              checked={source.enabled}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  linkSources: settings.linkSources.map((candidate) =>
                    candidate.id === source.id ? { ...candidate, enabled: event.target.checked } : candidate
                  )
                })
              }
            />
            {source.label}
          </label>
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Wire views into App**

Add imports to `src/App.tsx`:

```tsx
import BookDetailPanel from "./components/BookDetailPanel";
import CurrentResultsView from "./components/CurrentResultsView";
import RecommendationSessionsView from "./components/RecommendationSessionsView";
import SettingsView from "./components/SettingsView";
import { decideRecommendation } from "./domain/recommendationSessions";
```

Add helper inside `App` before `return`:

```tsx
const selectedBook = state.books.find((book) => book.id === state.selectedBookId);
```

Replace the non-library canvas branch in `src/App.tsx` with:

```tsx
<>
  {activeTab === "sessions" ? (
    <RecommendationSessionsView
      sessions={state.sessions}
      activeSessionId={state.activeSessionId}
      onSelectSession={(sessionId) => {
        setState((current) => ({ ...current, activeSessionId: sessionId }));
        setActiveTab("results");
      }}
    />
  ) : null}
  {activeTab === "results" ? (
    <CurrentResultsView
      session={activeSession}
      onDecideRecommendation={(recommendationId, decision) => {
        if (!activeSession) {
          return;
        }
        const updated = decideRecommendation(activeSession, recommendationId, decision);
        setState((current) => ({
          ...current,
          sessions: upsertSession(current.sessions, updated)
        }));
      }}
      onSelectBook={(bookId) => {
        setState((current) => ({ ...current, selectedBookId: bookId }));
        setActiveTab("detail");
      }}
    />
  ) : null}
  {activeTab === "detail" ? <BookDetailPanel book={selectedBook} /> : null}
  {activeTab === "settings" ? (
    <SettingsView
      preferences={state.preferences}
      settings={state.settings}
      onPreferencesChange={(preferences) => setState((current) => ({ ...current, preferences }))}
      onSettingsChange={(settings) => setState((current) => ({ ...current, settings }))}
    />
  ) : null}
</>
```

- [ ] **Step 6: Add result/settings CSS**

Append to `src/styles.css`:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.recommendation-card,
.detail-panel,
.settings-view section {
  border: 1px solid #e5ded2;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}

.recommendation-card h4 {
  margin: 0;
}

.caveat {
  color: #7a4b00;
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.external-links a {
  color: #57412a;
  font-weight: 700;
}

.settings-view {
  display: grid;
  gap: 20px;
}

.checkbox-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.checkbox-row input {
  width: auto;
}
```

- [ ] **Step 7: Run tests and build**

Run: `npm test -- src/components/CurrentResultsView.test.tsx src/components/SettingsView.test.tsx src/App.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/components/RecommendationCard.tsx src/components/CurrentResultsView.tsx src/components/RecommendationSessionsView.tsx src/components/BookDetailPanel.tsx src/components/SettingsView.tsx src/components/CurrentResultsView.test.tsx src/components/SettingsView.test.tsx src/styles.css
git commit -m "feat: add recommendation canvas views"
```

### Task 10: Final Integration Verification And Manual QA Script

**Files:**
- Create: `docs/manual-qa.md`
- Modify: `README.md`

- [ ] **Step 1: Create README**

Create `README.md`:

```md
# NextChapter

NextChapter is a single-user web app for AI-assisted personal book recommendations.

## Development

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run the app:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## First Version

- Import Goodreads CSV exports.
- Edit local read and want-to-read lists.
- Ask natural-language recommendation prompts.
- Review recommendations grouped by shelf matches and new discoveries.
- Save iterative sessions.
- Edit preferences, AI settings, and external link sources.
```

- [ ] **Step 2: Create manual QA checklist**

Create `docs/manual-qa.md`:

```md
# Manual QA

Run `npm run dev`, open the local Vite URL, and verify:

- The app opens to chat plus library canvas.
- A Goodreads CSV fixture can be imported through the Library view.
- The Library view shows read and want-to-read books after import.
- A manual book can be added to the want-to-read shelf.
- A prompt such as "Find me a post-apocalyptic novel that is not too bleak" creates a recommendation session.
- Current Results shows "From your want-to-read shelf" and "New discoveries".
- A recommendation can be shortlisted, accepted, and rejected.
- Sessions shows the saved session and can return to its results.
- Book Detail opens from a library row.
- Settings can save reading preferences, model settings, and external link enabled flags.
- Desktop layout matches the approved UI design addendum: chat is the primary conversational surface and the canvas keeps Library, Sessions, Current Results, and Book Detail visible as primary work areas.
- Mobile layout matches the approved UI design addendum without horizontal scrolling, text overlap, or unreachable primary actions.
- Settings remains a secondary configuration surface rather than a face-up primary canvas tab in daily recommendation flows.
- Refreshing the browser preserves imported books, sessions, preferences, and settings.
```

- [ ] **Step 3: Run full automated verification**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Run local app for manual verification**

Run: `npm run dev`

Expected: Vite prints a localhost URL. Open it and execute `docs/manual-qa.md`.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/manual-qa.md
git commit -m "docs: add NextChapter usage and QA notes"
```

## Plan Self-Review

- Spec coverage: The tasks cover CSV import, editable read/want-to-read library, two-lane recommendations, iterative sessions, saved sessions, editable preferences, configurable AI settings, configurable external links, chat-first UI, canvas views, local persistence, and test scenarios.
- Scope: This is a first usable single-user web app. It intentionally does not add auth, multi-user deployment, Goodreads automation, or a server database.
- Type consistency: Shared types originate in `src/domain/types.ts`; component props and domain helpers use those names consistently.
- Testing: Each behavior-heavy module starts with failing unit or component tests, then finishes with targeted tests plus a build.
