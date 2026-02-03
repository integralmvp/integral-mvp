// Mapbox 지도 컨테이너 - 조립 컴포넌트 (리팩토링 후)
import { useMapbox } from './hooks/useMapbox'

export default function MapboxContainer() {
  const { mapContainer, miniMapContainer, hasToken } = useMapbox()

  // Mapbox Token이 없으면 안내 메시지 표시
  if (!hasToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-cyber-dark text-cyber-text">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold mb-2">Mapbox Access Token 필요</h3>
          <p className="text-sm text-cyber-text-dim">
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
        .minimap-container .mapboxgl-ctrl-attrib,
        .minimap-container .mapboxgl-ctrl-logo {
          display: none;
        }
      `}</style>

      {/* 메인 지도 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 우측 상단: 미니맵 (헤더 높이 아래에 위치) */}
      <div className="absolute top-20 right-4 z-10">
        <div
          className="overflow-hidden minimap-container"
          style={{
            width: '200px',
            height: '170px',
            background: 'rgba(10, 10, 15, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
          }}
        >
          <div ref={miniMapContainer} className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}
