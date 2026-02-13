/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-base': '#12274E',
        'brand-text': '#ffffff',
        'brand-primary': '#38BDF8',
        'brand-accent-green': '#8AE800',
        'brand-accent-cyan': '#00E4EE',
        'brand-accent-orange': '#FFA123',
        'brand-accent-pink': '#FF78D3',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
