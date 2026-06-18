import type { RecommendationSession } from "../domain/types";

interface RecommendationSessionsViewProps {
  sessions: RecommendationSession[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

export default function RecommendationSessionsView({
  sessions,
  activeSessionId,
  onSelectSession
}: RecommendationSessionsViewProps) {
  if (sessions.length === 0) {
    return <p>No recommendation sessions yet.</p>;
  }

  return (
    <div className="book-list">
      {sessions.map((session) => (
        <button className="book-row" type="button" key={session.id} onClick={() => onSelectSession(session.id)}>
          <strong>{session.title}</strong>
          <span>{session.rounds.length} rounds</span>
          <small>{session.id === activeSessionId ? "Active" : new Date(session.updatedAt).toLocaleString()}</small>
        </button>
      ))}
    </div>
  );
}
