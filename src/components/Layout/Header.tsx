// 심플 헤더 - 로고 / LIVE
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
    <header className="bg-white px-6 py-4 flex items-center justify-between">
      {/* 로고 */}
      <div
        className="cursor-pointer hover:opacity-70 transition-opacity"
        onClick={() => window.location.reload()}
      >
        <span className="text-slate-900 text-2xl font-black tracking-tight">
          INTEGRAL
        </span>
      </div>

      {/* LIVE 표시 */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
          style={{
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)'
          }}
        ></span>
        <span className="text-slate-900 font-mono text-lg font-semibold">
          LIVE
        </span>
        <span className="text-slate-600 font-mono text-sm">
          {formattedTime}
        </span>
      </div>
    </header>
  )
}
