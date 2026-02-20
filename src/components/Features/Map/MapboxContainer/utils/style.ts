// 지도 스타일 유틸리티

// SVG 화살표 데이터 URL 생성
export function createArrowSvgUrl(color: string, strokeColor: string, size: number = 24): string {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="${color}" stroke="${strokeColor}" stroke-width="0.5"/>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 화살표 색상 설정
export const ARROW_COLORS = {
  cyan: { fill: '#3b82f6', stroke: '#1e40af' },
  green: { fill: '#10b981', stroke: '#047857' },
  magenta: { fill: '#a855f7', stroke: '#7c3aed' },
} as const

// 경로 색상 설정
export const ROUTE_COLORS = {
  intra: '#3b82f6',    // 도내 (파란색)
  inbound: '#10b981',  // 입도 (녹색)
  outbound: '#a855f7', // 출도 (보라색)
} as const

// 파렛트 마커 크기 결정
export function getPalletMarkerSize(capacity: number): number {
  if (capacity > 30) return 14
  if (capacity > 15) return 12
  return 10
}

// 파렛트 마커 SVG 생성
export function createPalletSvg(size: number): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 32 28" style="filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.8));">
      <!-- 아이소메트릭 3D 파렛트 (주황) -->
      <!-- 상판 -->
      <path d="M 16,2 L 30,10 L 16,18 L 2,10 Z" fill="#ff6b35" stroke="#ff8c5a" stroke-width="0.5"/>
      <!-- 좌측면 -->
      <path d="M 2,10 L 2,18 L 16,26 L 16,18 Z" fill="#cc5429" stroke="#ff6b35" stroke-width="0.5"/>
      <!-- 우측면 -->
      <path d="M 30,10 L 30,18 L 16,26 L 16,18 Z" fill="#e65c2e" stroke="#ff6b35" stroke-width="0.5"/>
      <!-- 하단 다리 -->
      <path d="M 5,17 L 5,21 L 8,23 L 8,19 Z" fill="#993d1f"/>
      <path d="M 14,22 L 14,26 L 18,26 L 18,22 Z" fill="#993d1f"/>
      <path d="M 24,19 L 24,23 L 27,21 L 27,17 Z" fill="#993d1f"/>
    </svg>
  `
}

// PR4: 구매 가능 상품 하이라이트 마커 (물방울 + O 표시)
export function createAvailableMarkerSvg(): string {
  return `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <!-- 물방울 모양 (180도 회전 - 뾰족한 부분이 아래로) -->
      <g transform="rotate(180, 16, 21)">
        <path d="M16 0C16 0 0 14 0 24C0 32.8366 7.16344 40 16 40C24.8366 40 32 32.8366 32 24C32 14 16 0 16 0Z"
              fill="#1e40af" stroke="#3b82f6" stroke-width="2"/>
        <!-- O 표시 (연두색) -->
        <circle cx="16" cy="22" r="8" fill="none" stroke="#22c55e" stroke-width="3"/>
      </g>
    </svg>
  `
}

// PR4: 하이라이트 마커 HTML 생성
export function createHighlightMarkerHtml(): string {
  return `
    <div class="highlight-marker" style="
      width: 32px;
      height: 42px;
      cursor: pointer;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      animation: bounce 0.5s ease-out;
    ">
      ${createAvailableMarkerSvg()}
    </div>
  `
}
