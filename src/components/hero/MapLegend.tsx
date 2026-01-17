// 지도 범례 컴포넌트
export default function MapLegend() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-6 py-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500"></div>
            <span className="text-gray-700">도내 경로</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-500 border-2 border-dashed border-green-500"></div>
            <span className="text-gray-700">입도</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500 border-2 border-dashed border-orange-500"></div>
            <span className="text-gray-700">출도</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-500 border-2 border-dashed border-purple-500"></div>
            <span className="text-gray-700">왕복</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/40 rounded"></div>
            <span className="text-gray-700">보관 공간</span>
          </div>
        </div>
      </div>
    </div>
  )
}
