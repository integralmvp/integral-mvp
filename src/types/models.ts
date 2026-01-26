// ============================================
// INTEGRAL MVP - 데이터 모델 타입 정의
// ============================================
// PR1: 기본 구조만 정의
// PR2: 상세 타입 확장 예정

// Code Data System 타입 import
import type { WeightBand, SizeBand } from '../data/bands'
export type { WeightBand, SizeBand }

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

// ============ 경로 범위 및 방향 ============
export type RouteScope = "INTRA_JEJU" | "SEA";
export type Direction = "INBOUND" | "OUTBOUND";
export type TripType = "ONE_WAY" | "ROUND_TRIP";

// ============ 경로 상품 (PR2에서 확장) ============
export interface RouteProduct {
  id: string;
  origin: Location;
  destination: Location;
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
}

// ============ 공간 상품 (PR2에서 확장) ============
export interface StorageProduct {
  id: string;
  location: Location & { region: string };
  storageType: StorageType;
  capacity: string;
  price: number;
  priceUnit: string;
  features: string[];
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

// ============ Phase 1: 통합 엔진 - Offer 모델 확장 (TODO) ============
// NOTE: Phase 4 매칭/추천 시 사용 예정

// 보관 오퍼 (확장)
export interface StorageOfferExtended {
  capacityPallets: number      // 용량 (파렛트)
  capacityCubes: number         // 용량 (큐브 = pallets * 128)
  remainingPallets: number      // 남은 용량 (파렛트)
  remainingCubes: number        // 남은 용량 (큐브)
  pricePerPallet: number        // 파렛트당 가격
  // TODO: 제약 조건 추가 (allowedModules, maxWeight, etc.)
}

// 운송 오퍼 (확장)
export interface RouteOfferExtended {
  capacityCubes: number         // 용량 (큐브)
  remainingCubes: number        // 남은 용량 (큐브)
  pricePerCube: number          // 큐브당 가격
  // TODO: 제약 조건 추가
  constraints?: {
    allowedModules?: ('소형' | '중형' | '대형')[]
    maxEdgeMm?: number
    maxWeightKg?: number
  }
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

// 조건 입력 상태
export interface StorageCondition {
  location?: string        // 보관 장소
  startDate?: string       // 보관 시작일
  endDate?: string         // 보관 종료일
}

export interface TransportCondition {
  origin?: string          // 출발지
  destination?: string     // 도착지
  transportDate?: string   // 운송 날짜
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

  // 조건 입력
  storageCondition?: StorageCondition
  transportCondition?: TransportCondition

  // 상태
  status: DemandStatus

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
