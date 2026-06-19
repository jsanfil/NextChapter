import { useState } from "react";
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
  const [preferenceText, setPreferenceText] = useState(preferences.text);
  const [model, setModel] = useState(settings.ai.model);
  const [provider, setProvider] = useState(settings.ai.provider);
  const [endpoint, setEndpoint] = useState(settings.ai.endpoint);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);

  const sectionLabel = "text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[--color-amber] mb-4 block";
  const fieldLabel = "block text-sm font-medium text-[--color-ink-muted] mb-1";
  const inputClass =
    "w-full rounded-xl bg-[--color-input-bg] shadow-sm text-[--color-ink] px-3 py-2 text-sm focus:outline-none transition-colors";
  const btnClass =
    "mt-4 text-sm px-5 py-2 rounded-full bg-[--color-espresso] text-[--color-parchment] hover:bg-[--color-espresso-hover] transition-colors font-medium";
  const divider = "pt-6";

  return (
    <div className="px-7 py-6 space-y-6">
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
        <button
          type="button"
          onClick={() => onPreferencesChange({ ...preferences, text: preferenceText.trim() })}
          className={btnClass}
        >
          Save preferences
        </button>
      </section>

      {/* AI settings */}
      <section className={divider}>
        <p className={sectionLabel}>AI settings</p>
        <div className="space-y-4">
          <div>
            <label className={fieldLabel} htmlFor="ai-provider">Provider</label>
            <select
              id="ai-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as AppSettings["ai"]["provider"])}
              className={inputClass}
            >
              <option value="mock">Mock (demo)</option>
              <option value="openai-compatible">OpenAI-compatible</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="ai-model">Model</label>
            <input
              id="ai-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="ai-endpoint">Endpoint URL</label>
            <input
              id="ai-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="ai-apikey">API key</label>
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
        <button
          type="button"
          onClick={() =>
            onSettingsChange({
              ...settings,
              ai: { provider, model: model.trim(), endpoint: endpoint.trim(), apiKey },
            })
          }
          className={btnClass}
        >
          Save AI settings
        </button>
      </section>

      {/* External links */}
      <section className={divider}>
        <p className={sectionLabel}>External links</p>
        <div className="space-y-3">
          {settings.linkSources.map((source) => (
            <label key={source.id} className="flex items-center gap-3 cursor-pointer group">
              {/* Hidden native checkbox for accessibility */}
              <input
                type="checkbox"
                checked={source.enabled}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    linkSources: settings.linkSources.map((candidate) =>
                      candidate.id === source.id
                        ? { ...candidate, enabled: e.target.checked }
                        : candidate
                    ),
                  })
                }
                className="sr-only"
              />
              {/* Custom checkbox */}
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
                style={{ backgroundColor: source.enabled ? "#3d2b1f" : "#ddd4c4" }}
              >
                {source.enabled && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
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
              <span className="text-sm text-[--color-ink]">{source.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
