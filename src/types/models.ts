/**
 * types/models.ts — 호환 브릿지 (Compat Bridge)
 *
 * @deprecated 직접 import 금지. 각 도메인 경로로 이동 중:
 *   - 도메인 타입:  types/domain/*
 *   - UI 타입:      types/ui/*
 *
 * 기존 코드(../types/models)는 이 파일을 통해 계속 동작하며,
 * 이후 PR에서 점진적으로 직접 경로로 전환 예정.
 */

// ============ Domain re-exports ============
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
} from './domain/cargo'

export type {
  Location,
  RegulationStatus,
  StorageType,
  StorageProduct,
  RouteScope,
  Direction,
  TripType,
  RouteProduct,
} from './domain/offer'

export type {
  ProviderInfo,
} from './domain/provider'

export type {
  ServiceType,
  ServiceOrder,
  StorageCondition,
  TransportCondition,
  DemandStatus,
  DemandSession,
} from './domain/demandSession'

export type {
  UserInfo,
  DealStatus,
  DealOption,
  Deal,
} from './domain/deal'

export type {
  RegionCode,
  WeightBand,
  SizeBand,
  FeatureCode,
} from './domain/codes'

export type {
  EventSubject,
  EventSignature,
  PlatformEventType,
  PlatformEvent,
  SearchExecutedFields,
} from './domain/events'

// ============ UI re-exports ============
export type {
  WeightRange,
  ProductCategory,
  CargoUI,
  RegisteredCargo,
  LocationOption,
  UnitLoadModule,
  HandlingOption,
  CargoCondition,
  MatchStatus,
  MatchResult,
  CostEstimate,
} from './ui/serviceConsole'

export type {
  ProductCardProps,
} from './ui/productCard'
