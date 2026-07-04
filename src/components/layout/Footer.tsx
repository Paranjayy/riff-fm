import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-6 sm:px-8">
        <span className="text-[14px] font-medium text-muted-foreground tracking-tight">
          riff.fm
        </span>

        <nav className="flex items-center gap-5">
          {[
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline hover:underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[12px] text-muted-foreground">
          &copy; {new Date().getFullYear()} riff.fm
        </p>
      </div>
    </footer>
  );
}
