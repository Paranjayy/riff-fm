"use client";

import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle background gradient — ambient depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[hsl(142_71%_45%/0.04)] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[hsl(262_83%_58%/0.03)] blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Text: 7 columns on desktop ────────────────────── */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <p className="text-label text-[hsl(var(--accent))] mb-6 animate-fade-in">
              Music analytics
            </p>

            {/* Headline — editorial weight */}
            <h1 className="text-display text-[hsl(var(--fg-primary))] mb-6 animate-fade-in-up">
              Your listening,
              <br />
              decoded.
            </h1>

            {/* Subtitle */}
            <p
              className="text-body-lg text-[hsl(var(--fg-secondary))] mb-10 max-w-[48ch] animate-fade-in-up"
              style={{ animationDelay: "80ms" }}
            >
              Track every play. Discover your patterns. See how your taste
              evolves over time with deep, meaningful visualizations.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: "160ms" }}
            >
              <Link
                href="/auth/signin"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[hsl(var(--accent))] px-7 text-[15px] font-medium text-[hsl(var(--accent-fg))] transition-all duration-150 hover:brightness-110 hover:shadow-[var(--shadow-md)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]"
              >
                Sign in with Spotify
              </Link>

              <a
                href="#features"
                className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] border border-[hsl(var(--border-default))] px-7 text-[15px] font-medium text-[hsl(var(--fg-secondary))] transition-all duration-150 hover:border-[hsl(var(--fg-faint))] hover:text-[hsl(var(--fg-primary))] active:scale-[0.98]"
              >
                Learn more
              </a>
            </div>

            {/* Subtle note */}
            <p
              className="text-small text-[hsl(var(--fg-faint))] mt-8 animate-fade-in"
              style={{ animationDelay: "320ms" }}
            >
              100% free &amp; open source
            </p>
          </div>

          {/* ── Visual: 5 columns — abstract data visualization ── */}
          <div className="hidden lg:col-span-5 lg:block">
            <div
              className="relative h-[420px] w-full animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              {/* Bar chart — listening activity */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2.5 h-[320px]">
                {[
                  { h: 55, delay: 0 },
                  { h: 78, delay: 40 },
                  { h: 42, delay: 80 },
                  { h: 92, delay: 120 },
                  { h: 68, delay: 160 },
                  { h: 85, delay: 200 },
                  { h: 35, delay: 240 },
                  { h: 72, delay: 280 },
                  { h: 60, delay: 320 },
                  { h: 95, delay: 360 },
                  { h: 50, delay: 400 },
                  { h: 78, delay: 440 },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[4px] transition-all duration-700"
                    style={{
                      height: `${bar.h}%`,
                      background:
                        i === 3 || i === 9
                          ? "hsl(142 71% 45%)"
                          : "hsl(230 14% 16%)",
                      transitionDelay: `${bar.delay}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Floating stat cards */}
              <div
                className="absolute top-8 right-0 rounded-[var(--radius-md)] bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] px-5 py-4 shadow-[var(--shadow-lg)] animate-fade-in-up"
                style={{ animationDelay: "400ms" }}
              >
                <p className="text-label text-[hsl(var(--fg-muted))] mb-1">
                  Monthly plays
                </p>
                <p className="text-h2 text-[hsl(var(--fg-primary))] tabular-nums">
                  2,847
                </p>
              </div>

              <div
                className="absolute bottom-24 left-4 rounded-[var(--radius-md)] bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] px-5 py-4 shadow-[var(--shadow-lg)] animate-fade-in-up"
                style={{ animationDelay: "520ms" }}
              >
                <p className="text-label text-[hsl(var(--fg-muted))] mb-1">
                  Top genre
                </p>
                <p className="text-h3 text-[hsl(var(--accent))]">Indie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
