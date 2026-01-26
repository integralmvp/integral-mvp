// 지도 레이어 관리 훅
import mapboxgl from 'mapbox-gl'
import { STORAGE_PRODUCTS, ROUTE_PRODUCTS } from '../../../../data/mockData'
import { calculateIconRotate, generateBezierCurve, calculateBearing } from '../utils/geo'
import { createArrowSvgUrl, ARROW_COLORS, getPalletMarkerSize, createPalletSvg, ROUTE_COLORS } from '../utils/style'

// 화살표 이미지 등록
export function addArrowImages(map: mapboxgl.Map): void {
  const blueArrow = new Image(24, 24)
  blueArrow.onload = () => map.addImage('arrow-cyan', blueArrow)
  blueArrow.src = createArrowSvgUrl(ARROW_COLORS.cyan.fill, ARROW_COLORS.cyan.stroke)

  const greenArrow = new Image(24, 24)
  greenArrow.onload = () => map.addImage('arrow-green', greenArrow)
  greenArrow.src = createArrowSvgUrl(ARROW_COLORS.green.fill, ARROW_COLORS.green.stroke)

  const purpleArrow = new Image(24, 24)
  purpleArrow.onload = () => map.addImage('arrow-magenta', purpleArrow)
  purpleArrow.src = createArrowSvgUrl(ARROW_COLORS.magenta.fill, ARROW_COLORS.magenta.stroke)
}

// 미니맵용 화살표 이미지 등록
export function addMiniMapArrowImages(miniMap: mapboxgl.Map): void {
  const greenArrow = new Image(16, 16)
  greenArrow.onload = () => miniMap.addImage('mini-arrow-green', greenArrow)
  greenArrow.src = createArrowSvgUrl(ARROW_COLORS.green.fill, ARROW_COLORS.green.stroke, 16)

  const purpleArrow = new Image(16, 16)
  purpleArrow.onload = () => miniMap.addImage('mini-arrow-purple', purpleArrow)
  purpleArrow.src = createArrowSvgUrl(ARROW_COLORS.magenta.fill, ARROW_COLORS.magenta.stroke, 16)
}

// 파렛트 마커 추가
export function addPalletMarkers(map: mapboxgl.Map): void {
  console.log('[MapboxContainer] Adding pallet markers...')

  STORAGE_PRODUCTS.forEach((storage) => {
    console.log(`[Marker] ${storage.location.name}:`, {
      lng: storage.location.lng,
      lat: storage.location.lat,
      isValid: storage.location.lng >= 126.1 && storage.location.lng <= 126.95 &&
               storage.location.lat >= 33.1 && storage.location.lat <= 33.6
    })

    const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')
    const size = getPalletMarkerSize(capacity)

    const el = document.createElement('div')
    el.className = 'pallet-marker'
    el.dataset.productId = storage.id  // PR4: 하이라이트용 ID
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
        ${createPalletSvg(size)}
      </div>
    `

    const innerDiv = el.querySelector('.pallet-marker-inner') as HTMLElement
    el.addEventListener('mouseenter', () => {
      if (innerDiv) innerDiv.style.transform = 'scale(1.2)'
    })
    el.addEventListener('mouseleave', () => {
      if (innerDiv) innerDiv.style.transform = 'scale(1)'
    })

    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([storage.location.lng, storage.location.lat])
      .addTo(map)

    const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false,
      className: 'storage-hover-popup',
    })
      .setHTML(`
        <div class="p-3 bg-white border border-slate-300 text-slate-900 rounded-lg shadow-lg">
          <h3 class="font-bold text-sm">${storage.location.name}</h3>
          <p class="text-xs text-slate-600 mt-1">${storage.storageType} | ${storage.capacity}</p>
          <p class="text-sm font-bold text-orange-600 mt-2">₩${storage.price.toLocaleString()}/${storage.priceUnit}</p>
        </div>
      `)

    el.addEventListener('mouseenter', () => {
      popup.setLngLat(marker.getLngLat()).addTo(map)
    })

    el.addEventListener('mouseleave', () => {
      popup.remove()
    })
  })
}

// 곡선 경로 추가
export function addCurvedRoutes(map: mapboxgl.Map): void {
  const intraRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'INTRA_JEJU')

  intraRoutes.forEach((route) => {
    const start = [route.origin.lng, route.origin.lat]
    const end = [route.destination.lng, route.destination.lat]
    const curvePoints = generateBezierCurve(start, end)

    const routeId = `route-${route.id}`

    // 메인 라인
    map.addLayer({
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
        'line-color': ROUTE_COLORS.intra,
        'line-width': 3,
        'line-opacity': 0.8,
      },
    })

    // 화살표 추가
    const lastPoint = curvePoints[curvePoints.length - 1]
    const secondLastPoint = curvePoints[curvePoints.length - 2]
    const bearing = calculateIconRotate(secondLastPoint, lastPoint)

    map.addSource(`${routeId}-arrow`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { bearing },
        geometry: { type: 'Point', coordinates: lastPoint }
      }
    })

    map.addLayer({
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

// 미니맵에 입도/출도 경로 추가
export function addMiniMapRoutes(miniMap: mapboxgl.Map): void {
  const inboundRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'SEA' && r.direction === 'INBOUND')
  const outboundRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'SEA' && r.direction === 'OUTBOUND')

  // 입도 경로 추가 (녹색)
  inboundRoutes.forEach((route, idx) => {
    const start = [route.origin.lng, route.origin.lat]
    const end = [route.destination.lng, route.destination.lat]

    miniMap.addLayer({
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
        'line-color': ROUTE_COLORS.inbound,
        'line-width': 2,
        'line-dasharray': [3, 2],
      },
    })

    const bearing = calculateBearing(start, end)
    miniMap.addSource(`minimap-inbound-arrow-${idx}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { bearing: -bearing },
        geometry: { type: 'Point', coordinates: end }
      }
    })

    miniMap.addLayer({
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

    miniMap.addLayer({
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
        'line-color': ROUTE_COLORS.outbound,
        'line-width': 2,
        'line-dasharray': [3, 2],
      },
    })

    const bearing = calculateBearing(start, end)
    miniMap.addSource(`minimap-outbound-arrow-${idx}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { bearing: -bearing },
        geometry: { type: 'Point', coordinates: end }
      }
    })

    miniMap.addLayer({
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
