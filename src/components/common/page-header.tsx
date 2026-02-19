"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  icon,
  title,
  subtitle,
  right,
  className,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {subtitle ? <p className="text-slate-400 text-sm mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
