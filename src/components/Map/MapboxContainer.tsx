// Mapbox 지도 컨테이너
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../data/mockData'
import MainlandMinimap from './MainlandMinimap'

// Mapbox Access Token (환경 변수에서 가져옴)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function MapboxContainer() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Mapbox Access Token이 없으면 경고 표시
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox Access Token이 설정되지 않았습니다.')
      console.warn('환경 변수 VITE_MAPBOX_ACCESS_TOKEN을 설정하세요.')
      return
    }

    // 지도 초기화
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // 밝은 스타일
      center: [126.5312, 33.4996], // 제주도 중심
      zoom: 9,
      minZoom: 7,
      maxZoom: 15,
      maxBounds: [
        [124.5, 32.5], // 남서쪽
        [128.5, 35.5], // 북동쪽
      ],
    })

    // 지도 로드 완료 후
    map.current.on('load', () => {
      if (!map.current) return

      setMapLoaded(true)

      // 파렛트 마커 추가
      addPalletMarkers()

      // 곡선 경로 추가
      addCurvedRoutes()
    })

    // 네비게이션 컨트롤
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    return () => {
      map.current?.remove()
    }
  }, [])

  // 파렛트 마커 추가
  const addPalletMarkers = () => {
    if (!map.current) return

    STORAGE_PRODUCTS.forEach((storage) => {
      const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')

      // 크기 결정
      let size = 24
      if (capacity > 30) size = 40
      else if (capacity > 15) size = 32

      // 색상 결정
      let color = '#f97316' // 기본: 주황색

      // 파렛트 아이콘 생성
      const el = document.createElement('div')
      el.className = 'pallet-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.cursor = 'pointer'
      el.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 32 24">
          <!-- 그림자 -->
          <rect x="2" y="4" width="28" height="18" rx="3" fill="rgba(0,0,0,0.2)" />
          <!-- 파렛트 본체 -->
          <rect x="0" y="2" width="28" height="18" rx="3" fill="${color}" stroke="#ea580c" stroke-width="1" />
          <!-- 파렛트 라인 -->
          <line x1="7" y1="5" x2="7" y2="17" stroke="#fed7aa" stroke-width="2" />
          <line x1="14" y1="5" x2="14" y2="17" stroke="#fed7aa" stroke-width="2" />
          <line x1="21" y1="5" x2="21" y2="17" stroke="#fed7aa" stroke-width="2" />
        </svg>
      `

      // 마커 추가
      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([storage.location.lng, storage.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${storage.location.name}</h3>
              <p class="text-sm">${storage.storageType} | ${storage.capacity}</p>
              <p class="text-sm font-bold">₩${storage.price.toLocaleString()}/${storage.priceUnit}</p>
            </div>
          `)
        )
        .addTo(map.current!)
    })
  }

  // 곡선 경로 추가
  const addCurvedRoutes = () => {
    if (!map.current) return

    const intraRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'INTRA_JEJU')

    intraRoutes.forEach((route) => {
      const start = [route.origin.lng, route.origin.lat]
      const end = [route.destination.lng, route.destination.lat]

      // 중간 제어점 (위로 볼록)
      const midLng = (start[0] + end[0]) / 2
      const midLat = (start[1] + end[1]) / 2 + 0.08

      // 베지어 곡선 포인트 생성
      const curvePoints = []
      for (let i = 0; i <= 50; i++) {
        const t = i / 50
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

      const routeId = `route-${route.id}`

      // 그림자 레이어
      map.current!.addLayer({
        id: `${routeId}-shadow`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: curvePoints },
          },
        },
        paint: {
          'line-color': '#1e40af',
          'line-width': 8,
          'line-opacity': 0.2,
          'line-blur': 3,
        },
      })

      // 메인 레이어
      map.current!.addLayer({
        id: `${routeId}-main`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: curvePoints },
          },
        },
        paint: {
          'line-color': '#2563eb',
          'line-width': 4,
          'line-opacity': 0.9,
        },
      })

      // 하이라이트 레이어
      map.current!.addLayer({
        id: `${routeId}-highlight`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: curvePoints },
          },
        },
        paint: {
          'line-color': '#60a5fa',
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      })
    })
  }

  // Mapbox Token이 없으면 안내 메시지 표시
  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold mb-2">Mapbox Access Token 필요</h3>
          <p className="text-sm text-slate-400">
            환경 변수 VITE_MAPBOX_ACCESS_TOKEN을 설정하세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* 범례 바 */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 flex items-center justify-center gap-8">
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <span className="w-4 h-3 bg-orange-500 rounded-sm"></span>
            공간상품
          </span>
          <span className="flex items-center gap-2 text-sm text-slate-300">
            <svg width="24" height="12" viewBox="0 0 24 12">
              <path
                d="M 2,8 Q 12,2 22,8"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
              />
              <polygon points="20,6 24,8 20,10" fill="#2563eb" />
            </svg>
            도내경로
          </span>
        </div>
      </div>

      {/* 지도 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 육지 미니맵 */}
      {mapLoaded && <MainlandMinimap />}
    </div>
  )
}
