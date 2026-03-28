// src/app/terms/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-white/5 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-white/5" />
          <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <Skeleton className="h-4 w-40 bg-white/5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <Skeleton className="h-4 w-full bg-white/5" />
            <Skeleton className="h-4 w-5/6 bg-white/5" />
            <Skeleton className="h-4 w-4/6 bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}