// 지도 위 메시지 오버레이 컴포넌트
export default function MessageOverlay() {
  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg px-8 py-6 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          제주 물류, 한눈에 연결하세요
        </h1>
        <p className="text-lg text-gray-600">
          경로와 보관 공간을 지도에서 직접 찾아 거래하세요
        </p>
      </div>
    </div>
  )
}
