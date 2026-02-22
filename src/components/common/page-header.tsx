"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  icon,
  title,
  subtitle,
  right,
  className,
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
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2 tracking-tight">
          {icon}
          <span>{title}</span>
        </h1>
        {subtitle ? <p className="text-slate-400 text-sm mt-1 max-w-2xl">{subtitle}</p> : null}
        {helpText ? <p className="text-xs text-slate-500 mt-1.5 max-w-2xl">{helpText}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
