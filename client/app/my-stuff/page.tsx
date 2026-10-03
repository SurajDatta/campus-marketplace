/**
 * app/my-stuff/page.tsx
 * Dashboard page where users can see all of their (current transactions)/(pending items).
 *
 * @author  Ashok Saravanan, https://github.com/AshokSaravanan222
 * @updated 2024-07-22
 *
 *
 */

import MyStuffPage from "@/components/MyStuff/MyStuff";

export default async function MyStuff() {
  const development = process.env.NEXT_PUBLIC_ENV === 'development';

  return (
    <MyStuffPage development={development} />
  );
}