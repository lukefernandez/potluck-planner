import { TEST_SLUG } from "../test/setup";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { CopyUrlButton } from "./copy-url-button";

const writeText = mock((_text: string) => Promise.resolve());

beforeEach(() => {
  writeText.mockClear();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});
afterEach(cleanup);

describe("CopyUrlButton", () => {
  test("copies the page URL and confirms", async () => {
    render(<CopyUrlButton />);

    fireEvent.click(screen.getByRole("button", { name: /Share/ }));

    await screen.findByText("Link copied!");
    expect(writeText).toHaveBeenCalledWith(`http://localhost:3000/potluck/${TEST_SLUG}`);
  });

  test("stays on Share when the clipboard is unavailable", async () => {
    writeText.mockRejectedValueOnce(new Error("clipboard denied"));
    render(<CopyUrlButton />);

    fireEvent.click(screen.getByRole("button", { name: /Share/ }));

    await waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(screen.queryByText("Link copied!")).toBeNull();
    screen.getByText("Share");
  });
});
