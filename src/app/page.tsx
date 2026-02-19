"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Target,
  BarChart3,
  Brain,
  Repeat,
  Sparkles,
  BriefcaseBusiness,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Target, label: "Track Progress", desc: "Subject-wise completion tracking" },
  { icon: Brain, label: "Smart Revision", desc: "Spaced repetition system" },
  { icon: Repeat, label: "Daily Streaks", desc: "Build consistent habits" },
  { icon: BarChart3, label: "Analytics", desc: "Visual progress insights" },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0a0a0f] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.05] blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/[0.03] blur-[100px]" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />

      <motion.nav
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            Placement<span className="text-indigo-400">OS</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-white text-sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5">
              Get Started
            </Button>
          </Link>
        </div>
      </motion.nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center -mt-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 text-xs tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Your placement prep, organized
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
            Master every <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">concept</span>
            <br />
            before the interview
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
            Track subjects, revise with spaced repetition, and build streaks.
            Everything you need to crack your placement - in one place.
          </p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-8 h-12 gap-2 group"
              >
                Start Preparing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:text-white text-sm px-8 h-12"
              >
                I have an account
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-emerald-300 text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Placement Mode
              </div>
              <p className="text-sm text-slate-300 mt-1">Deadline-driven prep with interview-focused analytics.</p>
            </div>
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider">
                <BriefcaseBusiness className="w-3.5 h-3.5" />
                Sarkari Mode
              </div>
              <p className="text-sm text-slate-300 mt-1">Department-specific syllabus and isolated dashboard data.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-20 sm:mt-24 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto w-full [content-visibility:auto] [contain-intrinsic-size:280px]"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-white">{f.label}</span>
              <span className="text-[10px] text-slate-500 text-center leading-tight">{f.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <motion.footer
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 py-8 text-center"
      >
        <p className="text-xs text-slate-700">Built for placement success</p>
      </motion.footer>
    </div>
  );
}
