/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: withOpacity('--bg-canvas-rgb'),
          100: withOpacity('--card-bg-rgb'),
          200: withOpacity('--border-color-rgb'),
          300: withOpacity('--border-color-rgb'),
          400: withOpacity('--text-secondary-rgb'),
          500: withOpacity('--text-secondary-rgb'),
          600: withOpacity('--text-secondary-rgb'),
          700: withOpacity('--border-color-rgb'),
          800: withOpacity('--border-color-rgb'),
          900: withOpacity('--card-bg-rgb'),
          950: withOpacity('--primary-navy-rgb'),
        },
        cyan: {
          50: withOpacity('--accent-orange-rgb'),
          100: withOpacity('--accent-orange-rgb'),
          200: withOpacity('--accent-orange-rgb'),
          300: withOpacity('--accent-orange-rgb'),
          400: withOpacity('--accent-orange-rgb'),
          500: withOpacity('--accent-orange-rgb'),
          600: withOpacity('--accent-orange-rgb'),
          700: withOpacity('--accent-orange-rgb'),
          800: withOpacity('--accent-orange-rgb'),
          900: withOpacity('--accent-orange-rgb'),
          950: withOpacity('--accent-orange-rgb'),
        },
        amber: {
          400: withOpacity('--accent-orange-rgb'),
          500: withOpacity('--accent-orange-rgb'),
          600: withOpacity('--accent-orange-rgb'),
          700: withOpacity('--accent-orange-rgb'),
        },
        orange: {
          500: withOpacity('--accent-orange-rgb'),
          600: withOpacity('--accent-orange-rgb'),
        },
        emerald: {
          400: withOpacity('--success-color-rgb'),
          500: withOpacity('--success-color-rgb'),
          600: withOpacity('--success-color-rgb'),
          700: withOpacity('--success-color-rgb'),
        },
        red: {
          400: withOpacity('--danger-color-rgb'),
          500: withOpacity('--danger-color-rgb'),
          600: withOpacity('--danger-color-rgb'),
        },
        brand: {
          500: withOpacity('--accent-orange-rgb'),
          600: withOpacity('--accent-orange-rgb'),
        },
        fuel: {
          gasoil: 'var(--success-color)',
          sansplomb: 'var(--accent-orange)',
          premium: 'var(--primary-navy)',
        },
      },
    },
  },
  plugins: [],
}
