import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAutoSave } from "../hooks/useAutoSave";

describe("useAutoSave", () => {
  it("debounces and calls onSave", async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useAutoSave({
        onSave,
        debounceMs: 500
      })
    );

    act(() => {
      result.current.enqueue({ id: 1 });
    });

    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("sets error after retries", async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => {
      throw { message: "fail" };
    });

    const { result } = renderHook(() =>
      useAutoSave({
        onSave,
        debounceMs: 0,
        maxRetries: 0,
        retryDelayMs: 0
      })
    );

    act(() => {
      result.current.enqueue({ id: 2 });
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state.error).toBeDefined();
    vi.useRealTimers();
  });
});
