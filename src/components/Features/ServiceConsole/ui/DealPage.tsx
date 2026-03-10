/**
 * DealPage - 거래 페이지
 * PR7: 8개 필수 섹션 구현
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
import { DEMO_USER } from '../../../../data/mock/mockData'
import type { ServiceType } from '../hooks/useServiceConsoleState'
import {
  calcBillableCubes,
  calcEstimatedTotal,
  calcStorageEstimate,
  type OptionSurcharge,
} from '../../../../engine/pricing/cubeSettlement'
import {
  allocateResource,
  type AllocateResourceParams,
} from '../../../../layers/matching/resource'
import {
  logDealConfirmed,
  logSettlementCalculated,
  logResourceAllocated,
  makeDealId,
} from '../../../../infra/storage'
import { DealUserSection } from './deal/DealUserSection'
import { DealCargoSummary } from './deal/DealCargoSummary'
import { DealOptionsSection } from './deal/DealOptionsSection'
import { DealPickupSection } from './deal/DealPickupSection'
import { DealPricingSection, type DealCostCalculation } from './deal/DealPricingSection'
import { DealContractModal } from './deal/DealContractModal'
import { DealConfirmCard } from './deal/DealConfirmCard'
import { DealHeaderSection } from './deal/DealHeaderSection'
import { DealMemoSection } from './deal/DealMemoSection'
import { DealContractSection } from './deal/DealContractSection'
import { DealFooterButtons } from './deal/DealFooterButtons'

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
      setOptions([
        { id: 'OPT_INSURANCE', name: '화물 보험', description: '화물 가액의 0.5%', price: 5000, selected: false },
        { id: 'OPT_PACKAGING', name: '포장 서비스', description: '전문 포장 서비스', price: 15000, selected: false },
        { id: 'OPT_EXPRESS', name: '빠른 배송', description: '우선 처리', price: 20000, selected: false },
      ])
      setPickupRequested(false)
      setPickupLocation('')
      setDropoffLocation('')
      setUserMemo('')
      setContractAgreed(false)
      setShowContractModal(false)
      setShowConfirmCard(false)
    }
  }, [isOpen])

  // PR7: 정산 엔진 기반 비용 계산
  const costCalculation = useMemo((): DealCostCalculation => {
    const totalWeightKg = registeredCargos.reduce((sum, cargo) => {
      const quantity = cargo.quantity || 1
      return sum + (cargo.weightKg || 0) * quantity
    }, 0)

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

    const storageDaysIsEstimated = !(storageCondition.startDate && storageCondition.endDate)
    const storageDays = storageDaysIsEstimated
      ? 1
      : Math.max(1, Math.ceil(
          (new Date(storageCondition.endDate!).getTime() - new Date(storageCondition.startDate!).getTime())
          / (1000 * 60 * 60 * 24)
        ))

    if (storageProduct) {
      storageBillable = calcBillableCubes(totalCubes, totalWeightKg, storageProduct.maxKgPerCube)
      storageResult = calcStorageEstimate(storageBillable.billableCubes, storageProduct.unitPricePerCube, storageDays, optionSurcharges)
    }

    if (routeProduct) {
      routeBillable = calcBillableCubes(totalCubes, totalWeightKg, routeProduct.maxKgPerCube)
      routeResult = calcEstimatedTotal(routeBillable.billableCubes, routeProduct.unitPricePerCube, optionSurcharges, routeBillable.volumeCubes, routeBillable.weightCubes)
    }

    const totalCost = (storageResult?.total || 0) + (routeResult?.total || 0)

    return {
      baseCost: (storageResult?.base || 0) + (routeResult?.base || 0),
      cubeCost: (storageResult?.base || 0) + (routeResult?.base || 0),
      weightCost: 0,
      optionsCost: (storageResult?.options || 0) + (routeResult?.options || 0),
      totalCost,
      totalWeightKg,
      storageBillable,
      routeBillable,
      storageResult,
      routeResult,
      storageDays,
      storageDaysIsEstimated,
    }
  }, [storageProduct, routeProduct, totalCubes, registeredCargos, options, storageCondition])

  // 옵션 토글
  const toggleOption = (optionId: string) => {
    setOptions(options.map(opt =>
      opt.id === optionId ? { ...opt, selected: !opt.selected } : opt
    ))
  }

  const handleSubmitDeal = () => {
    if (!contractAgreed) { setShowContractModal(true); return }
    setShowConfirmCard(true)
  }

  const handleConfirmDeal = () => {
    const dealId = makeDealId()
    logDealConfirmed(
      dealId,
      (costCalculation.storageBillable?.billableCubes || 0) + (costCalculation.routeBillable?.billableCubes || 0),
      costCalculation.totalWeightKg
    )
    if (storageProduct && costCalculation.storageBillable) {
      const params: AllocateResourceParams = {
        offerId: storageProduct.id, offerType: 'storage',
        billableCubes: costCalculation.storageBillable.billableCubes,
        totalWeightKg: costCalculation.totalWeightKg,
      }
      const result = allocateResource(params)
      if (result.success) {
        logSettlementCalculated(dealId, costCalculation.storageBillable.volumeCubes, costCalculation.storageBillable.weightCubes, costCalculation.storageBillable.billableCubes, storageProduct.unitPricePerCube, costCalculation.storageResult?.total || 0)
        logResourceAllocated(dealId, storageProduct.id, 'storage', costCalculation.storageBillable.billableCubes, costCalculation.totalWeightKg)
      } else { alert(`보관 서비스 재고 차감 실패: ${result.message}`); return }
    }
    if (routeProduct && costCalculation.routeBillable) {
      const params: AllocateResourceParams = {
        offerId: routeProduct.id, offerType: 'route',
        billableCubes: costCalculation.routeBillable.billableCubes,
        totalWeightKg: costCalculation.totalWeightKg,
      }
      const result = allocateResource(params)
      if (result.success) {
        logSettlementCalculated(dealId, costCalculation.routeBillable.volumeCubes, costCalculation.routeBillable.weightCubes, costCalculation.routeBillable.billableCubes, routeProduct.unitPricePerCube, costCalculation.routeResult?.total || 0)
        logResourceAllocated(dealId, routeProduct.id, 'route', costCalculation.routeBillable.billableCubes, costCalculation.totalWeightKg)
      } else { alert(`운송 서비스 재고 차감 실패: ${result.message}`); return }
    }
    onDealComplete?.()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DealHeaderSection activeTab={activeTab} onClose={onClose} />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DealUserSection user={user} />
          <DealCargoSummary
            activeTab={activeTab}
            registeredCargos={registeredCargos}
            totalCubes={totalCubes}
            totalPallets={totalPallets}
            storageCondition={storageCondition}
            transportCondition={transportCondition}
          />
          <DealOptionsSection options={options} onToggle={toggleOption} />
          {(activeTab === 'storage' || activeTab === 'transport') && (
            <DealPickupSection
              activeTab={activeTab}
              pickupRequested={pickupRequested}
              onPickupRequestChange={setPickupRequested}
              pickupLocation={pickupLocation}
              onPickupLocationChange={setPickupLocation}
              dropoffLocation={dropoffLocation}
              onDropoffLocationChange={setDropoffLocation}
            />
          )}
          <DealPricingSection
            activeTab={activeTab}
            storageProduct={storageProduct}
            routeProduct={routeProduct}
            costCalculation={costCalculation}
          />
          <DealMemoSection value={userMemo} onChange={setUserMemo} />
          <DealContractSection
            agreed={contractAgreed}
            onChange={setContractAgreed}
            storageProduct={storageProduct}
            routeProduct={routeProduct}
            onViewContract={() => setShowContractModal(true)}
          />
        </div>

        <DealFooterButtons
          onCancel={onClose}
          onSubmit={handleSubmitDeal}
          canSubmit={contractAgreed}
        />
      </div>

      {showContractModal && (
        <DealContractModal
          onClose={() => setShowContractModal(false)}
          onAgree={() => setContractAgreed(true)}
        />
      )}
      {showConfirmCard && (
        <DealConfirmCard
          totalCost={costCalculation.totalCost}
          onCancel={() => setShowConfirmCard(false)}
          onConfirm={handleConfirmDeal}
        />
      )}
    </div>
  )
}
