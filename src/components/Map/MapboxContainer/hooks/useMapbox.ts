// Mapbox 지도 인스턴스 관리 훅
import { useEffect, useRef } from 'react'
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

      // 좌측 45% 블러 영역만큼 오른쪽으로 offset
      const container = map.current.getContainer()
      const width = container.clientWidth
      const offsetX = (width * 0.45) / 2

      map.current.easeTo({
        center: MAP_CONFIG.center,
        offset: [offsetX, 0],
        duration: 0,
      })

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

    return () => {
      map.current?.remove()
      miniMap.current?.remove()
    }
  }, [])

  return {
    mapContainer,
    miniMapContainer,
    hasToken: Boolean(MAPBOX_TOKEN),
  }
}
