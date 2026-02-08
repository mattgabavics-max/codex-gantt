import { useCallback, useEffect, useRef, useState } from "react";

export type AutoSaveState = {
  isSaving: boolean;
  lastSavedAt?: string;
  dirty: boolean;
  error?: string;
  conflict?: boolean;
};

export type AutoSaveOptions<T> = {
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  onSave: (payload: T) => Promise<void>;
};

/**
 * Debounced autosave hook with retry and conflict detection.
 */
export function useAutoSave<T>({
  debounceMs = 500,
  maxRetries = 2,
  retryDelayMs = 600,
  onSave
}: AutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    dirty: false
  });

  const timerRef = useRef<number | null>(null);
  const queueRef = useRef<T | null>(null);
  const inFlightRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleSave = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(async () => {
      if (!queueRef.current || inFlightRef.current) return;
      const payload = queueRef.current;
      queueRef.current = null;
      inFlightRef.current = true;
      setState((prev) => ({ ...prev, isSaving: true, error: undefined, conflict: false }));

      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          await onSave(payload);
          setState((prev) => ({
            ...prev,
            isSaving: false,
            dirty: false,
            lastSavedAt: new Date().toISOString()
          }));
          break;
        } catch (err: any) {
          const status = err?.status ?? err?.response?.status;
          const conflict = status === 409;
          attempt += 1;
          if (attempt > maxRetries || conflict) {
            setState((prev) => ({
              ...prev,
              isSaving: false,
              error: err?.message ?? "Save failed",
              conflict
            }));
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
        }
      }

      inFlightRef.current = false;
      if (queueRef.current) {
        scheduleSave();
      }
    }, debounceMs);
  }, [debounceMs, maxRetries, onSave, retryDelayMs]);

  const enqueue = useCallback(
    (payload: T) => {
      queueRef.current = payload;
      setState((prev) => ({ ...prev, dirty: true }));
      scheduleSave();
    },
    [scheduleSave]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: undefined, conflict: false }));
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return { state, enqueue, clearError };
}
