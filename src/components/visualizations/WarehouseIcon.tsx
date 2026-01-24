// 창고 아이콘 (10평 기준)
interface WarehouseIconProps {
  count?: number
  size?: number
  showLabel?: boolean
}

export default function WarehouseIcon({ count, size = 80, showLabel = true }: WarehouseIconProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* 라벨 */}
      {showLabel && (
        <div className="text-xs font-semibold text-slate-700">
          10평 창고
        </div>
      )}

      {/* 아이콘 */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
      >
        {/* 건물 본체 */}
        <rect x="15" y="40" width="70" height="50" fill="#94a3b8" stroke="#475569" strokeWidth="2"/>

        {/* 지붕 */}
        <path d="M 10,40 L 50,15 L 90,40 Z" fill="#64748b" stroke="#475569" strokeWidth="2"/>

        {/* 창문들 */}
        <rect x="25" y="50" width="12" height="12" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
        <rect x="44" y="50" width="12" height="12" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
        <rect x="63" y="50" width="12" height="12" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>

        {/* 큰 문 */}
        <rect x="35" y="70" width="30" height="20" fill="#475569" stroke="#334155" strokeWidth="1.5"/>
        <line x1="50" y1="70" x2="50" y2="90" stroke="#334155" strokeWidth="1.5"/>
        <circle cx="45" cy="80" r="1.5" fill="#cbd5e1"/>
        <circle cx="55" cy="80" r="1.5" fill="#cbd5e1"/>

        {/* 지붕 디테일 */}
        <line x1="50" y1="15" x2="50" y2="40" stroke="#475569" strokeWidth="1" opacity="0.3"/>
      </svg>

      {/* 카운트 */}
      {count !== undefined && (
        <div className="text-sm font-bold text-slate-800">
          약 {count}채
        </div>
      )}
    </div>
  )
}
