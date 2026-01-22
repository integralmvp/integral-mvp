// Mapbox 지도 컨테이너 (이중 맵: 메인 + 미니맵)
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../data/mockData'

// Mapbox Access Token (환경 변수에서 가져옴)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN
}

export default function MapboxContainer() {
  // 메인 지도 refs
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  // 미니맵 refs
  const miniMapContainer = useRef<HTMLDivElement>(null)
  const miniMap = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Mapbox Access Token이 없으면 경고 표시
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox Access Token이 설정되지 않았습니다.')
      console.warn('환경 변수 VITE_MAPBOX_ACCESS_TOKEN을 설정하세요.')
      return
    }

    // === 메인 지도 초기화 ===
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // 라이트 스타일
      center: [126.5312, 33.4996], // 제주도 중심
      zoom: 9,
      minZoom: 7,
      maxZoom: 15,
      maxBounds: [
        [124.5, 32.5], // 남서쪽
        [129.5, 35.5], // 북동쪽
      ],
    })

    // 메인 지도 로드 완료 후
    map.current.on('load', () => {
      if (!map.current) return

      // 좌측 45% 블러 영역만큼 오른쪽으로 offset
      const container = map.current.getContainer()
      const width = container.clientWidth
      const offsetX = (width * 0.45) / 2

      map.current.easeTo({
        center: [126.5312, 33.4996], // 제주도 중심 그대로
        offset: [offsetX, 0], // x만 오른쪽으로 이동
        duration: 0, // 애니메이션 없음
      })

      // 파렛트 마커 추가
      addPalletMarkers()

      // 화살표 이미지 등록
      addArrowImages()

      // 곡선 경로 추가 (화살표 이미지 로드 후)
      setTimeout(() => {
        addCurvedRoutes()
      }, 100)
    })

    // 네비게이션 컨트롤
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    )

    // === 미니맵 초기화 ===
    if (miniMapContainer.current) {
      miniMap.current = new mapboxgl.Map({
        container: miniMapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [127.0, 36.0], // 한반도 중심 (더 북쪽으로)
        zoom: 5, // 더 줌아웃 (육지+제주 전부 보이게)
        interactive: false, // 상호작용 비활성화
        attributionControl: false, // 어트리뷰션 제거
      })

      // 미니맵 로드 완료 후
      miniMap.current.on('load', () => {
        if (!miniMap.current) return

        // 컨테이너 크기 재계산
        miniMap.current.resize()

        // 미니맵에 화살표 이미지 등록
        addMiniMapArrowImages()

        // 미니맵에 입도/출도 경로 추가
        setTimeout(() => {
          addMiniMapRoutes()
        }, 100)
      })
    }

    return () => {
      map.current?.remove()
      miniMap.current?.remove()
    }
  }, [])


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
      let size = 10
      if (capacity > 30) size = 14
      else if (capacity > 15) size = 12

      // 아이소메트릭 파렛트 아이콘 생성
      const el = document.createElement('div')
      el.className = 'pallet-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.cursor = 'pointer'
      el.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          transition: transform 0.2s ease;
          transform-origin: center center;
        " class="pallet-marker-inner">
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

      // 마커/팝업을 변수로 만들고, 클릭 대신 호버에서 열고 닫기
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([storage.location.lng, storage.location.lat])
        .addTo(map.current!)
      
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,     // 호버용: 닫기 버튼 제거(선택)
        closeOnClick: false,    // 호버용: 지도 클릭 시 자동 닫힘 방지(선택)
        className: 'storage-hover-popup',
      })
        .setHTML(`
          <div class="p-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-lg">
            <h3 class="font-bold text-sm">${storage.location.name}</h3>
            <p class="text-xs text-slate-600 mt-1">${storage.storageType} | ${storage.capacity}</p>
            <p class="text-sm font-bold text-orange-600 mt-2">₩${storage.price.toLocaleString()}/${storage.priceUnit}</p>
          </div>
        `)

      // 호버 시 팝업 열기/닫기
      el.addEventListener('mouseenter', () => {
        // 호버 시에도 팝업이 정확히 마커 위치를 따라가도록(선택)
        popup.setLngLat(marker.getLngLat()).addTo(map.current!)
      })

      el.addEventListener('mouseleave', () => {
        popup.remove()
      })
    })
  }

  // 방향(bearing) 계산 함수
  const calculateBearing = (start: number[], end: number[]): number => {
    const angle = Math.atan2(
      end[1] - start[1],
      end[0] - start[0]
    ) * (180 / Math.PI)
    return angle
  }

  // 각도 정규화
  const normalizeAngle = (deg: number): number => {
    const a = deg % 360
    return a < 0 ? a + 360 : a
  }


  // 화살표 이미지 등록
  const addArrowImages = () => {
    if (!map.current) return

    // 파란 화살표 (도내)
    const blueArrow = new Image(24, 24)
    blueArrow.onload = () => map.current!.addImage('arrow-cyan', blueArrow)
    blueArrow.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="#3b82f6" stroke="#1e40af" stroke-width="0.5"/>
      </svg>
    `)}`

    // 녹색 화살표 (입도)
    const greenArrow = new Image(24, 24)
    greenArrow.onload = () => map.current!.addImage('arrow-green', greenArrow)
    greenArrow.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="#10b981" stroke="#047857" stroke-width="0.5"/>
      </svg>
    `)}`

    // 보라 화살표 (출도)
    const purpleArrow = new Image(24, 24)
    purpleArrow.onload = () => map.current!.addImage('arrow-magenta', purpleArrow)
    purpleArrow.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="#a855f7" stroke="#7c3aed" stroke-width="0.5"/>
      </svg>
    `)}`
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
      const color = '#3b82f6' // 파란색

      // 메인 라인
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
          'line-opacity': 0.8,
        },
      })

      // 화살표 추가 (Symbol Layer)
      const lastPoint = curvePoints[curvePoints.length - 1]
      const secondLastPoint = curvePoints[curvePoints.length - 2]

      // Mapbox symbol layer용 회전각 계산
      const calculateIconRotate = (start: number[], end: number[]): number => {
        const angle = calculateBearing(start, end) // 0=동, 90=북
        // Mapbox: 0=북, 90=동 로 맞추기
        return normalizeAngle(- angle)
      }

      // 방향 계산
      const bearing = calculateIconRotate(secondLastPoint, lastPoint)

      // 화살표 레이어 (도착지에 심볼 배치)
      map.current!.addSource(`${routeId}-arrow`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            bearing: bearing
          },
          geometry: {
            type: 'Point',
            coordinates: lastPoint
          }
        }
      })

      map.current!.addLayer({
        id: `${routeId}-arrow-layer`,
        type: 'symbol',
        source: `${routeId}-arrow`,
        layout: {
          'icon-image': 'arrow-cyan',
          'icon-size': 0.8,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      })
    })
  }

  // 미니맵용 화살표 이미지 등록
  const addMiniMapArrowImages = () => {
    if (!miniMap.current) return

    // 녹색 화살표 (입도)
    const greenArrow = new Image(16, 16)
    greenArrow.onload = () => miniMap.current!.addImage('mini-arrow-green', greenArrow)
    greenArrow.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="#10b981" stroke="#047857" stroke-width="0.5"/>
      </svg>
    `)}`

    // 보라 화살표 (출도)
    const purpleArrow = new Image(16, 16)
    purpleArrow.onload = () => miniMap.current!.addImage('mini-arrow-purple', purpleArrow)
    purpleArrow.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,4 L20,12 L0,20 L6,12 Z" fill="#a855f7" stroke="#7c3aed" stroke-width="0.5"/>
      </svg>
    `)}`
  }

  // 미니맵에 입도/출도 경로 추가 (화살표 포함)
  const addMiniMapRoutes = () => {
    if (!miniMap.current) return

    // 입도/출도 경로 필터링 (SEA 경로 중 direction으로 구분)
    const inboundRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'SEA' && r.direction === 'INBOUND')
    const outboundRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'SEA' && r.direction === 'OUTBOUND')

    // 입도 경로 추가 (녹색)
    inboundRoutes.forEach((route, idx) => {
      const start = [route.origin.lng, route.origin.lat]
      const end = [route.destination.lng, route.destination.lat]

      // 점선 라인
      miniMap.current!.addLayer({
        id: `minimap-inbound-line-${idx}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [start, end] },
          },
        },
        paint: {
          'line-color': '#10b981', // 녹색
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      })

      // 화살표 (도착지)
      const bearing = calculateBearing(start, end)
      miniMap.current!.addSource(`minimap-inbound-arrow-${idx}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { bearing: -bearing },
          geometry: { type: 'Point', coordinates: end }
        }
      })

      miniMap.current!.addLayer({
        id: `minimap-inbound-arrow-${idx}`,
        type: 'symbol',
        source: `minimap-inbound-arrow-${idx}`,
        layout: {
          'icon-image': 'mini-arrow-green',
          'icon-size': 0.6,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      })
    })

    // 출도 경로 추가 (보라색)
    outboundRoutes.forEach((route, idx) => {
      const start = [route.origin.lng, route.origin.lat]
      const end = [route.destination.lng, route.destination.lat]

      // 점선 라인
      miniMap.current!.addLayer({
        id: `minimap-outbound-line-${idx}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: [start, end] },
          },
        },
        paint: {
          'line-color': '#a855f7', // 보라색
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      })

      // 화살표 (도착지)
      const bearing = calculateBearing(start, end)
      miniMap.current!.addSource(`minimap-outbound-arrow-${idx}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { bearing: -bearing },
          geometry: { type: 'Point', coordinates: end }
        }
      })

      miniMap.current!.addLayer({
        id: `minimap-outbound-arrow-${idx}`,
        type: 'symbol',
        source: `minimap-outbound-arrow-${idx}`,
        layout: {
          'icon-image': 'mini-arrow-purple',
          'icon-size': 0.6,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
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
      {/* Mapbox Popup z-index */}
      <style>{`
        .storage-hover-popup.mapboxgl-popup {
          z-index: 60;
        }
        /* 미니맵 컨트롤 숨기기 */
        .minimap-container .mapboxgl-ctrl-attrib,
        .minimap-container .mapboxgl-ctrl-logo {
          display: none;
        }
      `}</style>

      {/* 메인 지도 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 우측 상단 위젯 영역 */}
      <div className="absolute top-4 right-4 left-[46%] z-10 flex flex-col gap-3">
        {/* 헤더 위젯 */}
        <HeaderWidget />

        {/* 미니맵 */}
        <div className="flex justify-end">
          <div
            className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-300 shadow-lg overflow-hidden"
            style={{ width: '200px', height: '150px' }}
          >
          
            <div ref={miniMapContainer} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 헤더 위젯 컴포넌트 (모니터링 문구 + 시각 + 범례)
function HeaderWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formattedTime = currentTime.toLocaleTimeString('ko-KR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-300 shadow-lg px-4 py-3">
      <div className="flex items-center gap-6">
        {/* 좌측: 모니터링 문구 + 시각 */}
        <div className="flex items-center gap-3">
          <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
            서비스 현황 실시간 모니터링
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-mono text-sm font-medium">
            {formattedTime}
          </span>
        </div>

        {/* 우측: 범례 아이콘들 */}
        <div className="ml-auto flex items-center gap-3">
          {/* 공간 */}
          <div className="flex items-center gap-1">
            <svg width="12" height="9" viewBox="0 0 16 12">
              <rect x="1" y="1" width="14" height="10" rx="2" fill="#ff6b35"/>
            </svg>
            <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
              공간
            </span>
          </div>

          {/* 도내 */}
          <div className="flex items-center gap-1">
            <svg width="16" height="6" viewBox="0 0 20 10">
              <path d="M 2,5 L 18,5" fill="none" stroke="#3b82f6" strokeWidth="2"/>
            </svg>
            <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
              도내경로
            </span>
          </div>

          {/* 입도 */}
          <div className="flex items-center gap-1">
            <svg width="16" height="6" viewBox="0 0 20 10">
              <path d="M 2,5 L 18,5" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3,2"/>
            </svg>
            <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
              입도경로
            </span>
          </div>

          {/* 출도 */}
          <div className="flex items-center gap-1">
            <svg width="16" height="6" viewBox="0 0 20 10">
              <path d="M 2,5 L 18,5" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,2"/>
            </svg>
            <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
              출도경로
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
