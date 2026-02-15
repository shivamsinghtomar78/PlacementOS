"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Bell, Search as SearchIcon, X, Check } from "lucide-react";
import { MobileSidebar } from "./Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { user, dbUser } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const queryClient = useQueryClient();

    // Search query
    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ["search", searchQuery],
        queryFn: async () => {
            if (!searchQuery) return { results: [] };
            const res = await apiClient(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error("Search failed");
            return res.json();
        },
        enabled: searchQuery.length > 2,
    });

    useEffect(() => {
        if (searchData?.results) {
            setSearchResults(searchData.results);
        } else {
            setSearchResults([]);
        }
    }, [searchData]);

    // Notifications query
    const { data: notifyData } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await apiClient("/api/notifications");
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json();
        },
        refetchInterval: 30000, // Refresh every 30s
    });

    const notifications = notifyData?.notifications || [];
    const unreadCount = notifications.filter((n: any) => !n.read).length;

    const readMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const res = await apiClient("/api/notifications", {
                method: "PATCH",
                body: JSON.stringify({ notificationId, action: "markAsRead" }),
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    return (
        <>
            <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 bg-slate-950/40 backdrop-blur-md border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <div className="relative group">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/50 border border-white/10 text-slate-500 text-sm w-64 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 focus-within:bg-slate-900 transition-all duration-300">
                            <SearchIcon className="w-4 h-4 transition-colors group-focus-within:text-indigo-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearching(true)}
                                placeholder="Search everything..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder:text-slate-500 placeholder:font-light"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="hover:scale-110 transition-transform">
                                    <X className="w-3.5 h-3.5 hover:text-white" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearching && searchQuery.length > 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-full max-w-[350px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                                >
                                    <div className="max-h-[400px] overflow-y-auto p-1 space-y-1">
                                        {searchLoading && (
                                            <p className="text-xs text-slate-500 p-3 italic">Searching...</p>
                                        )}
                                        {!searchLoading && searchResults.length === 0 && (
                                            <p className="text-xs text-slate-500 p-3">No results found</p>
                                        )}
                                        {searchResults.map((result: any, idx: number) => (
                                            <motion.div
                                                key={result.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <Link
                                                    href={result.link}
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        setIsSearching(false);
                                                    }}
                                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 group/item"
                                                >
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-transform duration-300 group-hover/item:scale-110",
                                                        result.type === "subject" ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-800 text-slate-300"
                                                    )}>
                                                        {result.icon || "📄"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white/90 truncate group-hover/item:text-white">{result.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{result.type}</p>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-400 hover:text-white hover:bg-white/5 relative transition-all duration-300 active:scale-90"
                            >
                                <Bell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-700 p-0 overflow-hidden shadow-2xl">
                            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <Badge variant="outline" className="text-[10px] border-indigo-500 text-indigo-400">
                                        {unreadCount} New
                                    </Badge>
                                )}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((n: any) => (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.read && readMutation.mutate(n._id)}
                                            className={cn(
                                                "p-4 border-b border-slate-800/50 cursor-pointer transition-colors group relative",
                                                !n.read ? "bg-indigo-500/5 hover:bg-indigo-500/10" : "hover:bg-slate-800"
                                            )}
                                        >
                                            {!n.read && (
                                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                                            )}
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={cn("text-xs font-semibold", !n.read ? "text-white" : "text-slate-400")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-slate-600">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="p-2 border-t border-slate-800 bg-slate-900/50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-xs text-slate-500 hover:text-white"
                                        onClick={() => {
                                            apiClient("/api/notifications", {
                                                method: "PATCH",
                                                body: JSON.stringify({ action: "markAllAsRead" }),
                                            }).then(() => queryClient.invalidateQueries({ queryKey: ["notifications"] }));
                                        }}
                                    >
                                        Mark all as read
                                    </Button>
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                                {(dbUser?.name || user?.displayName || "U")[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:block text-sm font-medium text-white">
                            {dbUser?.name || user?.displayName || "User"}
                        </span>
                    </div>
                </div>

                {/* Click outside search to close */}
                {isSearching && (
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsSearching(false)}
                    />
                )}
            </header>

            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
    );
}
