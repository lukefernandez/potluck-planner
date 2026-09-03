import {
  fetchMock,
  failNetworkOnce,
  lastRequest,
  resetTestState,
  respondWith,
  routerPush,
} from "../test/setup";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { CreatePotluckForm } from "./form-create-potluck";

beforeEach(resetTestState);
afterEach(cleanup);

const submit = (name: string) => {
  fireEvent.change(screen.getByLabelText("Potluck name"), { target: { value: name } });
  fireEvent.submit(screen.getByRole("button", { name: "Create potluck page" }).closest("form")!);
};

describe("CreatePotluckForm", () => {
  test("creates a potluck and navigates to its page", async () => {
    respondWith({
      success: true,
      data: { id: "abc-123", name: "Friendsgiving", createdAt: "2026-07-01T00:00:00.000Z" },
    });
    render(<CreatePotluckForm />);

    submit("Friendsgiving");

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/potluck/abc-123");
    });
    const { url, init } = lastRequest();
    expect(url).toEndWith("/potlucks");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ name: "Friendsgiving" });
  });

  test("shows the API error message and re-enables the form", async () => {
    respondWith({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Validation failed" },
    });
    render(<CreatePotluckForm />);

    submit("Friendsgiving");

    await screen.findByText("Validation failed");
    expect(routerPush).not.toHaveBeenCalled();
    expect((screen.getByRole("button", { name: "Create potluck page" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  test("shows a friendly message when the network fails", async () => {
    failNetworkOnce();
    render(<CreatePotluckForm />);

    submit("Friendsgiving");

    await screen.findByText("Failed to connect to the server. Please try again.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
