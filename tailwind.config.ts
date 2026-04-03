import type { Config } from "tailwindcss";
import plugin from 'tailwindcss/plugin';

export default {
    darkMode: ["class"],
    content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// -----------------------------------------------------------------
  			// Existing shadcn/Radix CSS variable colors — DO NOT MODIFY
  			// -----------------------------------------------------------------
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
        appAccent: {
          DEFAULT: 'hsl(var(--app-accent))',
          foreground: 'hsl(var(--app-accent-foreground))'
        },
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
        sidebar: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

  			// -----------------------------------------------------------------
  			// Brand design tokens — NEW (Phase 8A)
  			// -----------------------------------------------------------------
  			brand: {
  				50: '#E6F0FF',
  				100: '#CCE0FF',
  				200: '#99C2FF',
  				300: '#66A3FF',
  				400: '#3385FF',
  				500: '#0066FF',
  				600: '#0052CC',
  				700: '#003D99',
  				800: '#002966',
  				900: '#001433',
  			},
  			surface: {
  				bg: '#060A10',
  				base: '#0A0F18',
  				card: '#111827',
  				elevated: '#1A2332',
  				overlay: '#243044',
  				border: '#1E293B',
  				'border-light': '#334155',
  			},
  			'text-brand': {
  				primary: '#F8FAFC',
  				secondary: '#CBD5E1',
  				muted: '#64748B',
  				disabled: '#475569',
  				inverse: '#0F172A',
  			},
  			status: {
  				success: '#22C55E',
  				'success-light': '#4ADE80',
  				'success-dark': '#16A34A',
  				danger: '#EF4444',
  				'danger-light': '#FB7185',
  				'danger-dark': '#DC2626',
  				warning: '#F59E0B',
  				'warning-light': '#FCD34D',
  				'warning-dark': '#D97706',
  				info: '#06B6D4',
  				'info-light': '#67E8F9',
  				'info-dark': '#0891B2',
  			},
  			gold: '#FFD700',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        'mono-brand': ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'brand-xs': '0.75rem',
        'brand-sm': '0.8125rem',
        'brand-base': '0.875rem',
        'brand-md': '1rem',
        'brand-lg': '1.125rem',
        'brand-xl': '1.25rem',
        'brand-2xl': '1.5rem',
        'brand-3xl': '1.875rem',
        'brand-4xl': '2.25rem',
      },
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'slide-in-right': {
  				from: { transform: 'translateX(100%)' },
  				to: { transform: 'translateX(0)' },
  			},
  			'slide-out-right': {
  				from: { transform: 'translateX(0)' },
  				to: { transform: 'translateX(100%)' },
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' },
  			},
  			'fade-out': {
  				from: { opacity: '1' },
  				to: { opacity: '0' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
  			'slide-out-right': 'slide-out-right 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
  			'fade-in': 'fade-in 0.2s ease-out',
  			'fade-out': 'fade-out 0.15s ease-in',
  		},
      backdropBlur: {
        '2px': '2px',
      },
      // -----------------------------------------------------------------
      // Brand layout tokens — NEW (Phase 8A)
      // -----------------------------------------------------------------
      maxWidth: {
        'page': '1400px',
      },
      height: {
        'header': '56px',
        'header-mobile': '48px',
      },
      spacing: {
        'header': '56px',
        'header-mobile': '48px',
      },
      zIndex: {
        'header': '200',
        'overlay': '300',
        'modal': '400',
        'popover': '500',
        'toast': '600',
        'tooltip': '700',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 102, 255, 0.15)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.15)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.15)',
        'brand-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'brand-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'brand-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'brand-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      },
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.backdrop-blur-2px': {
          'backdrop-filter': 'blur(2px)',
        },
      })
    })
  ],
} satisfies Config;