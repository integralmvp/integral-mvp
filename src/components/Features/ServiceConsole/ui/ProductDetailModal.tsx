/**
 * ProductDetailModal - 상품 상세 페이지
 * PR7: 업체 정보, 상품 상세, 규정/제한 정보 표시
 */

import type { StorageProduct, RouteProduct } from '../../../../types/models'
import { formatFeatureLabel } from '../../../../infra/dataspec/codedata/features/featureCodes'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: StorageProduct | RouteProduct | null
  productType: 'storage' | 'route'
  onSelect: () => void
  isSelected: boolean
}

export default function ProductDetailModal({
  isOpen,
  onClose,
  product,
  productType,
  onSelect,
  isSelected,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null

  const isStorage = productType === 'storage'
  const storageProduct = isStorage ? (product as StorageProduct) : null
  const routeProduct = !isStorage ? (product as RouteProduct) : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">
                {isStorage ? '보관 상품' : '운송 상품'}
              </div>
              <h2 className="text-2xl font-bold">
                {isStorage
                  ? storageProduct!.location.name
                  : `${routeProduct!.origin.name} → ${routeProduct!.destination.name}`}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl font-light ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">기본 정보</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              {isStorage ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">보관 타입</span>
                    <span className="font-medium text-slate-900">{storageProduct!.storageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">수용 용량</span>
                    <span className="font-medium text-slate-900">{storageProduct!.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">지역</span>
                    <span className="font-medium text-slate-900">{storageProduct!.location.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">제공 기능</span>
                    <div className="flex gap-1 flex-wrap">
                      {storageProduct!.features.map((feature, i) => (
                        <span key={i} className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                          {formatFeatureLabel(feature)}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-600">경로 범위</span>
                    <span className="font-medium text-slate-900">
                      {routeProduct!.routeScope === 'INTRA_JEJU' ? '도내' : '해상'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">차량 타입</span>
                    <span className="font-medium text-slate-900">{routeProduct!.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">수용 용량</span>
                    <span className="font-medium text-slate-900">{routeProduct!.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">운행 일정</span>
                    <span className="font-medium text-slate-900">{routeProduct!.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">취급 화물</span>
                    <div className="flex gap-1 flex-wrap">
                      {routeProduct!.cargoTypes.map((type, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 업체 정보 (필수) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">업체 정보</h3>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-lg">{product.provider.name}</div>
                  <div className="text-sm text-slate-600 mt-1">{product.provider.serviceType} 전문</div>
                </div>
                {product.provider.verified && (
                  <span className="bg-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    인증업체
                  </span>
                )}
              </div>
              {product.provider.description && (
                <p className="text-sm text-slate-700">{product.provider.description}</p>
              )}
              <div className="pt-3 border-t border-teal-200 space-y-2">
                {product.provider.pickupAvailable !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${product.provider.pickupAvailable ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    <span className="text-slate-700">
                      픽업 서비스 {product.provider.pickupAvailable ? '가능' : '불가'}
                    </span>
                  </div>
                )}
                {product.provider.weightLimitKg && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-700">
                      최대 중량 제한: {product.provider.weightLimitKg}kg
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 규정 및 제한 사항 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">규정 및 제한 사항</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">최대 중량</span>
                <span className="font-medium text-slate-900">
                  {product.maxWeightKg ? `${product.maxWeightKg}kg` : '제한 없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">최대 3변합</span>
                <span className="font-medium text-slate-900">
                  {product.maxSumCm ? `${product.maxSumCm}cm` : '제한 없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">최소 물량</span>
                <span className="font-medium text-slate-900">
                  {product.minCubes ? `${product.minCubes} 큐브` : '제한 없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">온도 관리</span>
                <span className="font-medium text-slate-900">
                  {product.tempSupported ? '지원' : '미지원'}
                </span>
              </div>
              {product.allowedItemCodes && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-slate-600 text-sm mb-1">허용 품목</div>
                  <div className="text-xs text-slate-500">
                    {product.allowedItemCodes.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 용량 정보 (PR5) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">용량 정보</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">총 수용 가능</span>
                <span className="font-medium text-slate-900">{product.capacityCubes} 큐브</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">현재 남은 용량</span>
                <span className="font-medium text-teal-700">{product.remainingCubes} 큐브</span>
              </div>
              {/* 용량 게이지 */}
              <div className="pt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(product.remainingCubes / product.capacityCubes) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 text-right mt-1">
                  {Math.round((product.remainingCubes / product.capacityCubes) * 100)}% 가용
                </div>
              </div>
            </div>
          </section>

          {/* 가격 정보 (PR7: 큐브 단가 기반) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">가격 정보</h3>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold text-teal-700">
                    ₩{product.unitPricePerCube.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    /Cube{isStorage ? '/일' : ''}
                  </div>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <div>큐브 당 단가</div>
                  <div className="text-xs text-slate-500 mt-1">
                    (1 Cube = 250mm³)
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200 space-y-1">
                <div className="text-xs text-slate-600">
                  • 최종 금액은 실제 사용 큐브 및 중량에 따라 달라질 수 있습니다.
                </div>
                <div className="text-xs text-slate-600">
                  • 중량이 무거울 경우 과금 큐브가 증가할 수 있습니다.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              onClick={onSelect}
              disabled={isSelected}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                isSelected
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isSelected ? '이미 선택됨' : '이 상품 선택'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
