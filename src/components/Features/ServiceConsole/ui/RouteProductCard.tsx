import type { RouteProduct } from '../../../../types/models'

interface RouteProductCardProps {
  product: RouteProduct
  isSelected: boolean
  onSelect: () => void
  onDetail: () => void
}

export function RouteProductCard({
  product,
  isSelected,
  onSelect,
  onDetail,
}: RouteProductCardProps) {
  const scopeBadge = product.routeScope === 'INTRA_JEJU'
    ? { label: '도내', color: 'bg-teal-100 text-teal-700' }
    : product.direction === 'INBOUND'
      ? { label: '입도', color: 'bg-green-100 text-green-700' }
      : { label: '출도', color: 'bg-purple-100 text-purple-700' }

  return (
    <div className={`w-full p-4 bg-white rounded-xl border transition-all ${
      isSelected ? 'border-teal-500 shadow-md' : 'border-slate-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${scopeBadge.color}`}>
              {scopeBadge.label}
            </span>
            <span className="font-bold text-slate-900">
              {product.origin.name} → {product.destination.name}
            </span>
            {product.provider.verified && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">인증</span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-1">{product.provider.name}</div>
          <div className="text-sm text-slate-600 mt-1">
            {product.vehicleType} · {product.capacity} · {product.schedule}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.cargoTypes.map((type, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {type}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-teal-700 font-bold text-lg">
            ₩{product.unitPricePerCube.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">/Cube</div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
        <button
          onClick={onDetail}
          className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          상세
        </button>
        <button
          onClick={onSelect}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            isSelected
              ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
          disabled={isSelected}
        >
          {isSelected ? '선택됨' : '선택'}
        </button>
      </div>
    </div>
  )
}
