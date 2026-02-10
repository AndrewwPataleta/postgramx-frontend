import { ApiError, parseBackendError } from "@shared/api/errors";
import { getTelegramInitDataToken } from "@/telegram/getTelegramInitData";

type ApiEnvelope<T> = {
  platformType: "telegram";
  authType: "telegram";
  token: string;
  data: T;
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const buildUrl = (path: string) => {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");
  return path.startsWith("/") ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const logPayload = (label: string, url: string, payload: unknown) => {
  if (!import.meta.env.DEV || import.meta.env.VITE_API_LOG !== "true") return;
  console.log(label, url, payload);
};

export async function apiPost<TResp, TData>(path: string, data: TData, opts?: { signal?: AbortSignal }): Promise<TResp> {
  const url = buildUrl(path);
  const envelope: ApiEnvelope<TData> = {
    platformType: "telegram",
    authType: "telegram",
    token: getTelegramInitDataToken(),
    data,
  };

  logPayload("[API] -> POST", url, envelope);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(envelope),
    signal: opts?.signal,
    credentials: "include",
  });

  const parsed = await parseResponseBody(response);
  logPayload("[API] <-", url, parsed);

  if (!response.ok) {
    throw new ApiError(parseBackendError(parsed, response.statusText || "Request failed"), response.status, parsed);
  }

  return parsed as TResp;
}
