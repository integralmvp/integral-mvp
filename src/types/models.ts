// ============================================
// INTEGRAL MVP - 데이터 모델 타입 정의
// ============================================
// PR1: 기본 구조만 정의
// PR2: 상세 타입 확장 예정

// Code Data System 타입 import
import type { WeightBand, SizeBand } from '../infra/dataspec/codedata/bands/bands'
import type { FeatureCode } from '../infra/dataspec/codedata/features/featureCodes'
export type { WeightBand, SizeBand }
export type { FeatureCode }

// ============ RegionCode 타입 (PR6 일원화) ============
// 법정동 코드 - 10자리 문자열 (예: '5011025300')
// UI/State/Store/Engine 전체에서 장소 식별에 사용하는 단일 진실 소스
export type RegionCode = string

// ============ 기본 위치 타입 ============
export interface Location {
  name: string;
  lat: number;
  lng: number;
}

// ============ 화물 및 공간 유형 ============
export type CargoType = "일반" | "냉장" | "냉동" | "위험물";
export type StorageType = "상온" | "냉장" | "냉동";

// ============ 규정 상태 ============
export interface RegulationStatus {
  allowed: boolean;
  restrictions?: string[];
}

// ============ PR7: 업체 정보 ============
/**
 * ProviderInfo - 업체 정보
 */
export interface ProviderInfo {
  id: string
  name: string
  serviceType: '보관' | '운송' | '통합'
  verified: boolean               // 인증 여부
  description?: string            // 업체 설명
  contractTemplate?: string       // 전자 간이 계약서 템플릿
  pickupAvailable?: boolean       // 픽업 서비스 제공 여부
  weightLimitKg?: number          // 업체별 중량 제한 (초과 중량 계산용)
}

// ============ 경로 범위 및 방향 ============
export type RouteScope = "INTRA_JEJU" | "SEA";
export type Direction = "INBOUND" | "OUTBOUND";
export type TripType = "ONE_WAY" | "ROUND_TRIP";

// ============ 경로 상품 (PR2에서 확장) ============
export interface RouteProduct {
  id: string;
  origin: Location;
  destination: Location;
  // PR7-pre: 법정동 코드 기반 필터링용 (필수)
  originCode: string;                    // 출발지 법정동 코드
  destinationCode: string;               // 도착지 법정동 코드
  schedule: string;
  capacity: string;
  vehicleType: string;
  cargoTypes: CargoType[];
  price: number;
  priceUnit: string;
  canIntegrateWith?: string[];
  regulationStatus: RegulationStatus;
  // PR2 추가 필드
  routeScope: RouteScope;
  direction?: Direction;  // routeScope === "SEA"일 때만 사용
  tripType?: TripType;     // 표현용 필드
  // PR4 규정 필드
  allowedItemCodes?: string[];           // 허용 품목 코드 (없으면 전체 허용)
  maxWeightKg?: number;                  // 최대 중량 (default: 20kg)
  maxSumCm?: number;                     // 최대 3변합 (default: 170cm)
  minCubes?: number;                     // 최소 큐브 수 (default: 0)
  tempSupported?: boolean;               // 냉장/냉동 지원
  hazmatSupported?: boolean;             // 위험물 지원
  allowedModuleClasses?: ModuleClassification[];  // 허용 모듈
  // PR5 자원 필드
  capacityCubes: number;                 // 총 수용 가능 큐브 (정수)
  remainingCubes: number;                // 현재 남은 큐브 (정수, MVP: capacity와 동일)
  // PR7 정산 필드
  unitPricePerCube: number;              // ₩/Cube (단일 진실, 큐브 당 단가)
  maxKgPerCube: number;                  // 1 Cube당 최대 허용 중량 (중량 환산 기준)
  payloadCapacityKg?: number;            // 총 하중 (선택, 있으면 사용)
  remainingPayloadKg?: number;           // 남은 하중 재고 (방어용)
  // PR7 업체 정보
  provider: ProviderInfo;                // 업체 정보
}

// ============ 공간 상품 (PR2에서 확장) ============
export interface StorageProduct {
  id: string;
  location: Location & { region: string; regionCode: string };  // PR7-pre: 법정동 코드 추가
  storageType: StorageType;
  capacity: string;
  price: number;
  priceUnit: string;
  features: FeatureCode[];  // PR7-pre: FeatureCode 타입으로 표준화
  connectedRoutes?: string[];
  regulationStatus: RegulationStatus;
  // PR4 규정 필드
  allowedItemCodes?: string[];           // 허용 품목 코드 (없으면 전체 허용)
  maxWeightKg?: number;                  // 최대 중량 (default: 20kg)
  maxSumCm?: number;                     // 최대 3변합 (default: 170cm)
  minCubes?: number;                     // 최소 큐브 수 (default: 0, Pallet 기준으로도 환산 가능)
  tempSupported?: boolean;               // 냉장/냉동 지원 (냉장/냉동 창고는 true)
  hazmatSupported?: boolean;             // 위험물 지원
  allowedModuleClasses?: ModuleClassification[];  // 허용 모듈
  // PR5 자원 필드
  capacityCubes: number;                 // 총 수용 가능 큐브 (정수, Pallet × 128)
  remainingCubes: number;                // 현재 남은 큐브 (정수, MVP: capacity와 동일)
  // PR7 정산 필드
  unitPricePerCube: number;              // ₩/Cube (단일 진실, 큐브 당 단가)
  maxKgPerCube: number;                  // 1 Cube당 최대 허용 중량 (중량 환산 기준)
  payloadCapacityKg?: number;            // 총 하중 (선택, 있으면 사용)
  remainingPayloadKg?: number;           // 남은 하중 재고 (방어용)
  // PR7 업체 정보
  provider: ProviderInfo;                // 업체 정보
}

// ============ ProductCard Props (PR1 용도) ============
export interface ProductCardProps {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
  priceUnit: string;
  badges?: string[];
  onClick?: () => void;
}

// ============ PR2: 거래 모달용 타입 ============
export type UnitLoadModule = "소형" | "대형" | "특수";

export type HandlingOption =
  | "파손주의"
  | "냉장"
  | "냉동"
  | "위험물"
  | "온도민감"
  | "적재방향";

export interface CargoCondition {
  unitLoadModule: UnitLoadModule;
  handlingOptions: HandlingOption[];
  quantity: number;
  notes?: string;
}

export type MatchStatus = "가능" | "주의" | "불가";

export interface MatchResult {
  status: MatchStatus;
  message: string;
  restrictions?: { reason: string; detail: string }[];
  warnings?: string[];
}

export interface CostEstimate {
  basePrice: number;
  handlingFee?: number;
  totalPrice: number;
  breakdown: { label: string; amount: number }[];
}

// ============ PR3-2: 보관면적 선택 타입 (재설계 - 다중 선택) ============
export type AreaInputType = 'module' | 'area'
export type BoxSize = '소형' | '중형' | '대형'

// 각 모듈별 입력값
export interface ModuleInput {
  count: number   // 박스 개수
  height: number  // 박스 높이(mm)
}

// 모든 모듈 입력값
export interface ModuleInputs {
  소형?: ModuleInput
  중형?: ModuleInput
  대형?: ModuleInput
}

export interface StorageAreaSelection {
  inputType: AreaInputType
  // 포장박스 모듈 선택 시 (다중 선택 지원)
  selectedModules?: Set<BoxSize>
  moduleInputs?: ModuleInputs
  // 면적 선택 시
  areaInSquareMeters?: number
  // 환산 결과
  estimatedPallets?: number
}

// ============ PR3-2 재재설계: 박스 실측 입력 기반 자동 분류 ============
// NOTE: 통합 엔진 도입 (Phase 1) - engine/shapeClassifier.ts와 호환

// 박스 실측 입력 Row (UI 레이어)
export interface BoxInputUI {
  id: string      // UI 식별자
  width: number   // mm
  depth: number   // mm
  height: number  // mm
  count: number
  completed?: boolean  // 입력 완료 여부
}

// 박스 입력 (엔진 레이어 - engine과 호환)
// NOTE: engine/shapeClassifier.ts의 BoxInput과 동일 구조
export interface BoxInput {
  widthMm: number
  depthMm: number
  heightMm: number
  count: number
  // 확장 필드 (Phase 4 매칭 시 사용)
  weightKg?: number
  stackable?: boolean
}

// 분류 결과 (SMALL/MEDIUM/LARGE/UNCLASSIFIED)
export type ModuleClassification = '소형' | '중형' | '대형' | 'UNCLASSIFIED'

// 분류된 박스
export interface ClassifiedBox extends BoxInput {
  classification: ModuleClassification
}

// 모듈별 집계 결과
export interface ModuleAggregate {
  moduleName: BoxSize
  countTotal: number
  heightMax: number
  volumeTotal: number
  palletsStandalone: number  // 단독 적재 가정 파레트 수
}

// 박스 기반 면적 선택
export interface BoxBasedAreaSelection {
  inputType: 'box' | 'area'
  // 박스 입력 시
  boxes?: BoxInput[]
  classifiedBoxes?: ClassifiedBox[]
  moduleAggregates?: ModuleAggregate[]
  hasUnclassified?: boolean
  // 면적 입력 시
  areaInSquareMeters?: number
  // 최종 환산 결과
  estimatedPallets?: number
}

// ============ PR3-3: UI 재설계 - 화물 등록 관련 타입 ============

// 중량 구간
export type WeightRange = '0-5kg' | '5-10kg' | '10-20kg' | '20-30kg' | '30kg+'

// 품목 카테고리 (우체국 품목 코드 체계 기반)
export interface ProductCategory {
  code: string
  name: string
  subCategories?: { code: string; name: string }[]
}

// 화물 UI 모델 (화물 등록 시 사용)
export interface CargoUI {
  id: string
  // 박스 규격
  width: number   // mm
  depth: number   // mm
  height: number  // mm
  // 분류 결과
  moduleType?: '소형' | '중형' | '대형' | 'UNCLASSIFIED'
  // 품목 (Code Data System)
  itemCode?: string                    // ICxx (플랫폼 표준 코드)
  productCategory?: string             // 기존 호환용 (deprecated)
  productSubCategory?: string          // 기존 호환용 (deprecated)
  // 중량
  weightKg?: number                    // 실제 중량 (kg)
  weightRange?: WeightRange            // 기존 호환용 (deprecated)
  // 자동 계산 밴드 (Code Data System)
  weightBand?: WeightBand
  sizeBand?: SizeBand
  sumCm?: number                       // 3변합 (cm)
  // 저장된 CargoInfo ID (Code Data System)
  cargoInfoId?: string
  // 상태
  completed: boolean
}

// 등록된 화물 (화물 등록 완료 후)
export interface RegisteredCargo extends CargoUI {
  cargoNumber: number  // 화물 번호 (등록 순서)
  quantity?: number    // 물량 입력 시 저장
  estimatedCubes?: number  // 환산된 큐브 수
}

// 지역 옵션 (드롭다운용 - 범위 개념)
export interface LocationOption {
  id: string
  name: string
  level: 'island' | 'city' | 'district'  // 제주도 전체 / 시 / 읍면동
  parentId?: string
}

// 조건 입력 상태 (PR6 일원화: RegionCode 기반)
export interface StorageCondition {
  location?: string        // 보관 장소 표시용 (name) - 레거시 호환
  locationCode?: RegionCode    // 보관 장소 법정동 코드 (필터링용, 단일 진실)
  startDate?: string       // 보관 시작일 (ISO 8601)
  endDate?: string         // 보관 종료일 (ISO 8601)
}

export interface TransportCondition {
  origin?: string          // 출발지 표시용 (name) - 레거시 호환
  originCode?: RegionCode      // 출발지 법정동 코드 (필터링용, 단일 진실)
  destination?: string     // 도착지 표시용 (name) - 레거시 호환
  destinationCode?: RegionCode // 도착지 법정동 코드 (필터링용, 단일 진실)
  transportDate?: string   // 운송 날짜 (ISO 8601)
}

// 보관+운송 순서
export type ServiceOrder = 'storage-first' | 'transport-first' | null

// PR3에서 추가될 타입들:
// - DealRequest/Response
// - RegulationRule
// - RegionHeatmap

// ============ Code Data System - Info 타입 ============
// PR: Code Data System MVP - 정보 데이터 타입

/**
 * CargoInfo - 화물 정보 데이터
 *
 * 정보 데이터의 핵심. 화물의 정적 정보를 저장.
 * - ID: prefix+ULID (의미 압축 금지)
 * - signature: 매칭/필터/집계용 핵심 분류 키
 * - fields: 상세 수치/텍스트/원본 정보
 */
export interface CargoInfo {
  // 식별
  id: string              // cargo_{ULID}
  ownerId: string         // 소유자 ID (MVP: 'demo-user')

  // 시그니처 (분류 키)
  signature: {
    moduleClass: ModuleClassification  // 포장모듈 분류 (기존 분류 결과 사용)
    itemCode: string                   // ICxx (품목 코드)
    weightBand: WeightBand             // WBX|WBY|WBZ|WBH
    sizeBand: SizeBand                 // SB1|SB2|SB3|SB4|SBX
  }

  // 상세 필드
  fields: {
    dimsMm: { w: number; d: number; h: number }  // 규격 (mm)
    sumCm: number                                 // 3변합 (cm)
    weightKg: number                              // 중량 (kg)
    notes?: string                                // 비고
  }

  // 메타
  createdAt: string       // ISO 8601
}

/**
 * DemandStatus - 수요 세션 상태
 */
export type DemandStatus =
  | 'DRAFT'           // 초안 (화물 등록 중)
  | 'RULES_PASSED'    // 규정 통과
  | 'RESOURCE_READY'  // 자원(큐브) 계산 완료
  | 'SEARCHED'        // 검색 실행됨
  | 'DEAL_STARTED'    // 거래 시작

/**
 * ServiceType - 서비스 유형
 */
export type ServiceType = 'STORAGE' | 'ROUTE' | 'BOTH'

/**
 * DemandSession - 수요 세션
 *
 * 규정→자원 흐름의 "접착제" 역할
 * 사용자가 입력한 조건과 계산된 큐브/파렛트 결과를 저장
 */
export interface DemandSession {
  // 식별
  demandId: string        // demand_{ULID}
  ownerId: string         // 소유자 ID

  // 서비스 유형
  serviceType: ServiceType
  order?: ServiceOrder    // BOTH일 때 순서

  // 화물 연결
  cargoIds: string[]                                    // 연결된 화물 ID 목록
  quantitiesByCargoId: Record<string, number>           // 화물별 수량

  // 큐브 계산 결과
  cubeResultByCargoId?: Record<string, {
    mode: 'STORAGE' | 'ROUTE'
    cubes: number
  }>
  totalCubes?: number
  totalPallets?: number   // Storage/Both에서만 사용
  // PR7 정산 관련 필드
  volumeCubes?: number    // 부피 기반 큐브 (실질 큐브)
  totalWeightKg?: number  // 총 중량 (kg)
  billableCubes?: number  // 정산 큐브 (중량 보정 포함, 거래 단계에서 계산)

  // 조건 입력
  storageCondition?: StorageCondition
  transportCondition?: TransportCondition

  // 상태
  status: DemandStatus

  // PR5: 규정/자원 체크 결과 요약
  regulationSummary?: {
    checked: boolean
    passedOfferIds: string[]
    failedOfferIdsCount: number
  }

  resourceSummary?: {
    checked: boolean
    passedOfferIds: string[]
    failedOfferIdsCount: number
  }

  // 메타
  createdAt: string
  updatedAt: string
}

// ============ Code Data System - Event 타입 ============
// PR: Code Data System MVP - 사건 데이터 타입 (append-only)

/**
 * EventSubject - 사건 대상
 */
export interface EventSubject {
  kind: 'cargo' | 'demand' | 'offer' | 'deal'
  id: string
}

/**
 * EventSignature - 사건 시그니처 (선택적)
 */
export interface EventSignature {
  itemCode?: string
  weightBand?: string
  sizeBand?: string
  moduleClass?: string
  serviceType?: string
}

/**
 * PlatformEventType - MVP 이벤트 타입
 */
export type PlatformEventType =
  // 화물 관련
  | 'CARGO_CREATED'
  | 'CARGO_REMOVED'
  | 'CARGO_SIGNATURE_UPDATED'
  // 규정 관련
  | 'RULE_CHECKED'
  | 'RULES_PASSED'
  // 물량 관련
  | 'QUANTITY_SET'
  | 'CUBE_CALCULATED'
  | 'RESOURCE_READY'
  // 조건 관련 - 보관
  | 'STORAGE_LOCATION_SET'
  | 'STORAGE_PERIOD_SET'
  // 조건 관련 - 운송
  | 'TRANSPORT_ORIGIN_SET'
  | 'TRANSPORT_DESTINATION_SET'
  | 'TRANSPORT_DATE_SET'
  // 검색 관련
  | 'SEARCH_EXECUTED'
  // PR5: 세션/자원 관련
  | 'DEMAND_SESSION_CREATED'
  | 'RESOURCE_CHECKED'
  // PR7: 거래 관련
  | 'MATCH_CONFIRMED'
  | 'DEAL_CREATED'
  | 'DEAL_SUBMITTED'
  | 'DEAL_CONFIRMED'           // 계약서 동의 완료
  | 'SETTLEMENT_CALCULATED'    // 정산 breakdown 생성
  | 'RESOURCE_ALLOCATED'       // 재고 차감 완료
  | 'DEAL_CANCELLED'           // 거래 취소
  | 'RESOURCE_RELEASED'        // 재고 복원

/**
 * PlatformEvent - 플랫폼 사건 데이터
 *
 * Info에 일어난 사건을 "append-only"로 기록
 * 분석/추적용
 */
export interface PlatformEvent {
  // 식별
  eventId: string         // evt_{ULID}
  ts: string              // ISO 8601 타임스탬프

  // 이벤트 정보
  eventType: PlatformEventType
  actorId: string         // 행위자 ID (MVP: 'demo-user')

  // 대상
  subject: EventSubject

  // 시그니처 (선택적)
  signature?: EventSignature

  // 상세 필드 (이벤트별 상이)
  fields?: Record<string, unknown>
}

// ============ Event Fields 상세 타입 (타입 안전성 향상) ============

/**
 * RULE_CHECKED 이벤트 필드
 */
export interface RuleCheckedFields {
  passed: boolean
  reasons: string[]
}

/**
 * CUBE_CALCULATED 이벤트 필드
 */
export interface CubeCalculatedFields {
  mode: 'STORAGE' | 'ROUTE'
  cubes: number
  packingFactor: number
}

/**
 * SEARCH_EXECUTED 이벤트 필드
 */
export interface SearchExecutedFields {
  resultCount: number
}

// ============ PR7: 거래 레이어 타입 ============

/**
 * UserInfo - 사용자 정보 (MVP 더미)
 */
export interface UserInfo {
  id: string
  name: string
  email: string
  phone: string
}

/**
 * DealOption - 거래 부가 옵션
 */
export interface DealOption {
  id: string
  name: string
  description: string
  price: number
  selected: boolean
}

/**
 * DealStatus - 거래 상태
 */
export type DealStatus =
  | 'DRAFT'           // 작성 중
  | 'SUBMITTED'       // 신청 완료
  | 'CONFIRMED'       // 확정
  | 'CANCELLED'       // 취소

/**
 * Deal - 거래 데이터
 */
export interface Deal {
  id: string
  demandId: string
  userId: string

  // 선택 상품
  selectedStorageId?: string
  selectedRouteId?: string

  // 거래 조건
  pickupRequested: boolean
  pickupLocation?: string
  dropoffLocation?: string

  // 부가 옵션
  options: DealOption[]

  // 비용 계산
  baseCost: number
  cubeCost: number
  weightCost: number
  optionsCost: number
  totalCost: number
  // PR7 정산 breakdown (큐브 단가 기반)
  volumeCubes?: number          // 부피 기반 큐브
  weightCubes?: number          // 중량 환산 큐브
  billableCubes?: number        // 최종 과금 큐브 = max(volumeCubes, weightCubes)
  unitPricePerCube?: number     // 적용된 큐브 당 단가
  weightSurchargeApplied?: boolean  // 중량 보정 적용 여부

  // 요청 메모
  userMemo?: string

  // 계약 동의
  contractAgreed: boolean
  contractAgreedAt?: string

  // 상태
  status: DealStatus

  // 메타
  createdAt: string
  updatedAt: string
}
