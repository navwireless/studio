// src/components/layout/footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-white/25 text-center sm:text-left">
            © {new Date().getFullYear()} Nav Wireless Technologies Pvt. Ltd.
            All rights reserved.
          </p>

          {/* Links */}
          <nav className="flex items-center gap-1 text-xs">
            <Link
              href="/terms"
              className="text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              Terms
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/privacy"
              className="text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              Privacy
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/pricing"
              className="text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
            >
              Pricing
            </Link>
          </nav>

          {/* Made by */}
          <p className="text-xs text-white/15 text-center sm:text-right">
            Made by Raj Patel
          </p>
        </div>
      </div>
    </footer>
  );
}