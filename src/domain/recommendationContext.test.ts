import type { Book, ReadingPreferences } from "./types";
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
  it("sends the full normalized library by default", () => {
    const context = buildRecommendationContext({
      prompt: "post-apocalyptic but not too bleak",
      books,
      preferences,
      activeSession: undefined
    });

    expect(context.prompt).toBe("post-apocalyptic but not too bleak");
    expect(context.contextStrategy).toBe("full");
    expect(context.libraryBooks.map((book) => book.title)).toEqual(["Station Eleven", "The Dog Stars"]);
    expect(context.readBooks.map((book) => book.title)).toEqual(["Station Eleven"]);
    expect(context.wantToReadBooks.map((book) => book.title)).toEqual(["The Dog Stars"]);
    expect(context.preferenceText).toContain("reflective");
    expect(context.preferenceText).toContain("pure action");
  });

  it("falls back to compact library context when the full library exceeds the budget", () => {
    const manyBooks = Array.from({ length: 40 }, (_, index): Book => ({
      id: `book-${index}`,
      title: index === 21 ? "Adventurous Oddity" : `Book ${index}`,
      author: `Author ${index}`,
      shelf: index % 2 === 0 ? "read" : "want-to-read",
      userNotes: index === 21 ? "A fun adventurous offbeat book." : "Quiet literary fiction.",
      sourceLinks: [],
      metadata: { genres: index === 21 ? ["adventure"] : [], themes: [], description: "x".repeat(40) }
    }));

    const context = buildRecommendationContext({
      prompt: "fun adventurous offbeat",
      books: manyBooks,
      preferences,
      activeSession: undefined,
      maxLibraryContextCharacters: 900
    });

    expect(context.contextStrategy).toBe("compact");
    expect(context.libraryBooks.length).toBeLessThan(manyBooks.length);
    expect(context.librarySummary.totalBooks).toBe(40);
    expect(context.librarySummary.byShelf.read).toBe(20);
    expect(context.libraryBooks.map((book) => book.title)).toContain("Adventurous Oddity");
  });
});
