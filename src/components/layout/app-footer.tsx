'use client';

import React from 'react';
import Link from 'next/link';
import { FindLOSLogo } from '@/components/ui/findlos-logo';
import { BRAND, NAV_LINKS } from '@/styles/design-tokens';
import { cn } from '@/lib/utils';

interface FooterLinkGroup {
    title: string;
    links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}

const FOOTER_GROUPS: FooterLinkGroup[] = [
    { title: 'Product', links: NAV_LINKS.footer.product },
    { title: 'Company', links: NAV_LINKS.footer.company },
    { title: 'Legal', links: NAV_LINKS.footer.legal },
    { title: 'Connect', links: NAV_LINKS.footer.connect },
];

interface AppFooterProps {
    className?: string;
}

export function AppFooter({ className }: AppFooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className={cn(
                'bg-surface-bg border-t border-surface-border print:hidden',
                className
            )}
        >
            <div className="page-container py-12 md:py-16">
                {/* Top section: Logo + link columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand column — takes 2 cols on lg */}
                    <div className="lg:col-span-2">
                        <div className="opacity-70 hover:opacity-100 transition-opacity">
                            <FindLOSLogo variant="full" size="sm" />
                        </div>
                        <p className="mt-3 text-sm text-text-brand-muted leading-relaxed max-w-xs">
                            {BRAND.description}
                        </p>
                    </div>

                    {/* Link columns */}
                    {FOOTER_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-xs font-semibold text-text-brand-secondary uppercase tracking-wider mb-3">
                                {group.title}
                            </h3>
                            <ul className="space-y-2">
                                {group.links.map((link) => {
                                    const isExternal = link.href.startsWith('mailto:') || link.href.startsWith('http');
                                    const isPlaceholder = link.href === '#';

                                    if (isPlaceholder) {
                                        return (
                                            <li key={link.label}>
                                                <span className="text-sm text-text-brand-disabled cursor-default">
                                                    {link.label}
                                                </span>
                                            </li>
                                        );
                                    }

                                    if (isExternal) {
                                        return (
                                            <li key={link.label}>
                                                <a
                                                    href={link.href}
                                                    className="text-sm text-text-brand-muted hover:text-text-brand-primary transition-colors"
                                                    target={link.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-text-brand-muted hover:text-text-brand-primary transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="mt-10 pt-6 border-t border-surface-border">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-text-brand-disabled text-center sm:text-left">
                            © {currentYear} {BRAND.company}. All rights reserved.
                        </p>
                        <p className="text-xs text-text-brand-disabled text-center sm:text-right">
                            Powered by{' '}
                            <a
                                href={BRAND.url}
                                className="text-text-brand-muted hover:text-text-brand-secondary transition-colors"
                            >
                                {BRAND.name}
                            </a>
                            {' '}({BRAND.domain})
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default AppFooter;