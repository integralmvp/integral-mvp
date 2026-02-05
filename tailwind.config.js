/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White Cyberpunk HUD Theme - Neon Green Accent
        neonGreen: {
          DEFAULT: '#10b981', // emerald-500 - 메인 네온 그린
          light: '#34d399',   // emerald-400 - 밝은 네온 그린
          dark: '#059669',    // emerald-600 - 어두운 네온 그린
          glow: '#6ee7b7',    // emerald-300 - 글로우 효과용
        },
        cyber: {
          bg: '#ffffff',           // 화이트 배경
          bgAlt: '#f0fdf4',        // 네온 그린 틴트 배경
          border: '#10b981',       // 네온 그린 보더
          borderAccent: '#10b981', // 네온 그린 보더
          text: '#000000',         // 진한 블랙 텍스트
          textAlt: '#1a1a1a',      // 블랙 텍스트
          textMuted: '#404040',    // 중간 블랙
          panel: 'rgba(16, 185, 129, 0.08)', // 네온 그린 틴트 패널
        },
        // 기존 컬러 (호환성 유지)
        primary: {
          DEFAULT: '#10b981', // 네온 그린으로 변경
          light: '#34d399',
          dark: '#059669',
        },
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
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
