// 전체 지도 배경 + 좌측 블러 오버레이 레이아웃
// PR4: 검색 결과 하이라이트 연동 - 물방울 마커로 가능 상품 강조
import { useEffect, useRef } from 'react'
import ServiceConsole from './ServiceConsole'
import MapboxContainer from '../Map/MapboxContainer'
import { useSearchResult } from '../../contexts/SearchResultContext'
import { createAvailableMarkerSvg } from '../Map/MapboxContainer/utils/style'

// 하이라이트 마커 생성
function createHighlightMarker(productId: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'highlight-marker'
  el.dataset.highlightId = productId
  el.style.cssText = `
    position: absolute;
    width: 32px;
    height: 42px;
    margin-left: -16px;
    margin-top: -42px;
    cursor: pointer;
    z-index: 100;
    pointer-events: none;
    animation: markerBounce 0.4s ease-out;
  `
  el.innerHTML = createAvailableMarkerSvg()
  return el
}

export default function CommandLayout() {
  const { highlightedIds, searchResult } = useSearchResult()
  const highlightMarkersRef = useRef<HTMLDivElement[]>([])

  // PR4: 검색 결과에 따라 물방울 마커로 가능 상품 강조
  useEffect(() => {
    // 기존 하이라이트 마커 제거
    highlightMarkersRef.current.forEach(marker => marker.remove())
    highlightMarkersRef.current = []

    // 검색 결과가 없으면 아무것도 하지 않음 (모든 상품 기본 표시)
    if (!searchResult) return

    // 하이라이트된 상품에 물방울 마커 추가
    const palletMarkers = document.querySelectorAll('.pallet-marker')

    palletMarkers.forEach((marker) => {
      const el = marker as HTMLElement
      const productId = el.dataset.productId

      if (productId && highlightedIds.has(productId)) {
        // 구매 가능 상품: 물방울 마커 추가
        const highlightMarker = createHighlightMarker(productId)
        el.style.position = 'relative'
        el.appendChild(highlightMarker)
        highlightMarkersRef.current.push(highlightMarker)
      }
    })
  }, [highlightedIds, searchResult])

  // CSS 애니메이션 스타일 추가
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes markerBounce {
        0% { transform: translateY(-20px); opacity: 0; }
        60% { transform: translateY(5px); opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
    `
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  return (
    <div className="h-screen relative overflow-hidden">
      {/* 배경: 전체 지도 */}
      <div className="absolute inset-0 z-0">
        <MapboxContainer />
      </div>

      {/* 좌측 45%: 블러 오버레이 */}
      <div className="absolute inset-y-0 left-0 w-[45%] z-10 flex flex-col"
        style={{
          backdropFilter: 'blur(5px)',
          background: 'rgba(255,255,255,0.6)'
        }}
      >
        {/* 상단: 로고 영역 */}
        <div className="p-6">
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity inline-block"
            onClick={() => window.location.reload()}
          >
            <span className="text-blue-900 text-3xl font-black tracking-tight drop-shadow-lg">
              INTEGRAL
            </span>
          </div>
          {/* 네비게이션 - 추후 추가 */}
        </div>

        {/* 하단: 서비스 콘솔 */}
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <ServiceConsole />
        </div>
      </div>
    </div>
  )
}
