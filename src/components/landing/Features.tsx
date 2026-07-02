"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  History,
  Users,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BarChart3,
    title: "Music Stats",
    description:
      "Deep insights into your listening habits with beautiful charts and visualizations.",
    hoverBorder: "hover:border-[#1DB954]/30",
    hoverGlow: "group-hover:shadow-[#1DB954]/10",
    iconBg: "bg-[#1DB954]/10",
    iconColor: "text-[#1DB954]",
  },
  {
    icon: History,
    title: "Import History",
    description:
      "Import your complete Spotify listening history and never lose a play.",
    hoverBorder: "hover:border-blue-400/30",
    hoverGlow: "group-hover:shadow-blue-400/10",
    iconBg: "bg-blue-400/10",
    iconColor: "text-blue-400",
  },
  {
    icon: Users,
    title: "Friends",
    description:
      "Connect with friends, compare taste, and discover what they're listening to.",
    hoverBorder: "hover:border-purple-400/30",
    hoverGlow: "group-hover:shadow-purple-400/10",
    iconBg: "bg-purple-400/10",
    iconColor: "text-purple-400",
  },
  {
    icon: Shield,
    title: "Privacy",
    description: "You control what's public. Your data stays yours — always.",
    hoverBorder: "hover:border-red-400/30",
    hoverGlow: "group-hover:shadow-red-400/10",
    iconBg: "bg-red-400/10",
    iconColor: "text-red-400",
  },
  {
    icon: Clock,
    title: "Time Machine",
    description:
      "Travel back through your listening history and revisit past favorites.",
    hoverBorder: "hover:border-amber-400/30",
    hoverGlow: "group-hover:shadow-amber-400/10",
    iconBg: "bg-amber-400/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description:
      "Get personalized recommendations and discover patterns you never noticed.",
    hoverBorder: "hover:border-pink-400/30",
    hoverGlow: "group-hover:shadow-pink-400/10",
    iconBg: "bg-pink-400/10",
    iconColor: "text-pink-400",
  },
];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export function Features() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-[#1DB954] to-emerald-300 bg-clip-text text-transparent">
              understand your music
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Powerful features to help you explore and share your unique
            listening journey.
          </p>
        </div>

        <div
          ref={ref}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map(
            (
              {
                icon: Icon,
                title,
                description,
                hoverBorder,
                hoverGlow,
                iconBg,
                iconColor,
              },
              index,
            ) => (
              <div
                key={title}
                className={cn(
                  "group relative rounded-xl border border-white/5 bg-gray-900/50 p-6",
                  "transition-all duration-500",
                  hoverBorder,
                  hoverGlow,
                  "hover:bg-gray-900/80 hover:shadow-xl",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8",
                )}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                {/* Icon with background circle */}
                <div
                  className={cn(
                    "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                    iconBg,
                  )}
                >
                  <Icon className={cn("h-6 w-6", iconColor)} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {description}
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
