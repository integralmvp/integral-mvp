// 품목 코드 검색 드롭다운 컴포넌트
import { useState, useRef, useEffect } from 'react'
import { PLATFORM_ITEM_CODES, searchItems, getItemByCode, type ItemCode } from '../../../../data/itemCodes'

interface ItemCodeDropdownProps {
  value?: string
  onChange: (code: string) => void
  disabled?: boolean
}

export default function ItemCodeDropdown({
  value,
  onChange,
  disabled = false,
}: ItemCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 선택된 아이템
  const selectedItem = value ? getItemByCode(value) : undefined

  // 검색 결과
  const filteredItems = searchQuery ? searchItems(searchQuery) : PLATFORM_ITEM_CODES

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 드롭다운 열릴 때 입력 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (item: ItemCode) => {
    onChange(item.code)
    setIsOpen(false)
    setSearchQuery('')
  }

  // 플래그 뱃지 렌더링
  const renderFlags = (item: ItemCode) => {
    if (!item.flags) return null

    const flags = []
    if (item.flags.fragile) flags.push('파손주의')
    if (item.flags.perishable) flags.push('부패성')
    if (item.flags.tempRequired) flags.push('온도관리')
    if (item.flags.liquid) flags.push('액체')
    if (item.flags.battery) flags.push('배터리')
    if (item.flags.hazmatLike) flags.push('취급주의')
    if (item.flags.oversizeRisk) flags.push('대형')

    if (flags.length === 0) return null

    return (
      <div className="flex gap-1 mt-0.5">
        {flags.slice(0, 2).map(flag => (
          <span
            key={flag}
            className="text-[9px] px-1 py-0.5 bg-orange-100 text-orange-700 rounded"
          >
            {flag}
          </span>
        ))}
        {flags.length > 2 && (
          <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-500 rounded">
            +{flags.length - 2}
          </span>
        )}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* 선택된 값 표시 / 버튼 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-2 py-1.5 border rounded text-xs text-left flex items-center justify-between
          ${disabled ? 'bg-slate-100 cursor-not-allowed' : 'bg-white hover:border-slate-400'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-300'}
        `}
      >
        {selectedItem ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-mono">{selectedItem.code}</span>
              <span className="truncate">{selectedItem.label}</span>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">품목 선택</span>
        )}
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 드롭다운 목록 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* 검색 입력 */}
          <div className="p-2 border-b border-slate-100">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="코드, 품목명, 키워드 검색..."
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 목록 */}
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                검색 결과가 없습니다
              </div>
            ) : (
              filteredItems.map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors
                    ${value === item.code ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-mono pt-0.5">{item.code}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-800 truncate">{item.label}</div>
                      {renderFlags(item)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
