// 파렛트 3D 아이소메트릭 아이콘 (치수 표시 포함)
interface PalletIcon3DProps {
  showDimensions?: boolean
  size?: number
  count?: number
}

export default function PalletIcon3D({ showDimensions = true, size = 150, count }: PalletIcon3DProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={showDimensions ? "-30 -80 160 240" : "0 0 100 120"}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
      >
        {/* 아이소메트릭 3D 파렛트 */}
        <g transform="translate(50, 50)">
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

          {showDimensions && (
            <>
              {/* z축 점선 (상판 모서리에서 위로) - 최대 적재 높이 표현 */}
              <line x1="-40" y1="0" x2="-40" y2="-50" stroke="#666" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6"/>
              <line x1="40" y1="0" x2="40" y2="-50" stroke="#666" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6"/>
              <line x1="0" y1="-20" x2="0" y2="-70" stroke="#666" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6"/>
              <line x1="0" y1="20" x2="0" y2="-30" stroke="#666" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6"/>

              {/* 가상 상단 공간 테두리 (점선) */}
              <path d="M 0,-70 L 40,-50 L 0,-30 L -40,-50 Z" fill="none" stroke="#666" strokeWidth="1" strokeDasharray="3,3" opacity="0.4"/>

              {/* 높이 치수선 (오른쪽) */}
              <line x1="48" y1="0" x2="48" y2="-50" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="45" y1="0" x2="51" y2="0" stroke="#666" strokeWidth="1"/>
              <line x1="45" y1="-50" x2="51" y2="-50" stroke="#666" strokeWidth="1"/>
              {/* 중괄호 */}
              <path d="M 53,0 Q 55,-2 55,-5 L 55,-45 Q 55,-48 53,-50" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="58" y="-22" fontSize="14" fill="#666" fontWeight="bold">1800mm</text>

              {/* 밑판 가로 치수선 (왼쪽 변 - 높이 치수 패턴 시계방향 110도 회전) */}
              <g transform="translate(40, 10) rotate(70)">
                <line x1="8" y1="0" x2="8" y2="45" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="5" y1="0" x2="11" y2="0" stroke="#666" strokeWidth="1"/>
                <line x1="5" y1="45" x2="11" y2="45" stroke="#666" strokeWidth="1"/>
                {/* 중괄호 */}
                <path d="M 13,0 Q 15,2 15,5 L 15,40 Q 15,43 13,45" stroke="#666" strokeWidth="1" fill="none"/>
                <text x="18" y="25" fontSize="14" fill="#666" fontWeight="bold">1100mm</text>
              </g>

              {/* 밑판 세로 치수선 (오른쪽 변 - 높이 치수 패턴 시계방향 110도 회전) */}
              <g transform="translate(-40, 10) rotate(-70)">
                <line x1="-8" y1="0" x2="-8" y2="45" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="-11" y1="0" x2="-5" y2="0" stroke="#666" strokeWidth="1"/>
                <line x1="-11" y1="45" x2="-5" y2="45" stroke="#666" strokeWidth="1"/>
                {/* 중괄호 */}
                <path d="M -13,0 Q -15,2 -15,5 L -15,40 Q -15,43 -13,45" stroke="#666" strokeWidth="1" fill="none"/>
                <text x="-50" y="25" fontSize="14" fill="#666" fontWeight="bold">1100mm</text>
              </g>
            </>
          )}
        </g>
      </svg>

      {/* 카운트 */}
      {count !== undefined && (
        <div className="text-sm font-bold text-slate-800">
          {count} 파렛트
        </div>
      )}
    </div>
  )
}
