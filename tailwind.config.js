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
          bgAlt: '#f8fafc',        // 아주 연한 쿨 그레이 (slate-50)
          border: '#e2e8f0',       // 연한 보더 (slate-200)
          borderAccent: '#10b981', // 네온 그린 보더
          text: '#0f172a',         // 짙은 텍스트 (slate-900)
          textAlt: '#64748b',      // 중간 톤 텍스트 (slate-500)
          panel: 'rgba(255, 255, 255, 0.85)', // 반투명 화이트 패널
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
