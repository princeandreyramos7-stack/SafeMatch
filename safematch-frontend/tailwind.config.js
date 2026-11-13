/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				50: '#e6f7f5',
  				100: '#b3e8e0',
  				200: '#80d9cb',
  				300: '#4dcab6',
  				400: '#1abba1',
  				500: '#0d9488',
  				600: '#0a766a',
  				700: '#08584d',
  				800: '#053a30',
  				900: '#031c18'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			success: {
  				DEFAULT: '#10b981',
  				light: '#d1fae5',
  				dark: '#047857'
  			},
  			warning: {
  				DEFAULT: '#f59e0b',
  				light: '#fef3c7',
  				dark: '#d97706'
  			},
  			error: {
  				DEFAULT: '#ef4444',
  				light: '#fee2e2',
  				dark: '#dc2626'
  			},
  			info: {
  				DEFAULT: '#3b82f6',
  				light: '#dbeafe',
  				dark: '#2563eb'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)'
  		},
  		boxShadow: {
  			'soft': '0 2px 15px 0 rgba(0, 0, 0, 0.05)',
  			'soft-lg': '0 10px 40px 0 rgba(0, 0, 0, 0.08)',
  			'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  			'glow': '0 0 20px rgba(13, 148, 136, 0.3)',
  			'glow-lg': '0 0 40px rgba(13, 148, 136, 0.4)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'slide-up': 'slideUp 0.3s ease-out',
  			'slide-down': 'slideDown 0.3s ease-out',
  			'slide-in': 'slideIn 0.3s ease-out',
  			'scale-in': 'scaleIn 0.2s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'bounce-soft': 'bounceSoft 1s ease-in-out infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			slideUp: {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideDown: {
  				'0%': { transform: 'translateY(-10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			slideIn: {
  				'0%': { transform: 'translateX(-10px)', opacity: '0' },
  				'100%': { transform: 'translateX(0)', opacity: '1' }
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			bounceSoft: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' }
  			}
  		}
  	}
  },
  plugins: [],
}
