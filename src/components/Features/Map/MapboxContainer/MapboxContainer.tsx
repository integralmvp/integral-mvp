// Mapbox 지도 컨테이너 - 조립 컴포넌트 (리팩토링 후)
import { useMapbox } from './hooks/useMapbox'

export default function MapboxContainer() {
  const { mapContainer, miniMapContainer, hasToken } = useMapbox()

  // Mapbox Token이 없으면 안내 메시지 표시
  if (!hasToken) {
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
        .minimap-container .mapboxgl-ctrl-attrib,
        .minimap-container .mapboxgl-ctrl-logo {
          display: none;
        }
      `}</style>

      {/* 메인 지도 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* 우측 상단 미니맵 (헤더 위젯 아래) */}
      <div className="absolute top-[88px] right-4 z-10">
        <div
          className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-300 shadow-lg overflow-hidden"
          style={{ width: '200px', height: '170px' }}
        >
          <div ref={miniMapContainer} className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}
