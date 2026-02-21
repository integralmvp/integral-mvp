/**
 * Domain Types - barrel
 * 플랫폼 핵심 도메인 타입 (새 파일에서 직접 export)
 */

export type {
  CargoType,
  BoxInput,
  BoxInputUI,
  ModuleClassification,
  BoxSize,
  ClassifiedBox,
  ModuleAggregate,
  AreaInputType,
  ModuleInput,
  ModuleInputs,
  StorageAreaSelection,
  BoxBasedAreaSelection,
  CargoInfo,
  RuleCheckedFields,
  CubeCalculatedFields,
} from './cargo'

export type {
  Location,
  RegulationStatus,
  StorageType,
  StorageProduct,
  RouteScope,
  Direction,
  TripType,
  RouteProduct,
} from './offer'

export type {
  ProviderInfo,
} from './provider'

export type {
  ServiceType,
  ServiceOrder,
  StorageCondition,
  TransportCondition,
  DemandStatus,
  DemandSession,
} from './demandSession'

export type {
  UserInfo,
  DealStatus,
  DealOption,
  Deal,
} from './deal'

export type {
  RegionCode,
  WeightBand,
  SizeBand,
  FeatureCode,
} from './codes'

export type {
  EventSubject,
  EventSignature,
  PlatformEventType,
  PlatformEvent,
  SearchExecutedFields,
} from './events'
