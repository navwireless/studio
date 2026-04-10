// src/app/loading.tsx
import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">Loading FindLOS...</p>
          <p className="text-xs text-muted-foreground">
            Preparing your workspace
          </p>
        </div>
      </div>
    </div>
  );
}