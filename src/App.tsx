export default function App() {
  return (
    <main className="app-shell">
      <section className="chat-panel" aria-label="Recommendation chat">
        <header className="app-header">
          <p className="eyebrow">Personal reading advisor</p>
          <h1>NextChapter</h1>
        </header>
        <div className="message-list" aria-label="Conversation">
          <p className="assistant-message">
            Ask for a mood, genre, theme, shelf pick, or reading goal.
          </p>
        </div>
        <form className="prompt-form">
          <label htmlFor="recommendation-prompt">Ask for book recommendations</label>
          <textarea
            id="recommendation-prompt"
            name="prompt"
            rows={4}
            placeholder="Find me a post-apocalyptic novel that fits what I have liked before..."
          />
          <button type="submit">Recommend</button>
        </form>
      </section>

      <section className="canvas-panel" aria-label="Library canvas">
        <div role="tablist" aria-label="Canvas views" className="tabs">
          <button role="tab" aria-selected="true">Library</button>
          <button role="tab" aria-selected="false">Sessions</button>
          <button role="tab" aria-selected="false">Current Results</button>
          <button role="tab" aria-selected="false">Book Detail</button>
          <button role="tab" aria-selected="false">Settings</button>
        </div>
        <div className="canvas-body">
          <h2>Library</h2>
          <p>Import Goodreads CSV data or add books manually.</p>
        </div>
      </section>
    </main>
  );
}
