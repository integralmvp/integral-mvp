// 초기화 버튼 컴포넌트 (GridCell headerAction용)
// PR4: 각 입력칸 우측 상단에 배치

interface ResetButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function ResetButton({ onClick, disabled = false }: ResetButtonProps) {
  if (disabled) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
      title="초기화"
    >
      초기화
    </button>
  )
}
