/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        cream: '#F4EBD0',
        ink: '#1A1A1A',
        rust: '#C84B31',
        mustard: '#E8A53D',
        forest: '#2C5530',
        court: '#3B6BA5',
      },
    },
  },
  plugins: [],
};
