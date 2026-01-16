// 지도 범례 (안내 패널용)
export default function MapLegend() {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>📍</span>
        지도 범례
      </h3>

      <div className="space-y-2 pl-6 text-sm">
        {/* 공간 상품 */}
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="#3B82F6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="14" width="20" height="2" rx="0.5" />
            <rect x="2" y="18" width="20" height="2" rx="0.5" />
            <rect x="4" y="8" width="3" height="6" />
            <rect x="10.5" y="8" width="3" height="6" />
            <rect x="17" y="8" width="3" height="6" />
            <rect x="3" y="6" width="18" height="2" rx="0.5" />
          </svg>
          <span className="text-gray-700">공간 상품 (크기 = 파렛트 수)</span>
        </div>

        {/* 도내 경로 */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-500 rounded"></div>
          <span className="text-gray-700">도내 경로</span>
        </div>

        {/* 입도 */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1 rounded"
            style={{
              background:
                'repeating-linear-gradient(90deg, #22C55E 0, #22C55E 4px, transparent 4px, transparent 8px)',
            }}
          ></div>
          <span className="text-gray-700">입도 경로</span>
        </div>

        {/* 출도 */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1 rounded"
            style={{
              background:
                'repeating-linear-gradient(90deg, #F97316 0, #F97316 4px, transparent 4px, transparent 8px)',
            }}
          ></div>
          <span className="text-gray-700">출도 경로</span>
        </div>

        {/* 왕복 */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-1 rounded"
            style={{
              background:
                'repeating-linear-gradient(90deg, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 8px)',
            }}
          ></div>
          <span className="text-gray-700">왕복 경로</span>
        </div>
      </div>
    </div>
  )
}
