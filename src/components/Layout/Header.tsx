// 투명 헤더 - 로고 / LIVE만 선 구분
import { useEffect, useState } from 'react'

export default function Header() {
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
    <>
      {/* 로고 영역 - 좌상단 */}
      <div className="absolute top-4 left-6 z-30">
        <div
          className="border-t border-b border-white/50 py-2 px-1 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => window.location.reload()}
        >
          <span className="text-white text-2xl font-black tracking-tight">
            INTEGRAL
          </span>
        </div>
      </div>

      {/* LIVE 영역 - 우상단 */}
      <div className="absolute top-4 right-6 z-30">
        <div className="border-t border-b border-white/50 py-2 px-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
              style={{
                boxShadow: '0 0 10px #00ff88'
              }}
            ></span>
            <span className="text-white font-mono text-lg">
              LIVE {formattedTime}
            </span>
          </div>
          <div className="text-white/60 text-sm">실시간 관제 중</div>
        </div>
      </div>
    </>
  )
}
