"use client";

import { useCallback, useState, useRef } from "react";
import {
  Upload,
  FileJson,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Table2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SpotifyStreamEntry } from "@/types";

interface ParsedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  entries: SpotifyStreamEntry[];
  preview: SpotifyStreamEntry[];
  status: "pending" | "uploading" | "done" | "error";
  imported: number;
  skipped: number;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function fileToId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function UploadPage() {
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = async (file: File): Promise<ParsedFile> => {
    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON file");
    }

    const entries: SpotifyStreamEntry[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as any).entries)
        ? (parsed as any).entries
        : [];

    if (entries.length === 0) {
      throw new Error("No streaming entries found in file");
    }

    return {
      id: fileToId(),
      file,
      name: file.name,
      size: formatBytes(file.size),
      entries,
      preview: entries.slice(0, 5),
      status: "pending",
      imported: 0,
      skipped: 0,
    };
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const jsonFiles = Array.from(fileList).filter(
      (f) => f.type === "application/json" || f.name.endsWith(".json"),
    );

    if (jsonFiles.length === 0) {
      toast.error("Please select JSON files only");
      return;
    }

    const parsed: ParsedFile[] = [];
    for (const file of jsonFiles) {
      try {
        const result = await parseFile(file);
        parsed.push(result);
      } catch (err: any) {
        toast.error(`Failed to parse ${file.name}: ${err.message}`);
      }
    }

    setFiles((prev) => [...prev, ...parsed]);

    if (parsed.length > 0) {
      const totalEntries = parsed.reduce((s, f) => s + f.entries.length, 0);
      toast.success(
        `Parsed ${parsed.length} file${parsed.length > 1 ? "s" : ""} with ${totalEntries.toLocaleString()} entries`,
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (pf: ParsedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === pf.id ? { ...f, status: "uploading" } : f)),
    );

    try {
      const res = await fetch("/api/spotify/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: pf.entries }),
      });

      const data = await res.json();

      if (data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pf.id
              ? {
                  ...f,
                  status: "done",
                  imported: data.data.imported,
                  skipped: data.data.skipped,
                }
              : f,
          ),
        );
        toast.success(
          `${pf.name}: ${data.data.imported} imported, ${data.data.skipped} skipped`,
        );
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === pf.id ? { ...f, status: "error", error: err.message } : f,
        ),
      );
      toast.error(`Failed to upload ${pf.name}: ${err.message}`);
    }
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) {
      toast.info("No files to upload");
      return;
    }

    setUploading(true);
    for (const file of pending) {
      await uploadFile(file);
    }
    setUploading(false);
    toast.success("All uploads complete!");
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const totalEntries = files.reduce((s, f) => s + f.entries.length, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Upload Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Import your Spotify extended streaming history
        </p>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            How to get your data
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Go to{" "}
              <a
                href="https://www.spotify.com/account/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Spotify Account Privacy
              </a>
            </li>
            <li>
              Request an{" "}
              <strong className="text-foreground">
                Extended streaming history
              </strong>{" "}
              download
            </li>
            <li>Spotify will email you a zip file (may take a few days)</li>
            <li>Extract the zip and upload the JSON files below</li>
          </ol>
          <p className="text-xs mt-2">
            Accepted format: JSON arrays with fields like{" "}
            <code className="text-primary">ts</code>,{" "}
            <code className="text-primary">master_metadata_track_name</code>,{" "}
            <code className="text-primary">ms_played</code>, etc.
          </p>
        </CardContent>
      </Card>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
              ${isDragging ? "bg-primary/20" : "bg-secondary"}
            `}
          >
            <Upload
              className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isDragging
                ? "Drop your files here"
                : "Drag & drop JSON files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse · supports multiple files
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Files ({files.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {totalEntries.toLocaleString()} entries
                </Badge>
                {pendingCount > 0 && (
                  <Button size="sm" onClick={uploadAll} disabled={uploading}>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Upload All ({pendingCount})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((pf) => (
              <div
                key={pf.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                {/* File header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileJson className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{pf.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pf.size} · {pf.entries.length.toLocaleString()} entries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pf.status === "done" && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {pf.imported} imported
                      </Badge>
                    )}
                    {pf.status === "error" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </Badge>
                    )}
                    {pf.status === "uploading" && (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading…
                      </Badge>
                    )}
                    {pf.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => uploadFile(pf)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Upload
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(pf.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(pf.status === "done" || pf.status === "error") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(pf.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {pf.status === "error" && pf.error && (
                  <p className="text-xs text-destructive">{pf.error}</p>
                )}

                {/* Skipped count */}
                {pf.status === "done" && pf.skipped > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {pf.skipped} entries skipped (duplicates or missing data)
                  </p>
                )}

                {/* Preview table */}
                {pf.preview.length > 0 && (
                  <div className="overflow-x-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <Table2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">
                        Preview (first {pf.preview.length} entries)
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-1.5 pr-3 font-medium">
                            Date
                          </th>
                          <th className="text-left py-1.5 pr-3 font-medium">
                            Track
                          </th>
                          <th className="text-left py-1.5 pr-3 font-medium">
                            Artist
                          </th>
                          <th className="text-left py-1.5 pr-3 font-medium">
                            Album
                          </th>
                          <th className="text-right py-1.5 font-medium">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pf.preview.map((entry, i) => (
                          <tr
                            key={i}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">
                              {new Date(entry.ts).toLocaleDateString()}
                            </td>
                            <td className="py-1.5 pr-3 truncate max-w-[150px]">
                              {entry.master_metadata_track_name || "—"}
                            </td>
                            <td className="py-1.5 pr-3 truncate max-w-[120px]">
                              {entry.master_metadata_album_artist_name || "—"}
                            </td>
                            <td className="py-1.5 pr-3 truncate max-w-[120px]">
                              {entry.master_metadata_album_album_name || "—"}
                            </td>
                            <td className="py-1.5 text-right text-muted-foreground whitespace-nowrap">
                              {Math.round(entry.ms_played / 1000)}s
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
