/**
 * Storage Info Repos - Export
 */

// Offer Repository
export {
  getAllStorageOffers,
  getAllRouteOffers,
  getStorageOfferById,
  getRouteOfferById,
  getOfferById,
  updateStorageOfferResource,
  updateRouteOfferResource,
} from './offer.repo'

// Provider Repository
export {
  getAllProviders,
  getProviderById,
  getProvidersByServiceType,
} from './provider.repo'

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
} from './cargo.repo'
export type { CreateCargoParams } from './cargo.repo'

// Demand Session Store
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
} from './demandSession.repo'

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
} from './deal.repo'
export type { CreateDealParams } from './deal.repo'
