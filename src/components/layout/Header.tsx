"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Bell, Search } from "lucide-react";
import { MobileSidebar } from "./Sidebar";

export function Header() {
    const { user, dbUser } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-500 text-sm w-64">
                        <Search className="w-4 h-4" />
                        <span>Search topics...</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 relative"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-slate-950" />
                    </Button>

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
            </header>

            <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
    );
}
