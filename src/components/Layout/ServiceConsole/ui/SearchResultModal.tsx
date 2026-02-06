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
import type { RegulationSummary } from '../../../../engine/regulation'
import type { ServiceType } from '../hooks/useServiceConsoleState'
import { JEJU_LOCATIONS } from '../../../../data/mockData'
import ProductDetailModal from './ProductDetailModal'

// 장소 ID를 한글 이름으로 변환
const getLocationName = (locationId?: string): string => {
  if (!locationId) return '전체'
  const location = JEJU_LOCATIONS.find(l => l.id === locationId)
  return location?.name || locationId
}

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

// 탭별 헤더 정보
const TAB_HEADERS: Record<ServiceType, { title: string; subtitle: string }> = {
  storage: {
    title: '공간상품',
    subtitle: '원하는 조건의 공간상품을 한 눈에 비교하고 선택하세요.',
  },
  transport: {
    title: '경로상품',
    subtitle: '원하는 조건의 경로상품을 한 눈에 비교하고 선택하세요.',
  },
  both: {
    title: '공간+경로 연계 상품',
    subtitle: '원하는 조건에 맞춰, 보관과 운송을 한 번에',
  },
}

// 보관+운송 모달 내부 탭 타입
type BothModalTab = 'integrated' | 'storage' | 'transport'

// 보관 상품 카드
function StorageProductCard({
  product,
  isSelected,
  onSelect,
  onDetail
}: {
  product: StorageProduct
  isSelected: boolean
  onSelect: () => void
  onDetail: () => void
}) {
  return (
    <div className={`w-full p-4 bg-white rounded-xl border transition-all ${
      isSelected ? 'border-teal-500 shadow-md' : 'border-slate-200'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="font-bold text-slate-900">{product.location.name}</div>
              <div className="text-xs text-slate-500 mt-1">{product.provider.name}</div>
              <div className="text-sm text-slate-600 mt-1">
                {product.storageType} · {product.capacity}
              </div>
            </div>
            {product.provider.verified && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">인증</span>
            )}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.features.slice(0, 3).map((feature, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {feature}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-teal-700 font-bold text-lg">
            ₩{product.unitPricePerCube.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">/Cube/일</div>
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

// 운송 상품 카드
function RouteProductCard({
  product,
  isSelected,
  onSelect,
  onDetail
}: {
  product: RouteProduct
  isSelected: boolean
  onSelect: () => void
  onDetail: () => void
}) {
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

// 입력 조건 요약 컴포넌트
function ConditionSummary({
  activeTab,
  registeredCargos,
  totalCubes,
  totalPallets,
  storageCondition,
  transportCondition,
  serviceOrder,
}: {
  activeTab: ServiceType
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  storageCondition: StorageCondition
  transportCondition: TransportCondition
  serviceOrder?: ServiceOrder
}) {
  // 자동 연계 날짜 계산 (보관+운송 탭에서 사용)
  const effectiveOrder = serviceOrder || 'storage-first'

  // 보관 시작일: transport-first인 경우 운송일과 연동
  const effectiveStorageStartDate = activeTab === 'both' && effectiveOrder === 'transport-first' && transportCondition.transportDate
    ? transportCondition.transportDate
    : storageCondition.startDate

  // 운송일: storage-first인 경우 보관 종료일과 연동
  const effectiveTransportDate = activeTab === 'both' && effectiveOrder === 'storage-first' && storageCondition.endDate
    ? storageCondition.endDate
    : transportCondition.transportDate

  return (
    <div className="bg-slate-50 rounded-xl p-4 mb-4">
      <div className="text-xs font-semibold text-slate-500 mb-2">입력 조건 요약</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* 화물 정보 */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-400 mb-1">화물</div>
          <div className="font-medium text-slate-900">
            {registeredCargos.length > 0
              ? `${registeredCargos.length}건 등록`
              : '미등록'}
          </div>
        </div>

        {/* 물량 */}
        <div className="bg-white rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-400 mb-1">물량</div>
          <div className="font-medium text-slate-900">
            {totalCubes > 0
              ? activeTab === 'storage'
                ? `${totalPallets} 파레트`
                : activeTab === 'transport'
                  ? `${totalCubes} 큐브`
                  : `${totalPallets} 파레트 / ${totalCubes} 큐브`
              : '-'}
          </div>
        </div>

        {/* 보관 조건 */}
        {(activeTab === 'storage' || activeTab === 'both') && (
          <>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">보관 장소</div>
              <div className="font-medium text-slate-900">
                {getLocationName(storageCondition.location)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">보관 기간</div>
              <div className="font-medium text-slate-900">
                {effectiveStorageStartDate && storageCondition.endDate
                  ? `${effectiveStorageStartDate} ~ ${storageCondition.endDate}`
                  : effectiveStorageStartDate || storageCondition.endDate || '-'}
              </div>
            </div>
          </>
        )}

        {/* 운송 조건 */}
        {(activeTab === 'transport' || activeTab === 'both') && (
          <>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">출발지 → 도착지</div>
              <div className="font-medium text-slate-900">
                {transportCondition.origin && transportCondition.destination
                  ? `${getLocationName(transportCondition.origin)} → ${getLocationName(transportCondition.destination)}`
                  : getLocationName(transportCondition.origin) || getLocationName(transportCondition.destination) || '전체'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="text-xs text-slate-400 mb-1">운송일</div>
              <div className="font-medium text-slate-900">
                {effectiveTransportDate || '-'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
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

  const header = TAB_HEADERS[activeTab]
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
        {/* 헤더 */}
        <div className="bg-teal-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{header.title}</h2>
              <p className="text-teal-200 text-sm mt-1">{header.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none p-1"
            >
              ×
            </button>
          </div>

          {/* 결과 카운트 */}
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {totalCount}건의 상품
            </span>
            {summary && summary.failedCount > 0 && (
              <span className="text-teal-200 text-xs">
                (조건 불일치 {summary.failedCount}건 제외)
              </span>
            )}
          </div>
        </div>

        {/* 컨텐츠 영역 - 모달 전체 스크롤 */}
        <div className="flex-1 overflow-y-auto">
          {/* 보관+운송일 경우: 입력 조건 요약 → 안내문구 → 탭 → 상품 리스트 (전체 스크롤) */}
          {activeTab === 'both' && (
            <>
              {/* 입력 조건 요약 */}
              <div className="px-6 pt-4">
                <ConditionSummary
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

              {/* 내부 탭 (순서에 따라 탭 순서 변경) - sticky로 스크롤 시 상단 고정 */}
              <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
                <button
                  onClick={() => setBothTab('integrated')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    bothTab === 'integrated'
                      ? 'text-teal-700 border-b-2 border-teal-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  연계
                </button>
                {effectiveOrder === 'storage-first' ? (
                  <>
                    <button
                      onClick={() => setBothTab('storage')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        bothTab === 'storage'
                          ? 'text-teal-700 border-b-2 border-teal-700'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      보관
                    </button>
                    <button
                      onClick={() => setBothTab('transport')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        bothTab === 'transport'
                          ? 'text-teal-700 border-b-2 border-teal-700'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      운송
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setBothTab('transport')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        bothTab === 'transport'
                          ? 'text-teal-700 border-b-2 border-teal-700'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      운송
                    </button>
                    <button
                      onClick={() => setBothTab('storage')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        bothTab === 'storage'
                          ? 'text-teal-700 border-b-2 border-teal-700'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      보관
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* 상품 리스트 영역 */}
          <div className="p-6">
            {/* 보관/운송 단일 탭일 경우 입력 조건 요약 */}
            {activeTab !== 'both' && (
              <ConditionSummary
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
              disabled={
                (activeTab === 'storage' && !selectedStorageId) ||
                (activeTab === 'transport' && !selectedRouteId) ||
                (activeTab === 'both' && (!selectedStorageId || !selectedRouteId))
              }
              className={`w-full mt-4 py-3 rounded-lg font-medium transition-colors ${
                (activeTab === 'storage' && selectedStorageId) ||
                (activeTab === 'transport' && selectedRouteId) ||
                (activeTab === 'both' && selectedStorageId && selectedRouteId)
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              거래 진행
            </button>
          </div>
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
