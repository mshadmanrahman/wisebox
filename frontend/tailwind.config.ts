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
          background: {
            DEFAULT: '#132344',
            darker: '#0C1A34',
            lighter: '#1E3050',
            card: '#192E4C',
            input: '#1C3250',
          },
          primary: {
            DEFAULT: '#2A9FD6',
            hover: '#2388B8',
            light: '#7ECDE8',
            50: '#EEF8FC',
            100: '#D5EFF8',
            200: '#ABE0F1',
            300: '#7ECDE8',
            400: '#4AB8DC',
            500: '#2A9FD6',
            600: '#2388B8',
            700: '#1C6E96',
            800: '#165775',
            900: '#11435A',
          },
          secondary: {
            DEFAULT: '#C69239',
            hover: '#A67A2F',
            light: '#E8D4A8',
            400: '#D4A348',
            500: '#C69239',
            600: '#A67A2F',
            700: '#876226',
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
            primary: '#FFFFFF',
            secondary: '#939EAD',
            muted: '#6B7785',
            disabled: '#475569',
            inverse: '#0F172A',
          },
          border: {
            DEFAULT: '#1E2A38',
            light: '#2E3A48',
            focus: '#2A9FD6',
          },
          overlay: {
            light: 'rgba(0, 0, 0, 0.3)',
            medium: 'rgba(0, 0, 0, 0.5)',
            heavy: 'rgba(0, 0, 0, 0.7)',
          },
        }
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
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
        'gradient-aurora': 'linear-gradient(135deg, #4A6FA5 0%, #6B4E8A 50%, #C77DB8 100%)',
        'gradient-purple': 'linear-gradient(135deg, #4A6FA5 0%, #6B4E8A 100%)',
        'gradient-blue': 'linear-gradient(135deg, #4A6FA5 0%, #C77DB8 100%)',
        'gradient-teal': 'linear-gradient(135deg, #3A8FD6 0%, #14B8A6 100%)',
        'gradient-orange': 'linear-gradient(135deg, #D97080 0%, #D4A348 100%)',
        'gradient-green': 'linear-gradient(135deg, #2BB5A8 0%, #7FCF6B 100%)',
        'gradient-service-consultation': 'linear-gradient(135deg, #2388B8 0%, #1C6E96 50%, #165775 100%)',
        'gradient-service-legal': 'linear-gradient(135deg, #059669 0%, #0D9488 50%, #2388B8 100%)',
        'gradient-service-admin': 'linear-gradient(135deg, #7435BD 0%, #6228B0 50%, #4030A0 100%)',
        'gradient-service-default': 'linear-gradient(135deg, #3A4A5C 0%, #2E3A48 50%, #1E2A38 100%)',
        'gradient-card-1': 'linear-gradient(135deg, rgba(17,67,90,0.8) 0%, rgba(42,159,214,0.4) 50%, #132344 100%)',
        'gradient-card-2': 'linear-gradient(135deg, rgba(6,95,70,0.8) 0%, rgba(13,148,136,0.6) 50%, #132344 100%)',
        'gradient-card-3': 'linear-gradient(135deg, rgba(116,53,189,0.8) 0%, rgba(98,40,176,0.6) 50%, #132344 100%)',
        'gradient-card-4': 'linear-gradient(135deg, rgba(166,122,47,0.8) 0%, rgba(135,98,38,0.6) 50%, #132344 100%)',
        'gradient-auth-primary': 'linear-gradient(to bottom right, #0D9488 0%, #115E59 100%)',
        'gradient-auth-admin': 'linear-gradient(to bottom right, #A67A2F 0%, #876226 100%)',
        'gradient-auth-consultant': 'linear-gradient(to bottom right, #059669 0%, #0D9488 100%)',
        'gradient-icon-primary': 'linear-gradient(to bottom right, #4AB8DC 0%, #2A9FD6 100%)',
        'gradient-icon-secondary': 'linear-gradient(to bottom right, #D4A348 0%, #C69239 100%)',
        'gradient-icon-accent': 'linear-gradient(to bottom right, #34D399 0%, #14B8A6 100%)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
