"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";

interface NavbarProps {
  user?: {
    name: string;
    image?: string;
  } | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between px-6 sm:px-8">
          {/* Logo — plain text */}
          <Link
            href="/"
            className="text-[16px] font-medium text-foreground tracking-tight"
          >
            riff.fm
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, label }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-3 py-2 text-[13px] font-medium transition-colors duration-150",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-foreground" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side — auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 rounded-full overflow-hidden transition-opacity duration-150 hover:opacity-80">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-secondary text-[11px] font-medium text-muted-foreground">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 text-[13px] text-secondary-foreground"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-[13px] text-secondary-foreground"
                    >
                      <User className="h-3.5 w-3.5" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 text-[13px] text-secondary-foreground cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                {mobileOpen ? (
                  <>
                    <line x1="4" y1="4" x2="14" y2="14" />
                    <line x1="14" y1="4" x2="4" y2="14" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="5.5" x2="15" y2="5.5" />
                    <line x1="3" y1="9" x2="15" y2="9" />
                    <line x1="3" y1="12.5" x2="15" y2="12.5" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <nav className="absolute top-14 right-0 w-full max-w-sm border-b border-border bg-background p-6 shadow-lg">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => {
                const active =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-[15px] font-medium transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-secondary-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}

              {!user && (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-[15px] font-medium text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
