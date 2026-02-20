/**
 * Domain Types - 플랫폼 핵심 도메인 타입
 * (호환 레이어: types/models.ts에서 재export, 완전 전환은 다음 작업)
 */

// Cargo domain
export type {
  CargoUI,
  RegisteredCargo,
  CargoInfo,
  CargoCondition,
  BoxInput,
  BoxInputUI,
  ClassifiedBox,
  ModuleAggregate,
  BoxBasedAreaSelection,
  StorageAreaSelection,
  ModuleInput,
  ModuleInputs,
} from '../models'

// Offer domain
export type {
  StorageProduct,
  RouteProduct,
  StorageType,
  CargoType,
  RouteScope,
  Direction,
  TripType,
  Location,
  RegulationStatus,
} from '../models'

// Provider domain
export type {
  ProviderInfo,
} from '../models'

// DemandSession domain
export type {
  DemandSession,
  DemandStatus,
  ServiceType,
  ServiceOrder,
  StorageCondition,
  TransportCondition,
} from '../models'

// Deal domain
export type {
  Deal,
  DealStatus,
  DealOption,
  UserInfo,
} from '../models'

// Code types
export type {
  RegionCode,
  WeightBand,
  SizeBand,
  FeatureCode,
  ModuleClassification,
  BoxSize,
  WeightRange,
  ProductCategory,
  LocationOption,
} from '../models'
