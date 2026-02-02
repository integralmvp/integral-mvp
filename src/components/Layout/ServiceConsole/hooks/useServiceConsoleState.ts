// 서비스 콘솔 상태 관리 훅 - 단일 진실 소스
// PR3-3: UI 재설계 - 화물 등록 → 물량 입력 → 조건 입력 흐름 반영
// Code Data System MVP: CargoInfo, DemandSession, Event 연동
// PR4: Regulation Engine 연동 - 검색 시 규정 필터링
// PR6: Matching Pipeline 통합 - 프리뷰/검색 결과 동기화

import { useState, useMemo, useEffect, useCallback } from 'react'
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
import { computeDemand, type BoxInput, type DemandResult } from '../../../../engine'
import {
  runMatchingPipeline,
  runCombinedPipeline,
  type PipelineCounts,
  type SearchConditions,
} from '../../../../engine/matching'
import { checkQuickRulesWithLogging } from '../../../../engine/rules'
import {
  logDemandSessionCreated,
  logResourceChecked,
} from '../../../../store/eventLog'
import {
  addCargo as addCargoToStore,
  removeCargo as removeCargoFromStore,
  loadOrCreateActiveDemand,
  addCargoToDemand,
  removeCargoFromDemand,
  setQuantitiesAndCubes,
  setStorageCondition as setStorageConditionInStore,
  setTransportCondition as setTransportConditionInStore,
  recordSearchExecution,
  resetActiveDemand,
} from '../../../../store'
import { CUBE_CONFIG } from '../../../../engine/cubeConfig'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../../../data/mockData'
import { useSearchResult } from '../../../../contexts/SearchResultContext'

export type ServiceType = 'storage' | 'transport' | 'both'

// UI 단계 정의
export type FlowStep = 'cargo-registration' | 'quantity-input' | 'condition-input'

// 화물 ID 생성용 카운터
let cargoIdCounter = 0

// ServiceType 변환 (UI → Model)
function toModelServiceType(uiType: ServiceType): ServiceTypeModel {
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

// PR6: 검색 결과 타입 (스냅샷)
export interface SearchResult {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  counts: PipelineCounts
  searchedAt: string
}

export interface ServiceConsoleState {
  activeTab: ServiceType
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
}

export interface ServiceConsoleActions {
  setActiveTab: (tab: ServiceType) => void
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
}

export function useServiceConsoleState(): [ServiceConsoleState, ServiceConsoleActions] {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [currentStep, setCurrentStep] = useState<FlowStep>('cargo-registration')
  const [expandedField, setExpandedField] = useState<string | null>('cargo-registration')

  // 화물 등록 상태
  const [cargos, setCargos] = useState<CargoUI[]>([])
  const [registeredCargos, setRegisteredCargos] = useState<RegisteredCargo[]>([])

  // 보관 조건
  const [storageCondition, setStorageCondition] = useState<StorageCondition>({})

  // 운송 조건
  const [transportCondition, setTransportCondition] = useState<TransportCondition>({})

  // 보관+운송 순서
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder>(null)

  // Code Data System: 현재 Demand ID
  const [currentDemandId, setCurrentDemandId] = useState<string | null>(null)

  // PR6: 검색 결과 상태 (스냅샷)
  const [searchResult, setSearchResultLocal] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // PR6: Context 연동
  const { setPreviewResult, setSearchResult: setSearchResultContext } = useSearchResult()

  // 탭 변경 시 DemandSession 초기화/로드
  useEffect(() => {
    const demand = loadOrCreateActiveDemand(toModelServiceType(activeTab))
    setCurrentDemandId(demand.demandId)
  }, [activeTab])

  // 물량 입력 결과 계산
  const { totalCubes, totalPallets, demandResult } = useMemo(() => {
    const cargosWithQuantity = registeredCargos.filter(c => c.quantity !== undefined && c.quantity > 0)

    if (cargosWithQuantity.length === 0) {
      return { totalCubes: 0, totalPallets: 0, demandResult: null }
    }

    // 모든 화물을 BoxInput으로 변환하여 통합 계산
    const boxInputs: BoxInput[] = cargosWithQuantity.map(cargo => ({
      widthMm: cargo.width,
      depthMm: cargo.depth,
      heightMm: cargo.height,
      count: cargo.quantity || 0,
    }))

    const mode = activeTab === 'transport' ? 'ROUTE' : 'STORAGE'
    const result = computeDemand(boxInputs, mode)

    return {
      totalCubes: result.demandCubes,
      totalPallets: result.demandPallets || Math.ceil(result.demandCubes / 128),
      demandResult: result,
    }
  }, [registeredCargos, activeTab])

  // PR6: 프리뷰 매칭 (실시간, 파이프라인 단일 소스)
  const previewMatch = useMemo<PreviewMatch>(() => {
    // 세션 정보 구성
    const session = {
      demandId: currentDemandId || undefined,
      totalCubes,
      totalPallets,
      cargos: registeredCargos.map(cargo => ({
        id: cargo.id,
        sumCm: cargo.sumCm,
        weightKg: cargo.weightKg,
        moduleType: cargo.moduleType,
        itemCode: cargo.itemCode,
        weightBand: cargo.weightBand,
        sizeBand: cargo.sizeBand,
      })),
    }

    // 조건 구성 (PR7-pre: 코드 기반 조건 우선)
    const conditions: SearchConditions = {
      // Storage 조건 - 코드 우선
      storageLocationCode: storageCondition.locationCode,
      storageLocation: storageCondition.location,
      startDate: storageCondition.startDate,
      endDate: storageCondition.endDate,
      // Route 조건 - 코드 우선
      originCode: transportCondition.originCode,
      destinationCode: transportCondition.destinationCode,
      origin: transportCondition.origin,
      destination: transportCondition.destination,
      transportDate: transportCondition.transportDate,
    }

    // 탭별 파이프라인 실행
    if (activeTab === 'storage') {
      const result = runMatchingPipeline({
        mode: 'STORAGE',
        offers: STORAGE_PRODUCTS,
        session,
        conditions,
        sort: 'LATEST',
      })

      return {
        storageProducts: result.matchedOffers,
        routeProducts: [],
        matchedOfferIds: result.matchedOfferIds,
        counts: result.counts,
      }
    }

    if (activeTab === 'transport') {
      const result = runMatchingPipeline({
        mode: 'ROUTE',
        offers: ROUTE_PRODUCTS,
        session,
        conditions,
        sort: 'LATEST',
      })

      return {
        storageProducts: [],
        routeProducts: result.matchedOffers,
        matchedOfferIds: result.matchedOfferIds,
        counts: result.counts,
      }
    }

    // both 탭
    const combinedResult = runCombinedPipeline({
      storageOffers: STORAGE_PRODUCTS,
      routeOffers: ROUTE_PRODUCTS,
      session,
      conditions,
      sort: 'LATEST',
    })

    return {
      storageProducts: combinedResult.storage.matchedOffers,
      routeProducts: combinedResult.route.matchedOffers,
      matchedOfferIds: combinedResult.combinedIds,
      counts: combinedResult.combinedCounts,
    }
  }, [
    activeTab,
    registeredCargos,
    totalCubes,
    totalPallets,
    storageCondition,
    transportCondition,
    currentDemandId,
  ])

  // PR6: Context에 프리뷰 결과 동기화 (지도 하이라이트용)
  useEffect(() => {
    // 화물이 있거나 조건이 있을 때만 프리뷰 결과 설정
    // PR6 일원화: locationCode 기반으로 체크
    const hasCargoOrCondition =
      registeredCargos.length > 0 ||
      storageCondition.locationCode ||
      transportCondition.originCode ||
      transportCondition.destinationCode

    if (hasCargoOrCondition) {
      setPreviewResult({
        storageProducts: previewMatch.storageProducts,
        routeProducts: previewMatch.routeProducts,
        matchedOfferIds: previewMatch.matchedOfferIds,
        counts: previewMatch.counts,
        updatedAt: new Date().toISOString(),
      })
    } else {
      setPreviewResult(null)
    }
  }, [
    previewMatch,
    registeredCargos.length,
    storageCondition.locationCode,
    transportCondition.originCode,
    transportCondition.destinationCode,
    setPreviewResult,
  ])

  // 화물 추가
  const addCargo = () => {
    const newCargo: CargoUI = {
      id: `cargo-${++cargoIdCounter}`,
      width: 0,
      depth: 0,
      height: 0,
      completed: false,
    }
    setCargos([...cargos, newCargo])
  }

  // 화물 삭제
  const removeCargo = (cargoId: string) => {
    const cargo = registeredCargos.find(c => c.id === cargoId)

    // Code Data System: CargoInfo 삭제
    if (cargo?.cargoInfoId) {
      removeCargoFromStore(cargo.cargoInfoId)

      // DemandSession에서도 제거
      if (currentDemandId) {
        removeCargoFromDemand(currentDemandId, cargo.cargoInfoId)
      }
    }

    setCargos(cargos.filter(c => c.id !== cargoId))
    setRegisteredCargos(registeredCargos.filter(c => c.id !== cargoId))
  }

  // 화물 업데이트
  const updateCargo = (cargoId: string, updates: Partial<CargoUI>) => {
    setCargos(cargos.map(c =>
      c.id === cargoId ? { ...c, ...updates } : c
    ))
  }

  // 화물 등록 완료
  const completeCargo = (cargoId: string) => {
    const cargo = cargos.find(c => c.id === cargoId)
    if (!cargo) return

    // Code Data System: 규정 체크
    checkQuickRulesWithLogging(
      {
        sumCm: cargo.sumCm || 0,
        weightKg: cargo.weightKg || 0,
        itemCode: cargo.itemCode || 'IC99',
        moduleClass: cargo.moduleType || 'UNCLASSIFIED',
      },
      { kind: 'cargo', id: cargoId }
    )

    // Code Data System: CargoInfo 저장
    const cargoInfo = addCargoToStore({
      widthMm: cargo.width,
      depthMm: cargo.depth,
      heightMm: cargo.height,
      moduleClass: cargo.moduleType || 'UNCLASSIFIED',
      itemCode: cargo.itemCode || 'IC99',
      weightKg: cargo.weightKg || 0,
    })

    // Code Data System: DemandSession에 화물 추가
    if (currentDemandId) {
      addCargoToDemand(currentDemandId, cargoInfo.id)
    }

    // 완료 상태로 업데이트
    setCargos(cargos.map(c =>
      c.id === cargoId ? { ...c, completed: true, cargoInfoId: cargoInfo.id } : c
    ))

    // 등록된 화물 목록에 추가
    const registeredCargo: RegisteredCargo = {
      ...cargo,
      completed: true,
      cargoNumber: registeredCargos.length + 1,
      cargoInfoId: cargoInfo.id,
    }
    setRegisteredCargos([...registeredCargos, registeredCargo])
  }

  // 물량 업데이트
  const updateCargoQuantity = (cargoId: string, quantity: number, estimatedCubes: number) => {
    setRegisteredCargos(registeredCargos.map(c =>
      c.id === cargoId ? { ...c, quantity, estimatedCubes } : c
    ))
  }

  // 물량 입력 확정 → 조건 입력 단계로 이동
  const confirmQuantityInput = () => {
    // Code Data System: DemandSession 업데이트
    if (currentDemandId && demandResult) {
      const mode = activeTab === 'transport' ? 'ROUTE' : 'STORAGE'
      const packingFactor = mode === 'STORAGE'
        ? CUBE_CONFIG.packingFactor.STORAGE
        : CUBE_CONFIG.packingFactor.ROUTE

      // 화물별 수량 및 큐브 결과 생성
      const quantitiesByCargoId: Record<string, number> = {}
      const cubeResultByCargoId: Record<string, { mode: 'STORAGE' | 'ROUTE'; cubes: number }> = {}

      registeredCargos.forEach(cargo => {
        if (cargo.cargoInfoId && cargo.quantity) {
          quantitiesByCargoId[cargo.cargoInfoId] = cargo.quantity
          cubeResultByCargoId[cargo.cargoInfoId] = {
            mode: mode,
            cubes: cargo.estimatedCubes || 0,
          }
        }
      })

      setQuantitiesAndCubes(currentDemandId, {
        quantitiesByCargoId,
        cubeResultByCargoId,
        totalCubes,
        totalPallets: mode === 'STORAGE' ? totalPallets : undefined,
        packingFactor,
      })
    }

    setCurrentStep('condition-input')
    setExpandedField('condition-input')
  }

  // 보관 조건 업데이트
  const updateStorageCondition = (updates: Partial<StorageCondition>) => {
    const newCondition = { ...storageCondition, ...updates }
    setStorageCondition(newCondition)

    // Code Data System: DemandSession 업데이트
    if (currentDemandId) {
      setStorageConditionInStore(currentDemandId, updates)
    }
  }

  // 운송 조건 업데이트
  const updateTransportCondition = (updates: Partial<TransportCondition>) => {
    const newCondition = { ...transportCondition, ...updates }
    setTransportCondition(newCondition)

    // Code Data System: DemandSession 업데이트
    if (currentDemandId) {
      setTransportConditionInStore(currentDemandId, updates)
    }
  }

  // PR4: 물량 초기화
  const resetQuantities = () => {
    setRegisteredCargos(registeredCargos.map(c => ({
      ...c,
      quantity: undefined,
      estimatedCubes: undefined,
    })))
  }

  // PR4: 보관 조건 초기화
  const resetStorageCondition = () => {
    setStorageCondition({})
    if (currentDemandId) {
      // PR6: locationCode도 함께 초기화
      setStorageConditionInStore(currentDemandId, {
        location: undefined,
        locationCode: undefined,
        startDate: undefined,
        endDate: undefined,
      })
    }
  }

  // PR4: 운송 조건 초기화
  const resetTransportCondition = () => {
    setTransportCondition({})
    if (currentDemandId) {
      // PR6: originCode/destinationCode도 함께 초기화
      setTransportConditionInStore(currentDemandId, {
        origin: undefined,
        originCode: undefined,
        destination: undefined,
        destinationCode: undefined,
        transportDate: undefined,
      })
    }
  }

  // 아코디언 필드 클릭
  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  // 다음 아코디언으로 이동
  const advanceAccordion = (nextFieldId: string) => {
    setExpandedField(nextFieldId)
  }

  // 탭 변경 시 상태 리셋
  const handleTabChange = (tab: ServiceType) => {
    setActiveTab(tab)
    setCurrentStep('cargo-registration')
    setExpandedField('cargo-registration')
    setCargos([])
    setRegisteredCargos([])
    setStorageCondition({})
    setTransportCondition({})
    setServiceOrder(null)
    // PR6: 검색 결과 리셋
    setSearchResultLocal(null)
    setSearchResultContext(null)
    setPreviewResult(null)
    setIsSearching(false)

    // Code Data System: 새 DemandSession 시작
    const demand = resetActiveDemand(toModelServiceType(tab))
    setCurrentDemandId(demand.demandId)
  }

  // PR6: 검색 (프리뷰 결과를 스냅샷으로 저장)
  const handleSearch = useCallback(() => {
    console.log('=== PR6 검색 시작 (단일 파이프라인) ===')
    console.log('활성 탭:', activeTab)
    console.log('프리뷰 건수:', previewMatch.matchedOfferIds.length)

    setIsSearching(true)

    // PR5: 세션 생성 이벤트 로깅
    const sessionMode = activeTab === 'transport' ? 'ROUTE' : 'STORAGE'
    if (currentDemandId) {
      logDemandSessionCreated(
        currentDemandId,
        sessionMode,
        totalCubes,
        sessionMode === 'STORAGE' ? totalPallets : undefined
      )
    }

    // PR6: 프리뷰 결과를 스냅샷으로 저장
    const result: SearchResult = {
      storageProducts: previewMatch.storageProducts,
      routeProducts: previewMatch.routeProducts,
      counts: previewMatch.counts,
      searchedAt: new Date().toISOString(),
    }

    setSearchResultLocal(result)
    setSearchResultContext(result)
    setIsSearching(false)

    const totalResourcePassed = previewMatch.matchedOfferIds.length
    console.log('검색 결과:', totalResourcePassed, '건')
    console.log('단계별 건수:', previewMatch.counts)

    // PR6: 이벤트 기록 (counts 포함)
    if (currentDemandId) {
      // 자원 체크 이벤트
      const totalFailed =
        previewMatch.counts.afterResource - previewMatch.counts.afterConditions
      logResourceChecked(currentDemandId, totalResourcePassed, totalFailed)

      // 검색 실행 이벤트 (counts 포함)
      recordSearchExecution(currentDemandId, totalResourcePassed, {
        afterRegulation: previewMatch.counts.afterRegulation,
        afterResource: previewMatch.counts.afterResource,
        afterConditions: previewMatch.counts.afterConditions,
      })
    }

    console.log('=== PR6 검색 완료 ===')
  }, [
    activeTab,
    previewMatch,
    totalCubes,
    totalPallets,
    currentDemandId,
    setSearchResultContext,
  ])

  const state: ServiceConsoleState = {
    activeTab,
    currentStep,
    expandedField,
    cargos,
    registeredCargos,
    totalCubes,
    totalPallets,
    demandResult,
    storageCondition,
    transportCondition,
    serviceOrder,
    previewCount: previewMatch.matchedOfferIds.length,
    currentDemandId,
    searchResult: searchResult,
    isSearching,
  }

  const actions: ServiceConsoleActions = {
    setActiveTab: handleTabChange,
    setCurrentStep,
    handleFieldClick,
    advanceAccordion,
    addCargo,
    removeCargo,
    updateCargo,
    completeCargo,
    updateCargoQuantity,
    confirmQuantityInput,
    updateStorageCondition,
    updateTransportCondition,
    resetQuantities,
    resetStorageCondition,
    resetTransportCondition,
    setServiceOrder,
    handleSearch,
  }

  return [state, actions]
}
