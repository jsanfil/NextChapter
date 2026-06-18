import { screen } from "@testing-library/react";
import type { RecommendationSession } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import CurrentResultsView from "./CurrentResultsView";

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
      preferenceSuggestions: [],
      recommendations: [
        {
          id: "rec-1",
          lane: "shelf",
          title: "The Dog Stars",
          author: "Peter Heller",
          rationale: "Already on your shelf.",
          matchNotes: ["Post-apocalyptic"],
          caveats: [],
          decision: "undecided",
          sourceLinks: []
        }
      ]
    }
  ]
};

describe("CurrentResultsView", () => {
  it("renders grouped recommendations and sends decisions", async () => {
    const decisions: string[] = [];
    const { user } = renderWithUser(
      <CurrentResultsView
        session={session}
        onDecideRecommendation={(id) => decisions.push(id)}
        onSelectBook={() => undefined}
      />
    );

    expect(screen.getByText("From your want-to-read shelf")).toBeInTheDocument();
    expect(screen.getByText("The Dog Stars")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Shortlist The Dog Stars" }));
    expect(decisions).toEqual(["rec-1"]);
  });
});
