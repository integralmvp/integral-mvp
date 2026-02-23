// 화물 등록 서브훅 - 화물 UI 상태 + 등록/물량 액션
import { useState } from 'react'
import type { CargoUI, RegisteredCargo } from '../../../../types/models'
import { computeDemand, type BoxInput, type DemandResult } from '../../../../engine/cube'
import { checkQuickRulesWithLogging } from '../../../../layers/matching/regulation/rules'
import {
  addCargo as addCargoToStore,
  removeCargo as removeCargoFromStore,
  addCargoToDemand,
  removeCargoFromDemand,
  setQuantitiesAndCubes,
} from '../../../../infra/storage'
import { CUBE_CONFIG } from '../../../../engine/cube/cubeConfig'
import type { UIServiceType } from './useServiceConsoleState'

let cargoIdCounter = 0

export interface CargoRegistrationResult {
  cargos: CargoUI[]
  registeredCargos: RegisteredCargo[]
  totalCubes: number
  totalPallets: number
  demandResult: DemandResult | null

  addCargo: () => void
  removeCargo: (cargoId: string) => void
  updateCargo: (cargoId: string, updates: Partial<CargoUI>) => void
  completeCargo: (cargoId: string) => void
  updateCargoQuantity: (cargoId: string, quantity: number, estimatedCubes: number) => void
  confirmQuantityInput: (onConfirmed: () => void) => void
  resetQuantities: () => void
  resetAll: () => void
}

export function useCargoRegistration(
  activeTab: UIServiceType,
  currentDemandId: string | null
): CargoRegistrationResult {
  const [cargos, setCargos] = useState<CargoUI[]>([])
  const [registeredCargos, setRegisteredCargos] = useState<RegisteredCargo[]>([])

  // 물량 입력 결과 계산
  const computeResult = (() => {
    const cargosWithQuantity = registeredCargos.filter(c => c.quantity !== undefined && c.quantity > 0)
    if (cargosWithQuantity.length === 0) {
      return { totalCubes: 0, totalPallets: 0, demandResult: null }
    }
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
  })()

  const addCargo = () => {
    const newCargo: CargoUI = {
      id: `cargo-${++cargoIdCounter}`,
      width: 0,
      depth: 0,
      height: 0,
      completed: false,
    }
    setCargos(prev => [...prev, newCargo])
  }

  const removeCargo = (cargoId: string) => {
    const cargo = registeredCargos.find(c => c.id === cargoId)
    if (cargo?.cargoInfoId) {
      removeCargoFromStore(cargo.cargoInfoId)
      if (currentDemandId) removeCargoFromDemand(currentDemandId, cargo.cargoInfoId)
    }
    setCargos(prev => prev.filter(c => c.id !== cargoId))
    setRegisteredCargos(prev => prev.filter(c => c.id !== cargoId))
  }

  const updateCargo = (cargoId: string, updates: Partial<CargoUI>) => {
    setCargos(prev => prev.map(c => c.id === cargoId ? { ...c, ...updates } : c))
  }

  const completeCargo = (cargoId: string) => {
    const cargo = cargos.find(c => c.id === cargoId)
    if (!cargo) return

    checkQuickRulesWithLogging(
      {
        sumCm: cargo.sumCm || 0,
        weightKg: cargo.weightKg || 0,
        itemCode: cargo.itemCode || 'IC99',
        moduleClass: cargo.moduleType || 'UNCLASSIFIED',
      },
      { kind: 'cargo', id: cargoId }
    )

    const cargoInfo = addCargoToStore({
      widthMm: cargo.width,
      depthMm: cargo.depth,
      heightMm: cargo.height,
      moduleClass: cargo.moduleType || 'UNCLASSIFIED',
      itemCode: cargo.itemCode || 'IC99',
      weightKg: cargo.weightKg || 0,
    })

    if (currentDemandId) addCargoToDemand(currentDemandId, cargoInfo.id)

    setCargos(prev => prev.map(c => c.id === cargoId ? { ...c, completed: true, cargoInfoId: cargoInfo.id } : c))
    setRegisteredCargos(prev => {
      const registeredCargo: RegisteredCargo = {
        ...cargo,
        completed: true,
        cargoNumber: prev.length + 1,
        cargoInfoId: cargoInfo.id,
      }
      return [...prev, registeredCargo]
    })
  }

  const updateCargoQuantity = (cargoId: string, quantity: number, estimatedCubes: number) => {
    setRegisteredCargos(prev => prev.map(c => c.id === cargoId ? { ...c, quantity, estimatedCubes } : c))
  }

  const confirmQuantityInput = (onConfirmed: () => void) => {
    const { totalCubes, totalPallets, demandResult } = computeResult
    if (currentDemandId && demandResult) {
      const mode = activeTab === 'transport' ? 'ROUTE' : 'STORAGE'
      const packingFactor = mode === 'STORAGE'
        ? CUBE_CONFIG.packingFactor.STORAGE
        : CUBE_CONFIG.packingFactor.ROUTE

      const quantitiesByCargoId: Record<string, number> = {}
      const cubeResultByCargoId: Record<string, { mode: 'STORAGE' | 'ROUTE'; cubes: number }> = {}

      registeredCargos.forEach(cargo => {
        if (cargo.cargoInfoId && cargo.quantity) {
          quantitiesByCargoId[cargo.cargoInfoId] = cargo.quantity
          cubeResultByCargoId[cargo.cargoInfoId] = { mode, cubes: cargo.estimatedCubes || 0 }
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
    onConfirmed()
  }

  const resetQuantities = () => {
    setRegisteredCargos(prev => prev.map(c => ({ ...c, quantity: undefined, estimatedCubes: undefined })))
  }

  const resetAll = () => {
    setCargos([])
    setRegisteredCargos([])
  }

  return {
    cargos,
    registeredCargos,
    ...computeResult,
    addCargo,
    removeCargo,
    updateCargo,
    completeCargo,
    updateCargoQuantity,
    confirmQuantityInput,
    resetQuantities,
    resetAll,
  }
}
