// 관제 센터 스타일 헤더
import { useEffect, useState } from 'react'

export default function CommandHeader() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setCurrentTime(formatted)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-20 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
      <div className="h-full flex items-center justify-between px-6">
        {/* 좌측: 로고 */}
        <div className="flex items-center">
          <span className="logo">INTEGRAL</span>
        </div>

        {/* 중앙: 타이틀 */}
        <div className="text-center">
          <h1 className="main-title">내 손 안의 작은 물류 허브</h1>
          <p className="sub-title">일상 물류의 시작</p>
        </div>

        {/* 우측: LIVE 표시 */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow"></span>
          <div className="text-right">
            <div className="live-indicator">LIVE {currentTime}</div>
            <div className="text-xs text-slate-400">실시간 관제 중</div>
          </div>
        </div>
      </div>
    </header>
  )
}
