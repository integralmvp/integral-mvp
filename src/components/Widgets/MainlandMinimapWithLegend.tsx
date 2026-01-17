// 육지 미니맵 + 범례 (통합) - 수평 배치
interface MainlandMinimapProps {
  inboundRoutes?: number
  outboundRoutes?: number
}

export default function MainlandMinimapWithLegend({
  inboundRoutes = 2,
  outboundRoutes = 2
}: MainlandMinimapProps) {
  return (
    <div className="absolute top-36 left-6 z-20">
      <div className="flex flex-col gap-2">
        {/* 미니맵 + 범례 (수평 배치) */}
        <div className="flex items-center gap-3">
          {/* 미니맵 */}
          <div className="bg-[rgba(10,10,30,0.5)] backdrop-blur-sm rounded-lg p-2">
            <svg viewBox="0 0 140 100" className="w-36 h-auto">
              {/* 한반도 윤곽 */}
              <path
                d="M 70,8 Q 85,5 95,15 Q 105,25 100,40 Q 95,50 100,60 Q 105,70 95,80 Q 85,88 75,85 Q 65,82 55,78 Q 45,74 40,65 Q 35,55 40,45 Q 45,35 50,25 Q 55,15 70,8"
                fill="rgba(0, 255, 255, 0.1)"
                stroke="#00ffff"
                strokeWidth="1"
                style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))' }}
              />

              {/* 인천 */}
              <g>
                <circle
                  cx="58"
                  cy="28"
                  r="5"
                  fill="#00bfff"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 191, 255, 0.8))' }}
                >
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <text
                  x="58"
                  y="22"
                  textAnchor="middle"
                  fill="white"
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
                  r="5"
                  fill="#00bfff"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 191, 255, 0.8))' }}
                >
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
                <text
                  x="45"
                  y="66"
                  textAnchor="middle"
                  fill="white"
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
                  r="5"
                  fill="#00bfff"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 191, 255, 0.8))' }}
                >
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur="2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  />
                </circle>
                <text
                  x="95"
                  y="59"
                  textAnchor="middle"
                  fill="white"
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
                    stroke="#00ff88"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.6))' }}
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
                    stroke="#00ff88"
                    strokeWidth="2"
                    strokeDasharray="4,2"
                    fill="none"
                    style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.6))' }}
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
                  stroke="#ff00ff"
                  strokeWidth="2"
                  strokeDasharray="4,2"
                  fill="none"
                  style={{ filter: 'drop-shadow(0 0 5px rgba(255, 0, 255, 0.6))' }}
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
              <text x="50" y="98" fill="white" fillOpacity="0.6" fontSize="7">
                ↓ 제주
              </text>
            </svg>
          </div>

          {/* 범례 (수평 배치) */}
          <div className="flex items-center gap-4 text-white/80 text-xs">
            {/* 공간상품 */}
            <div className="flex items-center gap-1.5">
              <svg width="14" height="10" viewBox="0 0 16 12">
                <rect
                  x="1"
                  y="1"
                  width="14"
                  height="10"
                  rx="2"
                  fill="#ff6b35"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(255, 107, 53, 0.8))' }}
                />
                <line x1="5" y1="3" x2="5" y2="9" stroke="#fed7aa" strokeWidth="1.5" />
                <line x1="8" y1="3" x2="8" y2="9" stroke="#fed7aa" strokeWidth="1.5" />
                <line
                  x1="11"
                  y1="3"
                  x2="11"
                  y2="9"
                  stroke="#fed7aa"
                  strokeWidth="1.5"
                />
              </svg>
              <span>공간</span>
            </div>

            {/* 도내경로 */}
            <div className="flex items-center gap-1.5">
              <svg width="18" height="8" viewBox="0 0 20 10">
                <path
                  d="M 2,5 L 18,5"
                  fill="none"
                  stroke="#00bfff"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(0, 191, 255, 0.8))' }}
                />
              </svg>
              <span>도내</span>
            </div>

            {/* 입도 */}
            <div className="flex items-center gap-1.5">
              <svg width="18" height="8" viewBox="0 0 20 10">
                <path
                  d="M 2,5 L 18,5"
                  fill="none"
                  stroke="#00ff88"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 136, 0.8))' }}
                />
              </svg>
              <span>입도</span>
            </div>

            {/* 출도 */}
            <div className="flex items-center gap-1.5">
              <svg width="18" height="8" viewBox="0 0 20 10">
                <path
                  d="M 2,5 L 18,5"
                  fill="none"
                  stroke="#ff00ff"
                  strokeWidth="2"
                  strokeDasharray="3,2"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(255, 0, 255, 0.8))' }}
                />
              </svg>
              <span>출도</span>
            </div>
          </div>
        </div>

        {/* MAINLAND 타이틀 (하단) */}
        <div className="pl-2">
          <h3 className="text-white/60 text-xs font-semibold tracking-wide">
            MAINLAND
          </h3>
        </div>
      </div>
    </div>
  )
}
