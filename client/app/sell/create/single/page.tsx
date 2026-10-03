/**
 * app/sell/listing/page.tsx
 * Sell page for the user to create a listing to sell an item. TODO: Change this to be under the listing page.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import SellCreatePage from "@/components/Sell/Listing/CreateListing";

export default async function SellItem() {
  const development = process.env.NEXT_PUBLIC_ENV === 'development';
  const mapsAPIKey = process.env.GOOGLE_MAPS_API_KEY;

  return (
    <SellCreatePage development={development} mapsAPIKey={mapsAPIKey} />
  );
}