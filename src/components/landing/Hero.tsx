"use client";

import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex min-h-[85vh] items-center">
      <div className="mx-auto w-full max-w-[1100px] px-6 py-24 sm:px-8">
        <div className="max-w-[640px]">
          {/* Headline */}
          <h1 className="text-display text-foreground mb-6">
            Your listening,
            <br />
            decoded.
          </h1>

          {/* Subtitle */}
          <p className="text-body text-muted-foreground mb-10 max-w-[44ch]">
            Track every play, discover patterns, and see how your taste evolves
            over time.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              Sign in with Spotify
            </Link>

            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-[14px] font-medium text-foreground transition-all duration-150 hover:bg-secondary active:scale-[0.98]"
            >
              Learn more
            </a>
          </div>

          {/* Fine print */}
          <p className="text-[12px] text-muted-foreground mt-8">
            100% free &amp; open source
          </p>
        </div>
      </div>
    </section>
  );
}
