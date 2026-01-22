// 서비스 콘솔 - 탭 + 아코디언 폼
import { useState } from 'react'

type ServiceType = 'storage' | 'transport' | 'both'

export default function ServiceConsole() {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      {/* 타이틀 */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">내 손 안의 작은 물류 허브</h1>
        <p className="text-sm text-slate-600 mt-1">비어있는 공간과 경로를 원하는 조건으로 검색하고 결제까지! 신개념 물류 오픈마켓</p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'storage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          보관
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'transport'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          운송
        </button>
        <button
          onClick={() => setActiveTab('both')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'both'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          보관+운송
        </button>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* 보관 탭 */}
        {activeTab === 'storage' && (
          <>
            <AccordionField
              id="storage-area"
              label="수요면적"
              placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'storage-area'}
              onToggle={() => handleFieldClick('storage-area')}
            />
            <AccordionField
              id="storage-product"
              label="품목"
              placeholder="화물의 내용물 품목을 선택합니다."
              expanded={expandedField === 'storage-product'}
              onToggle={() => handleFieldClick('storage-product')}
            />
            <AccordionField
              id="storage-period"
              label="보관기간"
              placeholder="보관을 원하시는 기간을 선택합니다."
              expanded={expandedField === 'storage-period'}
              onToggle={() => handleFieldClick('storage-period')}
            />
          </>
        )}

        {/* 운송 탭 */}
        {activeTab === 'transport' && (
          <>
            <AccordionField
              id="transport-area"
              label="수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'transport-area'}
              onToggle={() => handleFieldClick('transport-area')}
            />
            <AccordionField
              id="transport-product"
              label="품목"
              placeholder="화물의 내용물 품목을 선택합니다."
              expanded={expandedField === 'transport-product'}
              onToggle={() => handleFieldClick('transport-product')}
            />
            <AccordionField
              id="transport-date"
              label="운송날짜"
              placeholder="운송을 원하시는 날짜를 선택합니다."
              expanded={expandedField === 'transport-date'}
              onToggle={() => handleFieldClick('transport-date')}
            />
          </>
        )}

        {/* 보관+운송 탭 */}
        {activeTab === 'both' && (
          <>
            <AccordionField
              id="both-order"
              label="순서"
              placeholder="보관 후 운송 또는 운송 후 보관"
              expanded={expandedField === 'both-order'}
              onToggle={() => handleFieldClick('both-order')}
            />
            <AccordionField
              id="both-storage-area"
              label="보관 수요면적"
              placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-storage-area'}
              onToggle={() => handleFieldClick('both-storage-area')}
            />
            <AccordionField
              id="both-transport-area"
              label="운송 수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-transport-area'}
              onToggle={() => handleFieldClick('both-transport-area')}
            />
            <AccordionField
              id="both-product"
              label="품목"
              placeholder="화물량의 내용물 품목을 선택합니다."
              expanded={expandedField === 'both-product'}
              onToggle={() => handleFieldClick('both-product')}
            />
            <AccordionField
              id="both-period"
              label="보관기간"
              placeholder="보관을 원하시는 기간을 선택합니다."
              expanded={expandedField === 'both-period'}
              onToggle={() => handleFieldClick('both-period')}
            />
            <AccordionField
              id="both-date"
              label="운송날짜"
              placeholder="운송을 원하시는 날짜를 선택합니다."
              expanded={expandedField === 'both-date'}
              onToggle={() => handleFieldClick('both-date')}
            />
          </>
        )}
      </div>

      {/* 검색 버튼 */}
      <div className="p-6 border-t border-slate-200">
        <button
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg ${
            activeTab === 'storage'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              : activeTab === 'transport'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          🔍 검색하기
        </button>
      </div>
    </div>
  )
}

// 아코디언 필드 컴포넌트
interface AccordionFieldProps {
  id: string
  label: string
  placeholder: string
  expanded: boolean
  onToggle: () => void
}

function AccordionField({ label, placeholder, expanded, onToggle }: AccordionFieldProps) {
  return (
    <div
      className={`border rounded-xl transition-all cursor-pointer ${
        expanded
          ? 'border-slate-400 bg-white shadow-md'
          : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-slate-400">
            {expanded ? '▲' : '▼'}
          </span>
        </div>

        {expanded && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        )}

        {!expanded && (
          <div className="mt-1 text-xs text-slate-400">{placeholder}</div>
        )}
      </div>
    </div>
  )
}
