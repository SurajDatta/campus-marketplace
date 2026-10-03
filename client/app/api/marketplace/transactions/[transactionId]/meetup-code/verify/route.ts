import { apiError, authenticatedRpc, isUuid, readJsonObject } from "@/utils/marketplace/api";

export async function POST(request: Request, { params }: { params: { transactionId: string } }) {
  if (!isUuid(params.transactionId)) return apiError(400, "VALIDATION_ERROR", "Transaction ID is invalid");
  const body = await readJsonObject(request);
  if (typeof body?.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return apiError(400, "VALIDATION_ERROR", "Code must contain exactly six digits");
  }
  return authenticatedRpc("campus_verify_meetup_code", {
    p_transaction_id: params.transactionId,
    p_code: body.code,
  });
}
