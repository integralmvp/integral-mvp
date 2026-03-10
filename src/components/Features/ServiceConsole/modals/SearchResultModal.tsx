/**
 * SearchResultModal - 검색 결과 모달 컴포넌트
 *
 * PR4: 검색 버튼 클릭 시 모달로 결과 표시
 * - 탭별 헤더 (공간상품/경로상품/연계상품)
 * - 입력 조건 요약
 * - 상품 리스트
 * - 보관+운송 탭의 경우 내부 3개 탭 (연계/보관/운송)
 */

import { useState } from 'react'
import type { StorageProduct, RouteProduct, StorageCondition, TransportCondition, RegisteredCargo, ServiceOrder } from '../../../../types/models'
import type { RegulationSummary } from '../../../../layers/matching/regulation'
import type { ServiceType } from '../hooks/useServiceConsoleState'
import ProductDetailModal from './ProductDetailModal'
import { StorageProductCard } from '../ui/StorageProductCard'
import { RouteProductCard } from '../ui/RouteProductCard'
import { SearchConditionSummary } from '../ui/SearchConditionSummary'
import { BothTabHeader } from '../ui/BothTabHeader'
import type { BothModalTab } from '../ui/BothTabHeader'
import { SearchResultSelectionPanel } from '../ui/SearchResultSelectionPanel'
import { SearchResultModalHeader } from '../ui/SearchResultModalHeader'

interface SearchResultModalProps {
  isOpen: boolean
  onClose: () => void
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  activeTab: ServiceType
  summary: RegulationSummary | null
  // 입력 조건 요약용
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  storageCondition: StorageCondition
  transportCondition: TransportCondition
  // 보관+운송 순서
  serviceOrder?: ServiceOrder
  // PR7: 선택 상태 관리
  selectedStorageId?: string
  selectedRouteId?: string
  onSelectStorage?: (id: string) => void
  onSelectRoute?: (id: string) => void
  onStartDeal?: () => void
}

export default function SearchResultModal({
  isOpen,
  onClose,
  storageProducts,
  routeProducts,
  activeTab,
  summary,
  registeredCargos,
  totalCubes,
  totalPallets,
  storageCondition,
  transportCondition,
  serviceOrder,
  selectedStorageId,
  selectedRouteId,
  onSelectStorage,
  onSelectRoute,
  onStartDeal,
}: SearchResultModalProps) {
  // 보관+운송 모달 내부 탭
  const [bothTab, setBothTab] = useState<BothModalTab>('integrated')

  // PR7: 상세 모달 상태
  const [detailProduct, setDetailProduct] = useState<StorageProduct | RouteProduct | null>(null)
  const [detailProductType, setDetailProductType] = useState<'storage' | 'route'>('storage')

  if (!isOpen) return null

  const totalCount = storageProducts.length + routeProducts.length
  const effectiveOrder = serviceOrder || 'storage-first'

  // 보관+운송 탭일 때 내부 탭에 따른 상품 필터링
  const getFilteredProducts = () => {
    if (activeTab !== 'both') {
      return { storage: storageProducts, route: routeProducts }
    }

    switch (bothTab) {
      case 'integrated':
        // TODO: 연계 상품은 별도 데이터 필요. 현재는 빈 배열
        return { storage: [], route: [] }
      case 'storage':
        return { storage: storageProducts, route: [] }
      case 'transport':
        return { storage: [], route: routeProducts }
      default:
        return { storage: storageProducts, route: routeProducts }
    }
  }

  const filtered = getFilteredProducts()
  const filteredCount = filtered.storage.length + filtered.route.length

  // 보관+운송 안내 문구 (순서에 따라 변경)
  const getBothGuideMessage = () => {
    if (effectiveOrder === 'storage-first') {
      return '연계 상품을 구매하시는 경우가 아니면, 공간 상품 구매 완료 후 경로 상품 구매가 진행됩니다.'
    } else {
      return '연계 상품을 구매하시는 경우가 아니면, 경로 상품 구매 완료 후 공간 상품 구매가 진행됩니다.'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <SearchResultModalHeader
          activeTab={activeTab}
          totalCount={totalCount}
          summary={summary}
          onClose={onClose}
        />

        {/* 컨텐츠 영역 - 모달 전체 스크롤 */}
        <div className="flex-1 overflow-y-auto">
          {/* 보관+운송일 경우: 입력 조건 요약 → 안내문구 → 탭 → 상품 리스트 (전체 스크롤) */}
          {activeTab === 'both' && (
            <>
              {/* 입력 조건 요약 */}
              <div className="px-6 pt-4">
                <SearchConditionSummary
                  activeTab={activeTab}
                  registeredCargos={registeredCargos}
                  totalCubes={totalCubes}
                  totalPallets={totalPallets}
                  storageCondition={storageCondition}
                  transportCondition={transportCondition}
                  serviceOrder={serviceOrder}
                />

                {/* 안내 문구 */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-teal-800">{getBothGuideMessage()}</p>
                </div>
              </div>

              {/* 내부 탭 - sticky로 스크롤 시 상단 고정 */}
              <BothTabHeader
                bothTab={bothTab}
                onTabChange={setBothTab}
                effectiveOrder={effectiveOrder}
              />
            </>
          )}

          {/* 상품 리스트 영역 */}
          <div className="p-6">
            {/* 보관/운송 단일 탭일 경우 입력 조건 요약 */}
            {activeTab !== 'both' && (
              <SearchConditionSummary
                activeTab={activeTab}
                registeredCargos={registeredCargos}
                totalCubes={totalCubes}
                totalPallets={totalPallets}
                storageCondition={storageCondition}
                transportCondition={transportCondition}
                serviceOrder={serviceOrder}
              />
            )}

            {/* 상품 리스트 */}
            {filteredCount === 0 ? (
              <div className="text-center py-12 text-slate-400">
                {activeTab === 'both' && bothTab === 'integrated' ? (
                  <>
                    <div className="text-4xl mb-3">📦</div>
                    <div>연계 상품은 준비 중입니다.</div>
                    <div className="text-sm mt-1">보관 또는 운송 탭에서 개별 상품을 확인하세요.</div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-3">🔍</div>
                    <div>조건에 맞는 상품이 없습니다.</div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* 보관 상품 */}
                {filtered.storage.length > 0 && (
                  <>
                    {activeTab === 'both' && bothTab !== 'storage' && (
                      <div className="text-sm font-semibold text-slate-700 mt-4 mb-2">
                        공간상품 ({filtered.storage.length})
                      </div>
                    )}
                    {filtered.storage.map(product => (
                      <StorageProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedStorageId === product.id}
                        onSelect={() => onSelectStorage?.(product.id)}
                        onDetail={() => {
                          setDetailProduct(product)
                          setDetailProductType('storage')
                        }}
                      />
                    ))}
                  </>
                )}

                {/* 운송 상품 */}
                {filtered.route.length > 0 && (
                  <>
                    {activeTab === 'both' && bothTab !== 'transport' && (
                      <div className="text-sm font-semibold text-slate-700 mt-4 mb-2">
                        경로상품 ({filtered.route.length})
                      </div>
                    )}
                    {filtered.route.map(product => (
                      <RouteProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedRouteId === product.id}
                        onSelect={() => onSelectRoute?.(product.id)}
                        onDetail={() => {
                          setDetailProduct(product)
                          setDetailProductType('route')
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 선택 요약 및 거래 버튼 - 하단 고정 */}
        {filteredCount > 0 && (
          <SearchResultSelectionPanel
            activeTab={activeTab}
            storageProducts={storageProducts}
            routeProducts={routeProducts}
            selectedStorageId={selectedStorageId}
            selectedRouteId={selectedRouteId}
            onSelectStorage={onSelectStorage}
            onSelectRoute={onSelectRoute}
            onStartDeal={onStartDeal}
          />
        )}
      </div>

      {/* PR7: 상품 상세 모달 */}
      <ProductDetailModal
        isOpen={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
        product={detailProduct}
        productType={detailProductType}
        onSelect={() => {
          if (detailProduct) {
            if (detailProductType === 'storage') {
              onSelectStorage?.(detailProduct.id)
            } else {
              onSelectRoute?.(detailProduct.id)
            }
            setDetailProduct(null)
          }
        }}
        isSelected={
          detailProductType === 'storage'
            ? selectedStorageId === detailProduct?.id
            : selectedRouteId === detailProduct?.id
        }
      />
    </div>
  )
}
