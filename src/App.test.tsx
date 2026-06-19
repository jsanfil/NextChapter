import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createDefaultAppState } from "./domain/defaultState";
import type { AppState, RecommendationSession } from "./domain/types";
import { STORAGE_KEY } from "./storage/localRepository";

function userMessage(id: string, text: string) {
  return {
    id,
    role: "user" as const,
    createdAt: "2026-06-17T00:00:00.000Z",
    text
  };
}

function assistantMessage(id: string, text: string) {
  return {
    id,
    role: "assistant" as const,
    createdAt: "2026-06-17T00:00:00.000Z",
    text,
    segments: [{ type: "text" as const, text }],
    preferenceSuggestions: []
  };
}

function saveState(state: Partial<AppState>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...createDefaultAppState(),
      ...state
    })
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the chat-first app shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NextChapter" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Ask for book recommendations" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Book Detail" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Library" })).toBeInTheDocument();
  });

  it("keeps Library, Sessions, and Settings reachable as secondary views", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Library" }));
    expect(screen.getByRole("button", { name: "Add book" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Sessions" }));
    expect(screen.getByText("No recommendation sessions yet.")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Settings" }));
    expect(screen.getByRole("heading", { name: "Reading Preferences" })).toBeInTheDocument();
  });

  it("restores a saved chat as the main transcript with clickable book links", async () => {
    const user = userEvent.setup();
    saveState({
      sessions: [
          {
            id: "session-1",
            title: "Offbeat adventure",
            createdAt: "2026-06-17T00:00:00.000Z",
            updatedAt: "2026-06-17T00:00:00.000Z",
            messages: [
              {
                id: "msg-1",
                role: "user",
                createdAt: "2026-06-17T00:00:00.000Z",
                text: "Recommend offbeat adventure books"
              },
              {
                id: "msg-2",
                role: "assistant",
                createdAt: "2026-06-17T00:00:00.000Z",
                text: "Try Piranesi.",
                segments: [
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
                ],
                preferenceSuggestions: []
              }
            ]
          }
        ]
    });

    render(<App />);
    await user.click(screen.getByRole("tab", { name: "Sessions" }));
    await user.click(screen.getByRole("button", { name: /Offbeat adventure/ }));

    expect(screen.getByText("Recommend offbeat adventure books")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open details for Piranesi by Susanna Clarke" }));

    expect(screen.getByRole("heading", { name: "Piranesi" })).toBeInTheDocument();
    expect(screen.getByText("A labyrinth mystery.")).toBeInTheDocument();
  });

  it("switches between saved chats and continues the selected chat", async () => {
    const user = userEvent.setup();
    const sessions: RecommendationSession[] = [
      {
        id: "session-old",
        title: "Old adventure chat",
        createdAt: "2026-06-17T00:00:00.000Z",
        updatedAt: "2026-06-17T00:00:00.000Z",
        messages: [userMessage("old-user", "Old prompt"), assistantMessage("old-assistant", "Old answer")]
      },
      {
        id: "session-current",
        title: "Current space chat",
        createdAt: "2026-06-18T00:00:00.000Z",
        updatedAt: "2026-06-18T00:00:00.000Z",
        messages: [userMessage("current-user", "Current prompt"), assistantMessage("current-assistant", "Current answer")]
      }
    ];
    saveState({ sessions, activeSessionId: "session-current" });

    render(<App />);
    expect(screen.getByText("Current prompt")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Sessions" }));
    await user.click(screen.getByRole("button", { name: /Old adventure chat/ }));

    expect(screen.getByText("Old prompt")).toBeInTheDocument();
    expect(screen.queryByText("Current prompt")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Ask for book recommendations"), "continue this one");
    await user.click(screen.getByRole("button", { name: "Recommend" }));

    expect(screen.getByText("continue this one")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as AppState;
    expect(saved.activeSessionId).toBe("session-old");
    expect(saved.sessions.find((session) => session.id === "session-old")?.messages.some((message) => message.text === "continue this one")).toBe(true);
  });

  it("can save the current chat and start a new blank chat", async () => {
    const user = userEvent.setup();
    saveState({
      activeSessionId: "session-1",
      sessions: [
        {
          id: "session-1",
          title: "Offbeat adventure",
          createdAt: "2026-06-17T00:00:00.000Z",
          updatedAt: "2026-06-17T00:00:00.000Z",
          messages: [userMessage("msg-1", "Saved prompt"), assistantMessage("msg-2", "Saved answer")]
        }
      ]
    });

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Save chat" }));
    expect(screen.getByText("Chat saved.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New chat" }));
    expect(screen.getByText("Ask for a mood, genre, theme, shelf pick, or reading goal.")).toBeInTheDocument();
    expect(screen.queryByText("Saved prompt")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Sessions" }));
    expect(screen.getByRole("button", { name: /Offbeat adventure/ })).toBeInTheDocument();
  });
});
