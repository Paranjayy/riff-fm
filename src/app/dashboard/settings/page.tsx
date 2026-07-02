"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Download, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string;
  image: string | null;
  email: string;
}

interface Privacy {
  publicProfile: boolean;
  showListening: boolean;
  showStats: boolean;
  showTopLists: boolean;
  showFriends: boolean;
  showHistory: boolean;
  showGenres: boolean;
  showHours: boolean;
}

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privacy, setPrivacy] = useState<Privacy>({
    publicProfile: true,
    showListening: true,
    showStats: true,
    showTopLists: true,
    showFriends: true,
    showHistory: false,
    showGenres: true,
    showHours: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchProfile();
  }, [status]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setProfile(data.data.profile);
          setPrivacy(data.data.privacy || privacy);
          setName(data.data.profile?.name || "");
          setUsername(data.data.profile?.username || "");
          setBio(data.data.profile?.bio || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated!");
        fetchProfile();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePrivacyChange(key: keyof Privacy) {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy: updated }),
      });
    } catch {
      setPrivacy(privacy);
      toast.error("Failed to update privacy settings");
    }
  }

  const privacyOptions: { key: keyof Privacy; label: string; desc: string }[] = [
    { key: "publicProfile", label: "Public Profile", desc: "Allow others to view your profile" },
    { key: "showListening", label: "Show Listening", desc: "Display current listening activity" },
    { key: "showStats", label: "Show Stats", desc: "Display your listening statistics" },
    { key: "showTopLists", label: "Show Top Lists", desc: "Display top artists, songs, albums" },
    { key: "showFriends", label: "Show Friends", desc: "Display your friends list" },
    { key: "showHistory", label: "Show History", desc: "Display recent listening history" },
    { key: "showGenres", label: "Show Genres", desc: "Display genre breakdowns" },
    { key: "showHours", label: "Show Hours", desc: "Display listening hours and patterns" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.image && (
            <div className="flex items-center gap-4">
              <img
                src={profile.image}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          )}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your profile will be at riff.fm/{username || "username"}
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {privacyOptions.map((opt) => (
              <div
                key={opt.key}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <button
                  onClick={() => handlePrivacyChange(opt.key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    privacy[opt.key] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      privacy[opt.key] ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-[#1DB954]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-sm">Spotify</span>
              </div>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="text-sm">GitHub</span>
              </div>
              <span className="text-xs px-2 py-1 bg-secondary text-muted-foreground rounded-full">
                Not connected
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
            Export My Data
          </button>
          <button className="flex items-center gap-2 w-full px-4 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
