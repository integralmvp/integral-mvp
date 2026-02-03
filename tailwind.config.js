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
        // 사이버펑크 테마 컬러
        cyber: {
          cyan: '#00F0FF',      // 메인 형광 청록
          'cyan-dim': '#00B8C4', // 어두운 청록
          'cyan-glow': '#00FFFF', // 글로우 효과용
          dark: '#0A0A0F',      // 메인 배경 (거의 검정)
          'dark-lighter': '#12121A', // 약간 밝은 배경
          'dark-card': '#161620', // 카드 배경
          border: '#1E3A4A',    // 기본 보더
          'border-bright': '#00D4FF', // 강조 보더
          text: '#E0F7FA',      // 밝은 텍스트
          'text-dim': '#7FDBDF', // 어두운 텍스트
        },
      },
      keyframes: {
        'slot-drop': {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(10%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slot-drop': 'slot-drop 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
