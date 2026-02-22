"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, LayoutDashboard, LogOut, Settings, Target, X, Zap } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/placement-mode", label: "Mode Switch", icon: Zap },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="mt-5 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-indigo-500/15 text-indigo-200 border border-indigo-500/30"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, dbUser, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-800/80 bg-slate-950/95 lg:flex lg:flex-col">
      <div className="border-b border-slate-800/80 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/20">
            <Target className="h-4 w-4 text-indigo-300" />
          </div>
          <p className="text-base font-semibold text-white tracking-tight">
            Placement<span className="text-indigo-400">OS</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <NavContent pathname={pathname} />
      </div>

      <div className="border-t border-slate-800/80 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-indigo-500/20 text-indigo-100 text-xs font-semibold">
              {(dbUser?.name || user?.displayName || "U")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{dbUser?.name || user?.displayName || "User"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-slate-500 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, dbUser, signOut } = useAuth();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close sidebar"
        onClick={onClose}
      />
      <aside className="relative h-full w-72 border-r border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/20">
              <Target className="h-4 w-4 text-indigo-300" />
            </div>
            <p className="text-base font-semibold text-white tracking-tight">
              Placement<span className="text-indigo-400">OS</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <NavContent pathname={pathname} onNavigate={onClose} />

        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-100 text-xs font-semibold">
                {(dbUser?.name || user?.displayName || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{dbUser?.name || user?.displayName || "User"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-slate-500 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

