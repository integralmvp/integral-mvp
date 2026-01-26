// 서비스 콘솔 상태 관리 훅 - 단일 진실 소스
// PR3-3: UI 재설계 - 화물 등록 → 물량 입력 → 조건 입력 흐름 반영
// Code Data System MVP: CargoInfo, DemandSession, Event 연동
// PR4: Regulation Engine 연동 - 검색 시 규정 필터링
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
import { checkQuickRulesWithLogging } from '../../../../engine/rules'
import {
  filterOffersByRegulation,
  adaptCargoForRegulation,
  type RegulationSummary,
} from '../../../../engine/regulation'
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

// PR4: 검색 결과 타입
export interface SearchResult {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  summary: RegulationSummary | null
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

  // 검색 가능 상품 건수 (더미)
  availableProductCount: number

  // Code Data System: 현재 Demand ID
  currentDemandId: string | null

  // PR4: 검색 결과
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

  // PR4: 검색 결과 상태
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

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

  // 검색 가능 상품 건수 (더미 - 조건에 따라 감소)
  const availableProductCount = useMemo(() => {
    let count = 8 // 기본 8개 상품

    // 조건이 입력될수록 건수 감소 (더미 로직)
    if (activeTab === 'storage') {
      if (storageCondition.location) count -= 2
      if (storageCondition.startDate && storageCondition.endDate) count -= 1
    } else if (activeTab === 'transport') {
      if (transportCondition.origin) count -= 2
      if (transportCondition.destination) count -= 1
      if (transportCondition.transportDate) count -= 1
    } else if (activeTab === 'both') {
      if (serviceOrder) count -= 1
      if (storageCondition.location) count -= 1
      if (transportCondition.origin || transportCondition.destination) count -= 1
    }

    return Math.max(1, count)
  }, [activeTab, storageCondition, transportCondition, serviceOrder])

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
      setStorageConditionInStore(currentDemandId, { location: undefined, startDate: undefined, endDate: undefined })
    }
  }

  // PR4: 운송 조건 초기화
  const resetTransportCondition = () => {
    setTransportCondition({})
    if (currentDemandId) {
      setTransportConditionInStore(currentDemandId, { origin: undefined, destination: undefined, transportDate: undefined })
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
    // PR4: 검색 결과 리셋
    setSearchResult(null)
    setIsSearching(false)

    // Code Data System: 새 DemandSession 시작
    const demand = resetActiveDemand(toModelServiceType(tab))
    setCurrentDemandId(demand.demandId)
  }

  // PR4: 검색 (규정 필터링 적용)
  const handleSearch = useCallback(() => {
    console.log('=== PR4 검색 시작 ===')
    console.log('활성 탭:', activeTab)
    console.log('등록된 화물:', registeredCargos)
    console.log('총 큐브:', totalCubes)
    console.log('총 파렛트:', totalPallets)

    setIsSearching(true)

    // 화물이 없으면 빈 결과 반환
    if (registeredCargos.length === 0) {
      console.log('등록된 화물 없음 - 전체 상품 표시')
      setSearchResult({
        storageProducts: activeTab !== 'transport' ? STORAGE_PRODUCTS : [],
        routeProducts: activeTab !== 'storage' ? ROUTE_PRODUCTS : [],
        summary: null,
        searchedAt: new Date().toISOString(),
      })
      setIsSearching(false)

      if (currentDemandId) {
        const count = activeTab === 'storage' ? STORAGE_PRODUCTS.length
          : activeTab === 'transport' ? ROUTE_PRODUCTS.length
          : STORAGE_PRODUCTS.length + ROUTE_PRODUCTS.length
        recordSearchExecution(currentDemandId, count)
      }
      return
    }

    // 화물 데이터를 규정 엔진 입력으로 변환
    const cargosForRegulation = registeredCargos.map(cargo => adaptCargoForRegulation({
      id: cargo.id,
      sumCm: cargo.sumCm,
      weightKg: cargo.weightKg,
      moduleType: cargo.moduleType,
      itemCode: cargo.itemCode,
      weightBand: cargo.weightBand,
      sizeBand: cargo.sizeBand,
    }))

    const demand = { totalCubes, totalPallets }
    let passedStorage: StorageProduct[] = []
    let passedRoutes: RouteProduct[] = []
    let combinedSummary: RegulationSummary | null = null

    // 탭별 필터링
    if (activeTab === 'storage' || activeTab === 'both') {
      console.log('보관 조건:', storageCondition)
      const storageResult = filterOffersByRegulation(
        cargosForRegulation,
        STORAGE_PRODUCTS,
        'STORAGE',
        demand
      )
      passedStorage = storageResult.passed
      combinedSummary = storageResult.summary
      console.log('보관 상품 필터링:', storageResult.summary)
    }

    if (activeTab === 'transport' || activeTab === 'both') {
      console.log('운송 조건:', transportCondition)
      const routeResult = filterOffersByRegulation(
        cargosForRegulation,
        ROUTE_PRODUCTS,
        'ROUTE',
        demand
      )
      passedRoutes = routeResult.passed
      if (!combinedSummary) {
        combinedSummary = routeResult.summary
      } else {
        // 두 결과 합산
        combinedSummary = {
          totalOffers: combinedSummary.totalOffers + routeResult.summary.totalOffers,
          passedCount: combinedSummary.passedCount + routeResult.summary.passedCount,
          failedCount: combinedSummary.failedCount + routeResult.summary.failedCount,
          failuresByReason: {
            ...combinedSummary.failuresByReason,
            ...routeResult.summary.failuresByReason,
          },
        }
      }
      console.log('운송 상품 필터링:', routeResult.summary)
    }

    if (activeTab === 'both') {
      console.log('서비스 순서:', serviceOrder)
    }

    // 검색 결과 저장
    const result: SearchResult = {
      storageProducts: passedStorage,
      routeProducts: passedRoutes,
      summary: combinedSummary,
      searchedAt: new Date().toISOString(),
    }
    setSearchResult(result)
    setIsSearching(false)

    const totalResultCount = passedStorage.length + passedRoutes.length
    console.log('검색 결과:', totalResultCount, '건')
    console.log('상세:', { 보관: passedStorage.length, 운송: passedRoutes.length })

    // Code Data System: 검색 실행 이벤트 기록
    if (currentDemandId) {
      recordSearchExecution(currentDemandId, totalResultCount)
    }

    console.log('=== PR4 검색 완료 ===')
  }, [activeTab, registeredCargos, totalCubes, totalPallets, storageCondition, transportCondition, serviceOrder, currentDemandId])

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
    availableProductCount,
    currentDemandId,
    searchResult,
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
