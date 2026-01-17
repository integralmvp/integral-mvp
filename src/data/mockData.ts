// ============================================
// INTEGRAL MVP - 더미 데이터
// ============================================
// PR2: 제주 물류 특화 더미 데이터

import type {
  RouteProduct,
  StorageProduct,
  CargoType,
  StorageType,
} from '../types/models'

// ============ 제주도 좌표 ============
export const JEJU_COORDS = {
  jejuCity: { lat: 33.4996, lng: 126.5312 },
  seogwipo: { lat: 33.2541, lng: 126.56 },
  seongsan: { lat: 33.4362, lng: 126.927 },
  aewol: { lat: 33.4631, lng: 126.3062 },
  jejuPort: { lat: 33.5197, lng: 126.5234 },
}

// ============ 육지 항만 좌표 ============
export const MAINLAND_PORTS = {
  busan: { lat: 35.0796, lng: 128.9612 },
  incheon: { lat: 37.4563, lng: 126.6052 },
  mokpo: { lat: 34.7806, lng: 126.3789 },
}

// ============ 경로 상품 (6개) ============

// 도내 경로 (3개)
export const ROUTE_PRODUCTS: RouteProduct[] = [
  {
    id: 'R1',
    origin: {
      name: '제주시',
      lat: JEJU_COORDS.jejuCity.lat,
      lng: JEJU_COORDS.jejuCity.lng,
    },
    destination: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo.lat,
      lng: JEJU_COORDS.seogwipo.lng,
    },
    schedule: '매일',
    capacity: '5톤',
    vehicleType: '카고',
    cargoTypes: ['일반', '냉장'] as CargoType[],
    price: 180000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
  },
  {
    id: 'R2',
    origin: {
      name: '제주시',
      lat: JEJU_COORDS.jejuCity.lat,
      lng: JEJU_COORDS.jejuCity.lng,
    },
    destination: {
      name: '성산',
      lat: JEJU_COORDS.seongsan.lat,
      lng: JEJU_COORDS.seongsan.lng,
    },
    schedule: '월수금',
    capacity: '1톤',
    vehicleType: '다마스',
    cargoTypes: ['일반'] as CargoType[],
    price: 85000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
  },
  {
    id: 'R3',
    origin: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo.lat,
      lng: JEJU_COORDS.seogwipo.lng,
    },
    destination: {
      name: '애월',
      lat: JEJU_COORDS.aewol.lat,
      lng: JEJU_COORDS.aewol.lng,
    },
    schedule: '화목',
    capacity: '2.5톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉동'] as CargoType[],
    price: 120000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
  },

  // 입·출도 경로 (3개)
  {
    id: 'R4',
    origin: {
      name: '부산항',
      lat: MAINLAND_PORTS.busan.lat,
      lng: MAINLAND_PORTS.busan.lng,
    },
    destination: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort.lat,
      lng: JEJU_COORDS.jejuPort.lng,
    },
    schedule: '화목',
    capacity: '11톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉장', '냉동'] as CargoType[],
    price: 350000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'INBOUND',
    tripType: 'ONE_WAY',
  },
  {
    id: 'R5',
    origin: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort.lat,
      lng: JEJU_COORDS.jejuPort.lng,
    },
    destination: {
      name: '인천항',
      lat: MAINLAND_PORTS.incheon.lat,
      lng: MAINLAND_PORTS.incheon.lng,
    },
    schedule: '월수',
    capacity: '5톤',
    vehicleType: '카고',
    cargoTypes: ['일반'] as CargoType[],
    price: 280000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'OUTBOUND',
    tripType: 'ONE_WAY',
  },
  {
    id: 'R6',
    origin: {
      name: '목포항',
      lat: MAINLAND_PORTS.mokpo.lat,
      lng: MAINLAND_PORTS.mokpo.lng,
    },
    destination: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort.lat,
      lng: JEJU_COORDS.jejuPort.lng,
    },
    schedule: '매일',
    capacity: '5톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉장'] as CargoType[],
    price: 400000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'INBOUND',
    tripType: 'ROUND_TRIP',
  },
]

// ============ 공간 상품 (6개) ============
export const STORAGE_PRODUCTS: StorageProduct[] = [
  {
    id: 'S1',
    location: {
      name: '제주시 (제주항 인근)',
      lat: 33.515,
      lng: 126.525,
      region: '제주시',
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 30개',
    price: 45000,
    priceUnit: '일',
    features: ['24시간 입출고', '지게차 보유', 'CCTV'],
    regulationStatus: { allowed: true },
  },
  {
    id: 'S2',
    location: {
      name: '제주시 (공항 인근)',
      lat: 33.505,
      lng: 126.49,
      region: '제주시',
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 15개',
    price: 80000,
    priceUnit: '일',
    features: ['신선식품 특화', '온도 관리', '24시간 모니터링'],
    regulationStatus: { allowed: true },
  },
  {
    id: 'S3',
    location: {
      name: '서귀포시',
      lat: 33.255,
      lng: 126.56,
      region: '서귀포',
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 25개',
    price: 40000,
    priceUnit: '일',
    features: ['대형 물량 가능', '주차 공간'],
    regulationStatus: { allowed: true },
  },
  {
    id: 'S4',
    location: {
      name: '서귀포시 (항만 인근)',
      lat: 33.245,
      lng: 126.565,
      region: '서귀포',
    },
    storageType: '냉동' as StorageType,
    capacity: '파렛트 20개',
    price: 120000,
    priceUnit: '일',
    features: ['수산물 특화', '-20도 유지', '급속 냉동'],
    regulationStatus: { allowed: true },
  },
  {
    id: 'S5',
    location: {
      name: '성산',
      lat: 33.44,
      lng: 126.93,
      region: '성산',
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 10개',
    price: 35000,
    priceUnit: '일',
    features: ['동부권 거점', '소량 보관'],
    regulationStatus: { allowed: true },
  },
  {
    id: 'S6',
    location: {
      name: '애월',
      lat: 33.465,
      lng: 126.31,
      region: '애월',
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 12개',
    price: 70000,
    priceUnit: '일',
    features: ['서부권 거점', '농산물 특화'],
    regulationStatus: { allowed: true },
  },
]

// ============ 유니트 로드 모듈 옵션 ============
export const UNIT_LOAD_MODULES = ['소형', '대형', '특수'] as const

// ============ 취급 특이사항 옵션 ============
export const HANDLING_OPTIONS = [
  '파손주의',
  '냉장',
  '냉동',
  '위험물',
  '온도민감',
  '적재방향',
] as const
