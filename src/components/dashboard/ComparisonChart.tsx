"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ComparisonChartProps {
  label: string;
  yours: number;
  theirs: number;
  format?: "number" | "hours" | "percent";
}

function formatValue(value: number, format: "number" | "hours" | "percent"): string {
  switch (format) {
    case "hours":
      return value < 1 ? `${Math.round(value * 60)}m` : `${value.toFixed(1)}h`;
    case "percent":
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

const CustomTooltip = ({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  format: "number" | "hours" | "percent";
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatValue(entry.value, format)}
        </p>
      ))}
    </div>
  );
};

export function ComparisonChart({
  label,
  yours,
  theirs,
  format = "number",
}: ComparisonChartProps) {
  const data = [
    { name: "You", value: yours, fill: "#22c55e" },
    { name: "Friend", value: theirs, fill: "#a855f7" },
  ];

  const winner = yours > theirs ? "yours" : theirs > yours ? "theirs" : "tie";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          {winner === "yours" ? (
            <span className="text-green-400">You lead</span>
          ) : winner === "theirs" ? (
            <span className="text-purple-400">They lead</span>
          ) : (
            <span>Tied</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">You</span>
          <span className="font-semibold text-foreground">
            {formatValue(yours, format)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-muted-foreground">Friend</span>
          <span className="font-semibold text-foreground">
            {formatValue(theirs, format)}
          </span>
        </div>
      </div>

      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap="20%"
          >
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              content={<CustomTooltip format={format} />}
              cursor={false}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fill}
                  opacity={
                    winner === "tie" || winner === (index === 0 ? "yours" : "theirs")
                      ? 1
                      : 0.5
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
