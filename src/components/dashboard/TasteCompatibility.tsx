"use client";

interface TasteCompatibilityProps {
  sharedArtists: number;
  totalArtists: number;
  sharedGenres: number;
  totalGenres: number;
}

export function TasteCompatibility({
  sharedArtists,
  totalArtists,
  sharedGenres,
  totalGenres,
}: TasteCompatibilityProps) {
  const artistPercent = totalArtists > 0 ? (sharedArtists / totalArtists) * 100 : 0;
  const genrePercent = totalGenres > 0 ? (sharedGenres / totalGenres) * 100 : 0;
  const overall = Math.round((artistPercent + genrePercent) / 2);

  // SVG ring dimensions
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;

  // Gradient: green (low) → purple (high)
  const gradientId = "taste-gradient";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{overall}%</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Match
          </span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="w-full space-y-3">
        {/* Shared Artists */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Shared Artists</span>
            <span className="font-medium text-foreground">
              {sharedArtists}
              <span className="text-muted-foreground"> / {totalArtists}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min(artistPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Shared Genres */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Shared Genres</span>
            <span className="font-medium text-foreground">
              {sharedGenres}
              <span className="text-muted-foreground"> / {totalGenres}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(genrePercent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
