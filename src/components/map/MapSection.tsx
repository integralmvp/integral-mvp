// 지도 섹션 (2칸)
import MainlandMinimap from '../hero/MainlandMinimap'
import JejuMap from './JejuMap'

export default function MapSection() {
  return (
    <div className="h-full flex flex-col">
      {/* 타이틀 */}
      <div className="h-[60px] flex items-center justify-center bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">오늘의 물자 지도</h2>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        {/* 육지 미니맵 */}
        <div className="absolute top-4 right-4 z-20">
          <MainlandMinimap />
        </div>

        {/* 제주 메인 지도 */}
        <JejuMap />
      </div>
    </div>
  )
}
