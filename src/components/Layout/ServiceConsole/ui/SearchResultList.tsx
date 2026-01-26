/**
 * SearchResultList - 검색 결과 리스트 컴포넌트
 *
 * PR4: 규정 통과 상품 리스트 표시
 * 카드 클릭 시 Toast 메시지 (거래 모달은 PR5)
 */

import type { StorageProduct, RouteProduct } from '../../../../types/models'
import type { RegulationSummary } from '../../../../engine/regulation'
import type { ServiceType } from '../hooks/useServiceConsoleState'

interface SearchResultListProps {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  activeTab: ServiceType
  summary: RegulationSummary | null
}

// 보관 상품 카드
function StorageProductCard({ product }: { product: StorageProduct }) {
  const handleClick = () => {
    // PR5: 거래 모달 연결 예정
    console.log('보관 상품 선택:', product.id)
    alert(`[${product.location.name}] 거래 기능은 PR5에서 연결됩니다.`)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-slate-900 text-sm">
            {product.location.name}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {product.storageType} | {product.capacity}
          </div>
        </div>
        <div className="text-right">
          <div className="text-blue-900 font-bold text-sm">
            {product.price.toLocaleString()}원
          </div>
          <div className="text-xs text-slate-400">/{product.priceUnit}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {product.features.slice(0, 3).map((feature, i) => (
          <span
            key={i}
            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
          >
            {feature}
          </span>
        ))}
      </div>
    </button>
  )
}

// 운송 상품 카드
function RouteProductCard({ product }: { product: RouteProduct }) {
  const handleClick = () => {
    // PR5: 거래 모달 연결 예정
    console.log('운송 상품 선택:', product.id)
    alert(`[${product.origin.name} → ${product.destination.name}] 거래 기능은 PR5에서 연결됩니다.`)
  }

  // 경로 타입 뱃지
  const scopeBadge = product.routeScope === 'INTRA_JEJU'
    ? { label: '도내', color: 'bg-blue-100 text-blue-700' }
    : product.direction === 'INBOUND'
      ? { label: '입도', color: 'bg-green-100 text-green-700' }
      : { label: '출도', color: 'bg-purple-100 text-purple-700' }

  return (
    <button
      onClick={handleClick}
      className="w-full p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded ${scopeBadge.color}`}>
              {scopeBadge.label}
            </span>
            <span className="font-semibold text-slate-900 text-sm">
              {product.origin.name} → {product.destination.name}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {product.vehicleType} | {product.capacity} | {product.schedule}
          </div>
        </div>
        <div className="text-right">
          <div className="text-blue-900 font-bold text-sm">
            {product.price.toLocaleString()}원
          </div>
          <div className="text-xs text-slate-400">/{product.priceUnit}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {product.cargoTypes.map((type, i) => (
          <span
            key={i}
            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
          >
            {type}
          </span>
        ))}
      </div>
    </button>
  )
}

export default function SearchResultList({
  storageProducts,
  routeProducts,
  activeTab,
  summary,
}: SearchResultListProps) {
  const totalCount = storageProducts.length + routeProducts.length

  if (totalCount === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        조건에 맞는 상품이 없습니다.
        {summary && summary.failedCount > 0 && (
          <div className="text-xs text-slate-400 mt-1">
            (규정 불일치: {summary.failedCount}건)
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {/* 요약 */}
      <div className="text-xs text-slate-500 mb-2">
        검색 결과: {totalCount}건
        {summary && summary.failedCount > 0 && (
          <span className="text-slate-400 ml-2">
            (규정 불일치 {summary.failedCount}건 제외)
          </span>
        )}
      </div>

      {/* 보관 상품 */}
      {(activeTab === 'storage' || activeTab === 'both') && storageProducts.length > 0 && (
        <div className="space-y-2">
          {activeTab === 'both' && (
            <div className="text-xs font-semibold text-slate-700">보관 상품</div>
          )}
          {storageProducts.map(product => (
            <StorageProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 운송 상품 */}
      {(activeTab === 'transport' || activeTab === 'both') && routeProducts.length > 0 && (
        <div className="space-y-2">
          {activeTab === 'both' && (
            <div className="text-xs font-semibold text-slate-700 mt-3">운송 상품</div>
          )}
          {routeProducts.map(product => (
            <RouteProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
