import axios, { AxiosError, type AxiosInstance } from "axios";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

type RetryConfig = {
  retries: number;
  retryDelayMs: number;
};

const defaultRetryConfig: RetryConfig = {
  retries: 2,
  retryDelayMs: 400
};

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function shouldRetry(error: AxiosError) {
  if (!error.config) return false;
  const method = error.config.method?.toLowerCase();
  const idempotent = ["get", "head", "options"].includes(method ?? "");
  const status = error.response?.status;
  return idempotent && (!status || status >= 500);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001",
    timeout: 12000
  });

  instance.interceptors.request.use((config) => {
    if (authToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config as typeof error.config & { _retryCount?: number };
      if (error.response?.status === 401) {
        onUnauthorized?.();
      }

      if (original && shouldRetry(error)) {
        original._retryCount = original._retryCount ?? 0;
        if (original._retryCount < defaultRetryConfig.retries) {
          original._retryCount += 1;
          await sleep(defaultRetryConfig.retryDelayMs * original._retryCount);
          return instance(original);
        }
      }

      return Promise.reject(formatApiError(error));
    }
  );

  return instance;
}

export const api = createApiClient();

export function formatApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as { error?: string; details?: unknown } | undefined;
    return {
      status: error.response.status,
      message: data?.error ?? "Request failed",
      details: data?.details
    };
  }

  return {
    status: 0,
    message: error.message || "Network error"
  };
}
