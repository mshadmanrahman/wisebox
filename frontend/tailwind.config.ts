import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      colors: {
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
        wisebox: {
          primary: {
            DEFAULT: '#3B8F7A',
            hover: '#2F7563',
            light: '#8FC4B7',
            50: '#F0F9F6',
            100: '#D8F0E8',
            200: '#B0E1D1',
            300: '#8FC4B7',
            400: '#5DA899',
            500: '#3B8F7A',
            600: '#2F7563',
            700: '#245C4E',
            800: '#1A443A',
            900: '#112E28',
          },
          secondary: {
            DEFAULT: '#D4943A',
            hover: '#B87E30',
            light: '#EDD4AA',
          },
          background: {
            DEFAULT: '#FAF9F7',
            darker: '#F3F1EE',
            lighter: '#FFFFFF',
            card: '#FFFFFF',
            input: '#F3F1EE',
          },
          accent: {
            emerald: '#10B981',
            'emerald-light': '#34D399',
            'emerald-dark': '#059669',
            violet: '#8B5CF6',
            'violet-light': '#A78BFA',
            'violet-dark': '#7C3AED',
            teal: '#14B8A6',
            'teal-light': '#2DD4BF',
            'teal-dark': '#0D9488',
          },
          status: {
            success: '#2EA85A',
            'success-light': '#B0E8C4',
            warning: '#D4A31C',
            'warning-light': '#F5E8C2',
            danger: '#D94D4D',
            'danger-light': '#F5CBCB',
            info: '#4A80E0',
            scheduled: '#9650E0',
            'scheduled-light': '#EDE4FC',
            'scheduled-dark': '#7435BD',
            pending: '#D4A31C',
          },
          text: {
            primary: '#1C1B22',
            secondary: '#706F76',
            muted: '#706F76',
            disabled: '#A09FA6',
            inverse: '#FAF9F7',
          },
          border: {
            DEFAULT: '#E8E6E1',
            light: '#F3F1EE',
            focus: '#3B8F7A',
          },
          overlay: {
            light: 'rgba(0, 0, 0, 0.3)',
            medium: 'rgba(0, 0, 0, 0.5)',
            heavy: 'rgba(0, 0, 0, 0.7)',
          },
        }
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(28, 27, 34, 0.04)',
        'md': '0 4px 16px rgba(28, 27, 34, 0.06)',
        'lg': '0 8px 32px rgba(28, 27, 34, 0.08)',
        'xl': '0 16px 48px rgba(28, 27, 34, 0.1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      backgroundImage: {
        'gradient-auth-primary': 'linear-gradient(to bottom right, #3B8F7A 0%, #245C4E 100%)',
        'gradient-auth-admin': 'linear-gradient(to bottom right, #D4943A 0%, #B87E30 100%)',
        'gradient-auth-consultant': 'linear-gradient(to bottom right, #059669 0%, #0D9488 100%)',
        'gradient-icon-primary': 'linear-gradient(to bottom right, #5DA899 0%, #3B8F7A 100%)',
        'gradient-icon-secondary': 'linear-gradient(to bottom right, #EDD4AA 0%, #D4943A 100%)',
        'gradient-icon-accent': 'linear-gradient(to bottom right, #34D399 0%, #14B8A6 100%)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
