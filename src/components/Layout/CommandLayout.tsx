// Grid 기반 레이아웃 - 좌측(45%) 서비스 콘솔 + 우측(55%) 지도
// PR4: 검색 결과 하이라이트 연동 - 물방울 마커로 가능 상품 강조
// PR6: 프리뷰 결과 기반 하이라이트 (실시간 동기화)

import { useEffect, useRef } from 'react'
import ServiceConsole from './ServiceConsole'
import MapboxContainer from '../Map/MapboxContainer'
import HeaderWidget from '../Map/MapboxContainer/ui/HeaderWidget'
import { useSearchResult } from '../../contexts/SearchResultContext'
import { createAvailableMarkerSvg } from '../Map/MapboxContainer/utils/style'
import logoSvg from '../../assets/icons/console/logo.svg'

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
  // PR6: 프리뷰 결과 기반 하이라이트 (실시간 동기화)
  const { highlightedIds, previewResult } = useSearchResult()
  const highlightMarkersRef = useRef<HTMLDivElement[]>([])

  // PR6: 프리뷰 결과에 따라 물방울 마커로 가능 상품 강조
  useEffect(() => {
    // 기존 하이라이트 마커 제거
    highlightMarkersRef.current.forEach(marker => marker.remove())
    highlightMarkersRef.current = []

    // 프리뷰 결과가 없으면 아무것도 하지 않음 (모든 상품 기본 표시)
    if (!previewResult) return

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
  }, [highlightedIds, previewResult])

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
    <div className="h-screen grid grid-cols-[45%_55%] overflow-hidden">
      {/* 배경 지도: 전체 화면 (grid의 모든 칸 차지) */}
      <div className="col-span-2 row-start-1 col-start-1">
        <MapboxContainer />
      </div>

      {/* 좌측 45%: 블러 배경 + 서비스 콘솔 */}
      <div className="row-start-1 col-start-1 flex flex-col z-10"
        style={{
          backdropFilter: 'blur(5px)',
          background: 'rgba(255,255,255,0.6)'
        }}
      >
        {/* 상단: 로고 영역 */}
        <div className="p-6">
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity inline-flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <img src={logoSvg} alt="CUBE Logo" className="h-8 w-auto" />
            <span className="text-teal-700 text-3xl font-black tracking-tight drop-shadow-lg">
              CUBE
            </span>
          </div>
          {/* 네비게이션 - 추후 추가 */}
        </div>

        {/* 하단: 서비스 콘솔 */}
        <div className="flex-1 p-6 pt-0 overflow-hidden">
          <ServiceConsole />
        </div>
      </div>

      {/* 우측 55%: 헤더 위젯 영역 */}
      <div className="row-start-1 col-start-2 z-10 pointer-events-none relative">
        {/* 헤더 위젯 (우측 상단) */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <HeaderWidget />
        </div>
      </div>
    </div>
  )
}
