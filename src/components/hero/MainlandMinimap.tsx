// 육지 미니맵 컴포넌트 (SVG)
export default function MainlandMinimap() {
  return (
    <div className="absolute top-24 right-8 z-20">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2 text-center">
          입·출도 경로
        </h3>
        <svg
          viewBox="0 0 200 160"
          className="w-48 h-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 항만 마커 */}
          {/* 인천 */}
          <circle cx="50" cy="30" r="6" fill="#3B82F6" />
          <text x="50" y="50" fontSize="10" textAnchor="middle" fill="#374151">
            인천
          </text>

          {/* 목포 */}
          <circle cx="30" cy="110" r="6" fill="#3B82F6" />
          <text x="30" y="130" fontSize="10" textAnchor="middle" fill="#374151">
            목포
          </text>

          {/* 부산 */}
          <circle cx="170" cy="90" r="6" fill="#3B82F6" />
          <text x="170" y="110" fontSize="10" textAnchor="middle" fill="#374151">
            부산
          </text>

          {/* 제주 (가상 위치) */}
          <circle cx="100" cy="150" r="8" fill="#F59E0B" />
          <text x="100" y="145" fontSize="10" textAnchor="middle" fill="#374151">
            제주
          </text>

          {/* 입출도 화살표 */}
          {/* 부산 → 제주 (입도) */}
          <defs>
            <marker
              id="arrowGreen"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#22C55E" />
            </marker>
            <marker
              id="arrowOrange"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#F97316" />
            </marker>
          </defs>

          <line
            x1="170"
            y1="90"
            x2="105"
            y2="145"
            stroke="#22C55E"
            strokeWidth="2"
            strokeDasharray="4,4"
            markerEnd="url(#arrowGreen)"
          />

          {/* 제주 → 인천 (출도) */}
          <line
            x1="100"
            y1="150"
            x2="52"
            y2="35"
            stroke="#F97316"
            strokeWidth="2"
            strokeDasharray="4,4"
            markerEnd="url(#arrowOrange)"
          />

          {/* 목포 ↔ 제주 (왕복) */}
          <line
            x1="33"
            y1="110"
            x2="95"
            y2="148"
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text x="65" y="135" fontSize="12" textAnchor="middle" fill="#8B5CF6">
            ⇄
          </text>
        </svg>
      </div>
    </div>
  )
}
