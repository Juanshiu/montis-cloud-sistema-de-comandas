/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          25: '#fffaf5',
          50: '#fef7ee',
          100: '#fdead6',
          200: '#fad2ac',
          300: '#f6b177',
          400: '#f08540',
          500: '#ec6824',
          600: '#dd4f1a',
          700: '#b73c18',
          800: '#92301c',
          900: '#752a1a',
        },
        secondary: {
          25: '#fcfdfe',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
