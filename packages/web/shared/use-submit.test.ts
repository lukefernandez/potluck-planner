import "../test/setup";

import type { ApiResponse } from "@potluck/contract/schema";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, mock, test } from "bun:test";

import { useSubmit } from "./use-submit";

const success = <T>(data: T): ApiResponse<T> => ({ success: true, data });
const failure = (message: string): ApiResponse<never> => ({
  success: false,
  error: { code: "INTERNAL_ERROR", message },
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("useSubmit", () => {
  test("hands the data to onSuccess and returns to idle under the reset policy", async () => {
    const onSuccess = mock((_data: string) => {});
    const { result } = renderHook(() =>
      useSubmit(async () => success("data"), { settle: "reset", onSuccess }),
    );

    await act(() => result.current.submit());

    expect(onSuccess).toHaveBeenCalledWith("data");
    expect(result.current.pending).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("holds pending after success under the navigate policy, blocking double submits", async () => {
    const { result } = renderHook(() =>
      useSubmit(async () => success("data"), { settle: "navigate" }),
    );

    await act(() => result.current.submit());

    expect(result.current.pending).toBe(true);
  });

  test("surfaces the error message and re-enables on failure, under every policy", async () => {
    const { result } = renderHook(() =>
      useSubmit(async () => failure("Potluck not found"), { settle: "navigate" }),
    );

    await act(() => result.current.submit());

    expect(result.current.error).toBe("Potluck not found");
    expect(result.current.pending).toBe(false);
  });

  test("clears the previous error as soon as a new submit starts", async () => {
    const call = deferred<ApiResponse<string>>();
    let attempt = 0;
    const { result } = renderHook(() =>
      useSubmit(() => (++attempt === 1 ? Promise.resolve(failure("boom")) : call.promise), {
        settle: "reset",
      }),
    );

    await act(() => result.current.submit());
    expect(result.current.error).toBe("boom");

    act(() => {
      void result.current.submit();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.pending).toBe(true);

    await act(async () => {
      call.resolve(success("data"));
    });
  });
});
