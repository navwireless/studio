// =============================================================================
// FindLOS Design Tokens — Single Source of Truth
// =============================================================================
// Every component, page, and styled element in the app should reference these
// tokens. Tailwind config extends from these values. Components can import
// directly for JS usage (e.g., inline styles, PDF generation, dynamic values).
// =============================================================================

export const BRAND = {
    name: 'FindLOS',
    company: 'Nav Wireless Technologies Pvt. Ltd.',
    domain: 'findlos.com',
    url: 'https://findlos.com',
    tagline: 'Line-of-Sight Feasibility Analysis',
    description: 'Professional terrain analysis and FSO link planning platform',
    supportEmail: 'support@findlos.com',
    adminEmail: 'admin@navwireless.com',
} as const;

export const COLORS = {
    // ---------------------------------------------------------------------------
    // Primary brand palette
    // ---------------------------------------------------------------------------
    primary: {
        50: '#E6F0FF',
        100: '#CCE0FF',
        200: '#99C2FF',
        300: '#66A3FF',
        400: '#3385FF',
        500: '#0066FF',    // Main brand blue
        600: '#0052CC',
        700: '#003D99',
        800: '#002966',
        900: '#001433',
    },

    // ---------------------------------------------------------------------------
    // Semantic status colors
    // ---------------------------------------------------------------------------
    success: {
        light: '#4ADE80',
        DEFAULT: '#22C55E',  // Feasible / Pass
        dark: '#16A34A',
        bg: 'rgba(34, 197, 94, 0.1)',
        border: 'rgba(34, 197, 94, 0.3)',
    },
    danger: {
        light: '#FB7185',
        DEFAULT: '#EF4444',  // Blocked / Fail
        dark: '#DC2626',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
        light: '#FCD34D',
        DEFAULT: '#F59E0B',
        dark: '#D97706',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
        light: '#67E8F9',
        DEFAULT: '#06B6D4',
        dark: '#0891B2',
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.3)',
    },

    // ---------------------------------------------------------------------------
    // Surface system (dark theme — primary use case)
    // ---------------------------------------------------------------------------
    surface: {
        bg: '#060A10',           // Deepest background (page edges, footer)
        base: '#0A0F18',         // Main page background
        card: '#111827',         // Card / panel background
        elevated: '#1A2332',     // Elevated card, modal, dropdown background
        overlay: '#243044',      // Hover states, selected items
        border: '#1E293B',       // Default border
        borderLight: '#334155',  // Lighter border for emphasis
    },

    // ---------------------------------------------------------------------------
    // Text system
    // ---------------------------------------------------------------------------
    text: {
        primary: '#F8FAFC',      // Main text (high contrast)
        secondary: '#CBD5E1',    // Secondary text
        muted: '#64748B',        // Muted / placeholder text
        disabled: '#475569',     // Disabled text
        inverse: '#0F172A',      // Text on light backgrounds
    },

    // ---------------------------------------------------------------------------
    // Special / accent
    // ---------------------------------------------------------------------------
    gold: '#FFD700',           // Pro badge accent
    pro: {
        from: '#FFD700',
        to: '#FFA500',
        gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
    },
} as const;

export const TYPOGRAPHY = {
    fontFamily: {
        heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
    },
    fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.8125rem',   // 13px
        base: '0.875rem',  // 14px — default body text (dense UI)
        md: '1rem',        // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },
    lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
    },
} as const;

export const SPACING = {
    page: {
        maxWidth: '1400px',
        paddingX: '1.5rem',       // Default horizontal padding
        paddingXMobile: '1rem',   // Mobile horizontal padding
    },
    header: {
        height: '56px',           // Global header height
        heightMobile: '48px',
    },
    sidebar: {
        width: '320px',           // Analysis page side panel width
        widthCollapsed: '0px',
    },
    section: {
        gap: '2rem',              // Gap between page sections
        gapMobile: '1.5rem',
    },
} as const;

export const RADIUS = {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px',
} as const;

export const SHADOWS = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    glow: {
        primary: '0 0 20px rgba(0, 102, 255, 0.15)',
        success: '0 0 20px rgba(34, 197, 94, 0.15)',
        danger: '0 0 20px rgba(239, 68, 68, 0.15)',
    },
} as const;

export const ANIMATION = {
    duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
} as const;

export const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

export const Z_INDEX = {
    base: 0,
    dropdown: 50,
    sticky: 100,
    header: 200,
    overlay: 300,
    modal: 400,
    popover: 500,
    toast: 600,
    tooltip: 700,
} as const;

// =============================================================================
// Navigation definitions — used by header, mobile nav, footer
// =============================================================================
export const NAV_LINKS = {
    main: [
        { label: 'Analysis', href: '/', matchExact: true },
        { label: 'Bulk', href: '/bulk-los-analyzer' },
        { label: 'Fiber', href: '/fiber-calculator' },
        { label: 'Pricing', href: '/pricing' },
    ],
    footer: {
        product: [
            { label: 'Analysis', href: '/' },
            { label: 'Bulk Analyzer', href: '/bulk-los-analyzer' },
            { label: 'Fiber Calculator', href: '/fiber-calculator' },
            { label: 'Pricing', href: '/pricing' },
        ],
        company: [
            { label: 'About Us', href: '#' },
            { label: 'Our Devices', href: '#' },
            { label: 'About the Maker', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        legal: [
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
        ],
        connect: [
            { label: 'Email', href: 'mailto:support@findlos.com' },
            { label: 'WhatsApp', href: '#' },
        ],
    },
} as const;