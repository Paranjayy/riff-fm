import React from "react";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 via-purple-500/5 to-blue-500/10" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#1DB954]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1DB954]/20 bg-[#1DB954]/10 px-4 py-1.5 text-sm text-[#1DB954]">
            <Music className="h-4 w-4" />
            Your personal music analytics
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Your music.
            </span>{" "}
            <span className="bg-gradient-to-r from-[#1DB954] to-emerald-300 bg-clip-text text-transparent">
              Your stats.
            </span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Your story.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-400">
            Track everything you listen to. Discover your patterns, share your
            taste, and dive deep into your listening history with beautiful
            visualizations.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/signin">Sign in with Spotify</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
