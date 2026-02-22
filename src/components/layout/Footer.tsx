"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-white tracking-tight">
              Placement<span className="text-indigo-400">OS</span>
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Focused prep platform for placement and Sarkari tracks.
            </p>
          </div>

          <div className="flex items-center gap-5 text-sm text-slate-400">
            <Link href="/signup" className="hover:text-white transition-colors">
              Get Started
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} PlacementOS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

