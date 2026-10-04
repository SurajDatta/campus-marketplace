import type { CampusApiError, CampusApiSuccess } from "@/types/marketplace";

export class MarketplaceRequestError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "REQUEST_FAILED", status = 500) {
    super(message);
    this.name = "MarketplaceRequestError";
    this.code = code;
    this.status = status;
  }
}

export async function marketplaceRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new MarketplaceRequestError(
      "Campus Marketplace could not reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      0,
    );
  }

  const rawBody = await response.text();
  let payload: CampusApiSuccess<T> | CampusApiError | null = null;
  try {
    payload = rawBody ? JSON.parse(rawBody) as CampusApiSuccess<T> | CampusApiError : null;
  } catch {
    // A proxy or framework error page may be HTML. Do not expose it to the UI.
  }

  const hasError = Boolean(payload && typeof payload === "object" && "error" in payload);
  if (!response.ok || hasError) {
    const error = hasError ? (payload as CampusApiError).error : null;
    throw new MarketplaceRequestError(
      error?.message ?? "The marketplace request failed. Please try again.",
      error?.code ?? "REQUEST_FAILED",
      response.status,
    );
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new MarketplaceRequestError(
      "The server returned an invalid response. Please try again.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return payload.data;
}

export function formatCampusMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatCampusDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
