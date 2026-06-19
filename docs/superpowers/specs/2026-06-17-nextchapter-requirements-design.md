# NextChapter Requirements And Design

Date: 2026-06-17
Status: Revised 2026-06-19 for chat-first book inspector direction

## Overview

NextChapter is a single-user web app that recommends the next book or books to read. It uses the user's Goodreads reading history, editable local library, saved reading preferences, catalog metadata, and natural-language prompts to produce explainable recommendations.

The primary experience is a ChatGPT-like conversation. The user can ask for loose, informal recommendations such as "find me a post-apocalyptic novel," "something light for summer," or "what should I read next from my want-to-read shelf?" The assistant answers in natural prose with sections, ranked lists, explanations, and clickable book titles. Clicking a book title updates the right-hand inspector with shelf status, cover art, metadata, a short summary, and links to richer external sources.

The app should feel like a personal reading advisor, not a rigid filter form or dashboard. It should preserve the native magic of chat while adding live book links, durable preferences, iterative refinement, saved sessions, and a contextual book inspector.

## Goals

- Import Goodreads reading data reliably from CSV export.
- Let the user view and edit local `read` and `want-to-read` lists.
- Recommend books from both the user's want-to-read shelf and the wider world of books.
- Support natural-language recommendation prompts by genre, theme, mood, tone, pacing, heaviness, seasonality, author traits, length, or comparison to previous books.
- Explain why each recommendation fits the user's history, preferences, and current prompt in the chat response itself.
- Make recommended book titles clickable in assistant responses.
- Show selected-book metadata, shelf status, cover art, short summary, and external links in a persistent right-hand inspector.
- Save conversation sessions so the user can reopen a prior chat and continue it.
- Maintain an editable reading preferences context that can be updated manually, through chat, or through approved model-suggested insights.
- Allow the user to configure which LLM provider/model is used.
- Provide configurable external links for book details and discovery.

## Non-Goals For The First Version

- Multi-user accounts, authentication, or shared libraries.
- Fully automated Goodreads sync as a required MVP capability.
- Dependence on an unofficial Goodreads API for core functionality.
- Perfect universal book metadata coverage.
- Social features, public reviews, or friend activity.
- E-commerce checkout or direct purchase flows.

## Product Approach

The selected approach is **Chat-First With Book Inspector**.

The app has a ChatGPT-like recommendation surface for open-ended prompts and follow-up refinement. The assistant response is the canonical recommendation result: it can include prose, grouped lists, ranked picks, caveats, and book-by-book rationale. Book titles in assistant messages are rendered as links.

The durable right-hand canvas defaults to a selected-book inspector. It shows structured information that should not disappear into the chat transcript: whether the book is already read or want-to-read, imported user notes/ratings, catalog metadata, cover art, short summary, and external detail links. Library, Sessions, and Settings remain reachable as secondary utility views.

## Core User Flows

### Import Goodreads Data

The user exports Goodreads data as CSV and imports it into NextChapter. The app maps Goodreads shelf data into local `read` and `want-to-read` lists. Imported data should preserve, when present:

- Title
- Author
- Shelf/list
- User rating
- Review text
- Date read
- ISBN or ISBN13
- Goodreads ID
- Derived or imported source URL

The app should preview import results and make clear which rows were imported, skipped, or need attention.

### Manage Local Library

After import, the local library is editable. The user can manually add, edit, remove, and recategorize books in the `read` and `want-to-read` lists, including books that were never present in Goodreads.

Each book record should support enough fields for recommendation and display:

- Title
- Author
- Shelf/status: `read`, `want-to-read`, or neither if retained as a recommendation only
- User rating
- User notes or review
- Date read
- ISBN/ISBN13 when known
- External IDs when known
- Source links
- Optional metadata such as genre, themes, page count, publication year, and description

### Ask For Recommendations

The user asks for recommendations in natural language. Examples:

- "Find me a post-apocalyptic novel based on what I've liked before."
- "I want something light but still smart for a summer trip."
- "What should I read next from my want-to-read shelf?"
- "Give me something like Station Eleven but less bleak."

The app should interpret loose requests without requiring structured filters. It should combine the current prompt with relevant library data, saved preferences, prior chat messages in the active session, and available metadata.

### Review Recommendation Results

Each recommendation round returns a useful chat response rather than a separate card board. The assistant may group recommendations into sections such as "If I were picking one book," "Adventure + fun + offbeat," "Hidden gems," or "Most likely 5-star reads." Each named book should be represented as a structured book link, not plain text.

Each linked book carries enough structured data to drive the inspector:

- Title and author
- Local book ID when the recommendation matches an imported book
- ISBN/ISBN13 or Goodreads ID when known
- Short rationale and caveats
- Imported or model-provided metadata fallback
- Configurable external links

The chat response should explain why each recommendation fits. The inspector should handle richer metadata, shelf status, cover art, catalog summaries, and external source links.

### Refine A Session

Recommendation conversations are iterative. The user can respond with follow-up prompts such as:

- "Not quite right."
- "More literary."
- "Lighter."
- "More like this one."
- "Only books already on my shelf."
- "More female authors."
- "Less bleak."

The app should append each follow-up to the active chat transcript and use prior messages as conversational context. It does not need to track accepted, rejected, shortlisted, or round-level state for the first version.

### Save And Revisit Recommendation Sessions

Each recommendation session should be saved as a resumable chat transcript. A saved session includes:

- Session title
- Created and updated timestamps
- Ordered user prompts
- Ordered assistant responses
- Structured book-link spans inside assistant responses
- Any pending or resolved preference suggestions attached to assistant messages

The user can return to a previous session, make it the main chat, click book links in old assistant messages, and continue the same conversation with a new prompt.

### Manage Reading Preferences Context

The app stores a durable reading preferences context. This is a plain-language profile used by the recommender. It can include preferences such as:

- Genres and themes the user likes
- Mood and tone preferences
- Pacing and heaviness preferences
- Author or style tendencies
- Seasonal preferences
- Explicit caveats or things to avoid

The user can edit this context manually in settings. The user can also update it through chat, for example: "Remember that I like post-apocalyptic books when they are more character-driven than action-heavy."

The app may infer possible preferences from ratings, reading history, and recommendation feedback, but it must ask for explicit approval before saving inferred preferences.

### Configure AI Model

The app includes AI settings where the user can configure which LLM provider/model is used for recommendations.

The recommendation pipeline should be provider-agnostic. Model-specific prompting or configuration is allowed, but the core recommendation contract should remain stable:

- Input: current prompt, full normalized library context when within budget, saved preferences, session state, and available metadata.
- Output: assistant prose with structured book-link spans, recommendation rationale/caveats for linked books, preference-update suggestions, and follow-up prompts when needed.

### Open Book Details And External Links

The app supports a right-hand book inspector plus configurable external book-detail/search links. When a linked title is clicked, the app resolves it against the local library by local ID, ISBN, or title-author match. If it matches the library, the inspector shows whether it is read or want-to-read and includes imported rating/review fields. If it does not match, the inspector treats it as a new discovery.

The inspector should prefer catalog metadata when available. It should look up details by ISBN first, then title and author. Initial catalog/detail sources should include:

- Goodreads
- Open Library
- Google Books
- Amazon

The local inspector should show title, author, cover, publication date/year, page count, genres/categories, source attribution, and a short summary. It should fall back to imported or model-provided data when catalog lookup fails. The app should generate safe search/detail links where direct IDs are unavailable. Link providers and ordering should be configurable in settings.

## Data And Integration Requirements

Goodreads CSV import is the dependable first integration path. Automated Goodreads sync is a later enhancement and must be validated separately because Goodreads no longer provides reliable official API access for new integrations. If automated sync is added later, the app must define conflict behavior between external Goodreads data and local edits.

Book metadata may come from imported CSV fields, manual edits, and app-friendly providers such as Open Library or Google Books where available. Recommendations should not depend on any single external catalog being complete or correct.

The LLM should receive the full imported library as normalized structured records by default. This matches the successful ChatGPT workflow for a small Goodreads export and avoids premature artificial filtering. If the normalized library exceeds the configured model/context budget, the app should fall back to a compact full-library summary plus the most relevant full records.

## Interface Requirements

The app should use a chat-first layout with a durable right-hand inspector.

On desktop, chat and inspector sit side by side. Chat is wider and remains the primary surface. On smaller screens, chat and inspector can become tabs, stacked panels, or a focused detail sheet.

The default canvas is **Book Detail**. Secondary views remain available:

- **Book Detail**: selected book cover, metadata, shelf status, summary, recommendation rationale, user notes, and source links.
- **Library**: `read` and `want-to-read` lists with search, filter, sort, and manual add/edit support.
- **Recommendation Sessions**: previous saved chats with message counts, updated timestamps, and resume actions.
- **Settings**: reading preferences context, AI provider/model settings, external link sources, and catalog behavior.

Settings contains lower-frequency configuration:

- **Reading Preferences Context**: editable user-authored notes and approved inferred preferences.
- **AI Settings**: selected LLM provider/model and related configuration.
- **External Link Sources**: configurable book-detail/search link providers and ordering.

The UI should make it easy to move from chat to inspection and action:

- Click a book title in chat
- See whether the book is already read, want-to-read, or new
- Review metadata, cover, summary, rationale, caveats, and source links
- Add a book to `want-to-read`
- Mark a book as `read`
- Open external links
- Save the current chat
- Start a new blank chat without losing saved conversations
- Continue a saved conversation with follow-up prompts
- Confirm or decline a proposed preference update inline

## Recommendation Behavior

The recommender should optimize for personal fit, not generic popularity. It should consider:

- Current user prompt
- Books the user has read
- Books the user wants to read
- User ratings and review text when available
- Saved reading preferences context
- Prior messages in the active session
- Available metadata such as genre, themes, description, length, publication year, and author

The recommender should clearly separate facts from inferences. For example, it may say a book appears to fit a preference because of imported ratings or saved notes, but it should not invent unsupported claims about the user's taste.

When confidence is low or the prompt is ambiguous, the app should either ask a short follow-up question or provide a small set of varied options with clear trade-offs.

## Error Handling And Edge Cases

- If CSV import fails, the app should show actionable row-level or file-level errors.
- If imported data is incomplete, the app should still retain usable book records.
- If metadata lookup fails, the app should fall back to imported/manual data and search links.
- If the selected LLM provider/model is unavailable, the app should show a clear error and preserve the user's prompt/session state.
- If recommendations are weak due to limited library data, the app should say so and suggest adding ratings, notes, or preferences.
- If automated Goodreads sync is later added, sync conflicts must not silently overwrite local edits.

## Testing And Success Criteria

The app is successful when the user can import a Goodreads CSV, see and edit `read` and `want-to-read` lists, ask for a recommendation in natural language, receive a small explainable set of books split between saved-shelf matches and new discoveries, refine the results conversationally, save the session, and return to it later.

Key test scenarios:

1. Import a Goodreads CSV with read and want-to-read books.
2. Manually add a book to each list.
3. Ask for a genre/theme recommendation, such as post-apocalyptic fiction.
4. Ask for a mood-based recommendation, such as light summer reading.
5. Refine a recommendation conversation with a follow-up prompt.
6. Reopen a saved chat, click a book link from the transcript, and continue the conversation.
7. Update reading preferences manually.
8. Accept or decline an inferred preference update.
9. Change the configured LLM model.
10. Click a linked book title in chat and verify the right-hand inspector shows metadata, shelf status, summary, cover, and external links.

## Open Questions For Later Planning

- Which web framework and storage layer should the first implementation use?
- Which LLM providers should be supported first?
- Should metadata enrichment run at import time, recommendation time, or on demand?
- How much of the app should work without internet access after CSV import?
