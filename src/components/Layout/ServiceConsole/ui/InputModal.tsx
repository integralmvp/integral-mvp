// 입력 모달 래퍼 - 기존 입력 UI를 모달로 호출
import type { ReactNode } from 'react'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  colorScheme?: 'blue' | 'emerald' | 'purple'
}

const headerColors = {
  blue: 'bg-blue-600',
  emerald: 'bg-emerald-600',
  purple: 'bg-purple-600',
}

export default function InputModal({
  isOpen,
  onClose,
  title,
  children,
  colorScheme = 'blue',
}: InputModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* 헤더 */}
        <div className={`${headerColors[colorScheme]} px-4 py-3 flex items-center justify-between`}>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-56px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
