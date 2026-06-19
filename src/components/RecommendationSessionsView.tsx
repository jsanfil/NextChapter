import type { RecommendationSession } from "../domain/types";

interface RecommendationSessionsViewProps {
  sessions: RecommendationSession[];
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

export default function RecommendationSessionsView({
  sessions,
  activeSessionId,
  onSelectSession,
}: RecommendationSessionsViewProps) {
  if (sessions.length === 0) {
    return (
      <div className="px-7 py-8">
        <p className="font-serif text-base text-[--color-ink-muted] leading-relaxed">
          No sessions yet. Start a conversation and your chats will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="px-7 py-6">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-4">
        Past conversations
      </p>
      <div className="space-y-1">
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
              className={
                isActive
                  ? "w-full text-left flex items-start justify-between gap-4 pl-3 pr-3.5 py-3 rounded-xl border-l-2 border-[--color-border-mid] bg-[--color-cream] transition-colors group"
                  : "w-full text-left flex items-start justify-between gap-4 px-3.5 py-3 rounded-xl border-l-2 border-transparent hover:bg-[--color-cream] transition-colors group"
              }
            >
              <div className="min-w-0 space-y-0.5">
                <p className={
                  isActive
                    ? "text-sm font-medium truncate m-0 text-[--color-espresso]"
                    : "text-sm font-medium truncate m-0 text-[--color-ink] group-hover:text-[--color-espresso]"
                }>
                  {session.title}
                </p>
                <p className="text-xs text-[--color-ink-muted] m-0">
                  {session.messages.length} {session.messages.length === 1 ? "message" : "messages"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {isActive ? (
                  <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full text-[--color-green] bg-[--color-green-bg]">
                    Active
                  </span>
                ) : (
                  <span className="text-xs text-[--color-ink-light]">
                    {new Date(session.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
