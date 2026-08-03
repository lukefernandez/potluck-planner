import { TEST_SLUG, lastRequest, resetTestState, respondWith, routerRefresh } from "../test/setup";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { DeleteItemForm } from "./form-delete-item";

beforeEach(resetTestState);
afterEach(cleanup);

describe("DeleteItemForm", () => {
  test("deletes the item and refreshes the page", async () => {
    respondWith({ success: true, data: { message: "Item deleted successfully" } });
    render(<DeleteItemForm id="item-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));

    await waitFor(() => {
      expect(routerRefresh).toHaveBeenCalled();
    });
    const { url, init } = lastRequest();
    expect(url).toEndWith(`/potlucks/${TEST_SLUG}/items/item-1`);
    expect(init?.method).toBe("DELETE");
  });

  test("re-enables the button when the delete fails", async () => {
    respondWith({
      success: false,
      error: { code: "NOT_FOUND", message: "Item not found" },
    });
    render(<DeleteItemForm id="item-1" />);

    const button = screen.getByRole("button", { name: "Delete item" });
    fireEvent.click(button);

    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });
    expect(routerRefresh).not.toHaveBeenCalled();
  });

  test("shows an error note when the delete fails", async () => {
    respondWith({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to delete item. Please try again." },
    });
    render(<DeleteItemForm id="item-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));

    await screen.findByText("Failed to delete item. Please try again.");
    expect(routerRefresh).not.toHaveBeenCalled();
  });
});
