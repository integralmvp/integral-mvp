// 서비스 현황
import { ROUTE_PRODUCTS, STORAGE_PRODUCTS } from '../../data/mockData'

export default function ServiceStats() {
  // 총 보관 공간 (파렛트 합계)
  const totalPallets = STORAGE_PRODUCTS.reduce((sum, storage) => {
    const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')
    return sum + capacity
  }, 0)

  // 총 경로 상품
  const totalRoutes = ROUTE_PRODUCTS.length

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>📊</span>
        서비스 현황
      </h3>

      <div className="space-y-3 pl-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">총 보관 공간</div>
          <div className="text-2xl font-bold text-blue-600">
            {totalPallets} <span className="text-sm text-gray-500">파렛트</span>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">총 경로 상품</div>
          <div className="text-2xl font-bold text-green-600">
            {totalRoutes} <span className="text-sm text-gray-500">건</span>
          </div>
        </div>
      </div>
    </div>
  )
}
