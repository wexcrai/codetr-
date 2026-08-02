import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <div className="glass-card p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Chart + Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="glass-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
