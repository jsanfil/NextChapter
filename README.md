# NextChapter

NextChapter is a local-first web app for personal book recommendations. It uses your Goodreads export, your reading preferences, and an OpenAI-compatible model to create ChatGPT-style recommendation conversations with clickable book links.

The main experience is chat. Ask for something like "fun, adventurous, and off the beaten path," and the assistant responds in prose with linked book titles. Click a title and the right-hand panel shows book details, shelf status, catalog metadata, a short summary, cover art when available, and external links.

## What You Bring

NextChapter does not ship with a hosted backend, user accounts, Goodreads sync, or an included AI key. To use it meaningfully, bring:

- A Goodreads CSV export, usually named something like `goodreads_library_export.csv`.
- An API key for an OpenAI-compatible chat completions endpoint.
- A model name supported by that endpoint.

You can run the app without an API key in mock mode, but recommendations will be canned demo output.

## Features

- Import a Goodreads CSV export.
- Browse and search local `read` and `want-to-read` shelves.
- Ask natural-language recommendation prompts.
- Save and resume chat sessions.
- Start a new chat without losing previous saved chats.
- Click book links in chat to inspect book metadata in the right-hand panel.
- Fetch catalog details from public book sources when available, with local/model fallback.
- Configure external links for Goodreads, Open Library, Google Books, and Amazon.
- Edit your reading preferences context.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

Run tests:

```bash
npm test
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Importing Your Goodreads Library

1. Export your library from Goodreads as a CSV file.
2. Open NextChapter.
3. Go to the `Library` tab.
4. Use `Import Goodreads CSV`.
5. Select your Goodreads CSV file.

The importer reads common Goodreads fields including title, author, shelf, rating, review text, date read, ISBN/ISBN13, Goodreads ID, page count, publication year, and shelf tags where available.

Imported data is stored in your browser's local storage. There is no cloud sync in this version.

## Configuring AI

NextChapter starts in `Mock` provider mode. To get real recommendations:

1. Go to the `Settings` tab.
2. Under `AI Settings`, set `Provider` to `OpenAI-compatible`.
3. Enter your model name.
4. Enter your chat completions endpoint.
5. Enter your API key.
6. Click `Save AI settings`.

The default endpoint is:

```text
https://api.openai.com/v1/chat/completions
```

Example model names depend on your provider. For OpenAI, use a currently available chat model for your account.

Important: this is a client-side app. Your API key is stored in browser local storage and used directly from the browser. Do not deploy this publicly with your personal API key embedded or preconfigured.

## Using The App

1. Import your Goodreads CSV.
2. Optionally edit your reading preferences in `Settings`.
3. Ask for recommendations in chat.
4. Click any linked book title in an assistant response.
5. Review details in the right-hand Book Detail panel.
6. Use `Save chat` to persist the current conversation.
7. Use `New chat` to start fresh.
8. Use `Sessions` to resume an earlier chat and keep going.

Saved sessions are simple chat transcripts: your prompts and the assistant responses. When you resume one, it becomes the active chat again.

## Data Storage

NextChapter is local-first:

- Library data is stored in browser local storage.
- Saved chats are stored in browser local storage.
- AI settings, including API key, are stored in browser local storage.
- Catalog lookups may call public external services from the browser.

Clearing browser storage for the site will remove your imported library, settings, and saved sessions.

## Project Scripts

```bash
npm run dev       # Start Vite dev server
npm test          # Run Vitest tests
npm run build     # Type-check and build production assets
npm run preview   # Preview production build locally
```

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- Papa Parse for Goodreads CSV parsing

## Status

This is an early single-user version. It is designed for local use with your own data and your own AI credentials.
