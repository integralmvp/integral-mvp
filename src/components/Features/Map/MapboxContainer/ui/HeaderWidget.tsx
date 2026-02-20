// 헤더 위젯 컴포넌트 (모니터링 문구 + 시각 + 범례)
import { useState, useEffect } from 'react'

export default function HeaderWidget() {
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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-300 shadow-lg px-4 py-3">
      <div className="flex items-center gap-6">
        {/* 좌측: 모니터링 문구 + 시각 */}
        <div className="flex items-center gap-3">
          <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
            서비스 현황 실시간 모니터링
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-mono text-sm font-medium">
            {formattedTime}
          </span>
        </div>

        {/* 우측: 범례 아이콘들 */}
        <div className="ml-auto flex items-center gap-3">
          {/* 공간 */}
          <LegendItem
            icon={<rect x="1" y="1" width="14" height="10" rx="2" fill="#ff6b35"/>}
            viewBox="0 0 16 12"
            label="공간"
          />

          {/* 도내 */}
          <LegendItem
            icon={<path d="M 2,5 L 18,5" fill="none" stroke="#3b82f6" strokeWidth="2"/>}
            viewBox="0 0 20 10"
            label="도내경로"
            width={16}
            height={6}
          />

          {/* 입도 */}
          <LegendItem
            icon={<path d="M 2,5 L 18,5" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3,2"/>}
            viewBox="0 0 20 10"
            label="입도경로"
            width={16}
            height={6}
          />

          {/* 출도 */}
          <LegendItem
            icon={<path d="M 2,5 L 18,5" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3,2"/>}
            viewBox="0 0 20 10"
            label="출도경로"
            width={16}
            height={6}
          />
        </div>
      </div>
    </div>
  )
}

// 범례 아이템 컴포넌트
interface LegendItemProps {
  icon: React.ReactNode
  viewBox: string
  label: string
  width?: number
  height?: number
}

function LegendItem({ icon, viewBox, label, width = 12, height = 9 }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1">
      <svg width={width} height={height} viewBox={viewBox}>
        {icon}
      </svg>
      <span className="text-slate-900 text-sm font-semibold whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}
