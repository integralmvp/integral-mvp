// 보유 상품 현황 (막대 그래프)
interface Stats {
  total: number
  used: number
}

interface ProductStatsProps {
  spaceStats: Stats
  routeStats: Stats
}

export default function ProductStats({
  spaceStats,
  routeStats
}: ProductStatsProps) {
  const spacePercentage = Math.round((spaceStats.used / spaceStats.total) * 100)
  const routePercentage = Math.round((routeStats.used / routeStats.total) * 100)

  return (
    <div className="absolute left-6 bottom-8 z-20 w-64">
      {/* 타이틀 */}
      <h2 className="text-white text-sm font-semibold tracking-wide">
        보유 상품 현황
      </h2>

      {/* 구분선 */}
      <div className="w-full h-px bg-white/50 mt-2 mb-3"></div>

      {/* 컨텐츠 */}
      <div className="bg-[rgba(64,73,91,0.2)] backdrop-blur-sm rounded-lg p-4 space-y-4">
        {/* 공간 상품 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/70">공간 상품</span>
            <span className="text-white font-mono">
              Total {spaceStats.total} 파렛트
            </span>
          </div>
          {/* 사용중 라벨 */}
          <div className="text-xs text-white/60 mb-1 ml-1">
            사용중
          </div>
          {/* 막대 그래프 */}
          <div className="h-6 bg-orange-500/20 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
              style={{
                width: `${spacePercentage}%`,
                boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
              }}
            ></div>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-mono">
              {spaceStats.used}P ({spacePercentage}%)
            </span>
          </div>
        </div>

        {/* 경로 상품 */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/70">경로 상품</span>
            <span className="text-white font-mono">
              Total {routeStats.total} 건
            </span>
          </div>
          {/* 사용중 라벨 */}
          <div className="text-xs text-white/60 mb-1 ml-1">
            사용중 (70%↑)
          </div>
          {/* 막대 그래프 */}
          <div className="h-6 bg-cyan-500/20 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
              style={{
                width: `${routePercentage}%`,
                boxShadow: '0 0 10px rgba(0, 191, 255, 0.5)'
              }}
            ></div>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white font-mono">
              {routeStats.used}건 ({routePercentage}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
