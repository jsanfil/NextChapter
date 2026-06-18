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

export function buildRecommendationContext(input: RecommendationContextInput): RecommendationContext {
  const approved = input.preferences.approvedInferences.join("\n");

  return {
    prompt: input.prompt,
    preferenceText: [input.preferences.text, approved].filter(Boolean).join("\n"),
    readBooks: selectRelevant(input.prompt, input.books, "read"),
    wantToReadBooks: selectRelevant(input.prompt, input.books, "want-to-read"),
    sessionFeedback: input.activeSession?.feedback || []
  };
}
