import type { Book, RecommendationSession, ReadingPreferences } from "./types";

export interface RecommendationContextInput {
  prompt: string;
  books: Book[];
  preferences: ReadingPreferences;
  activeSession?: RecommendationSession;
  maxLibraryContextCharacters?: number;
}

export interface LibrarySummary {
  totalBooks: number;
  byShelf: Record<Book["shelf"], number>;
  fiveStarTitles: string[];
  wantToReadTitles: string[];
}

export interface RecommendationContext {
  prompt: string;
  preferenceText: string;
  contextStrategy: "full" | "compact";
  libraryBooks: Book[];
  librarySummary: LibrarySummary;
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
  const terms = prompt.toLowerCase().split(/\W+/).filter((term) => term.length > 3);

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function selectRelevant(prompt: string, books: Book[], shelf: Book["shelf"]): Book[] {
  return books
    .filter((book) => book.shelf === shelf)
    .map((book) => ({ book, score: scoreBook(prompt, book) }))
    .sort((left, right) => right.score - left.score || left.book.title.localeCompare(right.book.title))
    .slice(0, 12)
    .map(({ book }) => book);
}

function estimateLibraryCharacters(books: Book[]): number {
  return JSON.stringify(
    books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      shelf: book.shelf,
      userRating: book.userRating,
      userNotes: book.userNotes,
      dateRead: book.dateRead,
      isbn: book.isbn,
      isbn13: book.isbn13,
      goodreadsId: book.goodreadsId,
      metadata: book.metadata
    }))
  ).length;
}

function summarizeLibrary(books: Book[]): LibrarySummary {
  return {
    totalBooks: books.length,
    byShelf: {
      read: books.filter((book) => book.shelf === "read").length,
      "want-to-read": books.filter((book) => book.shelf === "want-to-read").length,
      none: books.filter((book) => book.shelf === "none").length
    },
    fiveStarTitles: books
      .filter((book) => book.userRating === 5)
      .slice(0, 20)
      .map((book) => `${book.title} — ${book.author}`),
    wantToReadTitles: books
      .filter((book) => book.shelf === "want-to-read")
      .slice(0, 40)
      .map((book) => `${book.title} — ${book.author}`)
  };
}

function compactLibrary(prompt: string, books: Book[]): Book[] {
  const relevant = books
    .map((book) => ({ book, score: scoreBook(prompt, book) }))
    .sort((left, right) => right.score - left.score || left.book.title.localeCompare(right.book.title))
    .slice(0, 24)
    .map(({ book }) => book);
  const fiveStar = books.filter((book) => book.userRating === 5).slice(0, 12);
  const wantToRead = books.filter((book) => book.shelf === "want-to-read").slice(0, 12);
  const byId = new Map<string, Book>();

  [...relevant, ...fiveStar, ...wantToRead].forEach((book) => byId.set(book.id, book));

  return [...byId.values()];
}

export function buildRecommendationContext(input: RecommendationContextInput): RecommendationContext {
  const approved = input.preferences.approvedInferences.join("\n");
  const maxLibraryContextCharacters = input.maxLibraryContextCharacters ?? 120_000;
  const fullFits = estimateLibraryCharacters(input.books) <= maxLibraryContextCharacters;
  const libraryBooks = fullFits ? input.books : compactLibrary(input.prompt, input.books);

  return {
    prompt: input.prompt,
    preferenceText: [input.preferences.text, approved].filter(Boolean).join("\n"),
    contextStrategy: fullFits ? "full" : "compact",
    libraryBooks,
    librarySummary: summarizeLibrary(input.books),
    readBooks: selectRelevant(input.prompt, input.books, "read"),
    wantToReadBooks: selectRelevant(input.prompt, input.books, "want-to-read"),
    sessionFeedback:
      input.activeSession?.messages.filter((message) => message.role === "user").map((message) => message.text) || []
  };
}
