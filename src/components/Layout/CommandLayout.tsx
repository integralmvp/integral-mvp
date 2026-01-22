// 2분할 레이아웃 (서비스 콘솔 | 지도)
import Header from './Header'
import ServiceConsole from './ServiceConsole'
import MapboxContainer from '../Map/MapboxContainer'

export default function CommandLayout() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* 헤더 (구분선 없음) */}
      <Header />

      {/* 메인 2분할 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 서비스 콘솔 (35%) */}
        <ServiceConsole />

        {/* 우측: 지도 섹션 (65%) */}
        <div className="flex-1 relative">
          <MapboxContainer />
        </div>
      </div>
    </div>
  )
}
