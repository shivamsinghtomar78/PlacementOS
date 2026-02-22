// c:\Users\shiva\Downloads\project\PlacementOS\src\components\layout\Footer.tsx
"use client";
import React from "react";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

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

            <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to ace your <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Placement</span>?
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                        Join thousands of students mastering interviews with PlacementOS.
                    </p>
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
