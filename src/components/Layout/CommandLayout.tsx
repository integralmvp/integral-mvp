// 전체 지도 배경 + 좌측 블러 오버레이 레이아웃
import ServiceConsole from './ServiceConsole'
import MapboxContainer from '../Map/MapboxContainer'

export default function CommandLayout() {
  return (
    <div className="h-screen relative overflow-hidden">
      {/* 배경: 전체 지도 */}
      <div className="absolute inset-0 z-0">
        <MapboxContainer />
      </div>

      {/* 좌측 45%: 블러 오버레이 */}
      <div className="absolute inset-y-0 left-0 w-[45%] z-10 flex flex-col"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(14, 165, 233, 0.15)' // 연한 하늘색 틴트
        }}
      >
        {/* 상단: 로고 영역 */}
        <div className="p-6">
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity inline-block"
            onClick={() => window.location.reload()}
          >
            <span className="text-white text-3xl font-black tracking-tight drop-shadow-lg">
              INTEGRAL
            </span>
          </div>
          {/* 네비게이션 - 추후 추가 */}
        </div>

        {/* 하단: 서비스 콘솔 */}
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <ServiceConsole />
        </div>
      </div>
    </div>
  )
}
