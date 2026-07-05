/**
 * 차량 DB 10종 (CUBE_MVP_SPEC.md §2 — 검증 완료, 그대로 사용)
 *
 * - volume_cube / weight_cube = 큐브좌표계 §4.1·§4.2 문서 확정값
 * - line_cube / area_cube + 중간차종(1.4/2.5/3.5/11t) = 시드값
 *   (실제 적재함 내부규격 기반, 데모용 — 추후 실측 등록. 차량 선/면큐브는 floor 규약 반영값)
 * - sort_order 오름차순 = matchVehicle() 순회 순서 (최소 차종 우선)
 */

import type { Vehicle } from './cubeCoordinate'

export const VEHICLE_DB: Vehicle[] = [
  { id: '1t',    name: '1t',    line_cube: 14, area_cube: 112, volume_cube: 400,  weight_cube: 300,  sort_order: 0 },
  { id: '1.4t',  name: '1.4t',  line_cube: 15, area_cube: 131, volume_cube: 480,  weight_cube: 400,  sort_order: 1 },
  { id: '2.5t',  name: '2.5t',  line_cube: 21, area_cube: 198, volume_cube: 900,  weight_cube: 700,  sort_order: 2 },
  { id: '3.5t',  name: '3.5t',  line_cube: 23, area_cube: 230, volume_cube: 1200, weight_cube: 900,  sort_order: 3 },
  { id: '5t',    name: '5t',    line_cube: 31, area_cube: 356, volume_cube: 2500, weight_cube: 1600, sort_order: 4 },
  { id: '5t축',  name: '5t축',  line_cube: 36, area_cube: 419, volume_cube: 3000, weight_cube: 2400, sort_order: 5 },
  { id: '11t',   name: '11t',   line_cube: 45, area_cube: 528, volume_cube: 3800, weight_cube: 2200, sort_order: 6 },
  { id: '25t',   name: '25t',   line_cube: 50, area_cube: 587, volume_cube: 4500, weight_cube: 5400, sort_order: 7 },
  { id: '추레라', name: '추레라', line_cube: 60, area_cube: 705, volume_cube: 5000, weight_cube: 5400, sort_order: 8 },
  { id: '로베드', name: '로베드', line_cube: 60, area_cube: 900, volume_cube: 4500, weight_cube: 5400, sort_order: 9 },
]
