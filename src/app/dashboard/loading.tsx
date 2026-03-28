// src/app/dashboard/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header skeleton */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-white/5" />
          <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page title */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-white/5" />
          <Skeleton className="h-4 w-72 bg-white/5" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-white/5">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-white/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-white/5" />
                <Skeleton className="h-3 w-32 mt-2 bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription card */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-64 bg-white/5" />
            <Skeleton className="h-10 w-40 bg-white/5" />
          </CardContent>
        </Card>

        {/* History table */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <Skeleton className="h-6 w-36 bg-white/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24 bg-white/5" />
                <Skeleton className="h-4 flex-1 bg-white/5" />
                <Skeleton className="h-4 w-16 bg-white/5" />
                <Skeleton className="h-4 w-20 bg-white/5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}