// 큐브 3D 아이소메트릭 아이콘 (비어있는 직육면체, 치수 표시 포함)
interface CubeIcon3DProps {
  showDimensions?: boolean
  size?: number
}

export default function CubeIcon3D({ showDimensions = true, size = 120 }: CubeIcon3DProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size * 1.2}
        viewBox={showDimensions ? "-20 -30 140 180" : "0 0 100 120"}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
      >
        {/* 아이소메트릭 3D 큐브 (비어있는 직육면체) */}
        <g transform="translate(50, 40)">
          {/* 상판 - 테두리만 (비어있음) */}
          <path
            d="M 0,-20 L 30,0 L 0,20 L -30,0 Z"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* 왼쪽 측면 - 테두리만 */}
          <path
            d="M -30,0 L -30,30 L 0,50 L 0,20 Z"
            fill="rgba(16, 185, 129, 0.05)"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* 오른쪽 측면 - 테두리만 */}
          <path
            d="M 30,0 L 30,30 L 0,50 L 0,20 Z"
            fill="rgba(16, 185, 129, 0.1)"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* 내부 모서리 (깊이감 표현) */}
          <line x1="0" y1="20" x2="0" y2="50" stroke="#10b981" strokeWidth="1.5" opacity="0.3"/>

          {/* 치수선 */}
          {showDimensions && (
            <>
              {/* 높이 치수선 (오른쪽) */}
              <line x1="38" y1="5" x2="38" y2="35" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="35" y1="5" x2="41" y2="5" stroke="#666" strokeWidth="1"/>
              <line x1="35" y1="35" x2="41" y2="35" stroke="#666" strokeWidth="1"/>
              {/* 중괄호 */}
              <path d="M 43,5 Q 45,7 45,10 L 45,30 Q 45,33 43,35" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="48" y="22" fontSize="8" fill="#666" fontWeight="bold">250mm</text>

              {/* 가로 치수선 (앞쪽 상단) */}
              <line x1="-30" y1="-8" x2="0" y2="12" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="-30" y1="-11" x2="-30" y2="-5" stroke="#666" strokeWidth="1"/>
              <line x1="0" y1="9" x2="0" y2="15" stroke="#666" strokeWidth="1"/>
              <path d="M -30,-8 Q -28,-10 -25,-10 L -5,-10 Q -2,-10 0,12" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="-20" y="-13" fontSize="8" fill="#666" fontWeight="bold">250mm</text>

              {/* 세로 치수선 (오른쪽 상단) */}
              <line x1="0" y1="12" x2="30" y2="-8" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
              <line x1="0" y1="9" x2="0" y2="15" stroke="#666" strokeWidth="1"/>
              <line x1="30" y1="-11" x2="30" y2="-5" stroke="#666" strokeWidth="1"/>
              <path d="M 0,12 Q 2,10 5,10 L 25,10 Q 28,10 30,-8" stroke="#666" strokeWidth="1" fill="none"/>
              <text x="10" y="8" fontSize="8" fill="#666" fontWeight="bold">250mm</text>
            </>
          )}
        </g>
      </svg>

      {showDimensions && (
        <div className="text-xs font-bold text-slate-700">
          1 큐브 = 250mm × 250mm × 250mm
        </div>
      )}
    </div>
  )
}
