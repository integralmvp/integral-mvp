/**
 * 냉동 단가테이블 (CUBE_MVP_SPEC.md §3 — 거성 확정 표준값)
 *
 * 근거: 단가테이블로직_확정문서 §4.1 "거성 차량형 도내비 — 17/17 통과, 표준 [150K, 180K]"
 *
 * 【주의】이 값은 SPL 파이프라인의 도출 결과(냉동)이며 SoT 재계산 대상이 아니다.
 * MVP는 이 테이블을 정적으로 룩업만 한다 (SPL 재구동 없음).
 * 선사비/내륙비는 섬간 운송 확장분 → 데모 OUT.
 */

import type { RateTable } from './cubeCoordinate'

export const RATE_TABLE: RateTable = {
  차량형: {
    도내비: { 시내: 150000, 시외: 180000 },
  },
}
