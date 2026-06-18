import { useEffect, useMemo, useState } from "react";
import { createMockRecommendationProvider } from "./ai/mockProvider";
import CanvasTabs, { type CanvasTab } from "./components/CanvasTabs";
import ChatPanel from "./components/ChatPanel";
import LibraryView from "./components/LibraryView";
import { buildRecommendationContext } from "./domain/recommendationContext";
import {
  appendRecommendationRound,
  createRecommendationSession,
  resolvePreferenceSuggestion
} from "./domain/recommendationSessions";
import type { AppState, RecommendationSession } from "./domain/types";
import { loadAppState, saveAppState } from "./storage/localRepository";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<CanvasTab>("library");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const activeSession = useMemo(
    () => state.sessions.find((session) => session.id === state.activeSessionId),
    [state.activeSessionId, state.sessions]
  );

  async function submitPrompt(prompt: string) {
    setIsLoading(true);
    setError("");

    try {
      const session = activeSession || createRecommendationSession(prompt);
      const context = buildRecommendationContext({
        prompt,
        books: state.books,
        preferences: state.preferences,
        activeSession: session
      });
      const provider = createMockRecommendationProvider();
      const response = await provider.recommend({
        context,
        linkSources: state.settings.linkSources
      });
      const updatedSession = appendRecommendationRound(session, {
        prompt,
        recommendations: response.recommendations,
        assistantSummary: response.assistantSummary,
        preferenceSuggestions: response.preferenceSuggestions
      });

      setState((current) => ({
        ...current,
        activeSessionId: updatedSession.id,
        sessions: upsertSession(current.sessions, updatedSession)
      }));
      setActiveTab("results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Recommendation failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function resolveSuggestion(suggestionId: string, status: "accepted" | "declined") {
    if (!activeSession) {
      return;
    }

    const updated = resolvePreferenceSuggestion(activeSession, suggestionId, status);
    const acceptedSuggestion = activeSession.rounds
      .flatMap((round) => round.preferenceSuggestions)
      .find((suggestion) => suggestion.id === suggestionId);

    setState((current) => ({
      ...current,
      sessions: upsertSession(current.sessions, updated),
      preferences:
        status === "accepted" && acceptedSuggestion
          ? {
              ...current.preferences,
              approvedInferences: [...current.preferences.approvedInferences, acceptedSuggestion.text]
            }
          : current.preferences
    }));
  }

  return (
    <main className="app-shell">
      <ChatPanel
        activeSession={activeSession}
        isLoading={isLoading}
        error={error}
        onSubmitPrompt={submitPrompt}
        onResolvePreferenceSuggestion={resolveSuggestion}
      />

      <section className="canvas-panel" aria-label="Library canvas">
        <CanvasTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className="canvas-body">
          {activeTab === "library" ? (
            <LibraryView
              books={state.books}
              linkSources={state.settings.linkSources}
              onBooksChange={(books) => setState((current) => ({ ...current, books }))}
              onSelectBook={(bookId) => {
                setState((current) => ({ ...current, selectedBookId: bookId }));
                setActiveTab("detail");
              }}
            />
          ) : (
            <>
              <h2>{tabTitle(activeTab)}</h2>
              <p>{canvasPlaceholder(activeTab, activeSession)}</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function upsertSession(sessions: RecommendationSession[], session: RecommendationSession): RecommendationSession[] {
  const exists = sessions.some((candidate) => candidate.id === session.id);
  return exists
    ? sessions.map((candidate) => (candidate.id === session.id ? session : candidate))
    : [session, ...sessions];
}

function tabTitle(tab: CanvasTab): string {
  const titles: Record<CanvasTab, string> = {
    library: "Library",
    sessions: "Recommendation Sessions",
    results: "Current Results",
    detail: "Book Detail",
    settings: "Settings"
  };

  return titles[tab];
}

function canvasPlaceholder(tab: CanvasTab, activeSession?: RecommendationSession): string {
  if (tab === "results" && activeSession) {
    const count = activeSession.rounds.at(-1)?.recommendations.length || 0;
    return `${count} recommendations in the latest round.`;
  }

  return "This view is implemented in the next tasks.";
}
