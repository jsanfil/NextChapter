import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the chat-first app shell", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "NextChapter" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Ask for book recommendations" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Library" })).toBeInTheDocument();
  });
});
