// 사이버펑크 HUD 스타일 SVG 데코레이션 컴포넌트
// 재사용 가능한 프레임 장식 요소들

interface CyberDecorationsProps {
  variant?: 'main' | 'widget' | 'compact'
}

/**
 * 메인 패널용 코너 장식
 */
export function CyberCorners({ variant = 'main' }: CyberDecorationsProps) {
  const size = variant === 'main' ? 60 : variant === 'widget' ? 40 : 30
  const strokeWidth = variant === 'main' ? 3 : 2

  return (
    <>
      {/* 좌상단 코너 */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={size}
        height={size}
        style={{ zIndex: 10 }}
      >
        <line
          x1="0"
          y1={size - 5}
          x2="0"
          y2="0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1="0"
          y1="0"
          x2={size - 5}
          y2="0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1={size - 10}
          y1="0"
          x2={size}
          y2={size - 10}
          stroke="currentColor"
          strokeWidth={strokeWidth / 2}
          opacity="0.5"
        />
      </svg>

      {/* 우상단 코너 */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width={size}
        height={size}
        style={{ zIndex: 10 }}
      >
        <line
          x1={size}
          y1={size - 5}
          x2={size}
          y2="0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1={size}
          y1="0"
          x2="5"
          y2="0"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 좌하단 코너 */}
      <svg
        className="absolute bottom-0 left-0 pointer-events-none"
        width={size}
        height={size}
        style={{ zIndex: 10 }}
      >
        <line
          x1="0"
          y1="5"
          x2="0"
          y2={size}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1="0"
          y1={size}
          x2={size - 5}
          y2={size}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      </svg>

      {/* 우하단 코너 */}
      <svg
        className="absolute bottom-0 right-0 pointer-events-none"
        width={size}
        height={size}
        style={{ zIndex: 10 }}
      >
        <line
          x1={size}
          y1="5"
          x2={size}
          y2={size}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1={size}
          y1={size}
          x2="5"
          y2={size}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <line
          x1="10"
          y1={size}
          x2="0"
          y2={size - 10}
          stroke="currentColor"
          strokeWidth={strokeWidth / 2}
          opacity="0.5"
        />
      </svg>
    </>
  )
}

/**
 * 상단 바 with 슬롯 인디케이터
 */
export function CyberTopBar() {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ zIndex: 10 }}>
      <div className="flex items-center gap-2 px-4 py-1 bg-neonGreen">
        <div className="w-2 h-2 bg-black opacity-40" />
        <div className="w-2 h-2 bg-black opacity-40" />
        <div className="w-2 h-2 bg-black opacity-40" />
        <div className="w-2 h-2 bg-black opacity-40" />
        <div className="w-2 h-2 bg-black opacity-40" />
        <div className="w-2 h-2 bg-black opacity-40" />
      </div>
    </div>
  )
}

/**
 * 사이드 줄무늬 패턴
 */
export function CyberStripes({ side = 'right' }: { side?: 'left' | 'right' }) {
  return (
    <div
      className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} pointer-events-none cyber-stripes`}
      style={{ zIndex: 5 }}
    />
  )
}

/**
 * 인디케이터 점들
 */
export function CyberIndicators({ count = 3, activeIndex = 0 }: { count?: number; activeIndex?: number }) {
  return (
    <div className="cyber-indicators">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`cyber-indicator ${i === activeIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}
