import type { AssistantMessageSegment, LegacyRecommendationRound } from "./types";
import {
  appendChatExchange,
  createRecommendationSession,
  legacyRoundsToMessages,
  resolvePreferenceSuggestion
} from "./recommendationSessions";

const assistantMessage: AssistantMessageSegment[] = [
  { type: "text", text: "Try " },
  {
    type: "book-link",
    text: "Piranesi",
    book: {
      title: "Piranesi",
      author: "Susanna Clarke",
      sourceLinks: [],
      metadata: { genres: ["Fantasy"], themes: ["Mystery"], description: "A labyrinth mystery." }
    }
  },
  { type: "text", text: "." }
];

describe("recommendationSessions", () => {
  it("creates a saved chat from the first prompt", () => {
    const session = createRecommendationSession("Find offbeat adventure books");

    expect(session.title).toBe("Find offbeat adventure books");
    expect(session.messages).toEqual([]);
  });

  it("appends a user prompt and assistant response as chat messages", () => {
    const session = createRecommendationSession("Find offbeat adventure books");
    const updated = appendChatExchange(session, {
      prompt: "Find offbeat adventure books",
      assistantSummary: "Try Piranesi.",
      assistantMessage,
      preferenceSuggestions: [{ id: "pref-1", text: "Prefers weird adventure.", status: "pending" }]
    });

    expect(updated.messages).toHaveLength(2);
    expect(updated.messages[0]).toMatchObject({ role: "user", text: "Find offbeat adventure books" });
    expect(updated.messages[1]).toMatchObject({ role: "assistant", text: "Try Piranesi." });
    expect(updated.messages[1].role === "assistant" ? updated.messages[1].segments : []).toEqual(assistantMessage);
  });

  it("appends follow-up prompts to the same chat transcript", () => {
    const first = appendChatExchange(createRecommendationSession("Find offbeat adventure books"), {
      prompt: "Find offbeat adventure books",
      assistantSummary: "Try Piranesi.",
      assistantMessage,
      preferenceSuggestions: []
    });
    const second = appendChatExchange(first, {
      prompt: "Lighter and funnier.",
      assistantSummary: "Try Starter Villain.",
      assistantMessage: [{ type: "text", text: "Try Starter Villain." }],
      preferenceSuggestions: []
    });

    expect(second.id).toBe(first.id);
    expect(second.messages.map((message) => message.role)).toEqual(["user", "assistant", "user", "assistant"]);
    expect(second.messages[2]).toMatchObject({ role: "user", text: "Lighter and funnier." });
  });

  it("resolves preference suggestions attached to assistant messages", () => {
    const session = appendChatExchange(createRecommendationSession("Find offbeat adventure books"), {
      prompt: "Find offbeat adventure books",
      assistantSummary: "Try Piranesi.",
      assistantMessage,
      preferenceSuggestions: [{ id: "pref-1", text: "Prefers weird adventure.", status: "pending" }]
    });

    const updated = resolvePreferenceSuggestion(session, "pref-1", "accepted");
    const assistant = updated.messages[1];

    expect(assistant.role === "assistant" ? assistant.preferenceSuggestions[0].status : undefined).toBe("accepted");
  });

  it("converts old recommendation rounds into chat transcript messages", () => {
    const legacyRounds: LegacyRecommendationRound[] = [
      {
        id: "round-1",
        prompt: "Find offbeat adventure books",
        createdAt: "2026-06-17T00:00:00.000Z",
        recommendations: [
          {
            id: "rec-1",
            lane: "discovery",
            title: "Piranesi",
            author: "Susanna Clarke",
            rationale: "A strange and wondrous labyrinth.",
            matchNotes: ["Wonder"],
            caveats: [],
            sourceLinks: [],
            metadata: { genres: ["Fantasy"], themes: ["Mystery"], description: "A labyrinth mystery." }
          }
        ],
        assistantSummary: "Try Piranesi.",
        preferenceSuggestions: []
      }
    ];

    const messages = legacyRoundsToMessages(legacyRounds);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: "user", text: "Find offbeat adventure books" });
    expect(messages[1].role === "assistant" ? messages[1].segments[0].type : undefined).toBe("book-link");
  });
});
