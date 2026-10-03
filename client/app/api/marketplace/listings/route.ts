import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { apiError, authenticatedRpc, readJsonObject } from "@/utils/marketplace/api";
import { CAMPUS_PAYMENT_MODE, type CampusMeetupOption } from "@/types/marketplace";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await (supabase.from as any)("campus_listings")
    .select("id,seller_id,title,description,price_cents,state,meetup_options,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return apiError(500, "DATABASE_ERROR", "Listings could not be loaded");
  return NextResponse.json({
    data: (data ?? []).map((row: any) => ({
      id: row.id,
      sellerId: row.seller_id,
      title: row.title,
      description: row.description,
      priceCents: row.price_cents,
      state: row.state,
      meetupOptions: row.meetup_options,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    meta: { paymentMode: CAMPUS_PAYMENT_MODE },
  });
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  const options = body?.meetupOptions;
  if (
    !body || typeof body.title !== "string" || typeof body.description !== "string" ||
    !Number.isSafeInteger(body.priceCents) || Number(body.priceCents) <= 0 ||
    !Array.isArray(options) || options.length < 1 || options.length > 20 ||
    !options.every((option): option is CampusMeetupOption =>
      option !== null && typeof option === "object" &&
      typeof (option as CampusMeetupOption).startsAt === "string" &&
      !Number.isNaN(Date.parse((option as CampusMeetupOption).startsAt)) &&
      typeof (option as CampusMeetupOption).location === "string" &&
      (option as CampusMeetupOption).location.trim().length > 0)
  ) {
    return apiError(400, "VALIDATION_ERROR", "Listing payload is invalid");
  }
  return authenticatedRpc("campus_create_listing", {
    p_title: body.title,
    p_description: body.description,
    p_price_cents: body.priceCents,
    p_meetup_options: options,
  });
}
