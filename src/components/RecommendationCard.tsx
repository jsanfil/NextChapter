import type { Recommendation, RecommendationDecision } from "../domain/types";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDecide: (recommendationId: string, decision: RecommendationDecision) => void;
  onSelectBook: (bookId: string) => void;
}

export default function RecommendationCard({
  recommendation,
  onDecide,
  onSelectBook
}: RecommendationCardProps) {
  const linkedBookId = recommendation.linkedBookId;

  return (
    <article className="recommendation-card">
      <h4>{recommendation.title}</h4>
      <p>{recommendation.author}</p>
      <p>{recommendation.rationale}</p>
      <ul>
        {recommendation.matchNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      {recommendation.caveats.length > 0 ? (
        <p className="caveat">Caveat: {recommendation.caveats.join(" ")}</p>
      ) : null}
      <div className="inline-actions">
        <button type="button" onClick={() => onDecide(recommendation.id, "shortlisted")}>
          Shortlist {recommendation.title}
        </button>
        <button type="button" onClick={() => onDecide(recommendation.id, "accepted")}>
          Accept
        </button>
        <button type="button" onClick={() => onDecide(recommendation.id, "rejected")}>
          Reject
        </button>
        {linkedBookId ? (
          <button type="button" onClick={() => onSelectBook(linkedBookId)}>
            Open detail
          </button>
        ) : null}
      </div>
      <div className="external-links">
        {recommendation.sourceLinks.map((link) => (
          <a href={link.url} key={link.id} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ))}
      </div>
    </article>
  );
}
