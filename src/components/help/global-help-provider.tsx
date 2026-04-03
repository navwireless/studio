// src/components/help/global-help-provider.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HelpButton } from './help-button';
import { HelpPanel } from './help-panel';
import { WhatsNewModal } from './whats-new-modal';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useHelpPanel } from '@/hooks/use-help-panel';

/** Pages where the help button should NOT appear */
const EXCLUDED_PATHS = ['/auth/signin', '/auth/error', '/pending-approval', '/suspended', '/rejected'];

export function GlobalHelpProvider() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'admin';

  const onboarding = useOnboarding(userId);
  const helpPanel = useHelpPanel();

  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // Show What's New after page load (only if not showing tour, and has unseen items)
  useEffect(() => {
    if (onboarding.isLoading) return;
    if (onboarding.isTourActive) return;
    if (!onboarding.hasUnseenWhatsNew) return;
    // Only show on main page
    if (pathname !== '/') return;

    const timer = setTimeout(() => {
      setShowWhatsNew(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onboarding.isLoading, onboarding.isTourActive, onboarding.hasUnseenWhatsNew, pathname]);

  const handleCloseWhatsNew = useCallback(() => {
    const itemIds = onboarding.unseenWhatsNew.map((item) => item.id);
    onboarding.markWhatsNewSeen(itemIds);
    setShowWhatsNew(false);
  }, [onboarding]);

  // Don't render on excluded paths
  if (EXCLUDED_PATHS.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <>
      {/* Help FAB — always visible */}
      <HelpButton
        onClick={helpPanel.toggle}
        hasNotification={onboarding.hasUnseenWhatsNew}
      />

      {/* Help Panel — slide-out drawer */}
      <HelpPanel
        isOpen={helpPanel.isOpen}
        onClose={helpPanel.close}
        currentPage={pathname}
        onRestartTour={pathname === '/' ? onboarding.restartTour : undefined}
        isAdmin={isAdmin}
      />

      {/* What's New Modal */}
      <WhatsNewModal
        items={onboarding.unseenWhatsNew}
        isOpen={showWhatsNew && !onboarding.isTourActive && !helpPanel.isOpen}
        onClose={handleCloseWhatsNew}
      />
    </>
  );
}