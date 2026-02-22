"use client";

import React from "react";
import { Flame, TrendingUp } from "lucide-react";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

const subjects = [
  { name: "DSA", progress: 72, tone: "from-indigo-500 to-indigo-300" },
  { name: "Core Mechanical", progress: 58, tone: "from-cyan-500 to-cyan-300" },
  { name: "Aptitude", progress: 81, tone: "from-emerald-500 to-emerald-300" },
];

export function ThreeDCardDemo() {
  return (
    <CardContainer containerClassName="py-4" className="w-full">
      <CardBody className="h-auto w-full max-w-[34rem] rounded-2xl border border-slate-700/80 bg-slate-950/95 p-4 sm:p-6 shadow-[0_20px_60px_rgba(2,6,23,0.65)]">
        <CardItem
          translateZ={40}
          className="text-xs uppercase tracking-[0.18em] text-slate-500"
        >
          PlacementOS Live Surface
        </CardItem>

        <CardItem
          translateZ={55}
          as="h3"
          className="mt-2 text-xl font-semibold text-white"
        >
          Intelligent Prep Dashboard
        </CardItem>

        <CardItem
          as="p"
          translateZ={65}
          className="text-slate-400 text-sm mt-2 leading-relaxed"
        >
          A clean, focus-first command center for placement and Sarkari preparation.
        </CardItem>

        <CardItem
          translateZ={80}
          className="mt-5 rounded-xl border border-slate-700 bg-slate-900/80 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Today</p>
              <p className="text-white text-lg font-semibold mt-1">4 / 6 tasks complete</p>
            </div>
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-indigo-300 text-xs font-medium">
              +18% this week
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {subjects.map((subject) => (
              <div key={subject.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{subject.name}</span>
                  <span className="text-slate-400">{subject.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${subject.tone}`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardItem>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <CardItem
            translateZ={35}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300"
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            16-day streak
          </CardItem>

          <CardItem
            translateZ={35}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Open Dashboard
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

