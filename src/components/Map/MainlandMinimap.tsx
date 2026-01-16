// 육지 미니맵 (개선 버전)
export default function MainlandMinimap() {
  return (
    <div className="absolute top-14 left-4 z-20">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* 타이틀 */}
        <div className="bg-slate-800 px-3 py-1.5">
          <span className="text-xs font-mono text-slate-300 font-medium">
            MAINLAND
          </span>
        </div>

        {/* 미니맵 SVG */}
        <div className="w-32 h-24 p-2 bg-slate-50">
          <svg viewBox="0 0 120 90" className="w-full h-full">
            {/* 한반도 간략 형태 */}
            <path
              d="M 40,10 Q 65,5 85,18 Q 100,35 95,60 Q 75,80 50,70 Q 25,55 40,10"
              fill="#dcfce7"
              stroke="#86efac"
              strokeWidth="1"
            />

            {/* 인천 */}
            <circle
              cx="55"
              cy="25"
              r="6"
              fill="#1d4ed8"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="55"
              y="28"
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="bold"
            >
              인
            </text>

            {/* 목포 */}
            <circle
              cx="42"
              cy="62"
              r="6"
              fill="#1d4ed8"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="42"
              y="65"
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="bold"
            >
              목
            </text>

            {/* 부산 */}
            <circle
              cx="90"
              cy="55"
              r="6"
              fill="#1d4ed8"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x="90"
              y="58"
              textAnchor="middle"
              fill="white"
              fontSize="7"
              fontWeight="bold"
            >
              부
            </text>

            {/* 제주 방향 표시 */}
            <g opacity="0.5">
              <text
                x="60"
                y="82"
                textAnchor="middle"
                fill="#64748b"
                fontSize="6"
              >
                ↓ 제주
              </text>
            </g>

            {/* 입도 경로 예시 (부산 → 제주) */}
            <defs>
              <marker
                id="arrow-inbound"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <polygon points="0,0 6,3 0,6" fill="#10b981" />
              </marker>
              <marker
                id="arrow-outbound"
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
                <polygon points="0,0 6,3 0,6" fill="#8b5cf6" />
              </marker>
            </defs>

            {/* 입도 경로선 */}
            <path
              d="M 90,61 Q 75,70 60,75"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3,2"
              markerEnd="url(#arrow-inbound)"
            />

            {/* 출도 경로선 */}
            <path
              d="M 50,75 Q 47,68 42,56"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeDasharray="3,2"
              markerEnd="url(#arrow-outbound)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
