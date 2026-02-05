/**
 * Store - 통합 Export
 *
 * Local-first 저장소 모듈
 * - cargoStore: 화물 정보 데이터 관리
 * - demandStore: 수요 세션 데이터 관리
 * - eventLog: 사건 데이터 (append-only) 관리
 */

// ID 생성 유틸
export {
  makeId,
  makeCargoId,
  makeDemandId,
  makeEventId,
  makeDealId,
  getIdPrefix,
  isValidId,
} from './id'

// Storage Keys
export {
  STORAGE_KEYS,
  getActiveDemandKey,
  clearAllData,
  exportAllData,
} from './storageKeys'

// Cargo Store
export {
  addCargo,
  getCargoById,
  listCargosByOwner,
  listCargosByIds,
  removeCargo,
  updateCargo,
  updateCargoSignature,
  clearAllCargos,
  getCargoCount,
} from './cargoStore'
export type { CreateCargoParams } from './cargoStore'

// Demand Store
export {
  createDemand,
  getDemandById,
  loadOrCreateActiveDemand,
  getActiveDemand,
  updateDemand,
  addCargoToDemand,
  removeCargoFromDemand,
  setQuantitiesAndCubes,
  setStorageCondition,
  setTransportCondition,
  setDemandStatus,
  recordSearchExecution,
  removeDemand,
  clearAllDemands,
  resetActiveDemand,
} from './demandStore'

// PR7: Deal Store
export {
  createDeal,
  getDealById,
  getDealsByDemandId,
  getDealsByUserId,
  updateDealStatus,
  agreeToDealContract,
  updateDeal,
  deleteDeal,
  getAllDeals,
} from './dealStore'
export type { CreateDealParams } from './dealStore'

// Event Log
export {
  logEvent,
  getEvents,
  getFilteredEvents,
  getEventHistory,
  getRecentEvents,
  clearEventLog,
  // 편의 함수
  logCargoCreated,
  logCargoRemoved,
  logCargoSignatureUpdated,
  logRuleChecked,
  logRulesPassed,
  logQuantitySet,
  logCubeCalculated,
  logResourceReady,
  logStorageLocationSet,
  logStoragePeriodSet,
  logTransportOriginSet,
  logTransportDestinationSet,
  logTransportDateSet,
  logSearchExecuted,
} from './eventLog'
