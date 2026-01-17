// 지도 히어로 섹션 - 모든 컴포넌트 통합
import JejuMainMap from './JejuMainMap'
import MessageOverlay from './MessageOverlay'
import MainlandMinimap from './MainlandMinimap'
import MapLegend from './MapLegend'

export default function MapHeroSection() {
  return (
    <section id="hero" className="relative w-full h-screen min-h-[600px]">
      {/* 제주 메인 지도 */}
      <div className="absolute inset-0 w-full h-full">
        <JejuMainMap />
      </div>

      {/* 메시지 오버레이 */}
      <MessageOverlay />

      {/* 육지 미니맵 */}
      <MainlandMinimap />

      {/* 범례 */}
      <MapLegend />
    </section>
  )
}
