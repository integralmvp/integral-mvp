// 하단 지도 가이드 문구
export default function MapGuide() {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[rgba(0,100,255,0.2)] text-center z-20 pointer-events-none">
      <h1
        className="text-l font-bold text-white tracking-wide"
        style={{
          textShadow: `
            0 0 20px rgba(255, 255, 255, 0.6),
            0 0 40px rgba(255, 255, 255, 0.4),
            0 0 60px rgba(255, 255, 255, 0.2)
          `
        }}
      >
        구매 가능한 물류 공간과 유통 경로가 실시간으로 업데이트됩니다.
      </h1>
      <p
        className="text-m text-white/80 mt-2"
        style={{
          textShadow: `
            0 0 15px rgba(255, 255, 255, 0.4),
            0 0 30px rgba(255, 255, 255, 0.2)
          `
        }}
      >
        지도 상에서 마우스를 움직여보세요.
      </p>
    </div>
  )
}
