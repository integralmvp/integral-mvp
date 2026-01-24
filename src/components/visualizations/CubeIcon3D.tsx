// 큐브 3D 아이소메트릭 아이콘 (비어있는 직육면체, 치수 표시 포함)
interface CubeIcon3DProps {
  showDimensions?: boolean
  size?: number
  count?: number
}

export default function CubeIcon3D({ showDimensions = true, size = 150, count }: CubeIcon3DProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={showDimensions ? "-30 -40 160 200" : "0 0 100 120"}
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
              <text x="48" y="22" fontSize="14" fill="#666" fontWeight="bold">250mm</text>

              {/* 밑판 가로 치수선 (왼쪽 변 - 높이 치수 패턴 시계방향 58도 회전) */}
              <g transform="translate(32, 25) rotate(58)">
                <line x1="8" y1="0" x2="8" y2="36" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="5" y1="0" x2="11" y2="0" stroke="#666" strokeWidth="1"/>
                <line x1="5" y1="36" x2="11" y2="36" stroke="#666" strokeWidth="1"/>
                {/* 중괄호 */}
                <path d="M 13,0 Q 15,2 15,5 L 15,31 Q 15,34 13,36" stroke="#666" strokeWidth="1" fill="none"/>
                <text x="4" y="20" fontSize="14" fill="#666" fontWeight="bold" transform="rotate(-58)">250mm</text>
              </g>

              {/* 밑판 세로 치수선 (오른쪽 변 - 높이 치수 패턴 반시계방향 58도 회전) */}
              <g transform="translate(-32, 25) rotate(-58)">
                <line x1="-8" y1="0" x2="-8" y2="36" stroke="#666" strokeWidth="1" strokeDasharray="2,2"/>
                <line x1="-11" y1="0" x2="-5" y2="0" stroke="#666" strokeWidth="1"/>
                <line x1="-11" y1="36" x2="-5" y2="36" stroke="#666" strokeWidth="1"/>
                {/* 중괄호 */}
                <path d="M -13,0 Q -15,2 -15,5 L -15,31 Q -15,34 -13,36" stroke="#666" strokeWidth="1" fill="none"/>
                <text x="-52" y="20" fontSize="14" fill="#666" fontWeight="bold" transform="rotate(58)">250mm</text>
              </g>
            </>
          )}
        </g>
      </svg>

      {/* 카운트 */}
      {count !== undefined && (
        <div className="text-sm font-bold text-slate-800">
          {count} 큐브
        </div>
      )}
    </div>
  )
}
