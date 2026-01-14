/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // 파란색 (경로)
          light: '#60A5FA',
          dark: '#2563EB',
        },
        success: {
          DEFAULT: '#22C55E', // 녹색 (공간, 가능)
          light: '#4ADE80',
          dark: '#16A34A',
        },
        warning: {
          DEFAULT: '#F59E0B', // 노란색 (주의)
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444', // 빨간색 (불가)
          light: '#F87171',
          dark: '#DC2626',
        },
      },
    },
  },
  plugins: [],
}
