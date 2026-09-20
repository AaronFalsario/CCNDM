/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.dark-mode'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: 0, transform: 'translateX(40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideInRight: 'slideInRight 0.3s ease-out',
      },
    },
  },
  plugins: [],
}