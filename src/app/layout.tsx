import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "riff.fm",
  description:
    "All-in-one media stats platform. Track music, movies, anime, books, games, and more.",
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  themeColor: "#1DB954",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "riff.fm",
    description:
      "All-in-one media stats platform. Track music, movies, anime, books, games, and more.",
    type: "website",
    url: "https://riff.fm",
  },
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
        <meta name="theme-color" content="#1DB954" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta property="og:title" content="riff.fm" />
        <meta
          property="og:description"
          content="All-in-one media stats platform. Track music, movies, anime, books, games, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://riff.fm" />
      </head>
      <body
        className={`${inter.variable} font-sans bg-background min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 6%)",
              border: "1px solid hsl(0 0% 15%)",
              color: "hsl(0 0% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
