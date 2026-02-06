import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      // ============================================
      // MAAL LINE - STREET DARK PALETTE
      // ============================================
      colors: {
        // Backgrounds
        background: {
          primary: '#0A0A0A',
          secondary: '#141414',
          tertiary: '#1F1F1F',
        },
        // Text
        foreground: {
          primary: '#FFFFFF',
          secondary: '#A3A3A3',
          muted: '#525252',
        },
        // Accent - Naranja fuego
        accent: {
          primary: '#FF3D00',
          secondary: '#FF6B35',
        },
        // Semantic
        success: '#22C55E',
        warning: '#FBBF24',
        error: '#EF4444',
        // Borders
        border: {
          DEFAULT: '#262626',
          hover: '#404040',
        },
        // Neutral scale
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },

      // ============================================
      // TYPOGRAPHY
      // ============================================
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },

      fontSize: {
        // Custom sizes
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px
        '7xl': ['4.5rem', { lineHeight: '1' }],          // 72px
        '8xl': ['6rem', { lineHeight: '1' }],            // 96px
        '9xl': ['8rem', { lineHeight: '1' }],            // 128px
      },

      // ============================================
      // SPACING (8px base grid)
      // ============================================
      spacing: {
        '13': '3.25rem',  // 52px
        '15': '3.75rem',  // 60px
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },

      // ============================================
      // BORDER RADIUS
      // ============================================
      borderRadius: {
        sm: '0.125rem',  // 2px - Tight badges
        DEFAULT: '0.25rem', // 4px - Buttons, inputs
        md: '0.375rem',  // 6px - Cards
        lg: '0.5rem',    // 8px - Modals
      },

      // ============================================
      // SHADOWS
      // ============================================
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.5)',
        DEFAULT: '0 4px 6px rgba(0,0,0,0.4)',
        md: '0 8px 16px rgba(0,0,0,0.4)',
        lg: '0 16px 32px rgba(0,0,0,0.5)',
        glow: '0 0 20px rgba(255,61,0,0.3)',
        'glow-lg': '0 0 40px rgba(255,61,0,0.4)',
      },

      // ============================================
      // Z-INDEX
      // ============================================
      zIndex: {
        dropdown: '100',
        sticky: '200',
        drawer: '300',
        modal: '400',
        toast: '500',
        tooltip: '600',
      },

      // ============================================
      // ANIMATIONS
      // ============================================
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'marquee': 'marquee 30s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      // ============================================
      // TRANSITIONS
      // ============================================
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-expo': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      // ============================================
      // ASPECT RATIOS
      // ============================================
      aspectRatio: {
        'product': '3 / 4',     // Standard product card
        'hero': '16 / 9',       // Hero sections
        'square': '1 / 1',      // Square images
        'portrait': '4 / 5',    // Portrait/editorial
      },

      // ============================================
      // CONTAINER
      // ============================================
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
        },
      },
    },
  },
  plugins: [
    // Custom plugin for street-specific utilities
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        // Text balance for headings
        '.text-balance': {
          'text-wrap': 'balance',
        },
        // Hide scrollbar but allow scrolling
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Gradient text
        '.text-gradient': {
          'background': 'linear-gradient(to right, #FF3D00, #FF6B35)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      })
    },
  ],
}

export default config
