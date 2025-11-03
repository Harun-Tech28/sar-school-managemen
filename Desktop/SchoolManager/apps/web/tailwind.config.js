/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC143C', // SAR Red
          600: '#C41230',
          700: '#A01027',
          800: '#7D0D1F',
          900: '#5A0A16',
        },
        sar: {
          red: '#DC143C',
          yellow: '#FFC107',
          gold: '#FFD700',
          teal: '#00897B',
          cream: '#FFF8E1',
        },
        accent: {
          gold: '#FFC107',
          teal: '#00897B',
          cream: '#FFF8E1',
        },
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
      },
    },
  },
  plugins: [],
}
