import React from "react";
import {
  BarChart3,
  History,
  Users,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Music Stats",
    description:
      "Deep insights into your listening habits with beautiful charts and visualizations.",
  },
  {
    icon: History,
    title: "Import History",
    description:
      "Import your complete Spotify listening history and never lose a play.",
  },
  {
    icon: Users,
    title: "Friends",
    description:
      "Connect with friends, compare taste, and discover what they're listening to.",
  },
  {
    icon: Shield,
    title: "Privacy",
    description:
      "You control what's public. Your data stays yours — always.",
  },
  {
    icon: Clock,
    title: "Time Machine",
    description:
      "Travel back through your listening history and revisit past favorites.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description:
      "Get personalized recommendations and discover patterns you never noticed.",
  },
];

export function Features() {
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
            Powerful features to help you explore and share your unique listening
            journey.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-white/5 bg-gray-900/50 p-6 transition-colors hover:border-[#1DB954]/20 hover:bg-gray-900/80"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[#1DB954]/10 p-2.5">
                <Icon className="h-5 w-5 text-[#1DB954]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
