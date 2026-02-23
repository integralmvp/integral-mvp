// ============================================
// INTEGRAL MVP - mockData Facade
// ============================================
// 역할: repo/builder 결과를 기존 export 이름으로 재노출 (하위 호환)
//
// ⚠️ 이 파일은 하드코딩 상품 객체를 보유하지 않는다.
// ⚠️ 데이터 소스: data/mock/records/ (InfoOfferRecord[], InfoProviderRecord[])
// ⚠️ 변환 로직: data/mock/builders/ (buildSeedOffers, buildSeedProviders)
// ⚠️ 저장/조회: infra/storage/info/offer.repo.ts, provider.repo.ts
//
// STORAGE_PRODUCTS / ROUTE_PRODUCTS: repo in-memory 캐시 참조
//   → updateOfferResource 이후에도 최신 remainingCubes 반영
//   → 새로고침 후 localStorage 로드 → remaining 유지 (G6)
//
// ⚠️ PRODUCT_CATEGORIES / WEIGHT_RANGES / JEJU_LOCATIONS:
//   표시용 어댑터 전용. 필터링/거래/저장 로직에 사용 금지.

import type { UserInfo } from '../../types/models'

// UI 옵션 어댑터 (표시용 전용, 필터링·거래·저장 로직 사용 금지)
export { PRODUCT_CATEGORIES, WEIGHT_RANGES, JEJU_LOCATIONS } from './adapters'

// ── repo 경유 offer / provider ────────────────────────────────────
// 동일 in-memory 캐시 참조 → update 후에도 최신값 반영됨
import { getAllStorageOffers, getAllRouteOffers } from '../../infra/storage/info/offer.repo'
import { getAllProviders } from '../../infra/storage/info/provider.repo'

export const STORAGE_PRODUCTS = getAllStorageOffers()
export const ROUTE_PRODUCTS = getAllRouteOffers()
export const PROVIDERS = getAllProviders()

// ── 데모 사용자 (정적) ───────────────────────────────────────────────
export const DEMO_USER: UserInfo = {
  id: 'demo-user',
  name: '김제주',
  email: 'demo@integral.com',
  phone: '010-1234-5678',
}
