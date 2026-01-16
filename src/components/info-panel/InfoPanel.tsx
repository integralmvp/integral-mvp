// 안내 패널 (3칸)
import Timestamp from './Timestamp'
import ServiceStats from './ServiceStats'
import MapLegend from './MapLegend'
import UsageGuide from './UsageGuide'

export default function InfoPanel() {
  return (
    <div className="p-6">
      {/* 집계 일시 */}
      <Timestamp />

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* 서비스 현황 */}
      <ServiceStats />

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* 지도 범례 */}
      <MapLegend />

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* 이용 안내 */}
      <UsageGuide />
    </div>
  )
}
