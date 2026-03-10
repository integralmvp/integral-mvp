import type { StorageProduct, RouteProduct } from '../../../../types/models'
import type { ServiceType } from '../hooks/useServiceConsoleState'

interface SearchResultSelectionPanelProps {
  activeTab: ServiceType
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  selectedStorageId?: string
  selectedRouteId?: string
  onSelectStorage?: (id: string) => void
  onSelectRoute?: (id: string) => void
  onStartDeal?: () => void
}

export function SearchResultSelectionPanel({
  activeTab,
  storageProducts,
  routeProducts,
  selectedStorageId,
  selectedRouteId,
  onSelectStorage,
  onSelectRoute,
  onStartDeal,
}: SearchResultSelectionPanelProps) {
  const canDeal =
    (activeTab === 'storage' && !!selectedStorageId) ||
    (activeTab === 'transport' && !!selectedRouteId) ||
    (activeTab === 'both' && !!selectedStorageId && !!selectedRouteId)

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3">선택한 상품</div>

      {/* 선택 요약 */}
      <div className="space-y-2">
        {activeTab === 'storage' && selectedStorageId && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-slate-700">
              보관: {storageProducts.find(p => p.id === selectedStorageId)?.location.name}
            </span>
            <button
              onClick={() => onSelectStorage?.('')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              취소
            </button>
          </div>
        )}

        {activeTab === 'transport' && selectedRouteId && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <span className="text-sm text-slate-700">
              운송: {routeProducts.find(p => p.id === selectedRouteId)?.origin.name} → {routeProducts.find(p => p.id === selectedRouteId)?.destination.name}
            </span>
            <button
              onClick={() => onSelectRoute?.('')}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              취소
            </button>
          </div>
        )}

        {activeTab === 'both' && (
          <>
            {selectedStorageId && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-slate-700">
                  보관: {storageProducts.find(p => p.id === selectedStorageId)?.location.name}
                </span>
                <button
                  onClick={() => onSelectStorage?.('')}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  취소
                </button>
              </div>
            )}
            {selectedRouteId && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm text-slate-700">
                  운송: {routeProducts.find(p => p.id === selectedRouteId)?.origin.name} → {routeProducts.find(p => p.id === selectedRouteId)?.destination.name}
                </span>
                <button
                  onClick={() => onSelectRoute?.('')}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  취소
                </button>
              </div>
            )}
          </>
        )}

        {!selectedStorageId && !selectedRouteId && (
          <div className="text-sm text-slate-400 text-center py-2">
            상품을 선택해주세요
          </div>
        )}
      </div>

      {/* 거래 버튼 */}
      <button
        onClick={onStartDeal}
        disabled={!canDeal}
        className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
          canDeal
            ? 'bg-teal-600 text-white hover:bg-teal-700'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        거래 진행
      </button>
    </div>
  )
}
