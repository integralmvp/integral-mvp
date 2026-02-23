/**
 * 지역 대표 좌표 매핑
 *
 * PR7-pre: 지도 마커/경로 좌표의 단일 진실 소스
 *
 * 키 체계:
 * - 법정동 코드 (10자리): 제주도 내 지역 (예: '5013025900' = 성산읍)
 * - 특수 코드: 항만 등 (예: 'JEJU_PORT', 'BUSAN_PORT')
 *
 * 좌표 정밀도: 소수점 6자리
 */

export interface Coordinates {
  lat: number
  lng: number
}

/**
 * 지역 대표 좌표
 *
 * 주의: 이 파일의 좌표값은 검증된 값만 사용한다.
 * 임의 추가/변경 금지.
 */
export const REGION_REPRESENTATIVE_COORDS: Record<string, Coordinates> = {
  // ============ 제주도 법정동 코드 기반 ============

  // 도 단위 (최상위 선택 시 지도 중심점 용도 — 필터는 conditionFilters에서 처리)
  '5000000000': { lat: 33.364805, lng: 126.542671 },  // 제주특별자치도 중심점

  // 시 단위
  '5011000000': { lat: 33.499621, lng: 126.531188 },  // 제주시
  '5013000000': { lat: 33.254120, lng: 126.560076 },  // 서귀포시

  // 제주시 읍면
  '5011025000': { lat: 33.412500, lng: 126.265200 },  // 한림읍
  '5011025300': { lat: 33.463100, lng: 126.306200 },  // 애월읍
  '5011025900': { lat: 33.538000, lng: 126.635000 },  // 조천읍
  '5011026300': { lat: 33.521800, lng: 126.854500 },  // 구좌읍

  // 서귀포시 읍면
  '5013025300': { lat: 33.277500, lng: 126.379000 },  // 대정읍
  '5013025600': { lat: 33.310500, lng: 126.368500 },  // 안덕면
  '5013025900': { lat: 33.435800, lng: 126.912700 },  // 성산읍
  '5013031000': { lat: 33.280000, lng: 126.710000 },  // 남원읍

  // ============ 항만 특수 코드 ============
  'JEJU_PORT': { lat: 33.519700, lng: 126.523400 },   // 제주항
  'BUSAN_PORT': { lat: 35.079600, lng: 128.961200 },  // 부산항
  'INCHEON_PORT': { lat: 37.456300, lng: 126.605200 }, // 인천항
  'MOKPO_PORT': { lat: 34.780600, lng: 126.378900 },  // 목포항
}

/**
 * 좌표 조회 헬퍼
 *
 * @param code - 법정동 코드 또는 특수 코드
 * @returns 좌표 또는 undefined
 */
export function getCoordsByCode(code: string): Coordinates | undefined {
  return REGION_REPRESENTATIVE_COORDS[code]
}

/**
 * 좌표 조회 (기본값 포함)
 *
 * @param code - 법정동 코드 또는 특수 코드
 * @param fallback - 찾지 못했을 때 기본값
 * @returns 좌표
 */
export function getCoordsByCodeOrDefault(
  code: string,
  fallback: Coordinates = { lat: 33.499621, lng: 126.531188 }  // 제주시 기본
): Coordinates {
  return REGION_REPRESENTATIVE_COORDS[code] ?? fallback
}
