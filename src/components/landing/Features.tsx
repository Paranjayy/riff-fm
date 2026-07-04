"use client";

import React from "react";

const features = [
  {
    title: "Top artists, songs & albums",
    description: "Across 4 weeks, 6 months, and all time.",
  },
  {
    title: "Listening history",
    description: "Recently played tracks with timestamps and play counts.",
  },
  {
    title: "Genre breakdown",
    description: "Visualize your genre distribution and how it shifts.",
  },
  {
    title: "Listening clock",
    description: "See when you listen most — by hour and day of week.",
  },
  {
    title: "Taste evolution",
    description: "Track how your preferences change over months and years.",
  },
  {
    title: "Audio features",
    description:
      "Energy, danceability, valence, and acousticness of your music.",
  },
  {
    title: "Listening streaks",
    description: "Track daily listening habits and maintain streaks.",
  },
  {
    title: "Social comparisons",
    description: "Compare your stats with friends and find shared tastes.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-8">
        <h2 className="text-h2 text-foreground mb-12">What you get</h2>

        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M13.5 4.5L6 12L2.5 8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-[14px] font-medium text-foreground">
                  {feature.title}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
