import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border-faint))]">
      <div className="mx-auto max-w-[1200px] px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-[14px] font-medium text-[hsl(var(--fg-faint))] tracking-tight">
            riff.fm
          </span>

          <nav className="flex items-center gap-6">
            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-[hsl(var(--fg-faint))] transition-colors duration-150 hover:text-[hsl(var(--fg-secondary))] hover:underline hover:underline-offset-4"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-[12px] text-[hsl(var(--fg-faint))]">
            &copy; {new Date().getFullYear()} riff.fm
          </p>
        </div>
      </div>
    </footer>
  );
}
