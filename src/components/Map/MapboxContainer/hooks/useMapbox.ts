// Mapbox 지도 인스턴스 관리 훅
import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import {
  addArrowImages,
  addMiniMapArrowImages,
  addPalletMarkers,
  addCurvedRoutes,
  addMiniMapRoutes
} from './useMapLayers'

// Mapbox Access Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

// 지도 설정
const MAP_CONFIG = {
  style: 'mapbox://styles/integralv0/cml9csjxt002l01sz7enl8s0n',
  center: [126.5312, 33.4996] as [number, number],
  zoom: 9,
  minZoom: 7,
  maxZoom: 15,
  maxBounds: [
    [124.5, 32.5],
    [129.5, 35.5],
  ] as [[number, number], [number, number]],
}

const MINIMAP_CONFIG = {
  style: 'mapbox://styles/integralv0/cml9csjxt002l01sz7enl8s0n',
  center: [127.0, 36.0] as [number, number],
  zoom: 4,
  interactive: false,
  attributionControl: false,
}

/**
 * 카메라 패딩 적용 (좌측 45% 블러 영역 보정)
 * padding 기반으로 우측 55% 영역 중심에 지도 포커스
 */
function applyCameraPadding(map: mapboxgl.Map): void {
  const container = map.getContainer()
  const width = container.clientWidth
  const leftPadding = width * 0.45

  map.setPadding({
    left: leftPadding,
    top: 0,
    right: 0,
    bottom: 0,
  })

  // padding 적용 후 중심 재설정
  map.easeTo({
    center: MAP_CONFIG.center,
    duration: 0,
  })
}

export interface UseMapboxResult {
  mapContainer: React.RefObject<HTMLDivElement>
  miniMapContainer: React.RefObject<HTMLDivElement>
  hasToken: boolean
}

export function useMapbox(): UseMapboxResult {
  const mapContainer = useRef<HTMLDivElement>(null!)
  const miniMapContainer = useRef<HTMLDivElement>(null!)
  const map = useRef<mapboxgl.Map | null>(null)
  const miniMap = useRef<mapboxgl.Map | null>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  // 리사이즈 핸들러 (메모이제이션)
  const handleResize = useCallback(() => {
    if (map.current) {
      map.current.resize()
      applyCameraPadding(map.current)
    }
    if (miniMap.current) {
      miniMap.current.resize()
    }
  }, [])

  useEffect(() => {
    if (map.current || !mapContainer.current) return
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox Access Token이 설정되지 않았습니다.')
      console.warn('환경 변수 VITE_MAPBOX_ACCESS_TOKEN을 설정하세요.')
      return
    }

    // 메인 지도 초기화
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      ...MAP_CONFIG,
    })

    map.current.on('load', () => {
      if (!map.current) return

      // load 시 resize 호출 후 padding 적용
      map.current.resize()
      applyCameraPadding(map.current)

      addPalletMarkers(map.current)
      addArrowImages(map.current)

      setTimeout(() => {
        if (map.current) addCurvedRoutes(map.current)
      }, 100)
    })

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    // 미니맵 초기화
    if (miniMapContainer.current) {
      miniMap.current = new mapboxgl.Map({
        container: miniMapContainer.current,
        ...MINIMAP_CONFIG,
      })

      miniMap.current.on('load', () => {
        if (!miniMap.current) return

        miniMap.current.resize()
        addMiniMapArrowImages(miniMap.current)

        setTimeout(() => {
          if (miniMap.current) addMiniMapRoutes(miniMap.current)
        }, 100)
      })
    }

    // ResizeObserver로 컨테이너 크기 변경 감지
    resizeObserver.current = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.current.observe(mapContainer.current)

    // window resize 이벤트 핸들러
    window.addEventListener('resize', handleResize)

    return () => {
      // cleanup: observer disconnect, event listener 제거
      resizeObserver.current?.disconnect()
      window.removeEventListener('resize', handleResize)
      map.current?.remove()
      miniMap.current?.remove()
    }
  }, [handleResize])

  return {
    mapContainer,
    miniMapContainer,
    hasToken: Boolean(MAPBOX_TOKEN),
  }
}
