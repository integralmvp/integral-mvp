// 공간 상품 카드 컴포넌트
import type { StorageProduct } from '../../types/models'
import Badge from '../common/Badge'

interface StorageProductCardProps {
  storage: StorageProduct
  onDetailClick?: () => void
  onDealClick?: () => void
}

export default function StorageProductCard({
  storage,
  onDetailClick,
  onDealClick,
}: StorageProductCardProps) {
  // 공간 유형 배지 색상
  const getStorageTypeBadge = () => {
    switch (storage.storageType) {
      case '냉장':
        return { label: '냉장', variant: 'inbound' as const }
      case '냉동':
        return { label: '냉동', variant: 'outbound' as const }
      default:
        return { label: '상온', variant: 'default' as const }
    }
  }

  const badge = getStorageTypeBadge()

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {storage.location.name}
          </h3>
          <Badge label={badge.label} variant={badge.variant} />
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>지역:</span>
          <span className="font-medium text-gray-900">
            {storage.location.region}
          </span>
        </div>
        <div className="flex justify-between">
          <span>용량:</span>
          <span className="font-medium text-gray-900">{storage.capacity}</span>
        </div>
        <div className="flex justify-between">
          <span>주요 특징:</span>
          <span className="font-medium text-gray-900 text-right">
            {storage.features.slice(0, 2).join(', ')}
          </span>
        </div>
      </div>

      {/* 가격 */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="text-2xl font-bold text-green-600">
          {storage.price.toLocaleString()}원
          <span className="text-sm text-gray-500 ml-1">
            / {storage.priceUnit}
          </span>
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
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          거래하기
        </button>
      </div>
    </div>
  )
}
