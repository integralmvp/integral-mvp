// ============================================
// INTEGRAL MVP - 데이터 모델 타입 정의
// ============================================
// PR1: 기본 구조만 정의
// PR2: 상세 타입 확장 예정

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
  // 품목
  productCategory?: string
  productSubCategory?: string
  // 중량
  weightRange?: WeightRange
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
