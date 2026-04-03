'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { FindLOSLogo } from '@/components/ui/findlos-logo';
import { NavLinks } from '@/components/layout/nav-links';
import { CreditsBadge } from '@/components/layout/credits-badge';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNav } from '@/components/layout/mobile-nav';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  /** If true, renders a more compact version (used on analysis page) */
  compact?: boolean;
  className?: string;
}

export default function AppHeader({ compact = false, className }: AppHeaderProps) {
  const { user, isAuthenticated, isApproved } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-header w-full print:hidden flex-shrink-0',
          'bg-surface-card border-b border-surface-border',
          compact ? 'h-header-mobile md:h-header' : 'h-header',
          className
        )}
      >
        <div className="page-container h-full flex items-center justify-between gap-4">
          {/* ── Left: Logo + Nav ── */}
          <div className="flex items-center gap-1 md:gap-2 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center flex-shrink-0 rounded-lg p-1 hover:bg-surface-overlay/50 transition-colors"
              aria-label="FindLOS — Go to homepage"
            >
              {/* Full logo on desktop and mobile to keep branding visible */}
              <span className="hidden md:block">
                <FindLOSLogo variant="full" size="sm" />
              </span>
              <span className="block md:hidden">
                <FindLOSLogo variant="full" size="sm" className="w-[108px]" />
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:block ml-2">
              <NavLinks isApproved={isApproved} />
            </div>
          </div>

          {/* ── Right: Credits + User + Hamburger ── */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Credits badge (desktop only) */}
            {isAuthenticated && user && (
              <div className="hidden sm:block">
                <CreditsBadge credits={user.credits} plan={user.plan} />
              </div>
            )}

            {/* User menu (desktop) */}
            {isAuthenticated && user ? (
              <div className="hidden md:block" data-tour="user-menu">
                <UserMenu user={user} />
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden md:flex items-center text-brand-sm font-medium text-brand-400 hover:text-brand-300 px-3 py-1.5 rounded-md border border-brand-500/20 hover:bg-brand-500/10 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-md text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
      />
    </>
  );
}