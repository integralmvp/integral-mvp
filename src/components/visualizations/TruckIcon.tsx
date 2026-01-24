// 트럭 아이콘 (1톤 기준)
interface TruckIconProps {
  count?: number
  size?: number
}

export default function TruckIcon({ count, size = 80 }: TruckIconProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 100 70"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
      >
        {/* 화물칸 */}
        <rect x="10" y="20" width="50" height="30" fill="#60a5fa" stroke="#2563eb" strokeWidth="2"/>
        <line x1="10" y1="20" x2="60" y2="20" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
        <line x1="30" y1="20" x2="30" y2="50" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>
        <line x1="45" y1="20" x2="45" y2="50" stroke="#2563eb" strokeWidth="1" opacity="0.5"/>

        {/* 운전석 */}
        <path d="M 60,25 L 60,50 L 80,50 L 80,35 Z" fill="#93c5fd" stroke="#2563eb" strokeWidth="2"/>
        <rect x="62" y="30" width="12" height="10" fill="#dbeafe" stroke="#2563eb" strokeWidth="1"/>

        {/* 바퀴 */}
        <circle cx="25" cy="50" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
        <circle cx="25" cy="50" r="4" fill="#475569" stroke="#0f172a" strokeWidth="1"/>
        <circle cx="65" cy="50" r="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2"/>
        <circle cx="65" cy="50" r="4" fill="#475569" stroke="#0f172a" strokeWidth="1"/>

        {/* 바닥 */}
        <line x1="10" y1="50" x2="15" y2="50" stroke="#1e293b" strokeWidth="2"/>
        <line x1="35" y1="50" x2="55" y2="50" stroke="#1e293b" strokeWidth="2"/>
        <line x1="75" y1="50" x2="80" y2="50" stroke="#1e293b" strokeWidth="2"/>
      </svg>

      {count !== undefined && (
        <div className="text-xs font-bold text-slate-700">
          약 {count}대
        </div>
      )}
    </div>
  )
}
