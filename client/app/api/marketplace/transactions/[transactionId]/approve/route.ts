import { apiError, authenticatedRpc, isUuid, readJsonObject } from "@/utils/marketplace/api";

export async function POST(request: Request, { params }: { params: { transactionId: string } }) {
  if (!isUuid(params.transactionId)) return apiError(400, "VALIDATION_ERROR", "Transaction ID is invalid");
  const body = await readJsonObject(request);
  if (!Number.isSafeInteger(body?.priceVersion) || Number(body?.priceVersion) <= 0) {
    return apiError(400, "VALIDATION_ERROR", "Price version must be a positive integer");
  }
  return authenticatedRpc("campus_approve_price", {
    p_transaction_id: params.transactionId,
    p_price_version: body!.priceVersion,
  });
}
