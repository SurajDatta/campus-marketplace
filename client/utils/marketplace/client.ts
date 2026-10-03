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
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = await response.json() as CampusApiSuccess<T> | CampusApiError;
  if (!response.ok || "error" in payload) {
    const error = "error" in payload ? payload.error : null;
    throw new MarketplaceRequestError(
      error?.message ?? "The marketplace request failed",
      error?.code,
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
