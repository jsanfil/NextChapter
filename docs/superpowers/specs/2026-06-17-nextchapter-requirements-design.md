# NextChapter Requirements And Design

Date: 2026-06-17
Status: Draft for user review

## Overview

NextChapter is a single-user web app that recommends the next book or books to read. It uses the user's Goodreads reading history, editable local library, saved reading preferences, and natural-language prompts to produce explainable recommendations.

The primary experience is conversational. The user can ask for loose, informal recommendations such as "find me a post-apocalyptic novel," "something light for summer," or "what should I read next from my want-to-read shelf?" The app pairs this chat flow with a structured canvas for shelves, recommendation sessions, results, and book details.

The app should feel like a personal reading advisor, not a rigid filter form. It should remember durable preferences, support iterative refinement, and make it easy to return to prior recommendation sessions.

## Goals

- Import Goodreads reading data reliably from CSV export.
- Let the user view and edit local `read` and `want-to-read` lists.
- Recommend books from both the user's want-to-read shelf and the wider world of books.
- Support natural-language recommendation prompts by genre, theme, mood, tone, pacing, heaviness, seasonality, author traits, length, or comparison to previous books.
- Explain why each recommendation fits the user's history, preferences, and current prompt.
- Save iterative recommendation sessions so the user can revisit previous prompts, rounds, feedback, and shortlists.
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

The selected approach is **Chat + Library Canvas**.

The app has a ChatGPT-like recommendation surface for open-ended prompts and follow-up refinement. A durable canvas shows structured information that should not disappear into the chat transcript: imported shelves, editable library records, current recommendation results, saved recommendation sessions, and book detail panels.

This approach keeps the recommendation experience flexible while preserving the concrete state needed for a useful personal reading app.

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

The app should interpret loose requests without requiring structured filters. It should combine the current prompt with relevant library data, saved preferences, session feedback, and available metadata.

### Review Recommendation Results

Each recommendation round returns a small, useful set of books rather than a huge list. Results are grouped into two lanes:

1. **From your want-to-read shelf**
2. **New discoveries**

Each recommendation card includes:

- Title and author
- Short rationale
- Match notes tied to the user's prompt, history, or preferences
- Caveats or reasons it might not fit
- Shelf/status actions
- Configurable external links

The default chat response should be concise and explainable. Richer metadata and longer descriptions can appear in expandable book details.

### Refine A Session

Recommendation sessions are iterative. The user can respond with feedback such as:

- "Not quite right."
- "More literary."
- "Lighter."
- "More like this one."
- "Only books already on my shelf."
- "More female authors."
- "Less bleak."

The app should use this feedback to refine the active session, track which recommendations were rejected or accepted, and preserve the sequence of recommendation rounds.

### Save And Revisit Recommendation Sessions

Each recommendation session should be saved as structured state, not only as raw chat. A saved session includes:

- Original prompt or goal
- Current constraints, mood, genre, theme, and refinement notes
- Recommendation rounds
- Recommended books in each round
- Accepted, rejected, and shortlisted books
- User feedback
- Any preference update suggestions and decisions

The user can return to previous sessions, resume refinement, review prior results, or use a previous session as context for a new one.

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

- Input: current prompt, relevant library context, saved preferences, session state, and available metadata.
- Output: structured recommendation groups, explanations, caveats, preference-update suggestions, and follow-up prompts when needed.

### Open Book Details And External Links

The app supports configurable external book-detail/search links. Initial link sources should include:

- Goodreads
- Open Library
- Google Books
- Amazon

The app should generate safe search/detail links where direct IDs are unavailable. Link providers and ordering should be configurable in settings.

## Data And Integration Requirements

Goodreads CSV import is the dependable first integration path. Automated Goodreads sync is a later enhancement and must be validated separately because Goodreads no longer provides reliable official API access for new integrations. If automated sync is added later, the app must define conflict behavior between external Goodreads data and local edits.

Book metadata may come from imported CSV fields, manual edits, and app-friendly providers such as Open Library or Google Books where available. Recommendations should not depend on any single external catalog being complete or correct.

The LLM should receive a scoped context package for each recommendation request. The app should select relevant books and preferences instead of dumping the entire library into every model call.

## Interface Requirements

The app should use a chat-first layout with a durable canvas for structured state.

On desktop, chat and canvas can sit side by side. On smaller screens, they can become tabs or stacked panels.

The main canvas focuses on everyday reading work:

- **Library**: `read` and `want-to-read` lists with search, filter, sort, and manual add/edit support.
- **Recommendation Sessions**: previous sessions, prompts, rounds, rejected/accepted books, and final shortlists.
- **Current Results**: grouped recommendation cards for the active session.
- **Book Detail**: richer metadata, user notes, shelf status, and external links.

Settings contains lower-frequency configuration:

- **Reading Preferences Context**: editable user-authored notes and approved inferred preferences.
- **AI Settings**: selected LLM provider/model and related configuration.
- **External Link Sources**: configurable book-detail/search link providers and ordering.

The UI should make it easy to move from chat to action:

- Save a recommendation
- Reject a recommendation
- Add a book to `want-to-read`
- Mark a book as `read`
- Open a book detail panel
- Open external links
- Use feedback to refine the session
- Confirm or decline a proposed preference update inline

## Recommendation Behavior

The recommender should optimize for personal fit, not generic popularity. It should consider:

- Current user prompt
- Books the user has read
- Books the user wants to read
- User ratings and review text when available
- Saved reading preferences context
- Current session feedback
- Prior accepted and rejected recommendations where relevant
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
5. Refine a recommendation session with negative feedback.
6. Save or reject recommendations and return to the session later.
7. Update reading preferences manually.
8. Accept or decline an inferred preference update.
9. Change the configured LLM model.
10. Open external links for a recommended book.

## Open Questions For Later Planning

- Which web framework and storage layer should the first implementation use?
- Which LLM providers should be supported first?
- Should metadata enrichment run at import time, recommendation time, or on demand?
- How much of the app should work without internet access after CSV import?
