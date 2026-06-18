import { useState } from "react";
import type { RecommendationSession } from "../domain/types";

interface ChatPanelProps {
  activeSession?: RecommendationSession;
  isLoading: boolean;
  error: string;
  onSubmitPrompt: (prompt: string) => void;
  onResolvePreferenceSuggestion: (suggestionId: string, status: "accepted" | "declined") => void;
}

export default function ChatPanel({
  activeSession,
  isLoading,
  error,
  onSubmitPrompt,
  onResolvePreferenceSuggestion
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("");
  const rounds = activeSession?.rounds || [];
  const pendingSuggestions = rounds.flatMap((round) =>
    round.preferenceSuggestions.filter((suggestion) => suggestion.status === "pending")
  );

  return (
    <section className="chat-panel" aria-label="Recommendation chat">
      <header className="app-header">
        <p className="eyebrow">Personal reading advisor</p>
        <h1>NextChapter</h1>
      </header>

      <div className="message-list" aria-label="Conversation">
        {rounds.length === 0 ? (
          <p className="assistant-message">Ask for a mood, genre, theme, shelf pick, or reading goal.</p>
        ) : (
          rounds.map((round) => (
            <article className="message-thread" key={round.id}>
              <p className="user-message">{round.prompt}</p>
              <p className="assistant-message">{round.assistantSummary}</p>
            </article>
          ))
        )}

        {pendingSuggestions.map((suggestion) => (
          <article className="preference-suggestion" key={suggestion.id}>
            <p>{suggestion.text}</p>
            <div className="inline-actions">
              <button type="button" onClick={() => onResolvePreferenceSuggestion(suggestion.id, "accepted")}>
                Save preference
              </button>
              <button type="button" onClick={() => onResolvePreferenceSuggestion(suggestion.id, "declined")}>
                Decline
              </button>
            </div>
          </article>
        ))}

        {error ? <p className="error-message">{error}</p> : null}
      </div>

      <form
        className="prompt-form"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = prompt.trim();
          if (trimmed) {
            onSubmitPrompt(trimmed);
            setPrompt("");
          }
        }}
      >
        <label htmlFor="recommendation-prompt">Ask for book recommendations</label>
        <textarea
          id="recommendation-prompt"
          name="prompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Find me a post-apocalyptic novel that fits what I have liked before..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Recommend"}
        </button>
      </form>
    </section>
  );
}
