/**
 * app/sell/[id].tsx
 * Profile page for the seller that is logged into the account. The page will show the seller's profile and the items they have listed for sale.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import SellPage from "@/components/Sell/Sell";

export default async function Sell() {
  const development = process.env.NEXT_PUBLIC_ENV === 'development';

  return (
    <SellPage development={development} />
  );
}