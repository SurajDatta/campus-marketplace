import { apiError, authenticatedRpc, isUuid, readJsonObject } from "@/utils/marketplace/api";

export async function PATCH(request: Request, { params }: { params: { transactionId: string } }) {
  if (!isUuid(params.transactionId)) return apiError(400, "VALIDATION_ERROR", "Transaction ID is invalid");
  const body = await readJsonObject(request);
  if (
    !Number.isSafeInteger(body?.finalPriceCents) || Number(body?.finalPriceCents) <= 0 ||
    !Number.isSafeInteger(body?.expectedPriceVersion) || Number(body?.expectedPriceVersion) <= 0
  ) {
    return apiError(400, "VALIDATION_ERROR", "Final price and expected version must be positive integers");
  }
  return authenticatedRpc("campus_change_final_price", {
    p_transaction_id: params.transactionId,
    p_final_price_cents: body!.finalPriceCents,
    p_expected_price_version: body!.expectedPriceVersion,
  });
}
