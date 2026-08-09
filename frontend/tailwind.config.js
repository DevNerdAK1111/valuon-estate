/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        valuon: {
          green: '#13381A',
          'green-light': '#276749',
          gold: '#A37841',
          cream: '#FAF8F5',
          bg: '#F7F4EC',
          border: '#E2D9CE',
          red: '#9B2C2C',
        },
      },
    },
  },
  plugins: [],
};
