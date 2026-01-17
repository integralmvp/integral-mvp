// 관제 센터 레이아웃
import Header from './Header'
import CenterTitle from './CenterTitle'
import LeftConsole from './LeftConsole'
import RightConsole from './RightConsole'
import MapboxContainer from '../Map/MapboxContainer'
import SpaceBackground from '../Background/SpaceBackground'

export default function CommandLayout() {
  return (
    <div className="h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* 우주 배경 */}
      <SpaceBackground />

      {/* 투명 헤더 (로고/LIVE) */}
      <Header />

      {/* 중앙 글로우 타이틀 */}
      <CenterTitle />

      {/* 메인 영역 */}
      <div className="h-full w-full">
        {/* 좌측 콘솔 */}
        <LeftConsole />

        {/* 중앙 지도 */}
        <div className="absolute inset-0">
          <MapboxContainer />
        </div>

        {/* 우측 콘솔 */}
        <RightConsole />
      </div>
    </div>
  )
}
