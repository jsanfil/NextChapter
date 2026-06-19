import { screen } from "@testing-library/react";
import type { RecommendationSession } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import ChatPanel from "./ChatPanel";

describe("ChatPanel", () => {
  it("submits a recommendation prompt", async () => {
    const submitted: string[] = [];
    const { user } = renderWithUser(
      <ChatPanel
        activeSession={undefined}
        isLoading={false}
        error=""
        status=""
        onSubmitPrompt={(prompt) => submitted.push(prompt)}
        onNewChat={() => undefined}
        onSaveChat={() => undefined}
        onSelectBookLink={() => undefined}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    await user.type(screen.getByLabelText("Ask for book recommendations"), "light post-apocalyptic fiction");
    await user.click(screen.getByRole("button", { name: "Recommend" }));

    expect(submitted).toEqual(["light post-apocalyptic fiction"]);
  });

  it("shows preference suggestions for the active session", () => {
    const session: RecommendationSession = {
      id: "session-1",
      title: "Post-apocalyptic",
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
      messages: [
        {
          id: "msg-1",
          role: "user",
          createdAt: "2026-06-17T00:00:00.000Z",
          text: "Post-apocalyptic"
        },
        {
          id: "msg-2",
          role: "assistant",
          createdAt: "2026-06-17T00:00:00.000Z",
          text: "Try these.",
          segments: [{ type: "text", text: "Try these." }],
          preferenceSuggestions: [{ id: "pref-1", text: "Prefers reflective collapse stories.", status: "pending" }]
        }
      ]
    };

    renderWithUser(
      <ChatPanel
        activeSession={session}
        isLoading={false}
        error=""
        status=""
        onSubmitPrompt={() => undefined}
        onNewChat={() => undefined}
        onSaveChat={() => undefined}
        onSelectBookLink={() => undefined}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    expect(screen.getByText("Prefers reflective collapse stories.")).toBeInTheDocument();
  });

  it("renders linked book titles inside assistant messages", async () => {
    const selected: string[] = [];
    const session: RecommendationSession = {
      id: "session-1",
      title: "Offbeat adventure",
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
      messages: [
        {
          id: "msg-1",
          role: "user",
          createdAt: "2026-06-17T00:00:00.000Z",
          text: "Offbeat adventure"
        },
        {
          id: "msg-2",
          role: "assistant",
          createdAt: "2026-06-17T00:00:00.000Z",
          text: "Try Piranesi.",
          segments: [
            { type: "text", text: "I would start with " },
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
            { type: "text", text: " for wonder and mystery." }
          ],
          preferenceSuggestions: []
        }
      ]
    };
    const { user } = renderWithUser(
      <ChatPanel
        activeSession={session}
        isLoading={false}
        error=""
        status=""
        onSubmitPrompt={() => undefined}
        onNewChat={() => undefined}
        onSaveChat={() => undefined}
        onSelectBookLink={(book) => selected.push(book.title)}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "Open details for Piranesi by Susanna Clarke" }));

    expect(selected).toEqual(["Piranesi"]);
  });
});
