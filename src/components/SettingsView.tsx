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
  onSettingsChange
}: SettingsViewProps) {
  const [preferenceText, setPreferenceText] = useState(preferences.text);
  const [model, setModel] = useState(settings.ai.model);
  const [provider, setProvider] = useState(settings.ai.provider);
  const [endpoint, setEndpoint] = useState(settings.ai.endpoint);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);

  return (
    <div className="settings-view">
      <section>
        <h2>Reading Preferences</h2>
        <label>
          Reading preferences context
          <textarea rows={8} value={preferenceText} onChange={(event) => setPreferenceText(event.target.value)} />
        </label>
        <button
          type="button"
          onClick={() => onPreferencesChange({ ...preferences, text: preferenceText.trim() })}
        >
          Save preferences
        </button>
      </section>

      <section>
        <h2>AI Settings</h2>
        <label>
          Provider
          <select value={provider} onChange={(event) => setProvider(event.target.value as AppSettings["ai"]["provider"])}>
            <option value="mock">Mock</option>
            <option value="openai-compatible">OpenAI-compatible</option>
          </select>
        </label>
        <label>
          Model
          <input value={model} onChange={(event) => setModel(event.target.value)} />
        </label>
        <label>
          Endpoint
          <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} />
        </label>
        <label>
          API key
          <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} type="password" />
        </label>
        <button
          type="button"
          onClick={() =>
            onSettingsChange({
              ...settings,
              ai: { provider, model: model.trim(), endpoint: endpoint.trim(), apiKey }
            })
          }
        >
          Save AI settings
        </button>
      </section>

      <section>
        <h2>External Links</h2>
        {settings.linkSources.map((source) => (
          <label className="checkbox-row" key={source.id}>
            <input
              type="checkbox"
              checked={source.enabled}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  linkSources: settings.linkSources.map((candidate) =>
                    candidate.id === source.id ? { ...candidate, enabled: event.target.checked } : candidate
                  )
                })
              }
            />
            {source.label}
          </label>
        ))}
      </section>
    </div>
  );
}
