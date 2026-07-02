"use client";

import React from "react";
import { Music, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const floatingNotes = [
  {
    emoji: "♪",
    left: "10%",
    top: "20%",
    delay: "0s",
    duration: "6s",
    size: "text-2xl",
  },
  {
    emoji: "♫",
    left: "85%",
    top: "15%",
    delay: "1s",
    duration: "7s",
    size: "text-3xl",
  },
  {
    emoji: "♪",
    left: "20%",
    top: "70%",
    delay: "2s",
    duration: "5s",
    size: "text-xl",
  },
  {
    emoji: "♫",
    left: "75%",
    top: "65%",
    delay: "0.5s",
    duration: "8s",
    size: "text-2xl",
  },
  {
    emoji: "♪",
    left: "50%",
    top: "80%",
    delay: "3s",
    duration: "6s",
    size: "text-lg",
  },
  {
    emoji: "♫",
    left: "90%",
    top: "45%",
    delay: "1.5s",
    duration: "7s",
    size: "text-xl",
  },
  {
    emoji: "♪",
    left: "5%",
    top: "50%",
    delay: "2.5s",
    duration: "5.5s",
    size: "text-2xl",
  },
];

const stats = [
  { label: "Media Types", value: "7" },
  { label: "Artists Tracked", value: "∞" },
  { label: "100% Free", value: "✓" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="hero-gradient absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 via-purple-500/5 to-blue-500/10" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#1DB954]/10 blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute left-1/4 bottom-1/3 h-[250px] w-[250px] rounded-full bg-blue-500/8 blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Floating music notes */}
      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        {floatingNotes.map((note, i) => (
          <div
            key={i}
            className={`absolute ${note.size} text-white/[0.04] select-none float-note`}
            style={{
              left: note.left,
              top: note.top,
              animationDelay: note.delay,
              animationDuration: note.duration,
            }}
          >
            {note.emoji}
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1DB954]/20 bg-[#1DB954]/10 px-4 py-1.5 text-sm text-[#1DB954] backdrop-blur-sm">
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
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 rounded-xl hover:scale-105 active:scale-[0.98] transition-transform duration-200 shadow-xl shadow-[#1DB954]/20"
            >
              <Link href="/auth/signin" className="gap-2">
                Sign in with Spotify
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-xl hover:scale-105 active:scale-[0.98] transition-transform duration-200 border-white/10 hover:border-white/20"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>

          {/* Free & Open Source badge */}
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              100% Free &amp; Open Source
            </span>
          </div>

          {/* Stats below CTA */}
          <div className="mt-12 flex items-center justify-center gap-8 sm:gap-12">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-0.5 text-xs text-gray-500 uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-note {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.04;
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.07;
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
            opacity: 0.05;
          }
          75% {
            transform: translateY(-25px) rotate(4deg);
            opacity: 0.08;
          }
        }
        .float-note {
          animation: float-note 6s ease-in-out infinite;
        }
        .hero-gradient {
          animation: hero-shift 8s ease-in-out infinite alternate;
        }
        @keyframes hero-shift {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
