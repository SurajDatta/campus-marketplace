import { apiError, authenticatedRpc, isUuid, readJsonObject } from "@/utils/marketplace/api";

export async function POST(request: Request, { params }: { params: { listingId: string } }) {
  if (!isUuid(params.listingId)) return apiError(400, "VALIDATION_ERROR", "Listing ID is invalid");
  const body = await readJsonObject(request);
  const meetup = body?.meetup as Record<string, unknown> | undefined;
  if (
    !meetup || typeof meetup.startsAt !== "string" || Number.isNaN(Date.parse(meetup.startsAt)) ||
    typeof meetup.location !== "string" || meetup.location.trim().length === 0
  ) {
    return apiError(400, "VALIDATION_ERROR", "A valid advertised meetup option is required");
  }
  return authenticatedRpc("campus_reserve_listing", {
    p_listing_id: params.listingId,
    p_meetup_starts_at: meetup.startsAt,
    p_meetup_location: meetup.location,
  });
}
