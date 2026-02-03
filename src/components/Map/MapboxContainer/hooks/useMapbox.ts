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
  style: 'mapbox://styles/integralv0/cmkppsvoe003e01stgyts0nxy',
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
  style: 'mapbox://styles/integralv0/cmkppsvoe003e01stgyts0nxy',
  center: [127.0, 36.0] as [number, number],
  zoom: 4,
  interactive: false,
  attributionControl: false,
}

/**
 * 패딩 기반 카메라 보정 (좌측 45% 오버레이 영역 고려)
 * easeTo offset 대신 setPadding 사용으로 안정적인 뷰포트 계산
 */
function applyMapPadding(map: mapboxgl.Map): void {
  const container = map.getContainer()
  const width = container.clientWidth
  const leftPadding = width * 0.45  // 좌측 45% 패널 영역

  map.setPadding({
    left: leftPadding,
    top: 64,  // 상단 헤더 높이
    right: 0,
    bottom: 0,
  })
}

/**
 * 사이버펑크 테마: 바다 색상을 검정색 계열로 변경
 */
function applyCyberpunkWaterStyle(map: mapboxgl.Map): void {
  // water 레이어의 색상을 어두운 남색/검정으로 변경
  if (map.getLayer('water')) {
    map.setPaintProperty('water', 'fill-color', '#0a0a12')
  }

  // water-depth (깊은 바다) 레이어가 있다면 변경
  if (map.getLayer('water-depth')) {
    map.setPaintProperty('water-depth', 'fill-color', '#050508')
  }

  // waterway 레이어가 있다면 변경
  if (map.getLayer('waterway')) {
    map.setPaintProperty('waterway', 'line-color', '#0a0a12')
  }
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
      applyMapPadding(map.current)
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

      // load 시 resize 호출 후 offset 적용
      map.current.resize()
      applyMapPadding(map.current)

      // 사이버펑크 테마: 바다 색상 변경
      applyCyberpunkWaterStyle(map.current)

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

        // 사이버펑크 테마: 미니맵 바다 색상 변경
        applyCyberpunkWaterStyle(miniMap.current)

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
