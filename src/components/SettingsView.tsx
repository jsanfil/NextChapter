import { useEffect, useRef, useState } from "react";
import type { AppSettings, ReadingPreferences } from "../domain/types";

interface SettingsViewProps {
  preferences: ReadingPreferences;
  settings: AppSettings;
  onPreferencesChange: (preferences: ReadingPreferences) => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export default function SettingsView({
  preferences,
  settings,
  onPreferencesChange,
  onSettingsChange,
}: SettingsViewProps) {
  // Local draft state
  const [preferenceText, setPreferenceText] = useState(preferences.text);
  const [model, setModel] = useState(settings.ai.model);
  const [provider, setProvider] = useState(settings.ai.provider);
  const [endpoint, setEndpoint] = useState(settings.ai.endpoint);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);
  const [linkSources, setLinkSources] = useState(settings.linkSources);

  // Saved confirmation toast
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync incoming props → local state (e.g. when settings change externally)
  useEffect(() => {
    setPreferenceText(preferences.text);
  }, [preferences.text]);

  useEffect(() => {
    setModel(settings.ai.model);
    setProvider(settings.ai.provider);
    setEndpoint(settings.ai.endpoint);
    setApiKey(settings.ai.apiKey);
    setLinkSources(settings.linkSources);
  }, [settings]);

  // Dirty detection
  const isDirty =
    preferenceText.trim() !== preferences.text.trim() ||
    model !== settings.ai.model ||
    provider !== settings.ai.provider ||
    endpoint !== settings.ai.endpoint ||
    apiKey !== settings.ai.apiKey ||
    JSON.stringify(linkSources) !== JSON.stringify(settings.linkSources);

  function handleSave() {
    onPreferencesChange({ ...preferences, text: preferenceText.trim() });
    onSettingsChange({
      ...settings,
      ai: { provider, model: model.trim(), endpoint: endpoint.trim(), apiKey },
      linkSources,
    });

    // Show toast
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setSavedAt(Date.now());
    toastTimer.current = setTimeout(() => setSavedAt(null), 2800);
  }

  function handleDiscard() {
    setPreferenceText(preferences.text);
    setModel(settings.ai.model);
    setProvider(settings.ai.provider);
    setEndpoint(settings.ai.endpoint);
    setApiKey(settings.ai.apiKey);
    setLinkSources(settings.linkSources);
  }

  // ── Shared style tokens ──────────────────────────────────────
  const sectionLabel =
    "text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-3 block";
  const fieldLabel =
    "block text-sm font-medium text-[--color-ink-muted] mb-1";
  const inputClass =
    "w-full rounded-xl bg-[--color-input-bg] shadow-sm text-[--color-ink] px-3 py-2 text-sm focus:outline-none transition-colors";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Scrollable content ── */}
      <div className="px-7 py-6 space-y-7 flex-1 overflow-y-auto">

        {/* Reading preferences */}
        <section>
          <p className={sectionLabel}>Reading preferences</p>
          <label className={fieldLabel} htmlFor="pref-text">
            Context for recommendations
          </label>
          <textarea
            id="pref-text"
            rows={7}
            value={preferenceText}
            onChange={(e) => setPreferenceText(e.target.value)}
            className={inputClass + " resize-y"}
            placeholder="e.g. I prefer literary fiction over genre fiction. I love slow, atmospheric books…"
          />
        </section>

        {/* Divider */}
        <hr className="border-[--color-border]" />

        {/* AI settings */}
        <section>
          <p className={sectionLabel}>AI settings</p>
          <div className="space-y-4">
            <div>
              <label className={fieldLabel} htmlFor="ai-provider">
                Provider
              </label>
              <select
                id="ai-provider"
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value as AppSettings["ai"]["provider"])
                }
                className={inputClass}
              >
                <option value="mock">Mock (demo)</option>
                <option value="openai-compatible">OpenAI-compatible</option>
              </select>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="ai-model">
                Model
              </label>
              <input
                id="ai-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="ai-endpoint">
                Endpoint URL
              </label>
              <input
                id="ai-endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="ai-apikey">
                API key
              </label>
              <input
                id="ai-apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={inputClass}
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-[--color-border]" />

        {/* External links */}
        <section>
          <p className={sectionLabel}>External links</p>
          <div className="space-y-3">
            {linkSources.map((source) => (
              <label
                key={source.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Hidden native checkbox for accessibility */}
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={(e) =>
                    setLinkSources((prev) =>
                      prev.map((candidate) =>
                        candidate.id === source.id
                          ? { ...candidate, enabled: e.target.checked }
                          : candidate
                      )
                    )
                  }
                  className="sr-only"
                />
                {/* Custom checkbox */}
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: source.enabled ? "#3d2b1f" : "#ddd4c4",
                  }}
                >
                  {source.enabled && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 4l2.5 2.5L9 1"
                        stroke="#fffdf8"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-[--color-ink]">
                  {source.label}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer bar — always in flow, visible only when dirty ── */}
      <div
        className={[
          "flex-shrink-0",
          "px-7 py-4 flex items-center justify-between gap-3",
          "bg-[--color-panel] border-t border-[--color-border]",
          "transition-all duration-200",
          isDirty ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-1",
        ].join(" ")}
        aria-hidden={!isDirty}
      >
        <p className="text-xs text-[--color-ink-light] leading-tight">
          Unsaved changes
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            className="text-sm px-4 py-1.5 rounded-full bg-[--color-ghost-btn] text-[--color-ink-muted] hover:opacity-80 transition-opacity font-medium"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-sm px-5 py-1.5 rounded-full bg-[--color-espresso] text-[--color-parchment] hover:bg-[--color-espresso-hover] transition-colors font-medium shadow-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Saved toast ── */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={[
          "fixed bottom-5 left-1/2 -translate-x-1/2 z-50",
          "px-4 py-2 rounded-full text-sm font-medium shadow-md",
          "bg-[--color-espresso] text-[--color-parchment]",
          "flex items-center gap-2 pointer-events-none",
          "transition-all duration-300",
          savedAt ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Checkmark */}
        <svg
          width="13"
          height="11"
          viewBox="0 0 13 11"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1.5 5.5l3 3L11.5 1.5"
            stroke="#fffdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Settings saved
      </div>
    </div>
  );
}
