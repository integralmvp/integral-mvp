// 서비스 콘솔 상태 관리 훅 - Facade (단일 진실 소스)
// 기능 로직은 각 서브훅에 위임:
//   - useCargoRegistration: 화물 UI 상태 + 등록/물량 액션
//   - useMatchingPreview: 파이프라인 실행 + 검색 스냅샷

import { useState, useEffect, useCallback } from 'react'
import type {
  CargoUI,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  ServiceOrder,
  ServiceType as ServiceTypeModel,
  StorageProduct,
  RouteProduct,
} from '../../../../types/models'
import type { DemandResult } from '../../../../engine/cube'
import type { PipelineCounts } from '../../../../layers/matching'
import type { SearchResult } from '../../../../layers/types'
import {
  loadOrCreateActiveDemand,
  setStorageCondition as setStorageConditionInStore,
  setTransportCondition as setTransportConditionInStore,
  resetActiveDemand,
} from '../../../../infra/storage'
import { useCargoRegistration } from './useCargoRegistration'
import { useMatchingPreview } from './useMatchingPreview'

/**
 * UIServiceType: UI 레벨 서비스 탭 타입 (소문자)
 * 도메인 레벨 ServiceType('STORAGE'|'ROUTE'|'BOTH')과 구분하기 위해 별칭 제공.
 * - UI/컴포넌트 코드에서는 UIServiceType 사용 권장
 * - 도메인 변환은 toModelServiceType() 사용
 */
export type UIServiceType = 'storage' | 'transport' | 'both'
/** @deprecated UIServiceType으로 마이그레이션 예정. 현재는 alias로 동작. */
export type ServiceType = UIServiceType

// UI 단계 정의
export type FlowStep = 'cargo-registration' | 'quantity-input' | 'condition-input'

// ServiceType 변환 (UI → Model)
function toModelServiceType(uiType: UIServiceType): ServiceTypeModel {
  switch (uiType) {
    case 'storage': return 'STORAGE'
    case 'transport': return 'ROUTE'
    case 'both': return 'BOTH'
  }
}

// PR6: 프리뷰 결과 타입
export interface PreviewMatch {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  matchedOfferIds: string[]
  counts: PipelineCounts
}

// SearchResult 타입 re-export (단일 진실 소스: layers/types/matchingTypes.ts)
export type { SearchResult }

export interface ServiceConsoleState {
  activeTab: UIServiceType
  currentStep: FlowStep
  expandedField: string | null

  // 화물 등록 상태 (공통)
  cargos: CargoUI[]
  registeredCargos: RegisteredCargo[]

  // 물량 입력 결과 (공통)
  totalCubes: number
  totalPallets: number
  demandResult: DemandResult | null

  // 보관 조건
  storageCondition: StorageCondition

  // 운송 조건
  transportCondition: TransportCondition

  // 보관+운송 순서
  serviceOrder: ServiceOrder

  // PR6: 프리뷰 매칭 건수 (실시간)
  previewCount: number

  // Code Data System: 현재 Demand ID
  currentDemandId: string | null

  // PR6: 검색 결과 (스냅샷)
  searchResult: SearchResult | null
  isSearching: boolean

  // PR7: 선택 상태
  selectedStorageId?: string
  selectedRouteId?: string
}

export interface ServiceConsoleActions {
  setActiveTab: (tab: UIServiceType) => void
  setCurrentStep: (step: FlowStep) => void
  handleFieldClick: (fieldId: string) => void
  advanceAccordion: (nextFieldId: string) => void

  // 화물 등록 액션
  addCargo: () => void
  removeCargo: (cargoId: string) => void
  updateCargo: (cargoId: string, updates: Partial<CargoUI>) => void
  completeCargo: (cargoId: string) => void

  // 물량 입력 액션
  updateCargoQuantity: (cargoId: string, quantity: number, estimatedCubes: number) => void
  confirmQuantityInput: () => void

  // 조건 입력 액션
  updateStorageCondition: (updates: Partial<StorageCondition>) => void
  updateTransportCondition: (updates: Partial<TransportCondition>) => void

  // PR4: 초기화 액션
  resetQuantities: () => void
  resetStorageCondition: () => void
  resetTransportCondition: () => void

  // 보관+운송 순서
  setServiceOrder: (order: ServiceOrder) => void

  // 검색
  handleSearch: () => void

  // PR7: 선택 액션
  selectStorage: (id: string) => void
  selectRoute: (id: string) => void
}

export function useServiceConsoleState(): [ServiceConsoleState, ServiceConsoleActions] {
  // ── 공유 상태 (탭/단계/조건/주문/선택) ──────────────────────────────
  const [activeTab, setActiveTabState] = useState<UIServiceType>('storage')
  const [currentStep, setCurrentStep] = useState<FlowStep>('cargo-registration')
  const [expandedField, setExpandedField] = useState<string | null>('cargo-registration')

  const [storageCondition, setStorageConditionState] = useState<StorageCondition>({})
  const [transportCondition, setTransportConditionState] = useState<TransportCondition>({})
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder>(null)

  const [currentDemandId, setCurrentDemandId] = useState<string | null>(null)

  const [selectedStorageId, setSelectedStorageId] = useState<string | undefined>()
  const [selectedRouteId, setSelectedRouteId] = useState<string | undefined>()

  // 탭 변경 시 DemandSession 초기화/로드
  useEffect(() => {
    const demand = loadOrCreateActiveDemand(toModelServiceType(activeTab))
    setCurrentDemandId(demand.demandId)
  }, [activeTab])

  // ── 서브훅 ─────────────────────────────────────────────────────────
  const cargoReg = useCargoRegistration(activeTab, currentDemandId)
  const matchingPreview = useMatchingPreview(
    activeTab,
    cargoReg.registeredCargos,
    cargoReg.totalCubes,
    cargoReg.totalPallets,
    storageCondition,
    transportCondition,
    currentDemandId
  )

  // ── 조건 업데이트 ───────────────────────────────────────────────────
  const updateStorageCondition = (updates: Partial<StorageCondition>) => {
    setStorageConditionState(prev => ({ ...prev, ...updates }))
    if (currentDemandId) setStorageConditionInStore(currentDemandId, updates)
  }

  const updateTransportCondition = (updates: Partial<TransportCondition>) => {
    setTransportConditionState(prev => ({ ...prev, ...updates }))
    if (currentDemandId) setTransportConditionInStore(currentDemandId, updates)
  }

  const resetStorageCondition = () => {
    setStorageConditionState({})
    if (currentDemandId) {
      setStorageConditionInStore(currentDemandId, {
        location: undefined,
        locationCode: undefined,
        startDate: undefined,
        endDate: undefined,
      })
    }
  }

  const resetTransportCondition = () => {
    setTransportConditionState({})
    if (currentDemandId) {
      setTransportConditionInStore(currentDemandId, {
        origin: undefined,
        originCode: undefined,
        destination: undefined,
        destinationCode: undefined,
        transportDate: undefined,
      })
    }
  }

  // ── 아코디언 ────────────────────────────────────────────────────────
  const handleFieldClick = (fieldId: string) => {
    setExpandedField(prev => prev === fieldId ? null : fieldId)
  }

  const advanceAccordion = (nextFieldId: string) => {
    setExpandedField(nextFieldId)
  }

  // ── 탭 변경 ─────────────────────────────────────────────────────────
  const handleTabChange = (tab: UIServiceType) => {
    setActiveTabState(tab)
    setCurrentStep('cargo-registration')
    setExpandedField('cargo-registration')
    setStorageConditionState({})
    setTransportConditionState({})
    setServiceOrder(null)
    setSelectedStorageId(undefined)
    setSelectedRouteId(undefined)
    cargoReg.resetAll()
    matchingPreview.resetSearch()

    const demand = resetActiveDemand(toModelServiceType(tab))
    setCurrentDemandId(demand.demandId)
  }

  // ── confirmQuantityInput (step 이동 포함) ──────────────────────────
  const confirmQuantityInput = () => {
    cargoReg.confirmQuantityInput(() => {
      setCurrentStep('condition-input')
      setExpandedField('condition-input')
    })
  }

  // ── 선택 ─────────────────────────────────────────────────────────────
  const selectStorage = useCallback((id: string) => {
    setSelectedStorageId(id || undefined)
  }, [])

  const selectRoute = useCallback((id: string) => {
    setSelectedRouteId(id || undefined)
  }, [])

  // ── 조합 ─────────────────────────────────────────────────────────────
  const state: ServiceConsoleState = {
    activeTab,
    currentStep,
    expandedField,
    cargos: cargoReg.cargos,
    registeredCargos: cargoReg.registeredCargos,
    totalCubes: cargoReg.totalCubes,
    totalPallets: cargoReg.totalPallets,
    demandResult: cargoReg.demandResult,
    storageCondition,
    transportCondition,
    serviceOrder,
    previewCount: matchingPreview.previewMatch.matchedOfferIds.length,
    currentDemandId,
    searchResult: matchingPreview.searchResult,
    isSearching: matchingPreview.isSearching,
    selectedStorageId,
    selectedRouteId,
  }

  const actions: ServiceConsoleActions = {
    setActiveTab: handleTabChange,
    setCurrentStep,
    handleFieldClick,
    advanceAccordion,
    addCargo: cargoReg.addCargo,
    removeCargo: cargoReg.removeCargo,
    updateCargo: cargoReg.updateCargo,
    completeCargo: cargoReg.completeCargo,
    updateCargoQuantity: cargoReg.updateCargoQuantity,
    confirmQuantityInput,
    updateStorageCondition,
    updateTransportCondition,
    resetQuantities: cargoReg.resetQuantities,
    resetStorageCondition,
    resetTransportCondition,
    setServiceOrder,
    handleSearch: matchingPreview.handleSearch,
    selectStorage,
    selectRoute,
  }

  return [state, actions]
}
