"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { TimeRange } from "@/types";

interface TimeMachineProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const ranges: { id: TimeRange; label: string }[] = [
  { id: "short_term", label: "4 weeks" },
  { id: "medium_term", label: "6 months" },
  { id: "long_term", label: "1 year" },
  { id: "all_time", label: "All time" },
];

export function TimeMachine({ value, onChange }: TimeMachineProps) {
  return (
    <div className="flex items-center gap-5">
      {ranges.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            "relative text-[13px] font-medium pb-1 transition-colors ease-out",
            value === id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground/70",
          )}
        >
          {label}
          {value === id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
