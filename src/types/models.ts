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

// PR3에서 추가될 타입들:
// - DealRequest/Response
// - RegulationRule
// - RegionHeatmap
