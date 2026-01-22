// 지도 범례 (가로 배치)
export default function Legend() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-300 shadow-lg">
      <div className="flex items-center gap-4 text-slate-700 text-xs">
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
              stroke="#3b82f6"
              strokeWidth="2"
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
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="3,2"
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
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
          </svg>
          <span>출도</span>
        </div>
      </div>
    </div>
  )
}
