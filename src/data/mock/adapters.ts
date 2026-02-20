/**
 * Mock Adapters - UI 표시용 옵션 상수
 *
 * ⚠️ 이 파일의 상수들은 "UI 표시용 어댑터"입니다.
 *    필터링/정렬/거래 로직에 사용 금지.
 *    codedata(infra/dataspec/codedata/*)가 단일 진실 소스(SoT)입니다.
 *
 * 관계 정리:
 * - PRODUCT_CATEGORIES → CargoUI.productCategory (레거시 UI 필드, deprecated)
 *   실제 코드: infra/dataspec/codedata/items/itemCodes.ts PLATFORM_ITEM_CODES
 * - WEIGHT_RANGES → CargoUI.weightRange (레거시 UI 필드, deprecated)
 *   실제 코드: infra/dataspec/codedata/bands/bands.ts WEIGHT_BAND_DEFINITIONS
 * - JEJU_LOCATIONS → LocationOption UI 드롭다운 (표시용 id/name/level 구조)
 *   실제 필터링: locationCode (RegionCode, 법정동 코드) 사용
 */

import type { ProductCategory, WeightRange, LocationOption } from '../../types/models'

// ============ 품목 카테고리 어댑터 (레거시 CargoUI 호환용) ============
// 실제 플랫폼 코드: PLATFORM_ITEM_CODES (infra/dataspec/codedata/items)
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

// ============ 중량 구간 어댑터 (레거시 CargoUI 호환용) ============
// 실제 플랫폼 코드: WEIGHT_BAND_DEFINITIONS (infra/dataspec/codedata/bands)
// 표시 형식: WeightRange → label 매핑 (UI 드롭다운용)
export const WEIGHT_RANGES: { value: WeightRange; label: string }[] = [
  { value: '0-5kg',   label: '5kg 이하' },
  { value: '5-10kg',  label: '5kg ~ 10kg' },
  { value: '10-20kg', label: '10kg ~ 20kg' },
  { value: '20-30kg', label: '20kg ~ 30kg' },
  { value: '30kg+',   label: '30kg 초과' },
]

// ============ 제주 지역 목록 어댑터 (UI 드롭다운용) ============
// 필터링 로직에서는 locationCode(RegionCode) 사용 → JEJU_LOCATIONS.id 사용 금지
// 표시용(name 표시)과 초기 선택용으로만 사용
export const JEJU_LOCATIONS: LocationOption[] = [
  // 도 전체
  { id: 'jeju-all',        name: '제주도 전체', level: 'island' },
  // 시 단위
  { id: 'jeju-city',       name: '제주시',   level: 'city', parentId: 'jeju-all' },
  { id: 'seogwipo-city',   name: '서귀포시', level: 'city', parentId: 'jeju-all' },
  // 읍면동 단위 (제주시)
  { id: 'ara-dong',        name: '아라동',   level: 'district', parentId: 'jeju-city' },
  { id: 'nohyeong-dong',   name: '노형동',   level: 'district', parentId: 'jeju-city' },
  { id: 'yeon-dong',       name: '연동',     level: 'district', parentId: 'jeju-city' },
  { id: 'ido-dong',        name: '이도동',   level: 'district', parentId: 'jeju-city' },
  { id: 'aewol-eup',       name: '애월읍',   level: 'district', parentId: 'jeju-city' },
  { id: 'hallim-eup',      name: '한림읍',   level: 'district', parentId: 'jeju-city' },
  { id: 'jocheon-eup',     name: '조천읍',   level: 'district', parentId: 'jeju-city' },
  { id: 'gujwa-eup',       name: '구좌읍',   level: 'district', parentId: 'jeju-city' },
  // 읍면동 단위 (서귀포시)
  { id: 'seogwipo-dong',   name: '서귀동',   level: 'district', parentId: 'seogwipo-city' },
  { id: 'seongsan-eup',    name: '성산읍',   level: 'district', parentId: 'seogwipo-city' },
  { id: 'namwon-eup',      name: '남원읍',   level: 'district', parentId: 'seogwipo-city' },
  { id: 'daejeong-eup',    name: '대정읍',   level: 'district', parentId: 'seogwipo-city' },
  { id: 'andeok-myeon',    name: '안덕면',   level: 'district', parentId: 'seogwipo-city' },
]
