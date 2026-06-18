import type { RecommendationDecision, RecommendationSession } from "../domain/types";
import RecommendationCard from "./RecommendationCard";

interface CurrentResultsViewProps {
  session?: RecommendationSession;
  onDecideRecommendation: (recommendationId: string, decision: RecommendationDecision) => void;
  onSelectBook: (bookId: string) => void;
}

export default function CurrentResultsView({
  session,
  onDecideRecommendation,
  onSelectBook
}: CurrentResultsViewProps) {
  const latestRound = session?.rounds.at(-1);

  if (!session || !latestRound) {
    return <p>Ask for a recommendation to see current results.</p>;
  }

  const shelf = latestRound.recommendations.filter((recommendation) => recommendation.lane === "shelf");
  const discovery = latestRound.recommendations.filter((recommendation) => recommendation.lane === "discovery");

  return (
    <div className="results-view">
      <h2>Current Results</h2>
      <p>{latestRound.assistantSummary}</p>
      <section>
        <h3>From your want-to-read shelf</h3>
        <div className="card-grid">
          {shelf.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onDecide={onDecideRecommendation}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      </section>
      <section>
        <h3>New discoveries</h3>
        <div className="card-grid">
          {discovery.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onDecide={onDecideRecommendation}
              onSelectBook={onSelectBook}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
