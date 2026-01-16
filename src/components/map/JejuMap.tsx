// 제주 메인 지도 (개선 버전)
import { useEffect, useRef } from 'react'
import { ROUTE_PRODUCTS, STORAGE_PRODUCTS } from '../../data/mockData'

export default function JejuMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = mapRef.current
          const options = {
            center: new window.kakao.maps.LatLng(33.3617, 126.5292),
            level: 10,
          }

          const map = new window.kakao.maps.Map(container, options)
          mapInstanceRef.current = map

          // 공간 상품 마커 (파렛트 아이콘)
          drawStorageMarkers(map)

          // 경로 상품 (곡선 화살표는 SVG 오버레이로 구현)
          drawRouteArrows(map)
        })
      }
    }

    if (window.kakao && window.kakao.maps) {
      initMap()
    } else {
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao)
          initMap()
        }
      }, 100)

      return () => clearInterval(checkKakao)
    }
  }, [])

  // 공간 상품 마커 (파렛트 아이콘)
  const drawStorageMarkers = (map: any) => {
    STORAGE_PRODUCTS.forEach((storage) => {
      const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')

      // 크기 결정
      let size = 24
      if (capacity > 30) size = 40
      else if (capacity > 15) size = 32

      // 색상 결정
      let color = '#6B7280' // 상온: 회색
      if (storage.storageType === '냉장') color = '#3B82F6' // 파란색
      if (storage.storageType === '냉동') color = '#1E40AF' // 남색

      // 파렛트 아이콘 SVG
      const iconContent = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
            <!-- 파렛트 모양 -->
            <rect x="2" y="14" width="20" height="2" rx="0.5" />
            <rect x="2" y="18" width="20" height="2" rx="0.5" />
            <rect x="4" y="8" width="3" height="6" />
            <rect x="10.5" y="8" width="3" height="6" />
            <rect x="17" y="8" width="3" height="6" />
            <rect x="3" y="6" width="18" height="2" rx="0.5" />
          </svg>
          <div style="
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            color: ${color};
          ">${storage.location.region}</div>
        </div>
      `

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          storage.location.lat,
          storage.location.lng
        ),
        content: iconContent,
        yAnchor: 1,
      })

      customOverlay.setMap(map)
    })
  }

  // 경로 화살표 (Polyline - 곡선은 SVG 오버레이로)
  const drawRouteArrows = (map: any) => {
    const intraRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'INTRA_JEJU')

    intraRoutes.forEach((route) => {
      // 중간 지점 계산
      const midLat = (route.origin.lat + route.destination.lat) / 2
      const midLng = (route.origin.lng + route.destination.lng) / 2

      // 곡선을 표현하기 위한 제어점 (위로 볼록)
      const controlLat = midLat + 0.05
      const controlLng = midLng

      // 3점을 이용한 곡선 경로
      const path = [
        new window.kakao.maps.LatLng(route.origin.lat, route.origin.lng),
        new window.kakao.maps.LatLng(controlLat, controlLng),
        new window.kakao.maps.LatLng(
          route.destination.lat,
          route.destination.lng
        ),
      ]

      const polyline = new window.kakao.maps.Polyline({
        path: path,
        strokeWeight: 4,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
      })

      polyline.setMap(map)

      // 화살표 표시
      const arrowContent = `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">→</div>
      `

      const arrowOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(controlLat, controlLng),
        content: arrowContent,
        yAnchor: 0.5,
      })

      arrowOverlay.setMap(map)
    })
  }

  return <div ref={mapRef} className="w-full h-full" />
}
