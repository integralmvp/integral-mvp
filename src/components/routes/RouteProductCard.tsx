// 경로 상품 카드 컴포넌트
import type { RouteProduct } from '../../types/models'
import Badge from '../common/Badge'

interface RouteProductCardProps {
  route: RouteProduct
  onDetailClick?: () => void
  onDealClick?: () => void
}

export default function RouteProductCard({
  route,
  onDetailClick,
  onDealClick,
}: RouteProductCardProps) {
  // 배지 variant 결정
  const getBadgeVariant = () => {
    if (route.routeScope === 'INTRA_JEJU') return 'intra'
    if (route.tripType === 'ROUND_TRIP') return 'roundtrip'
    if (route.direction === 'INBOUND') return 'inbound'
    if (route.direction === 'OUTBOUND') return 'outbound'
    return 'default'
  }

  // 배지 라벨 결정
  const getBadgeLabel = () => {
    if (route.routeScope === 'INTRA_JEJU') return '도내'
    if (route.tripType === 'ROUND_TRIP') return '왕복'
    if (route.direction === 'INBOUND') return '입도'
    if (route.direction === 'OUTBOUND') return '출도'
    return ''
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {route.origin.name} → {route.destination.name}
          </h3>
          <Badge label={getBadgeLabel()} variant={getBadgeVariant()} />
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>운행 일정:</span>
          <span className="font-medium text-gray-900">{route.schedule}</span>
        </div>
        <div className="flex justify-between">
          <span>차량:</span>
          <span className="font-medium text-gray-900">
            {route.vehicleType} ({route.capacity})
          </span>
        </div>
        <div className="flex justify-between">
          <span>화물 유형:</span>
          <span className="font-medium text-gray-900">
            {route.cargoTypes.join(', ')}
          </span>
        </div>
      </div>

      {/* 가격 */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-2xl font-bold text-blue-600">
          {route.price.toLocaleString()}원
          <span className="text-sm text-gray-500 ml-1">/ {route.priceUnit}</span>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={onDetailClick}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          상세 보기
        </button>
        <button
          onClick={onDealClick}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          거래하기
        </button>
      </div>
    </div>
  )
}
