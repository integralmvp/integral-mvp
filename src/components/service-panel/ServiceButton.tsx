// 서비스 버튼 (보관하기/운송하기)
interface ServiceButtonProps {
  icon: string
  label: string
  isSelected: boolean
  isMinimized: boolean
  onClick: () => void
}

export default function ServiceButton({
  icon,
  label,
  isSelected,
  isMinimized,
  onClick,
}: ServiceButtonProps) {
  if (isMinimized) {
    // 선택된 상태: 작게 표시
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg">
        <span className="text-xl">{icon}</span>
        <span className="font-semibold text-blue-900">{label}</span>
        <span className="ml-auto text-xs text-blue-700">선택됨</span>
      </div>
    )
  }

  // 초기 상태: 큰 버튼
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-8 rounded-xl border-2 transition-all
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      <div className="text-6xl mb-4">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{label}</div>
    </button>
  )
}
