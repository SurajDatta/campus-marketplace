/**
 * app/buy/page.tsx
 * Marketplace page where users can view items for sale and click on them for more info.
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-08-04
 *
 *
 */
import Buy from '@/components/Buy/Buy'

export default async function BuyPage() {
  // i should be prefetching the items here, so whenever there is a link here, it will be served instanlty. It is a balance, because then this page will not be static, and slower to load.
  const development = process.env.NEXT_PUBLIC_ENV === 'development';
  return (
    <Buy development={development} />
  )
}