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
