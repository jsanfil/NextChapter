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
