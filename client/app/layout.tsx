import { fonts } from './fonts'
import "./globals.css";
import { Providers } from './providers'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Campus Marketplace",
  description: "A safe, secure, frictionless marketplace. Easily buy and sell your items in seconds and avoid scams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={fonts.rubik.variable}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
