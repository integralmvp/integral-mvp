// 육지 미니맵 (한반도 + 항만 + 경로)
interface MainlandMinimapProps {
  inboundRoutes?: number
  outboundRoutes?: number
}

export default function MainlandMinimap({
  inboundRoutes = 2,
  outboundRoutes = 2
}: MainlandMinimapProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-slate-300 shadow-lg" style={{ width: '200px', height: '150px' }}>
      <svg viewBox="0 0 140 100" className="w-full h-auto">
        {/* 한반도 윤곽 */}
        <path
          d="M 70,8 Q 85,5 95,15 Q 105,25 100,40 Q 95,50 100,60 Q 105,70 95,80 Q 85,88 75,85 Q 65,82 55,78 Q 45,74 40,65 Q 35,55 40,45 Q 45,35 50,25 Q 55,15 70,8"
          fill="rgba(100, 116, 139, 0.1)"
          stroke="#64748b"
          strokeWidth="1"
        />

        {/* 인천 */}
        <g>
          <circle
            cx="58"
            cy="28"
            r="4"
            fill="#3b82f6"
          >
            <animate
              attributeName="r"
              values="3.5;4.5;3.5"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="58"
            y="22"
            textAnchor="middle"
            fill="#1e293b"
            fontSize="8"
            fontWeight="bold"
          >
            인천
          </text>
        </g>

        {/* 목포 */}
        <g>
          <circle
            cx="45"
            cy="72"
            r="4"
            fill="#3b82f6"
          >
            <animate
              attributeName="r"
              values="3.5;4.5;3.5"
              dur="2s"
              repeatCount="indefinite"
              begin="0.3s"
            />
          </circle>
          <text
            x="45"
            y="66"
            textAnchor="middle"
            fill="#1e293b"
            fontSize="8"
            fontWeight="bold"
          >
            목포
          </text>
        </g>

        {/* 부산 */}
        <g>
          <circle
            cx="95"
            cy="65"
            r="4"
            fill="#3b82f6"
          >
            <animate
              attributeName="r"
              values="3.5;4.5;3.5"
              dur="2s"
              repeatCount="indefinite"
              begin="0.6s"
            />
          </circle>
          <text
            x="95"
            y="59"
            textAnchor="middle"
            fill="#1e293b"
            fontSize="8"
            fontWeight="bold"
          >
            부산
          </text>
        </g>

        {/* 제주 방향 화살표 (입도) */}
        {inboundRoutes > 0 && (
          <g>
            <path
              d="M 58,35 Q 55,60 50,92"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4,2"
              fill="none"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M 95,72 Q 80,85 60,92"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4,2"
              fill="none"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-12"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        )}

        {/* 제주 방향 화살표 (출도) */}
        {outboundRoutes > 0 && (
          <path
            d="M 45,78 Q 40,90 35,92"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="4,2"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        )}

        {/* 제주 표시 */}
        <text x="50" y="98" fill="#64748b" fillOpacity="0.8" fontSize="7">
          ↓ 제주
        </text>
      </svg>

      {/* MAINLAND 타이틀 + 설명 (중앙 정렬) */}
      <div className="mt-2 text-center">
        <h3 className="text-slate-600 text-xs font-semibold tracking-wide">
          MAINLAND
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          {inboundRoutes > 0 && `입도: ${inboundRoutes}건`}
          {inboundRoutes > 0 && outboundRoutes > 0 && ' | '}
          {outboundRoutes > 0 && `출도: ${outboundRoutes}건`}
        </p>
      </div>
    </div>
  )
}
