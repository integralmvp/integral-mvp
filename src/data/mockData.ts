// ============================================
// INTEGRAL MVP - 더미 데이터
// ============================================
// PR2: 제주 물류 특화 더미 데이터

import type {
  RouteProduct,
  StorageProduct,
  CargoType,
  StorageType,
  ProductCategory,
  LocationOption,
  WeightRange,
  ModuleClassification,
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

// ============ 경로 상품 (8개) ============

// 도내 경로 (4개)
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
    // PR4 규정: 넉넉한 조건 (대부분 통과)
    maxWeightKg: 25,
    maxSumCm: 200,
    tempSupported: true,
    minCubes: 0,
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
    capacity: '3.5톤',
    vehicleType: '다마스',
    cargoTypes: ['일반'] as CargoType[],
    price: 90000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
    // PR4 규정: 소형 화물 전용 (중량/규격 제한)
    maxWeightKg: 10,
    maxSumCm: 120,
    allowedModuleClasses: ['소형', '중형'] as ModuleClassification[],
    minCubes: 0,
  },
  {
    id: 'R3',
    origin: {
      name: '애월',
      lat: JEJU_COORDS.aewol.lat,
      lng: JEJU_COORDS.aewol.lng,
    },
    destination: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo.lat,
      lng: JEJU_COORDS.seogwipo.lng,
    },
    schedule: '화목',
    capacity: '5톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉동'] as CargoType[],
    price: 160000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
    // PR4 규정: 냉동 지원, 최소 물량 요구
    tempSupported: true,
    minCubes: 8,
    maxWeightKg: 20,
    maxSumCm: 170,
  },
  {
    id: 'R4',
    origin: {
      name: '한림',
      lat: 33.41,
      lng: 126.27,
    },
    destination: {
      name: '조천',
      lat: 33.538,
      lng: 126.64,
    },
    schedule: '수금',
    capacity: '1톤',
    vehicleType: '라보',
    cargoTypes: ['일반'] as CargoType[],
    price: 75000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'INTRA_JEJU',
    // PR4 규정: 소형 차량 제한 (엄격한 규격/중량)
    maxWeightKg: 5,
    maxSumCm: 100,
    allowedModuleClasses: ['소형'] as ModuleClassification[],
    minCubes: 0,
  },

  // 입도 경로 (2개)
  {
    id: 'R5',
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
    price: 352000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'INBOUND',
    tripType: 'ONE_WAY',
    // PR4 규정: 대용량 해상 운송 (넉넉, 최소 물량 요구)
    maxWeightKg: 30,
    maxSumCm: 250,
    tempSupported: true,
    minCubes: 16,
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
    capacity: '8톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉장'] as CargoType[],
    price: 224000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'INBOUND',
    tripType: 'ROUND_TRIP',
    // PR4 규정: 식품 전용 경로
    allowedItemCodes: ['IC01', 'IC02', 'IC10', 'IC11', 'IC12', 'IC13', 'IC14'],
    tempSupported: true,
    maxWeightKg: 20,
    maxSumCm: 170,
    minCubes: 4,
  },

  // 출도 경로 (2개)
  {
    id: 'R7',
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
    capacity: '11톤',
    vehicleType: '카고',
    cargoTypes: ['일반'] as CargoType[],
    price: 495000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'OUTBOUND',
    tripType: 'ONE_WAY',
    // PR4 규정: 일반 화물만, 대용량 최소 물량
    maxWeightKg: 25,
    maxSumCm: 200,
    tempSupported: false,
    minCubes: 32,
  },
  {
    id: 'R8',
    origin: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo.lat,
      lng: JEJU_COORDS.seogwipo.lng,
    },
    destination: {
      name: '부산항',
      lat: MAINLAND_PORTS.busan.lat,
      lng: MAINLAND_PORTS.busan.lng,
    },
    schedule: '화금',
    capacity: '5톤',
    vehicleType: '윙바디',
    cargoTypes: ['일반', '냉장'] as CargoType[],
    price: 190000,
    priceUnit: '회',
    regulationStatus: { allowed: true },
    routeScope: 'SEA',
    direction: 'OUTBOUND',
    tripType: 'ONE_WAY',
    // PR4 규정: 중소 규모 운송
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 0,
  },
]

// ============ 공간 상품 (8개) ============
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
    // PR4 규정: 일반 창고 (넉넉한 조건)
    maxWeightKg: 25,
    maxSumCm: 200,
    tempSupported: false,
    minCubes: 0,
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
    // PR4 규정: 냉장 창고, 식품 전용
    allowedItemCodes: ['IC10', 'IC11', 'IC12', 'IC13', 'IC14'],
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 4,
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
    // PR4 규정: 대형 화물 가능
    maxWeightKg: 30,
    maxSumCm: 250,
    tempSupported: false,
    minCubes: 8,
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
    // PR4 규정: 냉동 창고, 수산물/냉동식품
    allowedItemCodes: ['IC10', 'IC12', 'IC13'],
    maxWeightKg: 25,
    maxSumCm: 180,
    tempSupported: true,
    minCubes: 8,
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
    // PR4 규정: 소규모 창고 (제한적)
    maxWeightKg: 15,
    maxSumCm: 150,
    tempSupported: false,
    allowedModuleClasses: ['소형', '중형'] as ModuleClassification[],
    minCubes: 0,
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
    // PR4 규정: 농산물 냉장 창고
    allowedItemCodes: ['IC10', 'IC11', 'IC14'],
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 0,
  },
  {
    id: 'S7',
    location: {
      name: '한림',
      lat: 33.41,
      lng: 126.27,
      region: '한림',
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 22개',
    price: 38000,
    priceUnit: '일',
    features: ['서부권 거점', '도로 접근성 우수'],
    regulationStatus: { allowed: true },
    // PR4 규정: 일반 창고
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: false,
    minCubes: 0,
  },
  {
    id: 'S8',
    location: {
      name: '조천',
      lat: 33.538,
      lng: 126.64,
      region: '조천',
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 18개',
    price: 75000,
    priceUnit: '일',
    features: ['동부권 거점', '온도관리 시설'],
    regulationStatus: { allowed: true },
    // PR4 규정: 냉장 창고, 중형 물량 요구
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 4,
  },
]

// ============ 유니트 로드 모듈 옵션 ============
export const UNIT_LOAD_MODULES = ['소형', '대형', '특수'] as const

// ============ 포장박스 모듈 (PR3-2 재설계 - 바닥 규격 mm) ============
export interface PackageBoxModule {
  id: string
  name: '소형' | '중형' | '대형'
  width: number  // mm (바닥 가로)
  depth: number  // mm (바닥 세로)
  label: string
}

export const PACKAGE_BOX_MODULES: PackageBoxModule[] = [
  {
    id: 'box-small',
    name: '소형',
    width: 550,
    depth: 275,
    label: '소형(8분할)'
  },
  {
    id: 'box-medium',
    name: '중형',
    width: 550,
    depth: 366,
    label: '중형(6분할)'
  },
  {
    id: 'box-large',
    name: '대형',
    width: 650,
    depth: 450,
    label: '대형(4분할)'
  }
]

// 파렛트 기준 (1100mm × 1100mm)
export const PALLET_SIZE = {
  width: 110,  // cm
  depth: 110,  // cm
  stackHeight: 180  // cm (적재 가능 높이)
}

// ============ 취급 특이사항 옵션 ============
export const HANDLING_OPTIONS = [
  '파손주의',
  '냉장',
  '냉동',
  '위험물',
  '온도민감',
  '적재방향',
] as const

// ============ PR3-3: UI 재설계 - 품목 카테고리 (우체국 품목 코드 체계 기반) ============
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    code: 'FOOD',
    name: '식품',
    subCategories: [
      { code: 'FOOD-FRESH', name: '신선식품' },
      { code: 'FOOD-PROCESSED', name: '가공식품' },
      { code: 'FOOD-FROZEN', name: '냉동식품' },
      { code: 'FOOD-BEVERAGE', name: '음료' },
    ]
  },
  {
    code: 'AGRI',
    name: '농산물',
    subCategories: [
      { code: 'AGRI-FRUIT', name: '과일류' },
      { code: 'AGRI-VEG', name: '채소류' },
      { code: 'AGRI-GRAIN', name: '곡류' },
    ]
  },
  {
    code: 'MARINE',
    name: '수산물',
    subCategories: [
      { code: 'MARINE-FRESH', name: '활어/선어' },
      { code: 'MARINE-DRIED', name: '건어물' },
      { code: 'MARINE-PROCESSED', name: '수산가공품' },
    ]
  },
  {
    code: 'INDUSTRIAL',
    name: '공산품',
    subCategories: [
      { code: 'INDUSTRIAL-ELEC', name: '전자제품' },
      { code: 'INDUSTRIAL-HOME', name: '생활용품' },
      { code: 'INDUSTRIAL-MATERIAL', name: '원자재' },
    ]
  },
  {
    code: 'ETC',
    name: '기타',
    subCategories: [
      { code: 'ETC-DOC', name: '서류/문서' },
      { code: 'ETC-SAMPLE', name: '샘플/시제품' },
      { code: 'ETC-OTHER', name: '기타' },
    ]
  },
]

// ============ PR3-3: UI 재설계 - 중량 구간 ============
export const WEIGHT_RANGES: { value: WeightRange; label: string }[] = [
  { value: '0-5kg', label: '5kg 이하' },
  { value: '5-10kg', label: '5kg ~ 10kg' },
  { value: '10-20kg', label: '10kg ~ 20kg' },
  { value: '20-30kg', label: '20kg ~ 30kg' },
  { value: '30kg+', label: '30kg 초과' },
]

// ============ PR3-3: UI 재설계 - 제주 지역 목록 (범위 개념) ============
export const JEJU_LOCATIONS: LocationOption[] = [
  // 도 전체
  { id: 'jeju-all', name: '제주도 전체', level: 'island' },
  // 시 단위
  { id: 'jeju-city', name: '제주시', level: 'city', parentId: 'jeju-all' },
  { id: 'seogwipo-city', name: '서귀포시', level: 'city', parentId: 'jeju-all' },
  // 읍면동 단위 (제주시)
  { id: 'ara-dong', name: '아라동', level: 'district', parentId: 'jeju-city' },
  { id: 'nohyeong-dong', name: '노형동', level: 'district', parentId: 'jeju-city' },
  { id: 'yeon-dong', name: '연동', level: 'district', parentId: 'jeju-city' },
  { id: 'ido-dong', name: '이도동', level: 'district', parentId: 'jeju-city' },
  { id: 'aewol-eup', name: '애월읍', level: 'district', parentId: 'jeju-city' },
  { id: 'hallim-eup', name: '한림읍', level: 'district', parentId: 'jeju-city' },
  { id: 'jocheon-eup', name: '조천읍', level: 'district', parentId: 'jeju-city' },
  { id: 'gujwa-eup', name: '구좌읍', level: 'district', parentId: 'jeju-city' },
  // 읍면동 단위 (서귀포시)
  { id: 'seogwipo-dong', name: '서귀동', level: 'district', parentId: 'seogwipo-city' },
  { id: 'seongsan-eup', name: '성산읍', level: 'district', parentId: 'seogwipo-city' },
  { id: 'namwon-eup', name: '남원읍', level: 'district', parentId: 'seogwipo-city' },
  { id: 'daejeong-eup', name: '대정읍', level: 'district', parentId: 'seogwipo-city' },
  { id: 'andeok-myeon', name: '안덕면', level: 'district', parentId: 'seogwipo-city' },
]
