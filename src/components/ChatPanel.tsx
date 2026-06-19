import { useState } from "react";
import type { AssistantMessageSegment, BookLinkTarget, RecommendationSession } from "../domain/types";

interface ChatPanelProps {
  activeSession?: RecommendationSession;
  isLoading: boolean;
  error: string;
  status: string;
  onSubmitPrompt: (prompt: string) => void;
  onNewChat: () => void;
  onSaveChat: () => void;
  onSelectBookLink: (book: BookLinkTarget) => void;
  onResolvePreferenceSuggestion: (suggestionId: string, status: "accepted" | "declined") => void;
}

export default function ChatPanel({
  activeSession,
  isLoading,
  error,
  status,
  onSubmitPrompt,
  onNewChat,
  onSaveChat,
  onSelectBookLink,
  onResolvePreferenceSuggestion
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState("");
  const messages = activeSession?.messages || [];
  const pendingSuggestions = messages.flatMap((message) =>
    message.role === "assistant"
      ? message.preferenceSuggestions.filter((suggestion) => suggestion.status === "pending")
      : []
  );

  return (
    <section className="chat-panel" aria-label="Recommendation chat">
      <header className="app-header">
        <div>
          <p className="eyebrow">Personal reading advisor</p>
          <h1>NextChapter</h1>
          {activeSession ? <p className="active-chat-title">Current chat: {activeSession.title}</p> : null}
        </div>
        <div className="chat-header-actions">
          <button type="button" onClick={onSaveChat} disabled={!activeSession}>
            Save chat
          </button>
          <button type="button" onClick={onNewChat}>
            New chat
          </button>
        </div>
      </header>

      <div className="message-list" aria-label="Conversation">
        {messages.length === 0 ? (
          <p className="assistant-message">Ask for a mood, genre, theme, shelf pick, or reading goal.</p>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <p className="user-message" key={message.id}>
                {message.text}
              </p>
            ) : (
              <div className="assistant-message" key={message.id}>
                <AssistantMessage segments={message.segments} onSelectBookLink={onSelectBookLink} />
              </div>
            )
          )
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
        {status ? <p className="status-message">{status}</p> : null}
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

function AssistantMessage({
  segments,
  onSelectBookLink
}: {
  segments: AssistantMessageSegment[];
  onSelectBookLink: (book: BookLinkTarget) => void;
}) {
  return (
    <p>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`${index}-${segment.text}`}>{segment.text}</span>;
        }

        return (
          <button
            className="book-link-button"
            key={`${index}-${segment.book.title}`}
            type="button"
            onClick={() => onSelectBookLink(segment.book)}
            aria-label={`Open details for ${segment.book.title} by ${segment.book.author}`}
          >
            {segment.text}
          </button>
        );
      })}
    </p>
  );
}
