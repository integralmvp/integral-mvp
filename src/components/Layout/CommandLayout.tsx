// Grid 기반 레이아웃 - 좌측(45%) 서비스 콘솔 + 우측(55%) 지도
// 하이라이트 마커 관리는 useMapbox 훅 내부 (updateMarkerHighlights via useEffect on highlightedIds)

import ServiceConsole from '../Features/ServiceConsole'
import MapboxContainer from '../Features/Map/MapboxContainer'
import HeaderWidget from '../Features/Map/MapboxContainer/ui/HeaderWidget'
import logoSvg from '../../assets/icons/console/logo.svg'

export default function CommandLayout() {
  return (
    <div className="h-screen grid grid-cols-[45%_55%] overflow-hidden">
      {/* 배경 지도: 전체 화면 (grid의 모든 칸 차지) */}
      <div className="col-span-2 row-start-1 col-start-1">
        <MapboxContainer />
      </div>

      {/* 좌측 45%: 블러 배경 + 서비스 콘솔 */}
      <div className="row-start-1 col-start-1 flex flex-col z-10"
        style={{
          backdropFilter: 'blur(5px)',
          background: 'rgba(255,255,255,0.6)'
        }}
      >
        {/* 상단: 로고 영역 */}
        <div className="p-6">
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <img src={logoSvg} alt="CUBE Logo" className="h-8 w-auto" />
            <span className="text-teal-700 text-3xl font-black tracking-tight drop-shadow-lg">
              CUBE
            </span>
          </div>
        </div>

        {/* 하단: 서비스 콘솔 */}
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <ServiceConsole />
        </div>
      </div>

      {/* 우측 55%: 헤더 위젯 영역 */}
      <div className="row-start-1 col-start-2 z-10 pointer-events-none relative">
        {/* 헤더 위젯 (우측 상단) */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <HeaderWidget />
        </div>
      </div>
    </div>
  )
}
