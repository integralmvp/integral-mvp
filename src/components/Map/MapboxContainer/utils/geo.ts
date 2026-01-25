// 지리 좌표 유틸리티

// 방향(bearing) 계산 함수
export function calculateBearing(start: number[], end: number[]): number {
  const angle = Math.atan2(
    end[1] - start[1],
    end[0] - start[0]
  ) * (180 / Math.PI)
  return angle
}

// 각도 정규화
export function normalizeAngle(deg: number): number {
  const a = deg % 360
  return a < 0 ? a + 360 : a
}

// Mapbox symbol layer용 회전각 계산
export function calculateIconRotate(start: number[], end: number[]): number {
  const angle = calculateBearing(start, end)
  return normalizeAngle(-angle)
}

// 베지어 곡선 포인트 생성
export function generateBezierCurve(
  start: number[],
  end: number[],
  controlOffset: number = 0.08,
  segments: number = 50
): number[][] {
  const midLng = (start[0] + end[0]) / 2
  const midLat = (start[1] + end[1]) / 2 + controlOffset

  const curvePoints: number[][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const lng =
      Math.pow(1 - t, 2) * start[0] +
      2 * (1 - t) * t * midLng +
      Math.pow(t, 2) * end[0]
    const lat =
      Math.pow(1 - t, 2) * start[1] +
      2 * (1 - t) * t * midLat +
      Math.pow(t, 2) * end[1]
    curvePoints.push([lng, lat])
  }

  return curvePoints
}
