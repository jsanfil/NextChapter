import type { AppState, AppSettings } from "./types";

export const defaultSettings: AppSettings = {
  ai: {
    provider: "mock",
    model: "mock-personal-reader-v1",
    endpoint: "https://api.openai.com/v1/chat/completions",
    apiKey: ""
  },
  linkSources: [
    { id: "goodreads", label: "Goodreads", enabled: true, order: 1 },
    { id: "open-library", label: "Open Library", enabled: true, order: 2 },
    { id: "google-books", label: "Google Books", enabled: true, order: 3 },
    { id: "amazon", label: "Amazon", enabled: true, order: 4 }
  ]
};

export function createDefaultAppState(): AppState {
  return {
    books: [],
    sessions: [],
    preferences: {
      text: "Use my reading history, ratings, notes, and current mood to recommend books. Explain the fit clearly and call out caveats.",
      approvedInferences: []
    },
    settings: {
      ai: { ...defaultSettings.ai },
      linkSources: defaultSettings.linkSources.map((source) => ({ ...source }))
    }
  };
}
