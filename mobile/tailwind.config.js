/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        busly: {
          primary: '#F5B800',
          'primary-hover': '#E0A800',
          'primary-light': '#FEF9E7',
          dark: '#1F2937',
          'dark-surface': '#111827',
          bg: '#F8FAFC',
          success: '#16A34A',
          danger: '#DC2626',
        },
      },
    },
  },
  plugins: [],
};
