/**
 * DealPage - 거래 페이지
 * PR7: 8개 필수 섹션 구현
 *
 * 1. 사용자 정보
 * 2. 화물 정보 및 입력 조건 요약
 * 3. 부가 옵션 영역
 * 4. 거래 요약 (비용 계산)
 * 5. 사용자 요청 메모
 * 6. 거래 신청 완료 버튼
 * 7. 필수 동의 영역 (계약서 동의 모달)
 * 8. 동의 완료 시 거래 신청 완료 토스트
 */

import { useState, useMemo } from 'react'
import type {
  StorageProduct,
  RouteProduct,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  DealOption,
  UserInfo,
} from '../../../../types/models'
import { DEMO_USER } from '../../../../data/mockData'
import type { ServiceType } from '../hooks/useServiceConsoleState'

interface DealPageProps {
  isOpen: boolean
  onClose: () => void
  activeTab: ServiceType
  storageProduct?: StorageProduct
  routeProduct?: RouteProduct
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  storageCondition: StorageCondition
  transportCondition: TransportCondition
  onDealComplete?: () => void
}

export default function DealPage({
  isOpen,
  onClose,
  activeTab,
  storageProduct,
  routeProduct,
  registeredCargos,
  totalCubes,
  totalPallets,
  storageCondition,
  transportCondition,
  onDealComplete,
}: DealPageProps) {
  // 부가 옵션 상태
  const [options, setOptions] = useState<DealOption[]>([
    { id: 'OPT_INSURANCE', name: '화물 보험', description: '화물 가액의 0.5%', price: 5000, selected: false },
    { id: 'OPT_PACKAGING', name: '포장 서비스', description: '전문 포장 서비스', price: 15000, selected: false },
    { id: 'OPT_EXPRESS', name: '빠른 배송', description: '우선 처리', price: 20000, selected: false },
  ])

  // 픽업 요청 상태
  const [pickupRequested, setPickupRequested] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropoffLocation, setDropoffLocation] = useState('')

  // 사용자 메모
  const [userMemo, setUserMemo] = useState('')

  // 계약 동의 모달
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAgreed, setContractAgreed] = useState(false)

  // 완료 토스트
  const [showCompleteToast, setShowCompleteToast] = useState(false)

  // 사용자 정보
  const user: UserInfo = DEMO_USER

  // 비용 계산
  const costCalculation = useMemo(() => {
    let baseCost = 0
    let cubeCost = 0
    let weightCost = 0

    // 기본 가격
    if (storageProduct) {
      baseCost += storageProduct.price
      // 큐브 기반 계산 (팔레트 단위)
      cubeCost += totalPallets * storageProduct.price
    }

    if (routeProduct) {
      baseCost += routeProduct.price
      // 큐브 기반 계산
      cubeCost += totalCubes * (routeProduct.price / routeProduct.capacityCubes)
    }

    // 초과 중량 계산
    registeredCargos.forEach(cargo => {
      const weightLimit = storageProduct?.provider.weightLimitKg || routeProduct?.provider.weightLimitKg || 20
      if (cargo.weightKg && cargo.weightKg > weightLimit) {
        const overweight = cargo.weightKg - weightLimit
        weightCost += overweight * 1000 // 1kg당 1000원 추가
      }
    })

    // 부가 옵션 비용
    const optionsCost = options
      .filter(opt => opt.selected)
      .reduce((sum, opt) => sum + opt.price, 0)

    // 최종 총액
    const totalCost = baseCost + cubeCost + weightCost + optionsCost

    return {
      baseCost,
      cubeCost,
      weightCost,
      optionsCost,
      totalCost,
    }
  }, [storageProduct, routeProduct, totalCubes, totalPallets, registeredCargos, options])

  // 옵션 토글
  const toggleOption = (optionId: string) => {
    setOptions(options.map(opt =>
      opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
    ))
  }

  // 거래 신청
  const handleSubmitDeal = () => {
    if (!contractAgreed) {
      setShowContractModal(true)
      return
    }

    // 거래 신청 완료
    setShowCompleteToast(true)
    setTimeout(() => {
      onDealComplete?.()
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">거래 신청서 작성</div>
              <h2 className="text-2xl font-bold">
                {activeTab === 'storage' && '보관 서비스 거래'}
                {activeTab === 'transport' && '운송 서비스 거래'}
                {activeTab === 'both' && '보관 + 운송 통합 거래'}
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
          {/* 1. 사용자 정보 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">사용자 정보</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">이름</span>
                <span className="font-medium text-slate-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">이메일</span>
                <span className="font-medium text-slate-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">연락처</span>
                <span className="font-medium text-slate-900">{user.phone}</span>
              </div>
            </div>
          </section>

          {/* 2. 화물 정보 및 입력 조건 요약 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">화물 정보 및 조건</h3>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">등록 화물</span>
                <span className="text-teal-700 font-bold">{registeredCargos.length}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-medium">총 물량</span>
                <span className="text-teal-700 font-bold">
                  {totalCubes} 큐브 ({totalPallets} 팔레트)
                </span>
              </div>
              {(activeTab === 'storage' || activeTab === 'both') && storageCondition.location && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">보관 장소</span>
                  <span className="text-slate-900">{storageCondition.location}</span>
                </div>
              )}
              {(activeTab === 'transport' || activeTab === 'both') && transportCondition.origin && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">운송 경로</span>
                  <span className="text-slate-900">
                    {transportCondition.origin} → {transportCondition.destination}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 3. 부가 옵션 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">부가 옵션</h3>
            <div className="space-y-2">
              {options.map(option => (
                <label
                  key={option.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    option.selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{option.name}</div>
                    <div className="text-sm text-slate-600">{option.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-teal-700 font-bold">+{option.price.toLocaleString()}원</div>
                    <input
                      type="checkbox"
                      checked={option.selected}
                      onChange={() => toggleOption(option.id)}
                      className="w-5 h-5 text-teal-600 rounded"
                    />
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* 픽업 요청 (탭별) */}
          {(activeTab === 'storage' || activeTab === 'transport') && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                {activeTab === 'storage' ? '픽업 요청' : '위탁 방식'}
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pickupRequested}
                    onChange={(e) => setPickupRequested(e.target.checked)}
                    className="w-5 h-5 text-teal-600 rounded"
                  />
                  <span className="text-slate-900 font-medium">
                    {activeTab === 'storage' ? '픽업 서비스 이용' : '픽업 요청'}
                  </span>
                </label>

                {pickupRequested && activeTab === 'storage' && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">픽업 장소</label>
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="픽업 장소를 입력하세요"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}

                {!pickupRequested && activeTab === 'transport' && (
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">위탁 장소</label>
                    <select
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                    >
                      <option value="">위탁 장소 선택</option>
                      <option value="제주항">제주항</option>
                      <option value="서귀포항">서귀포항</option>
                      <option value="제주공항">제주공항</option>
                    </select>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. 거래 요약 (비용 계산) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">거래 요약</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">기본 금액</span>
                <span className="font-medium text-slate-900">{costCalculation.baseCost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">큐브 기반 금액</span>
                <span className="font-medium text-slate-900">{Math.round(costCalculation.cubeCost).toLocaleString()}원</span>
              </div>
              {costCalculation.weightCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">초과 중량 추가</span>
                  <span className="font-medium text-orange-600">+{costCalculation.weightCost.toLocaleString()}원</span>
                </div>
              )}
              {costCalculation.optionsCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">부가 옵션</span>
                  <span className="font-medium text-teal-600">+{costCalculation.optionsCost.toLocaleString()}원</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-300 flex justify-between">
                <span className="font-bold text-slate-900 text-lg">최종 예상 금액</span>
                <span className="font-bold text-teal-700 text-2xl">{Math.round(costCalculation.totalCost).toLocaleString()}원</span>
              </div>
              <div className="text-xs text-slate-500 pt-2">
                * 최종 금액은 실제 사용량 및 중량에 따라 변동될 수 있습니다.
              </div>
            </div>
          </section>

          {/* 5. 사용자 요청 메모 */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">요청 사항 (선택)</h3>
            <textarea
              value={userMemo}
              onChange={(e) => setUserMemo(e.target.value)}
              placeholder="추가 요청 사항이 있으시면 입력해주세요"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 resize-none h-24"
            />
          </section>

          {/* 7. 계약 동의 체크박스 */}
          <section>
            <label className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <input
                type="checkbox"
                checked={contractAgreed}
                onChange={(e) => setContractAgreed(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded mt-0.5"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">전자 간이 계약서에 동의합니다</div>
                <div className="text-sm text-slate-600 mt-1">
                  {storageProduct && `${storageProduct.provider.name} - ${storageProduct.provider.contractTemplate}`}
                  {routeProduct && `${routeProduct.provider.name} - ${routeProduct.provider.contractTemplate}`}
                </div>
                <button
                  onClick={() => setShowContractModal(true)}
                  className="text-sm text-teal-600 hover:text-teal-700 underline mt-2"
                >
                  계약서 전문 보기
                </button>
              </div>
            </label>
          </section>
        </div>

        {/* 6. 하단 버튼 */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmitDeal}
              disabled={!contractAgreed}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
                contractAgreed
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              거래 신청
            </button>
          </div>
        </div>
      </div>

      {/* 계약서 모달 */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">전자 간이 계약서</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
              <section>
                <h4 className="font-bold text-slate-900 mb-2">제 1 조 (목적)</h4>
                <p>본 계약은 물류 서비스 제공에 관한 사항을 정함을 목적으로 합니다.</p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">제 2 조 (서비스 내용)</h4>
                <p>
                  갑(서비스 제공자)은 을(이용자)에게 화물 보관 및 운송 서비스를 제공하며,
                  을은 본 계약에서 정한 요금을 지불합니다.
                </p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">제 3 조 (요금 및 결제)</h4>
                <p>
                  서비스 요금은 실제 사용량 및 중량에 따라 산정되며,
                  등록된 결제 수단으로 후불 결제됩니다.
                </p>
              </section>
              <section>
                <h4 className="font-bold text-slate-900 mb-2">제 4 조 (책임 및 면책)</h4>
                <p>
                  갑은 정상적인 관리 범위 내에서 발생한 화물 손상에 대해 책임을 지며,
                  천재지변 등 불가항력적 사유로 인한 손해는 면책됩니다.
                </p>
              </section>
            </div>
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setContractAgreed(true)
                  setShowContractModal(false)
                }}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. 거래 신청 완료 토스트 */}
      {showCompleteToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="text-2xl">✓</div>
          <div>
            <div className="font-bold">거래 신청이 완료되었습니다!</div>
            <div className="text-sm opacity-90">업체에서 확인 후 연락드리겠습니다.</div>
          </div>
        </div>
      )}
    </div>
  )
}
