#rudrahedit
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CAMPUS_PAYMENT_MODE } from "@/types/marketplace";

interface RpcEnvelope<T> {
  ok: boolean;
  status: number;
  data?: T;
  idempotent?: boolean;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function apiError(status: number, code: string, message: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export async function authenticatedRpc<T>(
  functionName: string,
  args: Record<string, unknown> = {},
): Promise<NextResponse> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return apiError(401, "AUTH_REQUIRED", "A valid Supabase session is required");
  }

  // Generated database types in this legacy repository predate the new migration.
  // The shared response types remain explicit while the migration is the RPC source of truth.
  const { data, error } = await (supabase.rpc as any)(functionName, args);
  if (error) {
    console.error(`Campus Marketplace RPC ${functionName} failed`, {
      code: error.code,
      message: error.message,
    });
    return apiError(500, "DATABASE_ERROR", "The marketplace operation could not be completed");
  }

  const envelope = data as RpcEnvelope<T>;
  if (!envelope?.ok || envelope.data === undefined) {
    const rpcError = envelope?.error;
    return apiError(
      envelope?.status ?? 500,
      rpcError?.code ?? "DATABASE_ERROR",
      rpcError?.message ?? "The marketplace operation could not be completed",
      rpcError?.details,
    );
  }

  return NextResponse.json(
    {
      data: envelope.data,
      meta: {
        paymentMode: CAMPUS_PAYMENT_MODE,
        ...(envelope.idempotent === undefined ? {} : { idempotent: envelope.idempotent }),
      },
    },
    { status: envelope.status, headers: { "Cache-Control": "no-store" } },
  );
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = await request.json();
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
