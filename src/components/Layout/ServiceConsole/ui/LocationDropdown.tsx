// 장소 드롭다운 컴포넌트 - 범위 개념의 지역 선택
import { JEJU_LOCATIONS } from '../../../../data/mockData'

interface LocationDropdownProps {
  value?: string
  onChange: (locationId: string) => void
  placeholder?: string
  disabled?: boolean
  locked?: boolean  // 잠금 상태 (자동 지정 시)
  lockedValue?: string  // 잠금 시 표시할 값
}

export default function LocationDropdown({
  value,
  onChange,
  placeholder = '지역 선택',
  disabled = false,
  locked = false,
  lockedValue,
}: LocationDropdownProps) {
  // 지역 목록을 계층적으로 정렬
  const islandLevel = JEJU_LOCATIONS.filter(l => l.level === 'island')
  const cityLevel = JEJU_LOCATIONS.filter(l => l.level === 'city')
  const districtLevel = JEJU_LOCATIONS.filter(l => l.level === 'district')

  // 선택된 지역 정보
  const selectedLocation = JEJU_LOCATIONS.find(l => l.id === value)

  if (locked) {
    return (
      <div className="relative">
        <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600 flex items-center justify-between">
          <span>{lockedValue || selectedLocation?.name || placeholder}</span>
          <span className="text-xs text-slate-400">자동 지정</span>
        </div>
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>

      {/* 도 전체 */}
      <optgroup label="제주 전역">
        {islandLevel.map(loc => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </optgroup>

      {/* 시 단위 */}
      <optgroup label="시 단위">
        {cityLevel.map(loc => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </optgroup>

      {/* 읍면동 단위 - 제주시 */}
      <optgroup label="제주시 읍면동">
        {districtLevel
          .filter(d => d.parentId === 'jeju-city')
          .map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
      </optgroup>

      {/* 읍면동 단위 - 서귀포시 */}
      <optgroup label="서귀포시 읍면동">
        {districtLevel
          .filter(d => d.parentId === 'seogwipo-city')
          .map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
      </optgroup>
    </select>
  )
}
