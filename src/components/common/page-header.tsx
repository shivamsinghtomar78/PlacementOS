"use client";

import { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function PageHeader({
  icon,
  title,
  subtitle,
  right,
  className,
  typewriterWords,
  helpText,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
  typewriterWords?: { text: string; className?: string }[];
  helpText?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
          {icon}
          {typewriterWords?.length ? (
            <TypewriterEffectSmooth
              words={typewriterWords}
              className="my-0 text-2xl font-bold"
              cursorClassName="h-6 bg-indigo-400"
            />
          ) : (
            title
          )}
          {helpText ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 text-slate-400 transition-colors hover:text-white"
                  aria-label="More context"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 border-slate-700 bg-slate-900 text-slate-200">
                <p className="text-xs leading-relaxed">{helpText}</p>
              </PopoverContent>
            </Popover>
          ) : null}
        </h1>
        {subtitle ? <p className="text-slate-400 text-sm mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
