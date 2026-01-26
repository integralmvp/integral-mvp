// 날짜 선택 컴포넌트 - 단일 날짜 또는 기간 선택

interface DatePickerProps {
  mode: 'single' | 'range'
  // 단일 날짜 모드
  date?: string
  onDateChange?: (date: string) => void
  // 기간 모드
  startDate?: string
  endDate?: string
  onStartDateChange?: (date: string) => void
  onEndDateChange?: (date: string) => void
  // 공통
  disabled?: boolean
  locked?: boolean  // 잠금 상태 (자동 지정 시)
  lockedLabel?: string
  minDate?: string
}

// 오늘 날짜 (YYYY-MM-DD)
const getToday = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export default function DatePicker({
  mode,
  date,
  onDateChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  locked = false,
  lockedLabel,
  minDate,
}: DatePickerProps) {
  const today = getToday()
  const effectiveMinDate = minDate || today

  if (mode === 'single') {
    if (locked) {
      return (
        <div className="relative">
          <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600 flex items-center justify-between">
            <span>{date || lockedLabel || '날짜 미지정'}</span>
            <span className="text-xs text-slate-400">자동 지정</span>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        <input
          type="date"
          value={date || ''}
          onChange={(e) => onDateChange?.(e.target.value)}
          min={effectiveMinDate}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      </div>
    )
  }

  // 기간 모드
  return (
    <div className="space-y-2">
      {/* 시작일 */}
      <div>
        <label className="block text-xs text-slate-600 mb-1">시작일</label>
        {locked && !onStartDateChange ? (
          <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600 flex items-center justify-between">
            <span>{startDate || lockedLabel || '날짜 미지정'}</span>
            <span className="text-xs text-slate-400">자동 지정</span>
          </div>
        ) : (
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange?.(e.target.value)}
            min={effectiveMinDate}
            disabled={disabled}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        )}
      </div>

      {/* 종료일 */}
      <div>
        <label className="block text-xs text-slate-600 mb-1">종료일</label>
        <input
          type="date"
          value={endDate || ''}
          onChange={(e) => onEndDateChange?.(e.target.value)}
          min={startDate || effectiveMinDate}
          disabled={disabled}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* 기간 표시 */}
      {startDate && endDate && (
        <div className="text-xs text-slate-500 text-center">
          {calculateDays(startDate, endDate)}일간 보관
        </div>
      )}
    </div>
  )
}

// 기간 계산 함수
function calculateDays(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1  // 시작일 포함
}
