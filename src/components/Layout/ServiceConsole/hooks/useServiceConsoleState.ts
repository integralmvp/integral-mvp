// 서비스 콘솔 상태 관리 훅 - 단일 진실 소스
import { useState, useEffect } from 'react'
import type { BoxInputUI } from '../../../../types/models'
import {
  computeDemand, computeDemandFromArea, type DemandResult, type BoxInput,
  areaToPalletsWithFactor, palletsToCubes
} from '../../../../engine'
import { toEngineBoxInput } from '../utils/consoleMappers'

export type ServiceType = 'storage' | 'transport' | 'both'

export interface ServiceConsoleState {
  activeTab: ServiceType
  expandedField: string | null
  // 보관 탭
  storageBoxes: BoxInputUI[]
  storageAreaM2: number
  storageInputType: 'box' | 'area'
  storageResult: DemandResult | null
  storageSelectedPallets: number | null
  // 운송 탭
  transportBoxes: BoxInputUI[]
  transportAreaM2: number
  transportInputType: 'box' | 'area'
  transportResult: DemandResult | null
  transportSelectedCubes: number | null
  // 보관+운송 탭
  bothStorageSelectedPallets: number | null
  bothTransportSelectedCubes: number | null
}

export interface ServiceConsoleActions {
  setActiveTab: (tab: ServiceType) => void
  handleFieldClick: (fieldId: string) => void
  advanceAccordion: (nextFieldId: string) => void
  // 보관
  setStorageInputType: (type: 'box' | 'area') => void
  setStorageBoxes: (boxes: BoxInputUI[]) => void
  setStorageAreaM2: (areaM2: number) => void
  handleStorageSelectPallets: () => void
  // 운송
  setTransportInputType: (type: 'box' | 'area') => void
  setTransportBoxes: (boxes: BoxInputUI[]) => void
  setTransportAreaM2: (areaM2: number) => void
  handleTransportSelectCubes: () => void
  // 검색
  handleSearch: () => void
}

export function useServiceConsoleState(): [ServiceConsoleState, ServiceConsoleActions] {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  // 보관 탭 상태
  const [storageBoxes, setStorageBoxes] = useState<BoxInputUI[]>([])
  const [storageAreaM2, setStorageAreaM2] = useState<number>(0)
  const [storageInputType, setStorageInputType] = useState<'box' | 'area'>('box')
  const [storageResult, setStorageResult] = useState<DemandResult | null>(null)
  const [storageSelectedPallets, setStorageSelectedPallets] = useState<number | null>(null)

  // 운송 탭 상태
  const [transportBoxes, setTransportBoxes] = useState<BoxInputUI[]>([])
  const [transportAreaM2, setTransportAreaM2] = useState<number>(0)
  const [transportInputType, setTransportInputType] = useState<'box' | 'area'>('box')
  const [transportResult, setTransportResult] = useState<DemandResult | null>(null)
  const [transportSelectedCubes, setTransportSelectedCubes] = useState<number | null>(null)

  // 보관+운송 탭 상태 (추후 구현)
  const [bothStorageSelectedPallets] = useState<number | null>(null)
  const [bothTransportSelectedCubes] = useState<number | null>(null)

  // 보관 탭: 계산 트리거 (완료된 박스만)
  useEffect(() => {
    if (storageInputType === 'box' && storageBoxes.length > 0) {
      const completedBoxes = storageBoxes.filter(b => b.completed === true)

      if (completedBoxes.length > 0) {
        const engineBoxes: BoxInput[] = completedBoxes.map(toEngineBoxInput)
        const result = computeDemand(engineBoxes, 'STORAGE')
        setStorageResult(result)

        if (result.hasUnclassified) {
          console.warn('[보관] UNCLASSIFIED 박스 감지 → 면적 단위 전환 권장')
        }
      } else {
        setStorageResult(null)
      }
    } else if (storageInputType === 'area' && storageAreaM2 > 0) {
      const demandPallets = areaToPalletsWithFactor(storageAreaM2)
      const demandCubes = palletsToCubes(demandPallets)
      setStorageResult({
        demandCubes,
        demandPallets,
        moduleSummary: [],
        hasUnclassified: false,
        detail: null as any,
      })
    } else {
      setStorageResult(null)
    }
  }, [storageBoxes, storageAreaM2, storageInputType])

  // 운송 탭: 계산 트리거 (완료된 박스만)
  useEffect(() => {
    if (transportInputType === 'box' && transportBoxes.length > 0) {
      const completedBoxes = transportBoxes.filter(b => b.completed === true)

      if (completedBoxes.length > 0) {
        const engineBoxes: BoxInput[] = completedBoxes.map(toEngineBoxInput)
        const result = computeDemand(engineBoxes, 'ROUTE')
        setTransportResult(result)

        if (result.hasUnclassified) {
          console.warn('[운송] UNCLASSIFIED 박스 감지 → 면적 단위 전환 권장')
        }
      } else {
        setTransportResult(null)
      }
    } else if (transportInputType === 'area' && transportAreaM2 > 0) {
      const result = computeDemandFromArea(transportAreaM2, 'ROUTE')
      setTransportResult({
        demandCubes: result.demandCubes,
        moduleSummary: [],
        hasUnclassified: false,
        detail: null as any,
      })
    } else {
      setTransportResult(null)
    }
  }, [transportBoxes, transportAreaM2, transportInputType])

  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  const advanceAccordion = (nextFieldId: string) => {
    setExpandedField(nextFieldId)
  }

  const handleStorageSelectPallets = () => {
    if (storageResult && storageResult.demandPallets) {
      setStorageSelectedPallets(storageResult.demandPallets)
      advanceAccordion('storage-product')
    }
  }

  const handleTransportSelectCubes = () => {
    if (transportResult && transportResult.demandCubes) {
      setTransportSelectedCubes(transportResult.demandCubes)
      advanceAccordion('transport-product')
    }
  }

  const handleSearch = () => {
    console.log('=== 검색 시작 ===')
    console.log('활성 탭:', activeTab)

    if (activeTab === 'storage') {
      console.log('선택된 파렛트:', storageSelectedPallets)
    } else if (activeTab === 'transport') {
      console.log('선택된 큐브:', transportSelectedCubes)
    } else if (activeTab === 'both') {
      console.log('보관 파렛트:', bothStorageSelectedPallets)
      console.log('운송 큐브:', bothTransportSelectedCubes)
    }

    console.log('=== 검색 완료 ===')
  }

  const state: ServiceConsoleState = {
    activeTab,
    expandedField,
    storageBoxes,
    storageAreaM2,
    storageInputType,
    storageResult,
    storageSelectedPallets,
    transportBoxes,
    transportAreaM2,
    transportInputType,
    transportResult,
    transportSelectedCubes,
    bothStorageSelectedPallets,
    bothTransportSelectedCubes,
  }

  const actions: ServiceConsoleActions = {
    setActiveTab,
    handleFieldClick,
    advanceAccordion,
    setStorageInputType,
    setStorageBoxes,
    setStorageAreaM2,
    handleStorageSelectPallets,
    setTransportInputType,
    setTransportBoxes,
    setTransportAreaM2,
    handleTransportSelectCubes,
    handleSearch,
  }

  return [state, actions]
}
