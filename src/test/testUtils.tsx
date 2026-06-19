import { render, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";

export function renderWithUser(ui: ReactElement): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(ui)
  };
}
