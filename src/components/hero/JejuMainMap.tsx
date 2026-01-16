// 제주 메인 지도 컴포넌트
import { useEffect, useRef } from 'react'
import { ROUTE_PRODUCTS, STORAGE_PRODUCTS } from '../../data/mockData'

export default function JejuMainMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Kakao Maps SDK 로드 대기
    const initMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = mapRef.current
          const options = {
            center: new window.kakao.maps.LatLng(33.3617, 126.5292), // 제주도 중심
            level: 10, // 제주도 전체가 보이는 줌 레벨
          }

          const map = new window.kakao.maps.Map(container, options)
          mapInstanceRef.current = map

          // 도내 경로 그리기
          drawIntraJejuRoutes(map)

          // 공간 히트맵 그리기
          drawStorageHeatmap(map)
        })
      }
    }

    // SDK 로드 확인
    if (window.kakao && window.kakao.maps) {
      initMap()
    } else {
      // SDK가 로드될 때까지 대기
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao)
          initMap()
        }
      }, 100)

      return () => clearInterval(checkKakao)
    }
  }, [])

  // 도내 경로 그리기
  const drawIntraJejuRoutes = (map: any) => {
    const intraRoutes = ROUTE_PRODUCTS.filter((r) => r.routeScope === 'INTRA_JEJU')

    intraRoutes.forEach((route) => {
      const path = [
        new window.kakao.maps.LatLng(route.origin.lat, route.origin.lng),
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

      // 화살표 표시 (중간 지점에 마커)
      const midLat = (route.origin.lat + route.destination.lat) / 2
      const midLng = (route.origin.lng + route.destination.lng) / 2

      const arrowContent = `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">→</div>
      `

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(midLat, midLng),
        content: arrowContent,
        yAnchor: 0.5,
      })

      customOverlay.setMap(map)
    })
  }

  // 공간 히트맵 그리기
  const drawStorageHeatmap = (map: any) => {
    STORAGE_PRODUCTS.forEach((storage) => {
      // 각 공간 주변에 작은 원형 폴리곤 그리기
      const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')

      // 용량에 따라 색상 투명도 결정
      let opacity = 0.3
      if (capacity > 25) opacity = 0.7
      else if (capacity > 15) opacity = 0.5

      const radius = 0.02 // 반경
      const points = 20 // 원을 구성하는 점의 개수

      const path = []
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points
        const lat = storage.location.lat + radius * Math.cos(angle)
        const lng = storage.location.lng + radius * Math.sin(angle)
        path.push(new window.kakao.maps.LatLng(lat, lng))
      }

      const polygon = new window.kakao.maps.Polygon({
        path: path,
        strokeWeight: 2,
        strokeColor: '#22C55E',
        strokeOpacity: 0.6,
        fillColor: '#22C55E',
        fillOpacity: opacity,
      })

      polygon.setMap(map)

      // 공간 이름 표시
      const labelContent = `
        <div style="
          padding: 4px 8px;
          background-color: white;
          border: 1px solid #22C55E;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #166534;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          white-space: nowrap;
        ">${storage.location.region}</div>
      `

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          storage.location.lat,
          storage.location.lng
        ),
        content: labelContent,
        yAnchor: 2,
      })

      customOverlay.setMap(map)
    })
  }

  return <div ref={mapRef} className="w-full h-full" />
}
