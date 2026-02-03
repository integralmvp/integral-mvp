// 입력 모달 래퍼 - 기존 입력 UI를 모달로 호출
// 블랙/그레이 통일 스타일
import type { ReactNode } from 'react'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function InputModal({
  isOpen,
  onClose,
  title,
  children,
}: InputModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-hidden animate-slide-up cyber-corner"
        style={{
          background: 'rgba(10, 10, 15, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
        }}
      >
        {/* 헤더 - Cyber */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 184, 196, 0.1) 100%)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          <h3 className="text-base font-bold text-cyber-cyan">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-56px)] text-cyber-text">
          {children}
        </div>
      </div>
    </div>
  )
}
