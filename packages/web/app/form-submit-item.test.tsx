import { TEST_SLUG, lastRequest, resetTestState, respondWith, routerRefresh } from "../test/setup";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { SubmitItemForm } from "./form-submit-item";

beforeEach(resetTestState);
afterEach(cleanup);

const fillAndSubmit = () => {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ada" } });
  fireEvent.change(screen.getByLabelText("What are you bringing?"), {
    target: { value: "Rolls" },
  });
  fireEvent.submit(screen.getByRole("button", { name: /Add item/ }).closest("form")!);
};

describe("SubmitItemForm", () => {
  test("dietary chips toggle their pressed state", () => {
    render(<SubmitItemForm />);

    const chip = screen.getByRole("button", { name: "Gluten" });
    expect(chip.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(chip);
    expect(chip.getAttribute("aria-pressed")).toBe("false");
  });

  test("submits the item with selected dietary flags and refreshes", async () => {
    respondWith({ success: true, data: { id: "item-1" } });
    render(<SubmitItemForm />);

    fireEvent.click(screen.getByRole("button", { name: "Gluten" }));
    fireEvent.click(screen.getByRole("button", { name: "Dairy" }));
    fillAndSubmit();

    await waitFor(() => {
      expect(routerRefresh).toHaveBeenCalled();
    });
    const { url, init } = lastRequest();
    expect(url).toEndWith(`/potlucks/${TEST_SLUG}/items`);
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Rolls",
      person: "Ada",
      containsMeat: false,
      containsFish: false,
      containsShellfish: false,
      containsEggs: false,
      containsDairy: true,
      containsOtherAnimalProducts: false,
      containsNuts: false,
      containsGluten: true,
    });
  });

  test("shows the API error message and keeps the form usable", async () => {
    respondWith({
      success: false,
      error: { code: "NOT_FOUND", message: "Potluck not found" },
    });
    render(<SubmitItemForm />);

    fillAndSubmit();

    await screen.findByText("Potluck not found");
    expect(routerRefresh).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: /Add item/ }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });
});
