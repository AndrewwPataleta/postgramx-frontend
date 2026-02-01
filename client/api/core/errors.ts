export class ApiError extends Error {
  status: number;
  raw?: unknown;

  constructor(message: string, status: number, raw?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.raw = raw;
  }
}

const readMessage = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    message?: unknown;
    error?: unknown;
    details?: { message?: unknown } | null;
  };

  if (typeof candidate.message === "string" && candidate.message.trim().length > 0) {
    return candidate.message;
  }

  if (typeof candidate.error === "string" && candidate.error.trim().length > 0) {
    return candidate.error;
  }

  if (candidate.details && typeof candidate.details.message === "string") {
    return candidate.details.message;
  }

  if (candidate.error && typeof candidate.error === "object") {
    const nested = candidate.error as { message?: unknown };
    if (typeof nested.message === "string" && nested.message.trim().length > 0) {
      return nested.message;
    }
  }

  return null;
};

export const readApiErrorMessage = (payload: unknown, fallback: string) =>
  readMessage(payload) ?? fallback;
