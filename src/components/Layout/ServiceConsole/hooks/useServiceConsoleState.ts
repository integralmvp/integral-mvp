// 서비스 콘솔 상태 관리 훅 - 단일 진실 소스
// PR3-3: UI 재설계 - 화물 등록 → 물량 입력 → 조건 입력 흐름 반영
import { useState, useMemo } from 'react'
import type {
  CargoUI,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  ServiceOrder,
} from '../../../../types/models'
import { computeDemand, type BoxInput, type DemandResult } from '../../../../engine'

export type ServiceType = 'storage' | 'transport' | 'both'

// UI 단계 정의
export type FlowStep = 'cargo-registration' | 'quantity-input' | 'condition-input'

// 화물 ID 생성용 카운터
let cargoIdCounter = 0

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

    // 완료 상태로 업데이트
    setCargos(cargos.map(c =>
      c.id === cargoId ? { ...c, completed: true } : c
    ))

    // 등록된 화물 목록에 추가
    const registeredCargo: RegisteredCargo = {
      ...cargo,
      completed: true,
      cargoNumber: registeredCargos.length + 1,
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
    setCurrentStep('condition-input')
    setExpandedField('condition-input')
  }

  // 보관 조건 업데이트
  const updateStorageCondition = (updates: Partial<StorageCondition>) => {
    setStorageCondition({ ...storageCondition, ...updates })
  }

  // 운송 조건 업데이트
  const updateTransportCondition = (updates: Partial<TransportCondition>) => {
    setTransportCondition({ ...transportCondition, ...updates })
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
  }

  // 검색
  const handleSearch = () => {
    console.log('=== 검색 시작 ===')
    console.log('활성 탭:', activeTab)
    console.log('등록된 화물:', registeredCargos)
    console.log('총 큐브:', totalCubes)
    console.log('총 파렛트:', totalPallets)

    if (activeTab === 'storage') {
      console.log('보관 조건:', storageCondition)
    } else if (activeTab === 'transport') {
      console.log('운송 조건:', transportCondition)
    } else if (activeTab === 'both') {
      console.log('서비스 순서:', serviceOrder)
      console.log('보관 조건:', storageCondition)
      console.log('운송 조건:', transportCondition)
    }

    console.log('검색 가능 상품:', availableProductCount, '건')
    console.log('=== 검색 완료 ===')
  }

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
    setServiceOrder,
    handleSearch,
  }

  return [state, actions]
}
