// 파렛트 3D 아이소메트릭 아이콘 (치수 표시 포함)
interface PalletIcon3DProps {
  showDimensions?: boolean
  size?: number
}

export default function PalletIcon3D({ showDimensions = true, size = 120 }: PalletIcon3DProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size * 1.2}
        viewBox={showDimensions ? "-20 -30 140 180" : "0 0 100 120"}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
      >
        {/* 아이소메트릭 3D 파렛트 */}
        <g transform="translate(50, 40)">
          {/* 상판 (주황색) */}
          <path d="M 0,-20 L 40,0 L 0,20 L -40,0 Z" fill="#ff6b35" stroke="#ff8c5a" strokeWidth="0.8"/>
          {/* 상판 나무 판자 간 공백 */}
          <line x1="-26" y1="-6" x2="14" y2="14" stroke="#993d1f" strokeWidth="2" opacity="0.5"/>
          <line x1="-18" y1="-10" x2="22" y2="10" stroke="#993d1f" strokeWidth="2" opacity="0.5"/>
          <line x1="-10" y1="-14" x2="30" y2="6" stroke="#993d1f" strokeWidth="2" opacity="0.5"/>

          {/* 왼쪽 측면 - 그림자색 배경 */}
          <path d="M -40,0 L -40,30 L 0,50 L 0,20 Z" fill="#993d1f" stroke="#ff6b35" strokeWidth="0.8"/>
          {/* 오른쪽 측면 */}
          <path d="M 40,0 L 40,30 L 0,50 L 0,20 Z" fill="#e65c2e" stroke="#ff6b35" strokeWidth="0.8"/>

          {/* 각목 3개 (실제 나무 각목) */}
          <path d="M -40,0 L -40,30 L -35,32.5 L -35,2.5 Z" fill="#ff6b35"/>
          <path d="M -20,10 L -20,40 L -15,42.5 L -15,12.5 Z" fill="#ff6b35"/>
          <path d="M 0,20 L 0,50 L 5,52.5 L 5,22.5 Z" fill="#ff6b35"/>

          {/* z축 치수선 (점선) */}
          {showDimensions && (
            <>
              {/* 높이 치수선 (오른쪽) */}
              <line x1="48" y1="5" x2="48" y2="35" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="45" y1="5" x2="51" y2="5" stroke="#666" strokeWidth="1"/>
              <line x1="45" y1="35" x2="51" y2="35" stroke="#666" strokeWidth="1"/>
              {/* 중괄호 */}
              <path d="M 53,5 Q 55,7 55,10 L 55,30 Q 55,33 53,35" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="58" y="22" fontSize="8" fill="#666" fontWeight="bold">1800mm</text>

              {/* 가로 치수선 (앞쪽 상단) */}
              <line x1="-40" y1="-8" x2="0" y2="12" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="-40" y1="-11" x2="-40" y2="-5" stroke="#666" strokeWidth="1"/>
              <line x1="0" y1="9" x2="0" y2="15" stroke="#666" strokeWidth="1"/>
              <path d="M -40,-8 Q -38,-10 -35,-10 L -5,-10 Q -2,-10 0,12" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="-25" y="-13" fontSize="8" fill="#666" fontWeight="bold">1100mm</text>

              {/* 세로 치수선 (오른쪽 상단) */}
              <line x1="0" y1="12" x2="40" y2="-8" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="0" y1="9" x2="0" y2="15" stroke="#666" strokeWidth="1"/>
              <line x1="40" y1="-11" x2="40" y2="-5" stroke="#666" strokeWidth="1"/>
              <path d="M 0,12 Q 2,10 5,10 L 35,10 Q 38,10 40,-8" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="15" y="8" fontSize="8" fill="#666" fontWeight="bold">1100mm</text>
            </>
          )}
        </g>
      </svg>

      {showDimensions && (
        <div className="text-xs font-bold text-slate-700">
          1 파렛트 = 1.1m × 1.1m × 1.8m
        </div>
      )}
    </div>
  )
}
