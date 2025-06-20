"use client";

import React from 'react';
import Link from 'next/link';
import { Home, ListChecks, Cable } from 'lucide-react'; // Icons for the links
import { usePathname } from 'next/navigation'; // To determine current page for active styling
import { cn } from '@/lib/utils';

interface AppNavigationMenuProps {
  isOpen?: boolean; // Parent will likely handle conditional rendering
  onClose: () => void;
  // currentPage prop might not be needed if using usePathname
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: "Single Link Analysis", icon: Home },
  { href: '/bulk-los-analyzer', label: "Bulk LOS Analyzer", icon: ListChecks },
  { href: '/fiber-calculator', label: "Fiber Path Calculator", icon: Cable },
];

const AppNavigationMenu: React.FC<AppNavigationMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname(); // Hook to get current path

  // This component will be conditionally rendered by AppHeader based on its isNavOpen state.
  // So, the isOpen prop here is more for potential internal animation/transition logic if added later.

  return (
    <div className="absolute top-12 right-0 bg-card border-b border-l border-border shadow-lg p-2 w-full md:w-64 md:rounded-bl-lg print:hidden z-40 space-y-1">
      {/* Styling matches the placeholder from previous step, adjusted padding */}
      <nav>
        <ul className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <a
                    onClick={onClose} // Close menu on link click
                    className={cn(
                      "flex items-center w-full p-2 text-sm font-medium rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground hover:text-primary/90"
                    )}
                  >
                    <item.icon className={cn("mr-2 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/90")} />
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AppNavigationMenu;
