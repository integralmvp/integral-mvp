// ============================================
// INTEGRAL MVP - 더미 데이터
// ============================================
// PR2: 제주 물류 특화 더미 데이터
// PR7-pre: 좌표 체계 일원화 (대표좌표 참조)

import type {
  RouteProduct,
  StorageProduct,
  CargoType,
  StorageType,
  ProductCategory,
  LocationOption,
  WeightRange,
  ModuleClassification,
  FeatureCode,
  ProviderInfo,
  UserInfo,
} from '../../types/models'
import { REGION_REPRESENTATIVE_COORDS } from '../../infra/dataspec/codedata/regions/regionRepresentativeCoords'

// ============ 대표좌표 참조 헬퍼 ============
const getCoords = (code: string) => REGION_REPRESENTATIVE_COORDS[code]

// ============ 제주도 좌표 (대표좌표 참조) ============
// 내부 참조용 (외부 export 하지 않음)
const JEJU_COORDS = {
  jejuCity: getCoords('5011000000'),
  seogwipo: getCoords('5013000000'),
  seongsan: getCoords('5013025900'),
  aewol: getCoords('5011025300'),
  hallim: getCoords('5011025000'),
  jocheon: getCoords('5011025900'),
  jejuPort: getCoords('JEJU_PORT'),
}

// ============ 육지 항만 좌표 (대표좌표 참조) ============
// 내부 참조용 (외부 export 하지 않음)
const MAINLAND_PORTS = {
  busan: getCoords('BUSAN_PORT'),
  incheon: getCoords('INCHEON_PORT'),
  mokpo: getCoords('MOKPO_PORT'),
}

// ============ PR7: 업체 정보 ============
export const PROVIDERS: ProviderInfo[] = [
  // 보관 업체
  {
    id: 'PROVIDER_S1',
    name: '제주물류센터',
    serviceType: '보관',
    verified: true,
    description: '제주항 인근 대형 물류센터, 24시간 입출고 가능',
    contractTemplate: '제주물류센터 표준 계약서 v2.1',
    pickupAvailable: true,
    weightLimitKg: 25,
  },
  {
    id: 'PROVIDER_S2',
    name: '한라냉장',
    serviceType: '보관',
    verified: true,
    description: '식품 전문 냉장/냉동 물류 서비스',
    contractTemplate: '한라냉장 표준 계약서 v1.8',
    pickupAvailable: false,
    weightLimitKg: 20,
  },
  {
    id: 'PROVIDER_S3',
    name: '서귀창고',
    serviceType: '보관',
    verified: true,
    description: '서귀포 지역 중심 물류 창고',
    contractTemplate: '서귀창고 표준 계약서 v1.5',
    pickupAvailable: true,
    weightLimitKg: 30,
  },
  {
    id: 'PROVIDER_S4',
    name: '탐라스토리지',
    serviceType: '보관',
    verified: false,
    description: '중소 규모 창고 전문',
    contractTemplate: '탐라스토리지 계약서 v1.0',
    pickupAvailable: false,
    weightLimitKg: 20,
  },
  // 운송 업체
  {
    id: 'PROVIDER_R1',
    name: '제주택배',
    serviceType: '운송',
    verified: true,
    description: '도내 운송 전문, 정시 배송 보장',
    contractTemplate: '제주택배 표준 계약서 v3.2',
    pickupAvailable: true,
    weightLimitKg: 25,
  },
  {
    id: 'PROVIDER_R2',
    name: '해운물류',
    serviceType: '운송',
    verified: true,
    description: '제주-육지 간 해상 운송 전문',
    contractTemplate: '해운물류 표준 계약서 v2.5',
    pickupAvailable: false,
    weightLimitKg: 30,
  },
  {
    id: 'PROVIDER_R3',
    name: '올레운송',
    serviceType: '운송',
    verified: true,
    description: '소형 화물 빠른 배송',
    contractTemplate: '올레운송 계약서 v1.2',
    pickupAvailable: true,
    weightLimitKg: 15,
  },
  // 통합 업체
  {
    id: 'PROVIDER_B1',
    name: '제주통합물류',
    serviceType: '통합',
    verified: true,
    description: '보관부터 운송까지 원스톱 서비스',
    contractTemplate: '제주통합물류 표준 계약서 v2.0',
    pickupAvailable: true,
    weightLimitKg: 30,
  },
]

// 업체 ID로 업체 정보 찾기 헬퍼
const getProvider = (id: string): ProviderInfo => {
  const provider = PROVIDERS.find(p => p.id === id)
  if (!provider) throw new Error(`Provider ${id} not found`)
  return provider
}

// ============ PR7: 사용자 정보 (MVP 더미) ============
export const DEMO_USER: UserInfo = {
  id: 'demo-user',
  name: '김제주',
  email: 'demo@integral.com',
  phone: '010-1234-5678',
}

// ============ 경로 상품 (8개) ============
// PR7-pre: originCode/destinationCode 추가 (법정동 코드 기반 필터링)
// 육지 항만(부산항, 인천항, 목포항)은 제주 법정동이 아니므로 빈 문자열 처리

// 도내 경로 (4개)
export const ROUTE_PRODUCTS: RouteProduct[] = [
  {
    id: 'R1',
    origin: {
      name: '제주시',
      lat: JEJU_COORDS.jejuCity!.lat,
      lng: JEJU_COORDS.jejuCity!.lng,
    },
    destination: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo!.lat,
      lng: JEJU_COORDS.seogwipo!.lng,
    },
    originCode: '5011000000',      // 제주시
    destinationCode: '5013000000', // 서귀포시
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
    // PR5 자원: 5톤 차량 (여유 있음)
    capacityCubes: 400,
    remainingCubes: 350,
    // PR7 정산: 큐브 단가 기반 (기존 180000원/회 → 450원/Cube)
    unitPricePerCube: 450,
    maxKgPerCube: 8,  // 5톤 차량, 1 Cube당 8kg 기준
    payloadCapacityKg: 5000,  // 5톤
    remainingPayloadKg: 4375,  // 일부 사용 중 (5000 - 350*8*0.78)
    // PR7 업체
    provider: getProvider('PROVIDER_R1'),
  },
  {
    id: 'R2',
    origin: {
      name: '제주시',
      lat: JEJU_COORDS.jejuCity!.lat,
      lng: JEJU_COORDS.jejuCity!.lng,
    },
    destination: {
      name: '성산',
      lat: JEJU_COORDS.seongsan!.lat,
      lng: JEJU_COORDS.seongsan!.lng,
    },
    originCode: '5011000000',      // 제주시
    destinationCode: '5013025900', // 서귀포시 성산읍
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
    // PR5 자원: 3.5톤 차량 (전체 가용)
    capacityCubes: 280,
    remainingCubes: 280,
    // PR7 정산: 큐브 단가 기반 (기존 90000원/회 → 320원/Cube)
    unitPricePerCube: 320,
    maxKgPerCube: 7,  // 3.5톤 차량, 1 Cube당 7kg 기준
    payloadCapacityKg: 3500,  // 3.5톤
    remainingPayloadKg: 3500,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_R3'),
  },
  {
    id: 'R3',
    origin: {
      name: '애월',
      lat: JEJU_COORDS.aewol!.lat,
      lng: JEJU_COORDS.aewol!.lng,
    },
    destination: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo!.lat,
      lng: JEJU_COORDS.seogwipo!.lng,
    },
    originCode: '5011025300',      // 제주시 애월읍
    destinationCode: '5013000000', // 서귀포시
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
    // PR5 자원: 5톤 차량 (거의 다 찼음 - 필터링 테스트용)
    capacityCubes: 400,
    remainingCubes: 100,
    // PR7 정산: 큐브 단가 기반 (기존 160000원/회 → 400원/Cube)
    unitPricePerCube: 400,
    maxKgPerCube: 8,  // 5톤 차량, 1 Cube당 8kg 기준
    payloadCapacityKg: 5000,  // 5톤
    remainingPayloadKg: 2600,  // 거의 다 찼음 (5000 - 300*8)
    // PR7 업체
    provider: getProvider('PROVIDER_R1'),
  },
  {
    id: 'R4',
    origin: {
      name: '한림',
      lat: JEJU_COORDS.hallim!.lat,
      lng: JEJU_COORDS.hallim!.lng,
    },
    destination: {
      name: '조천',
      lat: JEJU_COORDS.jocheon!.lat,
      lng: JEJU_COORDS.jocheon!.lng,
    },
    originCode: '5011025000',      // 제주시 한림읍
    destinationCode: '5011025900', // 제주시 조천읍
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
    // PR5 자원: 1톤 소형 차량 (전체 가용)
    capacityCubes: 80,
    remainingCubes: 80,
    // PR7 정산: 큐브 단가 기반 (기존 75000원/회 → 940원/Cube)
    unitPricePerCube: 940,
    maxKgPerCube: 6,  // 1톤 차량, 1 Cube당 6kg 기준
    payloadCapacityKg: 1000,  // 1톤
    remainingPayloadKg: 1000,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_R3'),
  },

  // 입도 경로 (2개) - 육지 출발, 제주 도착
  {
    id: 'R5',
    origin: {
      name: '부산항',
      lat: MAINLAND_PORTS.busan!.lat,
      lng: MAINLAND_PORTS.busan!.lng,
    },
    destination: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort!.lat,
      lng: JEJU_COORDS.jejuPort!.lng,
    },
    originCode: '',                // 육지 (제주 법정동 외)
    destinationCode: '5011000000', // 제주시 (제주항)
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
    // PR5 자원: 11톤 대용량 (여유 있음)
    capacityCubes: 880,
    remainingCubes: 600,
    // PR7 정산: 큐브 단가 기반 (기존 352000원/회 → 400원/Cube)
    unitPricePerCube: 400,
    maxKgPerCube: 10,  // 11톤 차량, 1 Cube당 10kg 기준
    payloadCapacityKg: 11000,  // 11톤
    remainingPayloadKg: 8200,  // 일부 사용 중 (11000 - 280*10)
    // PR7 업체
    provider: getProvider('PROVIDER_R2'),
  },
  {
    id: 'R6',
    origin: {
      name: '목포항',
      lat: MAINLAND_PORTS.mokpo!.lat,
      lng: MAINLAND_PORTS.mokpo!.lng,
    },
    destination: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort!.lat,
      lng: JEJU_COORDS.jejuPort!.lng,
    },
    originCode: '',                // 육지 (제주 법정동 외)
    destinationCode: '5011000000', // 제주시 (제주항)
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
    // PR5 자원: 8톤 차량 (여유 있음)
    capacityCubes: 640,
    remainingCubes: 400,
    // PR7 정산: 큐브 단가 기반 (기존 224000원/회 → 350원/Cube)
    unitPricePerCube: 350,
    maxKgPerCube: 9,  // 8톤 차량, 1 Cube당 9kg 기준
    payloadCapacityKg: 8000,  // 8톤
    remainingPayloadKg: 5840,  // 일부 사용 중 (8000 - 240*9)
    // PR7 업체
    provider: getProvider('PROVIDER_R2'),
  },

  // 출도 경로 (2개) - 제주 출발, 육지 도착
  {
    id: 'R7',
    origin: {
      name: '제주항',
      lat: JEJU_COORDS.jejuPort!.lat,
      lng: JEJU_COORDS.jejuPort!.lng,
    },
    destination: {
      name: '인천항',
      lat: MAINLAND_PORTS.incheon!.lat,
      lng: MAINLAND_PORTS.incheon!.lng,
    },
    originCode: '5011000000', // 제주시 (제주항)
    destinationCode: '',      // 육지 (제주 법정동 외)
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
    // PR5 자원: 11톤 대용량 (거의 다 찼음 - 필터링 테스트용)
    capacityCubes: 880,
    remainingCubes: 200,
    // PR7 정산: 큐브 단가 기반 (기존 495000원/회 → 562원/Cube)
    unitPricePerCube: 562,
    maxKgPerCube: 10,  // 11톤 차량, 1 Cube당 10kg 기준
    payloadCapacityKg: 11000,  // 11톤
    remainingPayloadKg: 4200,  // 거의 다 찼음 (11000 - 680*10)
    // PR7 업체
    provider: getProvider('PROVIDER_R2'),
  },
  {
    id: 'R8',
    origin: {
      name: '서귀포',
      lat: JEJU_COORDS.seogwipo!.lat,
      lng: JEJU_COORDS.seogwipo!.lng,
    },
    destination: {
      name: '부산항',
      lat: MAINLAND_PORTS.busan!.lat,
      lng: MAINLAND_PORTS.busan!.lng,
    },
    originCode: '5013000000', // 서귀포시
    destinationCode: '',      // 육지 (제주 법정동 외)
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
    // PR5 자원: 5톤 차량 (전체 가용)
    capacityCubes: 400,
    remainingCubes: 400,
    // PR7 정산: 큐브 단가 기반 (기존 190000원/회 → 475원/Cube)
    unitPricePerCube: 475,
    maxKgPerCube: 8,  // 5톤 차량, 1 Cube당 8kg 기준
    payloadCapacityKg: 5000,  // 5톤
    remainingPayloadKg: 5000,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_R2'),
  },
]

// ============ 공간 상품 (8개) ============
// PR5: capacityCubes = Pallet 수 × 128
// PR7-pre: regionCode 추가 + features를 FeatureCode로 표준화 + 좌표 대표좌표 참조
export const STORAGE_PRODUCTS: StorageProduct[] = [
  {
    id: 'S1',
    location: {
      name: '제주시 (제주항 인근)',
      lat: JEJU_COORDS.jejuPort!.lat,
      lng: JEJU_COORDS.jejuPort!.lng,
      region: '제주시',
      regionCode: '5011000000',  // 제주시
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 30개',
    price: 45000,
    priceUnit: '일',
    features: ['F_24H_INOUT', 'F_FORKLIFT', 'F_CCTV'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 일반 창고 (넉넉한 조건)
    maxWeightKg: 25,
    maxSumCm: 200,
    tempSupported: false,
    minCubes: 0,
    // PR5 자원: 30 Pallet × 128 = 3840 큐브 (전체 가용)
    capacityCubes: 3840,
    remainingCubes: 3840,
    // PR7 정산: 큐브 단가 기반 (기존 45000원/일 → 11.7원/Cube/일)
    unitPricePerCube: 12,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준 (보수적)
    payloadCapacityKg: 15000,  // 30 Pallet × 500kg
    remainingPayloadKg: 15000,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_S1'),
  },
  {
    id: 'S2',
    location: {
      name: '제주시 (공항 인근)',
      lat: JEJU_COORDS.jejuCity!.lat,
      lng: JEJU_COORDS.jejuCity!.lng,
      region: '제주시',
      regionCode: '5011000000',  // 제주시
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 15개',
    price: 80000,
    priceUnit: '일',
    features: ['F_FOOD_SPECIALIZED', 'F_TEMP_MONITORING'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 냉장 창고, 식품 전용
    allowedItemCodes: ['IC10', 'IC11', 'IC12', 'IC13', 'IC14'],
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 4,
    // PR5 자원: 15 Pallet × 128 = 1920 큐브 (일부 사용 중)
    capacityCubes: 1920,
    remainingCubes: 1000,
    // PR7 정산: 큐브 단가 기반 (기존 80000원/일 → 41.7원/Cube/일)
    unitPricePerCube: 42,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 7500,  // 15 Pallet × 500kg
    remainingPayloadKg: 3906,  // 일부 사용 중 (7500 × 1000/1920)
    // PR7 업체
    provider: getProvider('PROVIDER_S2'),
  },
  {
    id: 'S3',
    location: {
      name: '서귀포시',
      lat: JEJU_COORDS.seogwipo!.lat,
      lng: JEJU_COORDS.seogwipo!.lng,
      region: '서귀포',
      regionCode: '5013000000',  // 서귀포시
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 25개',
    price: 40000,
    priceUnit: '일',
    features: ['F_PARKING', 'F_FORKLIFT'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 대형 화물 가능
    maxWeightKg: 30,
    maxSumCm: 250,
    tempSupported: false,
    minCubes: 8,
    // PR5 자원: 25 Pallet × 128 = 3200 큐브 (전체 가용)
    capacityCubes: 3200,
    remainingCubes: 3200,
    // PR7 정산: 큐브 단가 기반 (기존 40000원/일 → 12.5원/Cube/일)
    unitPricePerCube: 13,  // 반올림
    maxKgPerCube: 6,  // 1 Cube당 6kg 기준 (대형 화물 가능)
    payloadCapacityKg: 12500,  // 25 Pallet × 500kg
    remainingPayloadKg: 12500,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_S3'),
  },
  {
    id: 'S4',
    location: {
      name: '서귀포시 (항만 인근)',
      lat: JEJU_COORDS.seogwipo!.lat,
      lng: JEJU_COORDS.seogwipo!.lng,
      region: '서귀포',
      regionCode: '5013000000',  // 서귀포시
    },
    storageType: '냉동' as StorageType,
    capacity: '파렛트 20개',
    price: 120000,
    priceUnit: '일',
    features: ['F_FOOD_SPECIALIZED', 'F_TEMP_MONITORING', 'F_FAST_FREEZE'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 냉동 창고, 수산물/냉동식품
    allowedItemCodes: ['IC10', 'IC12', 'IC13'],
    maxWeightKg: 25,
    maxSumCm: 180,
    tempSupported: true,
    minCubes: 8,
    // PR5 자원: 20 Pallet × 128 = 2560 큐브 (거의 다 찼음 - 필터링 테스트용)
    capacityCubes: 2560,
    remainingCubes: 500,
    // PR7 정산: 큐브 단가 기반 (기존 120000원/일 → 46.9원/Cube/일)
    unitPricePerCube: 47,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 10000,  // 20 Pallet × 500kg
    remainingPayloadKg: 1953,  // 거의 다 찼음 (10000 × 500/2560)
    // PR7 업체
    provider: getProvider('PROVIDER_S3'),
  },
  {
    id: 'S5',
    location: {
      name: '성산',
      lat: JEJU_COORDS.seongsan!.lat,
      lng: JEJU_COORDS.seongsan!.lng,
      region: '성산',
      regionCode: '5013025900',  // 서귀포시 성산읍
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 10개',
    price: 35000,
    priceUnit: '일',
    features: ['F_PARKING'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 소규모 창고 (제한적)
    maxWeightKg: 15,
    maxSumCm: 150,
    tempSupported: false,
    allowedModuleClasses: ['소형', '중형'] as ModuleClassification[],
    minCubes: 0,
    // PR5 자원: 10 Pallet × 128 = 1280 큐브 (전체 가용)
    capacityCubes: 1280,
    remainingCubes: 1280,
    // PR7 정산: 큐브 단가 기반 (기존 35000원/일 → 27.3원/Cube/일)
    unitPricePerCube: 27,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 5000,  // 10 Pallet × 500kg
    remainingPayloadKg: 5000,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_S4'),
  },
  {
    id: 'S6',
    location: {
      name: '애월',
      lat: JEJU_COORDS.aewol!.lat,
      lng: JEJU_COORDS.aewol!.lng,
      region: '애월',
      regionCode: '5011025300',  // 제주시 애월읍
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 12개',
    price: 70000,
    priceUnit: '일',
    features: ['F_AGRI_SPECIALIZED', 'F_TEMP_MONITORING'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 농산물 냉장 창고
    allowedItemCodes: ['IC10', 'IC11', 'IC14'],
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 0,
    // PR5 자원: 12 Pallet × 128 = 1536 큐브 (일부 사용 중)
    capacityCubes: 1536,
    remainingCubes: 800,
    // PR7 정산: 큐브 단가 기반 (기존 70000원/일 → 45.6원/Cube/일)
    unitPricePerCube: 46,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 6000,  // 12 Pallet × 500kg
    remainingPayloadKg: 3125,  // 일부 사용 중 (6000 × 800/1536)
    // PR7 업체
    provider: getProvider('PROVIDER_S2'),
  },
  {
    id: 'S7',
    location: {
      name: '한림',
      lat: JEJU_COORDS.hallim!.lat,
      lng: JEJU_COORDS.hallim!.lng,
      region: '한림',
      regionCode: '5011025000',  // 제주시 한림읍
    },
    storageType: '상온' as StorageType,
    capacity: '파렛트 22개',
    price: 38000,
    priceUnit: '일',
    features: ['F_PARKING', 'F_FORKLIFT'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 일반 창고
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: false,
    minCubes: 0,
    // PR5 자원: 22 Pallet × 128 = 2816 큐브 (전체 가용)
    capacityCubes: 2816,
    remainingCubes: 2816,
    // PR7 정산: 큐브 단가 기반 (기존 38000원/일 → 13.5원/Cube/일)
    unitPricePerCube: 14,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 11000,  // 22 Pallet × 500kg
    remainingPayloadKg: 11000,  // 전체 가용
    // PR7 업체
    provider: getProvider('PROVIDER_S1'),
  },
  {
    id: 'S8',
    location: {
      name: '조천',
      lat: JEJU_COORDS.jocheon!.lat,
      lng: JEJU_COORDS.jocheon!.lng,
      region: '조천',
      regionCode: '5011025900',  // 제주시 조천읍
    },
    storageType: '냉장' as StorageType,
    capacity: '파렛트 18개',
    price: 75000,
    priceUnit: '일',
    features: ['F_TEMP_MONITORING'] as FeatureCode[],
    regulationStatus: { allowed: true },
    // PR4 규정: 냉장 창고, 중형 물량 요구
    maxWeightKg: 20,
    maxSumCm: 170,
    tempSupported: true,
    minCubes: 4,
    // PR5 자원: 18 Pallet × 128 = 2304 큐브 (거의 다 찼음 - 필터링 테스트용)
    capacityCubes: 2304,
    remainingCubes: 100,
    // PR7 정산: 큐브 단가 기반 (기존 75000원/일 → 32.6원/Cube/일)
    unitPricePerCube: 33,  // 반올림
    maxKgPerCube: 5,  // 1 Cube당 5kg 기준
    payloadCapacityKg: 9000,  // 18 Pallet × 500kg
    remainingPayloadKg: 391,  // 거의 다 찼음 (9000 × 100/2304)
    // PR7 업체
    provider: getProvider('PROVIDER_S2'),
  },
]

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
