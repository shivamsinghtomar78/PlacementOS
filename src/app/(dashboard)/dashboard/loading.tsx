import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardRouteLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-slate-800/60" />
        <Skeleton className="h-4 w-96 max-w-full bg-slate-800/40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl bg-slate-800/50" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-2xl bg-slate-800/50" />
        <Skeleton className="h-72 rounded-2xl bg-slate-800/50" />
      </div>

      <Skeleton className="h-72 rounded-2xl bg-slate-800/50" />
    </div>
  );
}
