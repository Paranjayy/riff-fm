"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TimeMachineProps {
  value: string;
  onChange: (range: string) => void;
}

const ranges = [
  { id: "short_term", label: "Last 4 Weeks" },
  { id: "medium_term", label: "Last 6 Months" },
  { id: "long_term", label: "Last Year" },
  { id: "all_time", label: "All Time" },
];

export function TimeMachine({ value, onChange }: TimeMachineProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-gray-900/50 p-1">
      {ranges.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
            value === id
              ? "bg-gradient-to-r from-[#1DB954] to-emerald-400 text-black shadow-lg shadow-[#1DB954]/20"
              : "text-gray-400 hover:text-white"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
