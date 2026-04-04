/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/LAYER-1-DESIGN/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'levi-black': '#000000',
        'levi-white': '#FFFFFF',
        'levi-blue': '#4169E1',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
