// 관리자(업체측) 견적 화면 레이아웃 — CommandLayout 껍데기 복제 (화주 화면 미변경)
// 좌측 45%: AdminQuoteConsole / 우측 55%: MapboxContainer + HeaderWidget

import AdminQuoteConsole from '../Features/AdminQuoteConsole'
import MapboxContainer from '../Features/Map/MapboxContainer'
import HeaderWidget from '../Features/Map/MapboxContainer/ui/HeaderWidget'
import logoSvg from '../../assets/icons/console/logo.svg'

export default function AdminLayout() {
  return (
    // grid-rows-[100%]: 암시적 row가 내용 높이로 늘어나 좌측 콘솔이 뷰포트를 넘는 것 방지
    <div className="h-screen grid grid-cols-[45%_55%] grid-rows-[100%] overflow-hidden">
      {/* 배경 지도: 전체 화면 (grid의 모든 칸 차지) */}
      <div className="col-span-2 row-start-1 col-start-1">
        <MapboxContainer />
      </div>

      {/* 좌측 45%: 블러 배경 + 관리자 견적 콘솔 */}
      <div className="row-start-1 col-start-1 flex flex-col z-10"
        style={{
          backdropFilter: 'blur(5px)',
          background: 'rgba(255,255,255,0.6)'
        }}
      >
        {/* 상단: 로고 영역 + 관리자 뱃지 */}
        <div className="p-6">
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <img src={logoSvg} alt="CUBE Logo" className="h-8 w-auto" />
            <span className="text-teal-700 text-3xl font-black tracking-tight drop-shadow-lg">
              CUBE
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-teal-700 text-white text-xs font-bold tracking-wide">
              관리자
            </span>
          </div>
        </div>

        {/* 하단: 관리자 견적 콘솔 */}
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <AdminQuoteConsole />
        </div>
      </div>

      {/* 우측 55%: 헤더 위젯 영역 */}
      <div className="row-start-1 col-start-2 z-10 pointer-events-none relative">
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <HeaderWidget />
        </div>
      </div>
    </div>
  )
}
