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
        onSubmitPrompt={(prompt) => submitted.push(prompt)}
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
      originalPrompt: "Post-apocalyptic",
      createdAt: "2026-06-17T00:00:00.000Z",
      updatedAt: "2026-06-17T00:00:00.000Z",
      constraints: [],
      feedback: [],
      rounds: [
        {
          id: "round-1",
          prompt: "Post-apocalyptic",
          createdAt: "2026-06-17T00:00:00.000Z",
          assistantSummary: "Try these.",
          recommendations: [],
          preferenceSuggestions: [{ id: "pref-1", text: "Prefers reflective collapse stories.", status: "pending" }]
        }
      ]
    };

    renderWithUser(
      <ChatPanel
        activeSession={session}
        isLoading={false}
        error=""
        onSubmitPrompt={() => undefined}
        onResolvePreferenceSuggestion={() => undefined}
      />
    );

    expect(screen.getByText("Prefers reflective collapse stories.")).toBeInTheDocument();
  });
});
