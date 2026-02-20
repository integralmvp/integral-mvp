/**
 * Infra Storage - 통합 Export
 * localStorage 기반 저장소 구현
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
} from '../dataspec/id/makeId'

// Storage Keys
export {
  STORAGE_KEYS,
  getActiveDemandKey,
  clearAllData,
  exportAllData,
} from './keys'

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
} from './info/cargo.repo'
export type { CreateCargoParams } from './info/cargo.repo'

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
} from './info/demandSession.repo'

// Deal Store
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
} from './info/deal.repo'
export type { CreateDealParams } from './info/deal.repo'

// Event Log
export {
  logEvent,
  getEvents,
  getFilteredEvents,
  getEventHistory,
  getRecentEvents,
  clearEventLog,
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
  logDemandSessionCreated,
  logResourceChecked,
  logMatchConfirmed,
  logDealCreated,
  logDealSubmitted,
  logDealConfirmed,
  logSettlementCalculated,
  logResourceAllocated,
  logResourceReleased,
} from './event/eventLog'
