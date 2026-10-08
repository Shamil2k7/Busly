/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
