// 선택 상품 요약 컴포넌트
import type { RouteProduct, StorageProduct } from '../../types/models'

interface ProductSummaryProps {
  product: RouteProduct | StorageProduct
  productType: 'route' | 'storage'
}

export default function ProductSummary({
  product,
  productType,
}: ProductSummaryProps) {
  const isRoute = productType === 'route'
  const route = isRoute ? (product as RouteProduct) : null
  const storage = !isRoute ? (product as StorageProduct) : null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span>📦</span>
        선택 상품
      </h3>

      {isRoute && route && (
        <div className="space-y-2">
          <div className="text-lg font-bold text-gray-900">
            {route.origin.name} → {route.destination.name}
          </div>
          <div className="text-sm text-gray-600">
            {route.schedule} 운행 | {route.vehicleType} ({route.capacity}) |{' '}
            <span className="font-semibold text-blue-600">
              {route.price.toLocaleString()}원/{route.priceUnit}
            </span>
          </div>
        </div>
      )}

      {!isRoute && storage && (
        <div className="space-y-2">
          <div className="text-lg font-bold text-gray-900">
            {storage.location.name}
          </div>
          <div className="text-sm text-gray-600">
            {storage.storageType} | {storage.capacity} |{' '}
            <span className="font-semibold text-green-600">
              {storage.price.toLocaleString()}원/{storage.priceUnit}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
