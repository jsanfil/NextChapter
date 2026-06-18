import { screen } from "@testing-library/react";
import { defaultSettings } from "../domain/defaultState";
import type { ReadingPreferences } from "../domain/types";
import { renderWithUser } from "../test/testUtils";
import SettingsView from "./SettingsView";

describe("SettingsView", () => {
  it("saves edited reading preferences and model settings", async () => {
    const preferences: ReadingPreferences = { text: "Original", approvedInferences: [] };
    const saved: string[] = [];
    const { user } = renderWithUser(
      <SettingsView
        preferences={preferences}
        settings={defaultSettings}
        onPreferencesChange={(next) => saved.push(next.text)}
        onSettingsChange={() => undefined}
      />
    );

    await user.clear(screen.getByLabelText("Reading preferences context"));
    await user.type(screen.getByLabelText("Reading preferences context"), "I like reflective science fiction.");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));

    expect(saved).toEqual(["I like reflective science fiction."]);
  });
});
