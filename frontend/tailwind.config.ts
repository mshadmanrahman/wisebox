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
  			'1': '0.25rem',   // 4px
  			'2': '0.5rem',    // 8px
  			'3': '0.75rem',   // 12px
  			'4': '1rem',      // 16px
  			'5': '1.25rem',   // 20px
  			'6': '1.5rem',    // 24px
  			'8': '2rem',      // 32px
  			'10': '2.5rem',   // 40px
  			'12': '3rem',     // 48px
  			'16': '4rem',     // 64px
  			'20': '5rem',     // 80px
  		},
  		fontSize: {
  			'xs': '0.75rem',    // 12px
  			'sm': '0.875rem',   // 14px
  			'base': '1rem',     // 16px
  			'lg': '1.125rem',   // 18px
  			'xl': '1.25rem',    // 20px
  			'2xl': '1.5rem',    // 24px
  			'3xl': '1.875rem',  // 30px
  			'4xl': '2.25rem',   // 36px
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
  				// Dark theme colors
  				background: {
  					DEFAULT: '#0A1628', // Primary dark navy
  					darker: '#050B14', // Even darker for depth
  					lighter: '#1A2942', // Slightly lighter cards
  					card: '#141E35', // Card backgrounds
  					input: '#1E293B', // Input fields
  				},
  				primary: {
  					DEFAULT: '#0EA5E9', // Cyan/blue accent
  					hover: '#0284C7',
  					light: '#7DD3FC',
  					50: '#F0F9FF',
  					100: '#E0F2FE',
  					200: '#BAE6FD',
  					300: '#7DD3FC',
  					400: '#38BDF8',
  					500: '#0EA5E9',
  					600: '#0284C7',
  					700: '#0369A1',
  					800: '#075985',
  					900: '#0C4A6E',
  				},
  				secondary: {
  					DEFAULT: '#F59E0B',
  					hover: '#D97706',
  					light: '#FDE68A',
  				},
  				status: {
  					success: '#22C55E',
  					warning: '#EAB308',
  					danger: '#EF4444',
  				},
  				text: {
  					primary: '#FFFFFF', // White for headings
  					secondary: '#94A3B8', // Light gray for body text
  					muted: '#64748B', // Even lighter gray
  					disabled: '#475569',
  				},
  				border: {
  					DEFAULT: '#1E293B', // Subtle borders
  					light: '#334155',
  					focus: '#0EA5E9',
  				},
  			}
  		},
  		borderRadius: {
  			'sm': '0.25rem',   // 4px
  			'md': '0.5rem',    // 8px
  			'lg': '0.75rem',   // 12px
  			'xl': '1rem',      // 16px
  			'2xl': '1.5rem',   // 24px
  			'full': '9999px',  // Pills/circles
  		},
  		boxShadow: {
  			'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  			'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  			'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  			'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		backgroundImage: {
  			'gradient-aurora': 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
  			'gradient-purple': 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
  			'gradient-blue': 'linear-gradient(135deg, #667EEA 0%, #F093FB 100%)',
  			'gradient-teal': 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
  			'gradient-orange': 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  			'gradient-green': 'linear-gradient(135deg, #30CDC3 0%, #A8FF78 100%)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
