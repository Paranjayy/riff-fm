"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GenreStat } from "@/types";

interface GenreChartProps {
  data: GenreStat[];
}

const GENRE_COLORS = [
  "#1DB954",
  "#1ed760",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#059669",
  "#047857",
  "#065f46",
];

export function GenreChart({ data }: GenreChartProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-gray-900/50 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold">Top Genres</h3>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="genre"
              width={100}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#f3f4f6" }}
              formatter={(value: number) => [`${value} plays`, "Plays"]}
            />
            <Bar
              dataKey="plays"
              radius={[0, 4, 4, 0]}
              barSize={20}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GENRE_COLORS[index % GENRE_COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Percentage list below chart */}
      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((genre, i) => (
          <div key={genre.genre} className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length] }}
            />
            <span className="flex-1 text-sm text-gray-300">{genre.genre}</span>
            <span className="text-sm font-medium text-gray-400">
              {genre.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
