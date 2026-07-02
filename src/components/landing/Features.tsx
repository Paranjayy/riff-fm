"use client";

import React from "react";

const features = [
  {
    eyebrow: "Listening insights",
    title: "Every play, tracked",
    description:
      "See your top artists, songs, and albums across different time ranges. Discover patterns you never noticed — your genre drift, your mood cycles, your late-night playlists.",
    visual: "insights",
  },
  {
    eyebrow: "Temporal data",
    title: "How your taste evolves",
    description:
      "Visualize when you listen — your most active hours, your seasonal shifts, the moment you discovered a genre. See how your taste has changed over months and years.",
    visual: "temporal",
  },
  {
    eyebrow: "Deep analysis",
    title: "Understand yourself",
    description:
      "Dive into your genre preferences. Explore your listening clock. Compare your stats with friends and find shared musical tastes.",
    visual: "analysis",
  },
];

function InsightsVisual() {
  return (
    <div className="relative h-[320px] w-full">
      {/* Genre ring chart — pure CSS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[240px] w-[240px]">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="hsl(230 14% 14%)"
              strokeWidth="28"
            />
            {/* Indie */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="hsl(142 71% 45%)"
              strokeWidth="28"
              strokeDasharray="220 410"
              strokeLinecap="round"
            />
            {/* Pop */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="hsl(262 83% 58%)"
              strokeWidth="28"
              strokeDasharray="130 500"
              strokeDashoffset="-220"
              strokeLinecap="round"
            />
            {/* Rock */}
            <circle
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="hsl(190 60% 42%)"
              strokeWidth="28"
              strokeDasharray="90 540"
              strokeDashoffset="-350"
              strokeLinecap="round"
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-h3 text-[hsl(var(--fg-primary))] tabular-nums">
              12
            </p>
            <p className="text-small text-[hsl(var(--fg-muted))]">Genres</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemporalVisual() {
  const bars = [
    { h: 40, label: "6a" },
    { h: 25, label: "" },
    { h: 35, label: "" },
    { h: 55, label: "9a" },
    { h: 65, label: "" },
    { h: 50, label: "" },
    { h: 70, label: "12p" },
    { h: 60, label: "" },
    { h: 45, label: "" },
    { h: 80, label: "3p" },
    { h: 75, label: "" },
    { h: 55, label: "" },
    { h: 90, label: "6p" },
    { h: 85, label: "" },
    { h: 70, label: "" },
    { h: 95, label: "9p" },
    { h: 88, label: "" },
    { h: 65, label: "" },
    { h: 50, label: "12a" },
    { h: 30, label: "" },
    { h: 20, label: "" },
    { h: 15, label: "3a" },
    { h: 10, label: "" },
    { h: 12, label: "" },
  ];

  return (
    <div className="relative h-[320px] w-full">
      {/* Listening clock — vertical bar chart */}
      <div className="absolute inset-x-0 bottom-8 flex items-end gap-1.5 h-[260px]">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[3px]"
              style={{
                height: `${bar.h}%`,
                background:
                  bar.h > 75
                    ? "hsl(142 71% 45%)"
                    : bar.h > 50
                      ? "hsl(142 71% 45% / 0.5)"
                      : "hsl(230 14% 16%)",
              }}
            />
            {bar.label && (
              <span className="text-[10px] text-[hsl(var(--fg-faint))] tabular-nums">
                {bar.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalysisVisual() {
  const items = [
    { label: "Indie", value: 42, color: "hsl(142 71% 45%)" },
    { label: "Pop", value: 28, color: "hsl(262 83% 58%)" },
    { label: "Rock", value: 18, color: "hsl(190 60% 42%)" },
    { label: "Electronic", value: 12, color: "hsl(350 60% 50%)" },
  ];

  return (
    <div className="relative h-[320px] w-full flex items-center">
      <div className="w-full space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-[hsl(var(--fg-secondary))]">
                {item.label}
              </span>
              <span className="text-[13px] tabular-nums text-[hsl(var(--fg-muted))]">
                {item.value}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[hsl(230_14%_14%)]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisual({ type }: { type: string }) {
  switch (type) {
    case "insights":
      return <InsightsVisual />;
    case "temporal":
      return <TemporalVisual />;
    case "analysis":
      return <AnalysisVisual />;
    default:
      return null;
  }
}

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      {/* Section header */}
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12 mb-20 sm:mb-28">
        <p className="text-label text-[hsl(var(--accent))] mb-4">Features</p>
        <h2 className="text-h1 text-[hsl(var(--fg-primary))] max-w-[38ch]">
          Understand your music
        </h2>
      </div>

      {/* Feature sections — alternating editorial layout */}
      <div className="space-y-24 sm:space-y-32">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12"
          >
            <div
              className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                index % 2 === 1 ? "lg:[direction:rtl]" : ""
              }`}
            >
              {/* Text */}
              <div className={index % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                <p className="text-label text-[hsl(var(--accent))] mb-3">
                  {feature.eyebrow}
                </p>
                <h3 className="text-h2 text-[hsl(var(--fg-primary))] mb-5">
                  {feature.title}
                </h3>
                <p className="text-body-lg text-[hsl(var(--fg-secondary))] max-w-[48ch]">
                  {feature.description}
                </p>
              </div>

              {/* Visual */}
              <div className={index % 2 === 1 ? "lg:[direction:ltr]" : ""}>
                <div className="rounded-[var(--radius-xl)] bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] p-8">
                  <FeatureVisual type={feature.visual} />
                </div>
              </div>
            </div>

            {/* Subtle separator (except last) */}
            {index < features.length - 1 && (
              <div className="mt-24 sm:mt-32 border-t border-[hsl(var(--border-faint))]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
