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
import { ThreeDCardDemo } from "@/components/custom/ThreeDCardDemo";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { ProgressiveBlur } from "@/components/custom/ProgressiveBlur";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Footer } from "@/components/layout/Footer";
import { PinContainer } from "@/components/ui/3d-pin";

const features = [
  { icon: Target, label: "Track Progress", desc: "Subject-wise completion tracking" },
  { icon: Brain, label: "Smart Revision", desc: "Spaced repetition system" },
  { icon: Repeat, label: "Daily Streaks", desc: "Build consistent habits" },
  { icon: BarChart3, label: "Analytics", desc: "Visual progress insights" },
];

const typewriterWords = [
  { text: "Master" },
  { text: "every" },
  { text: "concept", className: "text-indigo-400 dark:text-indigo-400" },
  { text: "before" },
  { text: "the" },
  { text: "interview", className: "text-violet-400 dark:text-violet-400" },
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
      <div className="min-h-screen relative flex flex-col bg-[#0a0a0f] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <BackgroundGradientAnimation
            gradientBackgroundStart="rgb(10, 10, 15)"
            gradientBackgroundEnd="rgb(15, 15, 25)"
            firstColor="79, 70, 229"
            secondColor="124, 58, 237"
            thirdColor="6, 182, 212"
            fourthColor="147, 51, 234"
            fifthColor="59, 130, 246"
            pointerColor="140, 100, 255"
            size="100%"
            blendingValue="hard-light"
            className="absolute inset-0 opacity-40 mix-blend-screen"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]"
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

            <div className="flex justify-center w-full">
              <TypewriterEffectSmooth
                words={typewriterWords}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                cursorClassName="bg-indigo-500"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left mt-8">
              <PinContainer title="Interview Mastery" href="/signup">
                <div className="flex basis-[16rem] flex-col p-4 tracking-tight text-slate-100/50 sm:basis-[20rem] h-[12rem]">
                  <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
                    Placement Mode
                  </h3>
                  <div className="text-base !m-0 !p-0 font-normal">
                    <span className="text-slate-500 ">
                      Deadline-driven prep with interview-focused analytics and company-specific tracks.
                    </span>
                  </div>
                  <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-emerald-500 via-emerald-500/20 to-transparent" />
                </div>
              </PinContainer>

              <PinContainer title="Government Exams" href="/signup">
                <div className="flex basis-[16rem] flex-col p-4 tracking-tight text-slate-100/50 sm:basis-[20rem] h-[12rem]">
                  <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
                    Sarkari Mode
                  </h3>
                  <div className="text-base !m-0 !p-0 font-normal">
                    <span className="text-slate-500 ">
                      Department-specific syllabus, PYQs, and isolated dashboard for government exam prep.
                    </span>
                  </div>
                  <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-sky-500 via-sky-500/20 to-transparent" />
                </div>
              </PinContainer>
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

          <div className="mt-20 w-full flex items-center justify-center relative z-10">
            <ContainerScroll
              titleComponent={
                <>
                  <h1 className="text-4xl font-semibold text-black dark:text-white">
                    Unleash the power of <br />
                    <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                      Interactive Prep
                    </span>
                  </h1>
                </>
              }
            >
              <div className="h-full relative w-full overflow-hidden bg-white dark:bg-black rounded-2xl flex items-center justify-center">
                <ThreeDCardDemo />
              </div>
            </ContainerScroll>
          </div>
        </main>

        <ProgressiveBlur direction="top" className="h-40 bottom-0 top-auto mt-[-10rem] z-20 pointer-events-none" />

      </div>
      <Footer />
    </div>
  );
}
