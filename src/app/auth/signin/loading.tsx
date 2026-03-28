// src/app/auth/signin/loading.tsx
import { Loader2 } from "lucide-react";

export default function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-white/40">Loading...</p>
      </div>
    </div>
  );
}