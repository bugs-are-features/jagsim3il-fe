/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // 타이틀용 Jua 폰트 (app/_layout.js에서 로드)
        jua: ['Jua_400Regular'],
        gowunDodum: ['GowunDodum_400Regular'],
        sans: ['GowunDodum_400Regular'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6A3D', // 로고 코랄 오렌지
          dark: '#E0542B', // 어두운 코랄 (pressed/강조)
          light: '#FFEDE6', // 연한 피치 (배경/배지)
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
