// Mapbox 지도 컨테이너
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../data/mockData'
import MainlandMinimap from '../Widgets/MainlandMinimap'
import Legend from '../Widgets/Legend'

// Mapbox Access Token (환경 변수에서 가져옴)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function MapboxContainer() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const minimapRef = useRef<HTMLDivElement>(null)
  const legendRef = useRef<HTMLDivElement>(null)

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
      style: 'mapbox://styles/mapbox/dark-v11', // 다크 스타일
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

      // 파렛트 마커 추가
      addPalletMarkers()

      // 곡선 경로 추가
      addCurvedRoutes()

      // 미니맵/범례 위치 업데이트
      updateOverlayPositions()
    })

    // 지도 이동/줌 시 미니맵/범례 위치 업데이트
    map.current.on('move', updateOverlayPositions)
    map.current.on('zoom', updateOverlayPositions)

    // 네비게이션 컨트롤
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    return () => {
      map.current?.remove()
    }
  }, [])

  // 미니맵/범례 위치 업데이트 (제주도 좌표 기준)
  const updateOverlayPositions = () => {
    if (!map.current) return

    // 제주도 북서쪽 좌표 (미니맵 기준점)
    const jejuNorthWest: [number, number] = [126.15, 33.55]
    // 제주도 중앙 상단 좌표 (범례 기준점)
    const jejuNorthCenter: [number, number] = [126.55, 33.55]

    // 좌표를 화면 픽셀로 변환
    const minimapPos = map.current.project(jejuNorthWest)
    const legendPos = map.current.project(jejuNorthCenter)

    // 미니맵 위치 설정
    if (minimapRef.current) {
      minimapRef.current.style.left = `${minimapPos.x + 10}px`
      minimapRef.current.style.top = `${minimapPos.y + 10}px`
    }

    // 범례 위치 설정
    if (legendRef.current) {
      legendRef.current.style.left = `${legendPos.x}px`
      legendRef.current.style.top = `${legendPos.y + 10}px`
      legendRef.current.style.transform = 'translateX(-50%)'
    }
  }

  // 아이소메트릭 파렛트 마커 추가
  const addPalletMarkers = () => {
    if (!map.current) return

    console.log('[MapboxContainer] Adding pallet markers...')

    STORAGE_PRODUCTS.forEach((storage) => {
      console.log(`[Marker] ${storage.location.name}:`, {
        lng: storage.location.lng,
        lat: storage.location.lat,
        isValid: storage.location.lng >= 126.1 && storage.location.lng <= 126.95 &&
                 storage.location.lat >= 33.1 && storage.location.lat <= 33.6
      })

      const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')

      // 크기 결정
      let size = 32
      if (capacity > 30) size = 48
      else if (capacity > 15) size = 40

      // 아이소메트릭 파렛트 아이콘 생성
      const el = document.createElement('div')
      el.className = 'pallet-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.cursor = 'pointer'
      el.style.position = 'relative'
      el.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          transition: transform 0.2s ease;
          transform-origin: center center;
        " class="pallet-marker-inner">
          <svg width="${size}" height="${size}" viewBox="0 0 32 28" style="filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.8));">
            <!-- 아이소메트릭 3D 파렛트 (녹색) -->
            <!-- 상판 -->
            <path d="M 16,2 L 30,10 L 16,18 L 2,10 Z" fill="#00ff88" stroke="#00ffaa" stroke-width="0.5"/>
            <!-- 좌측면 -->
            <path d="M 2,10 L 2,18 L 16,26 L 16,18 Z" fill="#00cc66" stroke="#00ff88" stroke-width="0.5"/>
            <!-- 우측면 -->
            <path d="M 30,10 L 30,18 L 16,26 L 16,18 Z" fill="#00dd77" stroke="#00ff88" stroke-width="0.5"/>
            <!-- 하단 다리 -->
            <path d="M 5,17 L 5,21 L 8,23 L 8,19 Z" fill="#009955"/>
            <path d="M 14,22 L 14,26 L 18,26 L 18,22 Z" fill="#009955"/>
            <path d="M 24,19 L 24,23 L 27,21 L 27,17 Z" fill="#009955"/>
          </svg>
        </div>
      `

      // 호버 효과 (내부 div에만 적용)
      const innerDiv = el.querySelector('.pallet-marker-inner') as HTMLElement
      el.addEventListener('mouseenter', () => {
        if (innerDiv) innerDiv.style.transform = 'scale(1.2)'
      })
      el.addEventListener('mouseleave', () => {
        if (innerDiv) innerDiv.style.transform = 'scale(1)'
      })

      // 마커 추가
      new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([storage.location.lng, storage.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2 bg-slate-900 text-white rounded">
              <h3 class="font-bold">${storage.location.name}</h3>
              <p class="text-sm">${storage.storageType} | ${storage.capacity}</p>
              <p class="text-sm font-bold text-orange-400">₩${storage.price.toLocaleString()}/${storage.priceUnit}</p>
            </div>
          `)
        )
        .addTo(map.current!)
    })
  }

  // 야광 곡선 경로 추가 (4레이어 글로우)
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
      const color = '#00bfff' // 네온 시안

      // 레이어 1: 글로우 (바깥쪽)
      map.current!.addLayer({
        id: `${routeId}-glow-outer`,
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
          'line-color': color,
          'line-width': 12,
          'line-opacity': 0.2,
          'line-blur': 8,
        },
      })

      // 레이어 2: 글로우 (안쪽)
      map.current!.addLayer({
        id: `${routeId}-glow-inner`,
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
          'line-color': color,
          'line-width': 6,
          'line-opacity': 0.4,
          'line-blur': 4,
        },
      })

      // 레이어 3: 메인 라인
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
          'line-color': color,
          'line-width': 3,
          'line-opacity': 1,
        },
      })

      // 레이어 4: 하이라이트 (밝은 중심선)
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
          'line-color': '#ffffff',
          'line-width': 1,
          'line-opacity': 0.6,
        },
      })

      // 화살표 추가 (도착지)
      const lastPoint = curvePoints[curvePoints.length - 1]
      const secondLastPoint = curvePoints[curvePoints.length - 2]

      // 각도 계산
      const angle = Math.atan2(
        lastPoint[1] - secondLastPoint[1],
        lastPoint[0] - secondLastPoint[0]
      ) * (180 / Math.PI)

      // 화살표 마커 생성 (더 크고 명확하게)
      const arrowEl = document.createElement('div')
      arrowEl.style.width = '24px'
      arrowEl.style.height = '24px'
      arrowEl.style.pointerEvents = 'none'
      arrowEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(${angle}deg);">
          <defs>
            <filter id="arrow-glow-${route.id}">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M 4,10 L 16,12 L 4,14 Z" fill="${color}" stroke="#ffffff" stroke-width="0.5" filter="url(#arrow-glow-${route.id})"/>
        </svg>
      `

      new mapboxgl.Marker({ element: arrowEl, anchor: 'center' })
        .setLngLat(lastPoint as [number, number])
        .addTo(map.current!)
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
      {/* 지도 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 미니맵 - 제주도 좌표 기준 동적 배치 */}
      <div
        ref={minimapRef}
        className="absolute z-10 pointer-events-auto"
        style={{ position: 'absolute' }}
      >
        <MainlandMinimap inboundRoutes={2} outboundRoutes={2} />
      </div>

      {/* 범례 - 제주도 좌표 기준 동적 배치 */}
      <div
        ref={legendRef}
        className="absolute z-10"
        style={{ position: 'absolute' }}
      >
        <Legend />
      </div>
    </div>
  )
}
