import React from "react";
import Link from "next/link";
import { Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-[#1DB954]" />
            <span className="bg-gradient-to-r from-[#1DB954] to-emerald-300 bg-clip-text font-bold text-transparent">
              riff.fm
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            Built with ♥ for music lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
