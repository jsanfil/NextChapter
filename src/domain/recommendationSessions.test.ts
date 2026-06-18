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
