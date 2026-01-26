/**
 * Code Data System 배선 테스트
 *
 * 목적: 규정 레이어 → DemandSession → 큐브 엔진 → 이벤트 로그 연결 확인
 * 실행: npx tsx src/__tests__/codeDataSystem.test.ts
 */

// Mock localStorage for Node.js environment
const storage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value },
  removeItem: (key: string) => { delete storage[key] },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]) },
}

// @ts-ignore - Mock global localStorage
globalThis.localStorage = mockLocalStorage

// Note: crypto.randomUUID is available in Node.js 19+, no mock needed

import {
  addCargo,
  getEvents,
  clearAllData,
  loadOrCreateActiveDemand,
  addCargoToDemand,
  setQuantitiesAndCubes,
  getDemandById,
} from '../store'
import { checkQuickRulesWithLogging } from '../engine/rules'
import { computeDemand } from '../engine'
import { calculateSumCm } from '../data/bands'

console.log('='.repeat(60))
console.log('Code Data System 배선 테스트')
console.log('='.repeat(60))

// 테스트 전 초기화
clearAllData()

// ============================================
// 테스트 1: 규정 레이어 연결 확인
// ============================================
console.log('\n📋 테스트 1: 규정 레이어 연결 확인')
console.log('-'.repeat(40))

// 1.1 화물 등록
const testCargo = {
  widthMm: 400,
  depthMm: 300,
  heightMm: 250,
  moduleClass: '소형' as const,
  itemCode: 'IC10',  // 식품(상온)
  weightKg: 10,
}

console.log('\n[1.1] 화물 등록 시도...')
console.log('  - 규격:', `${testCargo.widthMm}×${testCargo.depthMm}×${testCargo.heightMm}mm`)
console.log('  - 품목:', testCargo.itemCode)
console.log('  - 중량:', testCargo.weightKg, 'kg')

const cargoInfo = addCargo(testCargo)

console.log('\n[1.2] CargoInfo 저장 확인')
console.log('  - ID:', cargoInfo.id)
console.log('  - 저장됨:', cargoInfo ? '✅' : '❌')

// 1.3 Signature 확인
console.log('\n[1.3] CargoInfo.signature 확인')
const sig = cargoInfo.signature
console.log('  - itemCode:', sig.itemCode, sig.itemCode ? '✅' : '❌')
console.log('  - weightBand:', sig.weightBand, sig.weightBand ? '✅' : '❌')
console.log('  - sizeBand:', sig.sizeBand, sig.sizeBand ? '✅' : '❌')
console.log('  - moduleClass:', sig.moduleClass, sig.moduleClass ? '✅' : '❌')

// 1.4 규정 체크 (별도 호출하여 이벤트 확인)
console.log('\n[1.4] 규정 체크 실행')
const sumCm = calculateSumCm(testCargo.widthMm, testCargo.depthMm, testCargo.heightMm)
const ruleResult = checkQuickRulesWithLogging(
  {
    sumCm,
    weightKg: testCargo.weightKg,
    itemCode: testCargo.itemCode,
    moduleClass: testCargo.moduleClass,
  },
  { kind: 'cargo', id: cargoInfo.id }
)
console.log('  - 규정 통과:', ruleResult.passed ? '✅' : '❌')
console.log('  - 사유:', ruleResult.reasons.join(', '))

// 1.5 이벤트 로그 확인
console.log('\n[1.5] EventLog 확인')
const events = getEvents()
const cargoCreatedEvent = events.find(e => e.eventType === 'CARGO_CREATED')
const sigUpdatedEvent = events.find(e => e.eventType === 'CARGO_SIGNATURE_UPDATED')
const ruleCheckedEvent = events.find(e => e.eventType === 'RULE_CHECKED')

console.log('  - CARGO_CREATED:', cargoCreatedEvent ? '✅' : '❌')
console.log('  - CARGO_SIGNATURE_UPDATED:', sigUpdatedEvent ? '✅' : '❌')
console.log('  - RULE_CHECKED:', ruleCheckedEvent ? '✅' : '❌')

// 1.6 DemandSession 확인
console.log('\n[1.6] DemandSession 확인')
const demand = loadOrCreateActiveDemand('STORAGE')
console.log('  - DemandSession 존재:', demand ? '✅' : '❌')
console.log('  - demandId:', demand.demandId)
console.log('  - status:', demand.status)

// DemandSession에 화물 추가
addCargoToDemand(demand.demandId, cargoInfo.id)
const updatedDemand = getDemandById(demand.demandId)
console.log('  - cargoIds 포함:', updatedDemand?.cargoIds.includes(cargoInfo.id) ? '✅' : '❌')

const test1Passed =
  cargoInfo &&
  sig.itemCode &&
  sig.weightBand &&
  sig.sizeBand &&
  sig.moduleClass &&
  cargoCreatedEvent &&
  sigUpdatedEvent &&
  ruleCheckedEvent &&
  demand

console.log('\n📊 테스트 1 결과:', test1Passed ? '✅ 통과' : '❌ 실패')

// ============================================
// 테스트 2: 큐브 엔진 연결 확인
// ============================================
console.log('\n\n📋 테스트 2: 큐브 엔진 연결 확인')
console.log('-'.repeat(40))

// 2.1 물량 입력 및 큐브 계산
console.log('\n[2.1] 물량 입력 및 큐브 계산')
const quantity = 10
const boxInputs = [{
  widthMm: testCargo.widthMm,
  depthMm: testCargo.depthMm,
  heightMm: testCargo.heightMm,
  count: quantity,
}]

const demandResult = computeDemand(boxInputs, 'STORAGE')
console.log('  - 수량:', quantity)
console.log('  - totalCubes:', demandResult.demandCubes)
console.log('  - totalPallets:', demandResult.demandPallets)

// 2.2 DemandSession 업데이트
console.log('\n[2.2] DemandSession 업데이트')
const quantitiesByCargoId: Record<string, number> = {
  [cargoInfo.id]: quantity
}
const cubeResultByCargoId: Record<string, { mode: 'STORAGE' | 'ROUTE'; cubes: number }> = {
  [cargoInfo.id]: { mode: 'STORAGE', cubes: demandResult.demandCubes }
}

setQuantitiesAndCubes(demand.demandId, {
  quantitiesByCargoId,
  cubeResultByCargoId,
  totalCubes: demandResult.demandCubes,
  totalPallets: demandResult.demandPallets,
  packingFactor: 1.15,
})

const finalDemand = getDemandById(demand.demandId)
console.log('  - cubeResultByCargoId:', finalDemand?.cubeResultByCargoId ? '✅' : '❌')
console.log('  - totalCubes:', finalDemand?.totalCubes, finalDemand?.totalCubes ? '✅' : '❌')
console.log('  - totalPallets:', finalDemand?.totalPallets, finalDemand?.totalPallets !== undefined ? '✅' : '❌')
console.log('  - status:', finalDemand?.status)

// 2.3 이벤트 로그 확인
console.log('\n[2.3] EventLog 확인')
const allEvents = getEvents()
const quantitySetEvent = allEvents.find(e => e.eventType === 'QUANTITY_SET')
const cubeCalcEvent = allEvents.find(e => e.eventType === 'CUBE_CALCULATED')
const resourceReadyEvent = allEvents.find(e => e.eventType === 'RESOURCE_READY')

console.log('  - QUANTITY_SET:', quantitySetEvent ? '✅' : '❌')
console.log('  - CUBE_CALCULATED:', cubeCalcEvent ? '✅' : '❌')
console.log('  - RESOURCE_READY:', resourceReadyEvent ? '✅' : '❌')

const test2Passed =
  finalDemand?.cubeResultByCargoId &&
  finalDemand?.totalCubes &&
  finalDemand?.totalPallets !== undefined &&
  finalDemand?.status === 'RESOURCE_READY' &&
  quantitySetEvent &&
  cubeCalcEvent &&
  resourceReadyEvent

console.log('\n📊 테스트 2 결과:', test2Passed ? '✅ 통과' : '❌ 실패')

// ============================================
// 최종 결과
// ============================================
console.log('\n' + '='.repeat(60))
console.log('최종 테스트 결과')
console.log('='.repeat(60))
console.log('테스트 1 (규정 레이어 연결):', test1Passed ? '✅ 통과' : '❌ 실패')
console.log('테스트 2 (큐브 엔진 연결):', test2Passed ? '✅ 통과' : '❌ 실패')
console.log('')

if (test1Passed && test2Passed) {
  console.log('🎉 Code Data System + Cube Engine 구조 연결 정상')
} else {
  console.log('⚠️ 연결 문제 발견 - 위 결과 확인 필요')
  throw new Error('Test failed')
}

// 이벤트 로그 전체 출력 (디버깅용)
console.log('\n\n📜 전체 이벤트 로그:')
console.log('-'.repeat(40))
allEvents.forEach((e, i) => {
  console.log(`${i + 1}. [${e.eventType}] ${e.subject.kind}:${e.subject.id.slice(0, 20)}...`)
})
