// src/app/pricing/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header skeleton */}
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-white/5" />
          <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-80 mx-auto bg-white/5" />
          <Skeleton className="h-5 w-96 mx-auto bg-white/5" />
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-white/5">
              <CardHeader className="space-y-3 pb-4">
                <Skeleton className="h-6 w-20 bg-white/5" />
                <Skeleton className="h-10 w-32 bg-white/5" />
                <Skeleton className="h-4 w-48 bg-white/5" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full bg-white/5" />
                    <Skeleton className="h-4 flex-1 bg-white/5" />
                  </div>
                ))}
                <Skeleton className="h-11 w-full mt-4 bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4 pt-8">
          <Skeleton className="h-8 w-64 mx-auto bg-white/5" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}