/**
 * PLATFORM_FEATURE_CODES v0.1
 * 플랫폼 표준 Feature 코드셋
 *
 * - StorageProduct.features 필드에 사용
 * - 표준화된 코드 기반 (UI에서 label로 렌더링)
 * - Route 쪽 feature는 MVP에서 우선 제외 (필요시 TODO)
 */

// Feature 코드 타입
export type FeatureCode =
  | 'F_24H_INOUT'        // 24시간 입출고
  | 'F_FORKLIFT'         // 지게차 보유
  | 'F_CCTV'             // CCTV
  | 'F_TEMP_MONITORING'  // 온도 모니터링
  | 'F_FAST_FREEZE'      // 급속 냉동
  | 'F_PARKING'          // 주차 공간
  | 'F_FOOD_SPECIALIZED' // 식품 특화
  | 'F_AGRI_SPECIALIZED' // 농산물 특화

// Feature 정의
export const FEATURE_DEFINITIONS: Record<FeatureCode, { label: string; category: 'storage' | 'route' | 'common' }> = {
  F_24H_INOUT: { label: '24시간 입출고', category: 'storage' },
  F_FORKLIFT: { label: '지게차 보유', category: 'storage' },
  F_CCTV: { label: 'CCTV', category: 'storage' },
  F_TEMP_MONITORING: { label: '온도 모니터링', category: 'storage' },
  F_FAST_FREEZE: { label: '급속 냉동', category: 'storage' },
  F_PARKING: { label: '주차 공간', category: 'storage' },
  F_FOOD_SPECIALIZED: { label: '식품 특화', category: 'storage' },
  F_AGRI_SPECIALIZED: { label: '농산물 특화', category: 'storage' },
}

/**
 * Feature 코드에서 라벨 조회
 */
export function getFeatureLabel(code: FeatureCode): string {
  return FEATURE_DEFINITIONS[code].label
}

/**
 * Feature 코드 유효성 검사
 */
export function isValidFeatureCode(code: string): code is FeatureCode {
  return code in FEATURE_DEFINITIONS
}

/**
 * 모든 Storage Feature 코드 목록 조회
 */
export function getStorageFeatureCodes(): FeatureCode[] {
  return (Object.keys(FEATURE_DEFINITIONS) as FeatureCode[]).filter(
    code => FEATURE_DEFINITIONS[code].category === 'storage'
  )
}
