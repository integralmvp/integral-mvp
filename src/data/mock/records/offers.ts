/**
 * Mock Records - INFO_OFFER[]
 * 공간/경로 상품 CDS 레코드 (16개)
 *
 * 규칙:
 * - id: 'offer_r001'~'offer_r008' (경로), 'offer_s001'~'offer_s008' (보관)
 * - signature: 'INFO_OFFER'
 * - fields.providerId: PROVIDER_S1 등 (InfoProviderRecord.id와 1:1 매핑)
 * - 좌표는 빌더에서 REGION_REPRESENTATIVE_COORDS로 조회 (레코드에 저장 안 함)
 * - originCode/destinationCode가 ''인 경우 → CoordsKey로 좌표 조회
 */

import type { InfoOfferRecord } from '../../../infra/dataspec/fields/info/offer.fields'

const SEED_DATE = '2026-01-01T00:00:00.000Z'

// ============ 경로 상품 레코드 (8개) ============

export const OFFER_RECORDS: InfoOfferRecord[] = [
  // ── 도내 경로 (4개) ──────────────────────────────────────────────
  {
    id: 'offer_r001',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R1',
      originCode: '5011000000',       // 제주시
      originName: '제주시',
      destinationCode: '5013000000',  // 서귀포시
      destinationName: '서귀포',
      schedule: '매일',
      vehicleCapacityText: '5톤',
      vehicleType: '카고',
      cargoTypes: ['일반', '냉장'],
      routeScope: 'INTRA_JEJU',
      // 규정
      maxWeightKg: 25,
      maxSumCm: 200,
      tempSupported: true,
      minCubes: 0,
      // SoT
      capacityCubes: 400,
      remainingCubes: 350,
      unitPricePerCube: 650,
      maxKgPerCube: 9,
      payloadCapacityKg: 3600,
      remainingPayloadKg: 3000,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_r002',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R3',
      originCode: '5011000000',       // 제주시
      originName: '제주시',
      destinationCode: '5013025900',  // 서귀포시 성산읍
      destinationName: '성산',
      schedule: '월수금',
      vehicleCapacityText: '3.5톤',
      vehicleType: '다마스',
      cargoTypes: ['일반'],
      routeScope: 'INTRA_JEJU',
      // 규정: 소형 화물 전용
      maxWeightKg: 10,
      maxSumCm: 120,
      allowedModuleClasses: ['소형', '중형'],
      minCubes: 0,
      // SoT
      capacityCubes: 280,
      remainingCubes: 280,
      unitPricePerCube: 520,
      maxKgPerCube: 11,
      payloadCapacityKg: 3080,
      remainingPayloadKg: 3080,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_r003',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R1',
      originCode: '5011025300',       // 제주시 애월읍
      originName: '애월',
      destinationCode: '5013000000',  // 서귀포시
      destinationName: '서귀포',
      schedule: '화목',
      vehicleCapacityText: '5톤',
      vehicleType: '윙바디',
      cargoTypes: ['일반', '냉동'],
      routeScope: 'INTRA_JEJU',
      // 규정: 냉동 지원, 최소 물량
      tempSupported: true,
      minCubes: 8,
      maxWeightKg: 20,
      maxSumCm: 170,
      // SoT: 거의 찼음 (필터링 테스트용)
      capacityCubes: 400,
      remainingCubes: 100,
      unitPricePerCube: 1350,
      maxKgPerCube: 15,
      payloadCapacityKg: 6000,
      remainingPayloadKg: 1425,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_r004',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R3',
      originCode: '5011025000',       // 제주시 한림읍
      originName: '한림',
      destinationCode: '5011025900',  // 제주시 조천읍
      destinationName: '조천',
      schedule: '수금',
      vehicleCapacityText: '1톤',
      vehicleType: '라보',
      cargoTypes: ['일반'],
      routeScope: 'INTRA_JEJU',
      // 규정: 소형 차량 엄격 제한
      maxWeightKg: 5,
      maxSumCm: 100,
      allowedModuleClasses: ['소형'],
      minCubes: 0,
      // SoT
      capacityCubes: 80,
      remainingCubes: 80,
      unitPricePerCube: 780,
      maxKgPerCube: 10,
      payloadCapacityKg: 800,
      remainingPayloadKg: 800,
    },
    createdAt: SEED_DATE,
    version: 1,
  },

  // ── 입도 경로 (2개) — 육지 출발, 제주 도착 ────────────────────────
  {
    id: 'offer_r005',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R2',
      originCode: '',                 // 육지 (제주 법정동 외 → 필터링 제외)
      originCoordsKey: 'BUSAN_PORT',  // 좌표 조회 키
      originName: '부산항',
      destinationCode: '5011000000',  // 제주시 (필터링용)
      destinationCoordsKey: 'JEJU_PORT', // 제주항 좌표
      destinationName: '제주항',
      schedule: '화목',
      vehicleCapacityText: '11톤',
      vehicleType: '윙바디',
      cargoTypes: ['일반', '냉장', '냉동'],
      routeScope: 'SEA',
      direction: 'INBOUND',
      tripType: 'ONE_WAY',
      // 규정: 대용량 해상, 최소 물량 요구
      maxWeightKg: 30,
      maxSumCm: 250,
      tempSupported: true,
      minCubes: 16,
      // SoT
      capacityCubes: 880,
      remainingCubes: 600,
      unitPricePerCube: 1850,
      maxKgPerCube: 18,
      payloadCapacityKg: 15840,
      remainingPayloadKg: 10260,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_r006',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R2',
      originCode: '',                 // 육지
      originCoordsKey: 'MOKPO_PORT',
      originName: '목포항',
      destinationCode: '5011000000',  // 제주시
      destinationCoordsKey: 'JEJU_PORT',
      destinationName: '제주항',
      schedule: '매일',
      vehicleCapacityText: '8톤',
      vehicleType: '윙바디',
      cargoTypes: ['일반', '냉장'],
      routeScope: 'SEA',
      direction: 'INBOUND',
      tripType: 'ROUND_TRIP',
      // 규정: 식품 전용 경로
      allowedItemCodes: ['IC01', 'IC02', 'IC10', 'IC11', 'IC12', 'IC13', 'IC14'],
      tempSupported: true,
      maxWeightKg: 20,
      maxSumCm: 170,
      minCubes: 4,
      // SoT
      capacityCubes: 640,
      remainingCubes: 400,
      unitPricePerCube: 1550,
      maxKgPerCube: 16,
      payloadCapacityKg: 10240,
      remainingPayloadKg: 6080,
    },
    createdAt: SEED_DATE,
    version: 1,
  },

  // ── 출도 경로 (2개) — 제주 출발, 육지 도착 ────────────────────────
  {
    id: 'offer_r007',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R2',
      originCode: '5011000000',       // 제주시 (필터링용)
      originCoordsKey: 'JEJU_PORT',   // 제주항 좌표
      originName: '제주항',
      destinationCode: '',            // 육지
      destinationCoordsKey: 'INCHEON_PORT',
      destinationName: '인천항',
      schedule: '월수',
      vehicleCapacityText: '11톤',
      vehicleType: '카고',
      cargoTypes: ['일반'],
      routeScope: 'SEA',
      direction: 'OUTBOUND',
      tripType: 'ONE_WAY',
      // 규정: 일반 화물만, 최소 물량 요구
      maxWeightKg: 25,
      maxSumCm: 200,
      tempSupported: false,
      minCubes: 32,
      // SoT: 거의 찼음 (필터링 테스트용)
      capacityCubes: 880,
      remainingCubes: 250,
      unitPricePerCube: 3200,
      maxKgPerCube: 20,
      payloadCapacityKg: 17600,
      remainingPayloadKg: 4750,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_r008',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'ROUTE',
      providerId: 'PROVIDER_R2',
      originCode: '5013000000',       // 서귀포시
      originName: '서귀포',
      destinationCode: '',            // 육지
      destinationCoordsKey: 'BUSAN_PORT',
      destinationName: '부산항',
      schedule: '화금',
      vehicleCapacityText: '5톤',
      vehicleType: '윙바디',
      cargoTypes: ['일반', '냉장'],
      routeScope: 'SEA',
      direction: 'OUTBOUND',
      tripType: 'ONE_WAY',
      // 규정
      maxWeightKg: 20,
      maxSumCm: 170,
      tempSupported: true,
      minCubes: 0,
      // SoT
      capacityCubes: 400,
      remainingCubes: 400,
      unitPricePerCube: 1750,
      maxKgPerCube: 14,
      payloadCapacityKg: 5600,
      remainingPayloadKg: 5600,
    },
    createdAt: SEED_DATE,
    version: 1,
  },

  // ============ 보관 상품 레코드 (8개) ====================================

  {
    id: 'offer_s001',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S1',
      regionCode: '5011000000',       // 제주시 (필터링용)
      locationCoordsKey: 'JEJU_PORT', // 제주항 인근 좌표
      locationName: '제주시 (제주항 인근)',
      locationRegion: '제주시',
      storageType: '상온',
      capacityText: '파렛트 30개',
      features: ['F_24H_INOUT', 'F_FORKLIFT', 'F_CCTV'],
      // 규정: 일반 창고 (넉넉)
      maxWeightKg: 25,
      maxSumCm: 200,
      tempSupported: false,
      minCubes: 0,
      // SoT: 30 Pallet × 128 = 3840
      capacityCubes: 3840,
      remainingCubes: 3840,
      unitPricePerCube: 95,
      maxKgPerCube: 20,
      payloadCapacityKg: 76800,
      remainingPayloadKg: 76800,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s002',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S2',
      regionCode: '5011000000',       // 제주시
      locationName: '제주시 (공항 인근)',
      locationRegion: '제주시',
      storageType: '냉장',
      capacityText: '파렛트 15개',
      features: ['F_FOOD_SPECIALIZED', 'F_TEMP_MONITORING'],
      // 규정: 냉장, 식품 전용
      allowedItemCodes: ['IC10', 'IC11', 'IC12', 'IC13', 'IC14'],
      maxWeightKg: 20,
      maxSumCm: 170,
      tempSupported: true,
      minCubes: 4,
      // SoT: 15 Pallet × 128 = 1920
      capacityCubes: 1920,
      remainingCubes: 1000,
      unitPricePerCube: 155,
      maxKgPerCube: 28,
      payloadCapacityKg: 53760,
      remainingPayloadKg: 26880,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s003',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S3',
      regionCode: '5013000000',       // 서귀포시
      locationName: '서귀포시',
      locationRegion: '서귀포',
      storageType: '상온',
      capacityText: '파렛트 25개',
      features: ['F_PARKING', 'F_FORKLIFT'],
      // 규정: 대형 화물 가능
      maxWeightKg: 30,
      maxSumCm: 250,
      tempSupported: false,
      minCubes: 8,
      // SoT: 25 Pallet × 128 = 3200
      capacityCubes: 3200,
      remainingCubes: 3200,
      unitPricePerCube: 85,
      maxKgPerCube: 22,
      payloadCapacityKg: 70400,
      remainingPayloadKg: 70400,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s004',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S3',
      regionCode: '5013000000',       // 서귀포시
      locationName: '서귀포시 (항만 인근)',
      locationRegion: '서귀포',
      storageType: '냉동',
      capacityText: '파렛트 20개',
      features: ['F_FOOD_SPECIALIZED', 'F_TEMP_MONITORING', 'F_FAST_FREEZE'],
      // 규정: 냉동, 수산물/냉동식품
      allowedItemCodes: ['IC10', 'IC12', 'IC13'],
      maxWeightKg: 25,
      maxSumCm: 180,
      tempSupported: true,
      minCubes: 8,
      // SoT: 20 Pallet × 128 = 2560 (거의 찼음 - 필터링 테스트용)
      capacityCubes: 2560,
      remainingCubes: 500,
      unitPricePerCube: 170,
      maxKgPerCube: 30,
      payloadCapacityKg: 76800,
      remainingPayloadKg: 14250,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s005',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S4',
      regionCode: '5013025900',       // 서귀포시 성산읍
      locationName: '성산',
      locationRegion: '성산',
      storageType: '상온',
      capacityText: '파렛트 10개',
      features: ['F_PARKING'],
      // 규정: 소규모, 소/중형 모듈만
      maxWeightKg: 15,
      maxSumCm: 150,
      tempSupported: false,
      allowedModuleClasses: ['소형', '중형'],
      minCubes: 0,
      // SoT: 10 Pallet × 128 = 1280
      capacityCubes: 1280,
      remainingCubes: 1280,
      unitPricePerCube: 45,
      maxKgPerCube: 15,
      payloadCapacityKg: 19200,
      remainingPayloadKg: 19200,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s006',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S2',
      regionCode: '5011025300',       // 제주시 애월읍
      locationName: '애월',
      locationRegion: '애월',
      storageType: '냉장',
      capacityText: '파렛트 12개',
      features: ['F_AGRI_SPECIALIZED', 'F_TEMP_MONITORING'],
      // 규정: 농산물 냉장
      allowedItemCodes: ['IC10', 'IC11', 'IC14'],
      maxWeightKg: 20,
      maxSumCm: 170,
      tempSupported: true,
      minCubes: 0,
      // SoT: 12 Pallet × 128 = 1536
      capacityCubes: 1536,
      remainingCubes: 800,
      unitPricePerCube: 105,
      maxKgPerCube: 20,
      payloadCapacityKg: 30720,
      remainingPayloadKg: 15200,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s007',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S1',
      regionCode: '5011025000',       // 제주시 한림읍
      locationName: '한림',
      locationRegion: '한림',
      storageType: '상온',
      capacityText: '파렛트 22개',
      features: ['F_PARKING', 'F_FORKLIFT'],
      // 규정: 일반 창고
      maxWeightKg: 20,
      maxSumCm: 170,
      tempSupported: false,
      minCubes: 0,
      // SoT: 22 Pallet × 128 = 2816
      capacityCubes: 2816,
      remainingCubes: 2816,
      unitPricePerCube: 52,
      maxKgPerCube: 16,
      payloadCapacityKg: 45056,
      remainingPayloadKg: 45056,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
  {
    id: 'offer_s008',
    signature: 'INFO_OFFER',
    fields: {
      offerType: 'STORAGE',
      providerId: 'PROVIDER_S2',
      regionCode: '5011025900',       // 제주시 조천읍
      locationName: '조천',
      locationRegion: '조천',
      storageType: '냉장',
      capacityText: '파렛트 18개',
      features: ['F_TEMP_MONITORING'],
      // 규정: 냉장, 중형 물량 요구
      maxWeightKg: 20,
      maxSumCm: 170,
      tempSupported: true,
      minCubes: 4,
      // SoT: 18 Pallet × 128 = 2304 (큐브는 충분, 하중 타이트 - 테스트용)
      capacityCubes: 2304,
      remainingCubes: 1800,
      unitPricePerCube: 110,
      maxKgPerCube: 22,
      payloadCapacityKg: 50688,
      remainingPayloadKg: 19800,
    },
    createdAt: SEED_DATE,
    version: 1,
  },
]
