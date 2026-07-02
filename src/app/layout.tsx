import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "riff.fm — Your listening, decoded",
    template: "%s — riff.fm",
  },
  description:
    "All-in-one media stats platform. Track music, movies, anime, books, games, and more with deep visualizations and meaningful insights.",
  keywords: [
    "music stats",
    "listening analytics",
    "spotify stats",
    "media tracker",
    "open source",
  ],
  authors: [{ name: "riff.fm" }],
  creator: "riff.fm",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://riff.fm",
    siteName: "riff.fm",
    title: "riff.fm — Your listening, decoded",
    description:
      "All-in-one media stats platform. Track music, movies, anime, books, games, and more with deep visualizations.",
  },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://riff.fm"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#111216" },
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
  ],
  colorScheme: "dark" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(230 15% 10%)",
              border: "1px solid hsl(230 12% 18%)",
              color: "hsl(220 10% 96%)",
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
