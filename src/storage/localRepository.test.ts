import { createDefaultAppState } from "../domain/defaultState";
import type { AppState } from "../domain/types";
import { loadAppState, saveAppState, STORAGE_KEY } from "./localRepository";

describe("localRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads default state when storage is empty", () => {
    const state = loadAppState();

    expect(state.books).toEqual([]);
    expect(state.settings.ai.provider).toBe("mock");
    expect(state.preferences.text).toContain("Use my reading history");
  });

  it("persists and reloads valid state", () => {
    const state: AppState = {
      ...createDefaultAppState(),
      books: [
        {
          id: "book-1",
          title: "Station Eleven",
          author: "Emily St. John Mandel",
          shelf: "read",
          userRating: 5,
          userNotes: "Loved the reflective post-apocalyptic tone.",
          dateRead: "2022-01-10",
          isbn: "9780385353304",
          isbn13: "9780385353304",
          goodreadsId: "20170404",
          sourceLinks: [],
          metadata: {
            genres: ["Post-apocalyptic"],
            themes: ["art", "memory"],
            description: "A literary post-apocalyptic novel.",
            pageCount: 333,
            publicationYear: 2014
          }
        }
      ]
    };

    saveAppState(state);

    expect(loadAppState().books).toHaveLength(1);
    expect(loadAppState().books[0].title).toBe("Station Eleven");
  });

  it("falls back to defaults when stored JSON is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "{bad json");

    expect(loadAppState().books).toEqual([]);
  });

  it("falls back to defaults when stored JSON has malformed app state shape", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        books: [],
        sessions: [],
        preferences: {},
        settings: {}
      })
    );

    const state = loadAppState();

    expect(state.preferences.text).toContain("Use my reading history");
    expect(state.settings.ai.provider).toBe("mock");
  });

  it("falls back to defaults when stored JSON has malformed nested collection values", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        books: [{}],
        sessions: [null],
        preferences: {
          text: "Malformed nested values",
          approvedInferences: [123]
        },
        settings: {
          ai: {
            provider: "mock",
            model: "mock-personal-reader-v1",
            endpoint: "https://api.openai.com/v1/chat/completions",
            apiKey: ""
          },
          linkSources: [{}]
        }
      })
    );

    const state = loadAppState();

    expect(state.books).toEqual([]);
    expect(state.sessions).toEqual([]);
    expect(state.preferences.text).toContain("Use my reading history");
    expect(state.settings.linkSources[0].id).toBe("goodreads");
  });

  it("falls back to defaults when stored JSON has a malformed session round", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createDefaultAppState(),
        sessions: [
          {
            id: "session-1",
            title: "Session",
            originalPrompt: "Find a book",
            createdAt: "2026-06-17T00:00:00.000Z",
            updatedAt: "2026-06-17T00:00:00.000Z",
            constraints: [],
            feedback: [],
            rounds: [null]
          }
        ]
      })
    );

    expect(loadAppState().sessions).toEqual([]);
  });

  it("converts old round-based sessions into chat transcripts", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createDefaultAppState(),
        sessions: [
          {
            id: "session-1",
            title: "Offbeat adventure",
            originalPrompt: "Offbeat adventure",
            createdAt: "2026-06-17T00:00:00.000Z",
            updatedAt: "2026-06-17T00:00:00.000Z",
            constraints: [],
            feedback: [],
            rounds: [
              {
                id: "round-1",
                prompt: "Offbeat adventure",
                createdAt: "2026-06-17T00:00:00.000Z",
                assistantSummary: "Try Piranesi.",
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
                preferenceSuggestions: []
              }
            ]
          }
        ]
      })
    );

    const session = loadAppState().sessions[0];

    expect(session.messages).toHaveLength(2);
    expect(session.messages[0]).toMatchObject({ role: "user", text: "Offbeat adventure" });
    expect(session.messages[1].role === "assistant" ? session.messages[1].segments[0].type : undefined).toBe("book-link");
    expect("rounds" in session).toBe(false);
  });

  it("falls back to defaults when stored JSON has malformed optional fields", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...createDefaultAppState(),
        activeSessionId: 123,
        books: [
          {
            id: "book-1",
            title: "Station Eleven",
            author: "Emily St. John Mandel",
            shelf: "read",
            userRating: "5",
            userNotes: "Loved it.",
            sourceLinks: [],
            metadata: {
              genres: [],
              themes: [],
              description: "A literary post-apocalyptic novel.",
              pageCount: "333"
            }
          }
        ]
      })
    );

    expect(loadAppState().books).toEqual([]);
  });
});
