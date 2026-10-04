import { fonts } from './fonts'
import "./globals.css";
import { Providers } from './providers'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Licks",
    template: "%s · Licks",
  },
  description: "A student marketplace for public meetups, shared price approval, and simulated wallet protection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={fonts.rubik.variable}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center w-full">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
