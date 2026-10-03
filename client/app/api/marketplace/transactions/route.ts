import { authenticatedRpc } from "@/utils/marketplace/api";

export async function GET() {
  return authenticatedRpc("campus_list_transactions");
}
