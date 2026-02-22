// c:\Users\shiva\Downloads\project\PlacementOS\src\components\layout\Footer.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import NumberTicker from "@/components/ui/number-ticker";
import { ProgressiveBlur } from "@/components/custom/ProgressiveBlur";
import { ShaderBackground } from "@/components/custom/shader-background";

const footerTypewriter = [
    { text: "Ship" },
    { text: "your" },
    { text: "best", className: "text-indigo-300" },
    { text: "interview", className: "text-cyan-300" },
    { text: "season" },
];

const footerStats = [
    { label: "Active learners", value: 18500, suffix: "+" },
    { label: "Sessions tracked", value: 942000, suffix: "+" },
    { label: "Subjects mapped", value: 128, suffix: "" },
];

export const Footer = () => {
    return (
        <footer className="relative w-full overflow-hidden bg-slate-950 px-8 py-20 lg:px-24">
            <div className="absolute inset-0 z-0">
                <BackgroundGradientAnimation
                    gradientBackgroundStart="rgb(5, 5, 10)"
                    gradientBackgroundEnd="rgb(10, 10, 15)"
                    firstColor="30, 30, 80"
                    secondColor="50, 20, 100"
                    thirdColor="10, 80, 100"
                    fourthColor="60, 20, 100"
                    fifthColor="20, 60, 120"
                    size="100%"
                    blendingValue="hard-light"
                    className="opacity-30 mix-blend-screen"
                />
            </div>
            <ShaderBackground className="z-[1] opacity-70" />
            <ProgressiveBlur direction="bottom" className="z-[3] h-32" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to ace your <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Placement</span>?
                    </h2>
                    <div className="mt-3 flex justify-center">
                        <TypewriterEffectSmooth
                            words={footerTypewriter}
                            className="my-0 text-sm sm:text-base"
                            cursorClassName="h-4 bg-indigo-400"
                        />
                    </div>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                        Join thousands of students mastering interviews with PlacementOS.
                    </p>
                </div>

                <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
                    {footerStats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.4, delay: idx * 0.08 }}
                            className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-4 text-center backdrop-blur-md"
                        >
                            <p className="text-xl font-semibold text-white tabular-nums">
                                <NumberTicker value={stat.value} className="text-white" />
                                {stat.suffix}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <a
                        href="/signup"
                        className="rounded-full bg-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started Free
                    </a>
                </div>

                <div className="mt-16 w-full max-w-5xl border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white tracking-tight">
                            Placement<span className="text-indigo-400">OS</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 text-center md:text-left">
                        &copy; {new Date().getFullYear()} PlacementOS. Built for success.
                    </p>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
