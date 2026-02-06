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

import { useState, useMemo, useEffect } from 'react'
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
import {
  calcBillableCubes,
  calcEstimatedTotal,
  calcStorageEstimate,
  type OptionSurcharge,
} from '../../../../engine/settlement/cubeSettlement'
import {
  allocateResource,
  type AllocateResourceParams,
} from '../../../../engine/resource'
import {
  logDealConfirmed,
  logSettlementCalculated,
  logResourceAllocated,
  makeDealId,
} from '../../../../store'

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

  // 완료 확인 카드
  const [showConfirmCard, setShowConfirmCard] = useState(false)

  // 사용자 정보
  const user: UserInfo = DEMO_USER

  // 모달 열릴 때마다 상태 리셋
  useEffect(() => {
    if (isOpen) {
      // 부가 옵션 리셋
      setOptions([
        { id: 'OPT_INSURANCE', name: '화물 보험', description: '화물 가액의 0.5%', price: 5000, selected: false },
        { id: 'OPT_PACKAGING', name: '포장 서비스', description: '전문 포장 서비스', price: 15000, selected: false },
        { id: 'OPT_EXPRESS', name: '빠른 배송', description: '우선 처리', price: 20000, selected: false },
      ])
      // 픽업 상태 리셋
      setPickupRequested(false)
      setPickupLocation('')
      setDropoffLocation('')
      // 메모 리셋
      setUserMemo('')
      // 계약 동의 리셋
      setContractAgreed(false)
      setShowContractModal(false)
      // 완료 확인 카드 리셋
      setShowConfirmCard(false)
    }
  }, [isOpen])

  // PR7: 정산 엔진 기반 비용 계산
  const costCalculation = useMemo(() => {
    // 중량 합계 계산
    const totalWeightKg = registeredCargos.reduce((sum, cargo) => {
      const quantity = cargo.quantity || 1
      return sum + (cargo.weightKg || 0) * quantity
    }, 0)

    // 부가 옵션 (정산 엔진 형식으로 변환)
    const optionSurcharges: OptionSurcharge[] = options
      .filter(opt => opt.selected)
      .map(opt => ({
        id: opt.id,
        name: opt.name,
        amount: opt.price,
      }))

    let storageResult = null
    let routeResult = null
    let storageBillable = null
    let routeBillable = null

    // Storage 정산
    if (storageProduct) {
      // Storage 보관 일수 계산 (간단히 1일로 가정, 실제로는 날짜 차이 계산)
      const days = 1 // TODO: storageCondition.startDate와 endDate로 계산

      storageBillable = calcBillableCubes(
        totalCubes,
        totalWeightKg,
        storageProduct.maxKgPerCube
      )

      storageResult = calcStorageEstimate(
        storageBillable.billableCubes,
        storageProduct.unitPricePerCube,
        days,
        optionSurcharges
      )
    }

    // Route 정산
    if (routeProduct) {
      routeBillable = calcBillableCubes(
        totalCubes,
        totalWeightKg,
        routeProduct.maxKgPerCube
      )

      routeResult = calcEstimatedTotal(
        routeBillable.billableCubes,
        routeProduct.unitPricePerCube,
        optionSurcharges,
        routeBillable.volumeCubes,
        routeBillable.weightCubes
      )
    }

    // 최종 합산
    const totalCost = (storageResult?.total || 0) + (routeResult?.total || 0)

    return {
      // 기존 호환
      baseCost: (storageResult?.base || 0) + (routeResult?.base || 0),
      cubeCost: (storageResult?.base || 0) + (routeResult?.base || 0),
      weightCost: 0, // 중량은 큐브로 환산되어 baseCost에 포함됨
      optionsCost: (storageResult?.options || 0) + (routeResult?.options || 0),
      totalCost,
      // PR7: 정산 breakdown
      totalWeightKg,
      storageBillable,
      routeBillable,
      storageResult,
      routeResult,
    }
  }, [storageProduct, routeProduct, totalCubes, registeredCargos, options])

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

    // 확인 카드 표시
    setShowConfirmCard(true)
  }

  // PR7: 거래 확정 (재고 차감 + 이벤트 로깅)
  const handleConfirmDeal = () => {
    const dealId = makeDealId()

    // 1. 거래 확정 이벤트 로깅
    logDealConfirmed(
      dealId,
      (costCalculation.storageBillable?.billableCubes || 0) + (costCalculation.routeBillable?.billableCubes || 0),
      costCalculation.totalWeightKg
    )

    // 2. Storage 재고 차감
    if (storageProduct && costCalculation.storageBillable) {
      const params: AllocateResourceParams = {
        offerId: storageProduct.id,
        offerType: 'storage',
        billableCubes: costCalculation.storageBillable.billableCubes,
        totalWeightKg: costCalculation.totalWeightKg,
      }

      const result = allocateResource(params)

      if (result.success) {
        // 정산 계산 이벤트
        logSettlementCalculated(
          dealId,
          costCalculation.storageBillable.volumeCubes,
          costCalculation.storageBillable.weightCubes,
          costCalculation.storageBillable.billableCubes,
          storageProduct.unitPricePerCube,
          costCalculation.storageResult?.total || 0
        )

        // 자원 할당 이벤트
        logResourceAllocated(
          dealId,
          storageProduct.id,
          'storage',
          costCalculation.storageBillable.billableCubes,
          costCalculation.totalWeightKg
        )

        console.log('[Storage 재고 차감 완료]', result.message)
      } else {
        console.error('[Storage 재고 차감 실패]', result.message)
        alert(`보관 서비스 재고 차감 실패: ${result.message}`)
        return
      }
    }

    // 3. Route 재고 차감
    if (routeProduct && costCalculation.routeBillable) {
      const params: AllocateResourceParams = {
        offerId: routeProduct.id,
        offerType: 'route',
        billableCubes: costCalculation.routeBillable.billableCubes,
        totalWeightKg: costCalculation.totalWeightKg,
      }

      const result = allocateResource(params)

      if (result.success) {
        // 정산 계산 이벤트
        logSettlementCalculated(
          dealId,
          costCalculation.routeBillable.volumeCubes,
          costCalculation.routeBillable.weightCubes,
          costCalculation.routeBillable.billableCubes,
          routeProduct.unitPricePerCube,
          costCalculation.routeResult?.total || 0
        )

        // 자원 할당 이벤트
        logResourceAllocated(
          dealId,
          routeProduct.id,
          'route',
          costCalculation.routeBillable.billableCubes,
          costCalculation.totalWeightKg
        )

        console.log('[Route 재고 차감 완료]', result.message)
      } else {
        console.error('[Route 재고 차감 실패]', result.message)
        alert(`운송 서비스 재고 차감 실패: ${result.message}`)
        return
      }
    }

    // 4. 완료 처리
    onDealComplete?.()
    onClose()
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

          {/* 4. 거래 요약 (PR7: 정산 breakdown) */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-3">거래 요약</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              {/* Storage 정산 */}
              {storageProduct && costCalculation.storageBillable && (
                <div className="pb-3 border-b border-slate-300">
                  <div className="text-sm font-semibold text-slate-700 mb-2">보관 서비스</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>부피 큐브</span>
                      <span>{costCalculation.storageBillable.volumeCubes} 큐브</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>중량 환산 큐브</span>
                      <span>{costCalculation.storageBillable.weightCubes} 큐브</span>
                    </div>
                    <div className="flex justify-between font-medium text-teal-700">
                      <span>과금 큐브 (max)</span>
                      <span>{costCalculation.storageBillable.billableCubes} 큐브</span>
                    </div>
                    {costCalculation.storageBillable.weightSurchargeApplied && (
                      <div className="text-xs text-orange-600 mt-1">
                        ⚠ 중량 보정 적용됨
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-slate-900 pt-2 border-t border-slate-200">
                      <span>보관 비용</span>
                      <span>{costCalculation.storageResult?.base.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Route 정산 */}
              {routeProduct && costCalculation.routeBillable && (
                <div className={storageProduct ? 'pb-3 border-b border-slate-300' : ''}>
                  <div className="text-sm font-semibold text-slate-700 mb-2">운송 서비스</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>부피 큐브</span>
                      <span>{costCalculation.routeBillable.volumeCubes} 큐브</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>중량 환산 큐브</span>
                      <span>{costCalculation.routeBillable.weightCubes} 큐브</span>
                    </div>
                    <div className="flex justify-between font-medium text-teal-700">
                      <span>과금 큐브 (max)</span>
                      <span>{costCalculation.routeBillable.billableCubes} 큐브</span>
                    </div>
                    {costCalculation.routeBillable.weightSurchargeApplied && (
                      <div className="text-xs text-orange-600 mt-1">
                        ⚠ 중량 보정 적용됨
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-slate-900 pt-2 border-t border-slate-200">
                      <span>운송 비용</span>
                      <span>{costCalculation.routeResult?.base.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 총 중량 정보 */}
              <div className="text-xs text-slate-600 bg-slate-100 rounded p-2">
                총 중량: {costCalculation.totalWeightKg.toFixed(1)}kg
              </div>

              {/* 부가 옵션 */}
              {costCalculation.optionsCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">부가 옵션</span>
                  <span className="font-medium text-teal-600">+{costCalculation.optionsCost.toLocaleString()}원</span>
                </div>
              )}

              {/* 최종 총액 */}
              <div className="pt-3 border-t border-slate-300 flex justify-between">
                <span className="font-bold text-slate-900 text-lg">최종 예상 금액</span>
                <span className="font-bold text-teal-700 text-2xl">{Math.round(costCalculation.totalCost).toLocaleString()}원</span>
              </div>
              <div className="text-xs text-slate-500 pt-2 space-y-1">
                <div>• 큐브 당 단가 기준으로 계산됩니다.</div>
                <div>• 중량이 무거울 경우 과금 큐브가 증가합니다.</div>
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

      {/* 8. 거래 확정 확인 카드 */}
      {showConfirmCard && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-teal-600">✓</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">거래를 확정하시겠습니까?</h3>
              <p className="text-sm text-slate-600">
                거래 신청이 완료되면 업체에서 확인 후 연락드립니다.
              </p>
              <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                <div className="text-sm text-slate-600">최종 예상 금액</div>
                <div className="text-2xl font-bold text-teal-700 mt-1">
                  {Math.round(costCalculation.totalCost).toLocaleString()}원
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmCard(false)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDeal}
                className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
              >
                확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
