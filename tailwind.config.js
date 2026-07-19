/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/index.html', './client/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          gold: '#C4A35A',
          'gold-light': '#D4B878',
          'gold-dark': '#A8893E',
        },
        dark: {
          bg: '#0A0A0A',
          card: '#141414',
          border: '#2A2A2A',
          muted: '#1A1A1A',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'slide-in-left': 'slideInLeft 0.35s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        xs: '375px',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        100: '25rem',
        112: '28rem',
        128: '32rem',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        luxury: '0 4px 40px rgba(0, 0, 0, 0.12)',
        'luxury-lg': '0 8px 60px rgba(0, 0, 0, 0.18)',
        'luxury-dark': '0 4px 40px rgba(0, 0, 0, 0.6)',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
      },
    },
  },
  plugins: [],
}
