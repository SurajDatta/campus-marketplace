import { apiError, authenticatedRpc, isUuid } from "@/utils/marketplace/api";

export async function GET(_request: Request, { params }: { params: { transactionId: string } }) {
  if (!isUuid(params.transactionId)) return apiError(400, "VALIDATION_ERROR", "Transaction ID is invalid");
  return authenticatedRpc("campus_get_transaction", { p_transaction_id: params.transactionId });
}
