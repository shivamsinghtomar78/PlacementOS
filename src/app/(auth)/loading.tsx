import { Skeleton } from "@/components/ui/skeleton";

export default function AuthRouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-2xl bg-slate-800/60" />
          <Skeleton className="h-7 w-56 bg-slate-800/60" />
          <Skeleton className="h-4 w-72 max-w-full bg-slate-800/40" />
        </div>
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/70 p-6 space-y-4">
          <Skeleton className="h-5 w-40 bg-slate-800/60" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-slate-800/40" />
          ))}
          <Skeleton className="h-10 w-full bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
