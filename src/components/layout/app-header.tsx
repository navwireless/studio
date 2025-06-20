
"use client";

import React, { useState } from 'react'; // Added useState
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react'; // Added Bell
import AppNavigationMenu from './AppNavigationMenu'; // Imported AppNavigationMenu
import NotificationCenter from './NotificationCenter'; // Removed { Notification } type import

interface AppHeaderProps {
  // Removed onToggleHistory, onClearMap, isHistoryPanelSupported
  // Removed currentPage as AppNavigationMenu uses usePathname
}

export default function AppHeader({ 
  // Removed onToggleHistory, onClearMap, isHistoryPanelSupported
  // Removed currentPage
}: AppHeaderProps) { // Removed currentPage from destructuring
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  return (
    <>
      <header className="bg-transparent px-2 py-1 h-12 flex items-center justify-between hover:bg-slate-900/10 transition-all duration-200 z-50 relative print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Home">
            <Image
              src="https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png"
              alt="Nav Wireless Technologies Pvt. Ltd. Logo"
              width={100}
              height={24}
              className="object-contain cursor-pointer"
              data-ai-hint="company logo"
          />
        </Link>
        <h1 className="text-base font-medium tracking-wider text-slate-100/90 block"> {/* Made title always visible */}
          LiFi Link Pro
        </h1>
      </div>
      <nav className="flex items-center gap-1"> {/* Added gap-1 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
          aria-label={isNotificationCenterOpen ? "Close notification center" : "Open notification center"}
          className="text-foreground hover:text-primary"
        >
          <Bell className="h-6 w-6" />
          {/* Optional: Add a badge here later for unread count */}
        </Button>

        {/* Existing Menu (hamburger) Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsNavOpen(!isNavOpen)} // Toggle state
          aria-label={isNavOpen ? "Close navigation menu" : "Open navigation menu"} // Dynamic aria-label
          className="text-foreground hover:text-primary" // Ensure good visibility
        >
          <Menu className="h-6 w-6" />
        </Button>
      </nav>
    </header>
    {isNavOpen && (
      <AppNavigationMenu
        onClose={() => setIsNavOpen(false)}
      />
    )}
    {isNotificationCenterOpen && (
      <NotificationCenter
        isOpen={isNotificationCenterOpen} // Pass state
        onClose={() => setIsNotificationCenterOpen(false)} // Handler to close
        // notifications prop removed
        // onClearAll prop removed
      />
    )}
  </>
  );
}
