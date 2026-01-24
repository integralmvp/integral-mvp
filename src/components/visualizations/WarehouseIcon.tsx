// 창고 아이콘 (면적 표시 - 운영계수 보정 적용)
import { palletsToAreaM2, palletsToAreaPyeong } from '../../engine'

interface WarehouseIconProps {
  pallets?: number          // 파레트 수 (신규: 면적 환산에 사용)
  count?: number            // 레거시: 채 수 (더 이상 사용하지 않음)
  size?: number
  showLabel?: boolean
}

export default function WarehouseIcon({ pallets, size = 80, showLabel = true }: WarehouseIconProps) {
  // 파레트 → 면적 환산 (운영계수 적용)
  const areaM2 = pallets ? palletsToAreaM2(pallets) : 0
  const areaPyeong = pallets ? palletsToAreaPyeong(pallets) : 0

  return (
    <div className="flex flex-col items-center gap-2">
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

      {/* 면적 표시 (파레트가 있는 경우) */}
      {showLabel && pallets !== undefined && pallets > 0 && (
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800">
            약 {areaM2}㎡ ({areaPyeong}평)
          </div>
          <div className="text-[10px] text-slate-500">
            운영 동선 고려(×1.30)
          </div>
        </div>
      )}
    </div>
  )
}
