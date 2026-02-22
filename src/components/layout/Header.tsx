"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BriefcaseBusiness, Menu, Search as SearchIcon, Sparkles, X } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { getClientScopeKey } from "@/lib/track-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "@/components/layout/Sidebar";

type SearchResult = {
  id: string;
  name: string;
  type: "subject" | "topic" | "subtopic";
  icon?: string;
  link: string;
};

type NotificationsResponse = {
  notifications: Array<{
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
};

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
}

export function Header() {
  const { user, dbUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebouncedValue(searchQuery.trim(), 250);
  const queryClient = useQueryClient();
  const scopeKey = getClientScopeKey(dbUser?.preferences);
  const activeTrack = dbUser?.preferences?.activeTrack || "placement";
  const sarkariDept = dbUser?.preferences?.sarkariDepartment || "mechanical";
  const sarkariDeptLabel = sarkariDept
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["search", scopeKey, debouncedSearchQuery],
    queryFn: async () => {
      if (debouncedSearchQuery.length < 3) return { results: [] as SearchResult[] };
      const res = await apiClient(`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return (await res.json()) as { results: SearchResult[] };
    },
    enabled: !!dbUser?._id && !!user && debouncedSearchQuery.length > 2,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const searchResults = searchData?.results ?? [];

  const { data: notifyData } = useQuery({
    queryKey: ["notifications", scopeKey],
    queryFn: async () => {
      const res = await apiClient("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return (await res.json()) as NotificationsResponse;
    },
    refetchInterval: 60_000,
    staleTime: 15_000,
    enabled: !!dbUser?._id && !!user,
  });

  const notifications = notifyData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const readMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId, action: "markAsRead" }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", scopeKey] });
    },
  });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur-sm lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="relative hidden sm:block">
              <div className="flex w-[320px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                <SearchIcon className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  placeholder="Search subjects, topics, subtopics..."
                  className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    className="text-slate-500 hover:text-white"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {isSearching && debouncedSearchQuery.length > 2 ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
                  <div className="max-h-[320px] overflow-y-auto p-1">
                    {searchLoading ? (
                      <p className="px-3 py-2 text-xs text-slate-500">Searching...</p>
                    ) : null}
                    {!searchLoading && searchResults.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-500">No results found.</p>
                    ) : null}
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                        className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-800/80"
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-800 text-xs text-slate-300">
                          {result.icon || "•"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-slate-100">{result.name}</span>
                          <span className="block text-[11px] uppercase tracking-wide text-slate-500">
                            {result.type}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Badge
                className={cn(
                  "border px-2.5 py-1 text-[10px] uppercase tracking-wide",
                  activeTrack === "placement"
                    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-300"
                    : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                )}
              >
                {activeTrack === "placement" ? (
                  <>
                    <Sparkles className="mr-1 h-3 w-3" /> Placement
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness className="mr-1 h-3 w-3" /> Sarkari
                  </>
                )}
              </Badge>
              {activeTrack === "sarkari" ? (
                <Badge className="border border-slate-700 bg-slate-900/70 text-[10px] uppercase tracking-wide text-slate-300">
                  {sarkariDeptLabel}
                </Badge>
              ) : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-slate-800">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-400" />
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 border-slate-800 bg-slate-900 p-0">
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <h3 className="text-sm font-medium text-white">Notifications</h3>
                  {unreadCount > 0 ? (
                    <Badge variant="outline" className="border-indigo-500/40 text-indigo-300">
                      {unreadCount} new
                    </Badge>
                  ) : null}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-5 text-xs text-slate-500">No notifications yet.</p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() => !notification.read && readMutation.mutate(notification._id)}
                        className={cn(
                          "w-full border-b border-slate-800 px-4 py-3 text-left transition-colors",
                          notification.read ? "hover:bg-slate-800/60" : "bg-indigo-500/5 hover:bg-indigo-500/10"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className={cn("text-xs font-medium", notification.read ? "text-slate-300" : "text-white")}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{notification.message}</p>
                      </button>
                    ))
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="border-t border-slate-800 p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-slate-400 hover:text-white"
                      onClick={() => {
                        apiClient("/api/notifications", {
                          method: "PATCH",
                          body: JSON.stringify({ action: "markAllAsRead" }),
                        }).then(() => queryClient.invalidateQueries({ queryKey: ["notifications", scopeKey] }));
                      }}
                    >
                      Mark all as read
                    </Button>
                  </div>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isSearching ? (
          <button
            type="button"
            aria-label="Close search panel"
            className="fixed inset-0 z-20 bg-transparent"
            onClick={() => setIsSearching(false)}
          />
        ) : null}
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

