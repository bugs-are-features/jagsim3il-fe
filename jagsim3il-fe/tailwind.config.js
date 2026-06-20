/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B5BD6',
          dark: '#4747B3',
          light: '#EEEEFB',
        },
        ink: {
          DEFAULT: '#1A1A2E',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};
