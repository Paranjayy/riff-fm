"use client";

import { useState } from "react";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  Music,
  Mic2,
  Disc3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function downloadBlob(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportFullJson = async () => {
    setExporting("json");
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");

      const text = await res.text();
      const filename = `riff-fm-export-${new Date().toISOString().split("T")[0]}.json`;
      downloadBlob(text, filename, "application/json");
      toast.success("Full stats exported as JSON");
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const exportCsv = async (type: "artists" | "tracks" | "albums") => {
    setExporting(type);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();

      let rows: string[];
      let filename: string;

      if (type === "artists") {
        const items = data.topArtists ?? [];
        rows = ["Rank,Name,Plays,Minutes,Hours,Percentage,Genres"];
        for (const a of items) {
          rows.push(
            [
              a.rank,
              `"${(a.name ?? "").replace(/"/g, '""')}"`,
              a.playCount,
              Math.round(a.totalMinutes * 100) / 100,
              Math.round(a.totalHours * 100) / 100,
              Math.round(a.percentage * 100) / 100,
              `"${(a.genres ?? []).join(", ")}"`,
            ].join(",")
          );
        }
        filename = "riff-fm-top-artists.csv";
      } else if (type === "tracks") {
        const items = data.topTracks ?? [];
        rows = ["Rank,Name,Artist,Plays,Minutes,Hours,Percentage"];
        for (const t of items) {
          rows.push(
            [
              t.rank,
              `"${(t.name ?? "").replace(/"/g, '""')}"`,
              `"${(t.subtitle ?? "").replace(/"/g, '""')}"`,
              t.playCount,
              Math.round(t.totalMinutes * 100) / 100,
              Math.round(t.totalHours * 100) / 100,
              Math.round(t.percentage * 100) / 100,
            ].join(",")
          );
        }
        filename = "riff-fm-top-tracks.csv";
      } else {
        const items = data.topAlbums ?? [];
        rows = ["Rank,Name,Artist,Plays,Minutes,Hours,Percentage,Release Date"];
        for (const a of items) {
          rows.push(
            [
              a.rank,
              `"${(a.name ?? "").replace(/"/g, '""')}"`,
              `"${(a.subtitle ?? "").replace(/"/g, '""')}"`,
              a.playCount,
              Math.round(a.totalMinutes * 100) / 100,
              Math.round(a.totalHours * 100) / 100,
              Math.round(a.percentage * 100) / 100,
              `"${a.releaseDate ?? ""}"`,
            ].join(",")
          );
        }
        filename = "riff-fm-top-albums.csv";
      }

      downloadBlob(rows.join("\n"), filename, "text/csv");
      toast.success(`Exported ${type} as CSV`);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Export Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download your listening stats in different formats
        </p>
      </div>

      {/* Full JSON Export */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Full Stats Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download your complete listening statistics as a JSON file. Includes
            overview, top artists, tracks, albums, genres, hourly/daily/monthly
            patterns, listening clock, and heat map data.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Overview",
              "Top Artists",
              "Top Tracks",
              "Top Albums",
              "Genres",
              "Hourly/Daily Stats",
              "Listening Clock",
              "Heat Map",
            ].map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
          <Button
            onClick={exportFullJson}
            disabled={exporting === "json"}
            className="mt-2"
          >
            {exporting === "json" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export as JSON
          </Button>
        </CardContent>
      </Card>

      {/* CSV Exports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            CSV Exports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export individual top lists as CSV files, ready to open in
            spreadsheets.
          </p>

          <div className="space-y-3">
            {/* Top Artists */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mic2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Top Artists</p>
                  <p className="text-xs text-muted-foreground">
                    Rank, name, plays, minutes, hours, percentage, genres
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportCsv("artists")}
                disabled={exporting === "artists"}
              >
                {exporting === "artists" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                CSV
              </Button>
            </div>

            {/* Top Tracks */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Top Tracks</p>
                  <p className="text-xs text-muted-foreground">
                    Rank, name, artist, plays, minutes, hours, percentage
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportCsv("tracks")}
                disabled={exporting === "tracks"}
              >
                {exporting === "tracks" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                CSV
              </Button>
            </div>

            {/* Top Albums */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Disc3 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Top Albums</p>
                  <p className="text-xs text-muted-foreground">
                    Rank, name, artist, plays, minutes, hours, percentage,
                    release date
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportCsv("albums")}
                disabled={exporting === "albums"}
              >
                {exporting === "albums" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
