"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Brain, Repeat, Target } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Track completion across subjects, topics, and subtopics without losing context.",
  },
  {
    icon: Brain,
    title: "Revision Planning",
    description: "Use spaced revision schedules to keep high-retention topics interview-ready.",
  },
  {
    icon: Repeat,
    title: "Habit Momentum",
    description: "Build streak consistency with daily targets and overdue visibility.",
  },
  {
    icon: BarChart3,
    title: "Actionable Analytics",
    description: "Spot weak areas quickly and focus on what improves outcomes fastest.",
  },
];

const stats = [
  { value: "18.5K+", label: "Active Learners" },
  { value: "9.4L+", label: "Sessions Tracked" },
  { value: "120+", label: "Subject Maps" },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500/25 border-t-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[120px]" />
          <div className="absolute right-[-8rem] top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
          <div className="absolute left-[-8rem] bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
        </div>

        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
          <p className="text-lg font-semibold tracking-tight text-white">
            Placement<span className="text-indigo-400">OS</span>
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-indigo-500 text-white hover:bg-indigo-600">Get Started</Button>
            </Link>
          </div>
        </nav>

        <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-4 sm:px-8 sm:pb-24">
          <section className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-indigo-200">
                Placement + Sarkari workspace
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Clean prep workflow for high-stakes interview seasons.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Replace scattered notes and random trackers with one focused system for subjects, revision, and progress analytics.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button className="h-11 bg-indigo-500 px-6 text-white hover:bg-indigo-600">
                    Start Preparing <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-11 border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800">
                    I already have an account
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.5)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Preparation Snapshot</p>
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                  +12% week over week
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  { label: "DSA", value: 74, tone: "from-indigo-500 to-indigo-300" },
                  { label: "Core Subject", value: 61, tone: "from-cyan-500 to-cyan-300" },
                  { label: "Aptitude", value: 82, tone: "from-emerald-500 to-emerald-300" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.tone}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Today</p>
                  <p className="mt-1 text-sm font-medium text-white">4 / 6 tasks done</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Revision Due</p>
                  <p className="mt-1 text-sm font-medium text-white">9 items</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-4">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </section>

          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/55 px-5 py-5">
                <feature.icon className="h-5 w-5 text-indigo-300" />
                <h2 className="mt-3 text-lg font-medium text-white">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </div>
            ))}
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

