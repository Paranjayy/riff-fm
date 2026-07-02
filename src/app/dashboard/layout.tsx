"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  Home,
  Users,
  Music,
  Disc3,
  Tag,
  Clock,
  Heart,
  Settings,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/top-artists", label: "Artists", icon: Users },
  { href: "/dashboard/top-songs", label: "Songs", icon: Music },
  { href: "/dashboard/top-albums", label: "Albums", icon: Disc3 },
  { href: "/dashboard/genres", label: "Genres", icon: Tag },
  { href: "/dashboard/timeline", label: "Timeline", icon: Clock },
  { href: "/dashboard/friends", label: "Friends", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/top-artists", label: "Artists", icon: Users },
  { href: "/dashboard/top-songs", label: "Songs", icon: Music },
  { href: "/dashboard/friends", label: "Friends", icon: Heart },
  { href: "/dashboard/settings", label: "More", icon: MoreHorizontal },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-60 lg:bg-card lg:border-r lg:border-border">
        {/* Logo */}
        <div className="flex items-center h-14 px-5 shrink-0">
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-lg font-bold text-foreground tracking-tight">
              riff.fm
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ease-out",
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px pl-[11px]"
                    : "text-muted-foreground hover:text-foreground/80 hover:bg-secondary",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors ease-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-[11px] font-medium text-muted-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left text-[13px] font-medium text-foreground/80 truncate">
                  Account
                </span>
                <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="start" side="top">
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 text-[13px] text-muted-foreground"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 text-[13px] text-muted-foreground cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="lg:ml-60 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6 max-w-[1200px]">
          {children}
        </div>
      </main>

      {/* ─── Mobile Bottom Tab Bar ────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 lg:hidden z-50 bg-card/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-colors ease-out",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground/60",
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
