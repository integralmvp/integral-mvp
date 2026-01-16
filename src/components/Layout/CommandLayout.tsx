// 관제 센터 레이아웃
import CommandHeader from './CommandHeader'
import LeftConsole from './LeftConsole'
import RightConsole from './RightConsole'
import MapboxContainer from '../Map/MapboxContainer'

export default function CommandLayout() {
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* 헤더 */}
      <CommandHeader />

      {/* 메인 영역 (3칸 레이아웃) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 콘솔 */}
        <LeftConsole />

        {/* 중앙 지도 */}
        <div className="flex-1">
          <MapboxContainer />
        </div>

        {/* 우측 콘솔 */}
        <RightConsole />
      </div>
    </div>
  )
}
