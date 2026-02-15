"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Target,
    Settings,
    LogOut,
    X,
    Zap,
    ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/subjects", label: "Subjects", icon: BookOpen },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/placement-mode", label: "Placement Mode", icon: Zap },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, dbUser, signOut } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 80 : 288 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 z-40"
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/50">
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white tracking-tight">
                                        Placement<span className="text-indigo-400">OS</span>
                                    </h1>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {collapsed && (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                    >
                        <ChevronLeft
                            className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                collapsed && "rotate-180"
                            )}
                        />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-indigo-400")} />
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                className="whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-slate-800/50">
                    <div className={cn("flex items-center gap-3 px-3 py-2", collapsed && "justify-center")}>
                        <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                                {(dbUser?.name || user?.displayName || "U")[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 min-w-0"
                                >
                                    <p className="text-sm font-medium text-white truncate">
                                        {dbUser?.name || user?.displayName || "User"}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {user?.email}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {!collapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={signOut}
                                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay - handled by Header MobileNav */}
        </>
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

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                    />
                    <motion.aside
                        initial={{ x: -320 }}
                        animate={{ x: 0 }}
                        exit={{ x: -320 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800/50 z-50 lg:hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-lg font-bold text-white">
                                    Placement<span className="text-indigo-400">OS</span>
                                </h1>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <nav className="flex-1 px-3 py-4 space-y-1">
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href} onClick={onClose}>
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-indigo-500/10 text-indigo-400"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            )}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                                        {(dbUser?.name || user?.displayName || "U")[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {dbUser?.name || user?.displayName || "User"}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={signOut}
                                    className="text-slate-400 hover:text-red-400"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
