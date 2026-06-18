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
