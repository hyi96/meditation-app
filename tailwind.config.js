/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meditation-blue': '#6366f1',
        'meditation-purple': '#8b5cf6',
        'meditation-pink': '#ec4899',
        'meditation-teal': '#14b8a6',
      }
    },
  },
  plugins: [],
}