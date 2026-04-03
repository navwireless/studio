'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import AppHeader from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
}

type MaxWidthOption = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  maxWidth?: MaxWidthOption;
  showFooter?: boolean;
  /** Extra classes for the main content area */
  contentClassName?: string;
  /** Extra classes for the outer scroll container */
  className?: string;
}

// ── Max width mapping ───────────────────────────────────

const MAX_WIDTH_MAP: Record<MaxWidthOption, string> = {
  sm: 'max-w-screen-sm',   // 640px
  md: 'max-w-screen-md',   // 768px
  lg: 'max-w-screen-lg',   // 1024px
  xl: 'max-w-screen-xl',   // 1280px
  full: 'max-w-full',
};

// ── Breadcrumbs ─────────────────────────────────────────

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-xs text-text-brand-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-text-brand-disabled flex-shrink-0" />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-text-brand-secondary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-text-brand-secondary' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Page Header ─────────────────────────────────────────

function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-text-brand-primary">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-text-brand-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

// ── Component ───────────────────────────────────────────

export function PageShell({
  children,
  title,
  description,
  breadcrumbs,
  maxWidth = 'lg',
  showFooter = true,
  contentClassName,
  className,
}: PageShellProps) {
  return (
    <div className={cn('flex flex-col h-dvh overflow-hidden', className)}>
      {/* Sticky header */}
      <AppHeader />

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-base">
        {/* Main content */}
        <main
          className={cn(
            'mx-auto px-4 md:px-6 py-6 md:py-8',
            MAX_WIDTH_MAP[maxWidth],
            contentClassName
          )}
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} />
          )}
          {title && <PageHeader title={title} description={description} />}
          {children}
        </main>

        {/* Footer */}
        {showFooter && <AppFooter />}
      </div>
    </div>
  );
}

export default PageShell;