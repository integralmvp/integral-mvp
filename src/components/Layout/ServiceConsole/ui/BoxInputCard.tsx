// 박스 입력 카드 컴포넌트
import type { BoxInputUI } from '../../../../types/models'

interface BoxInputCardProps {
  box: BoxInputUI
  index: number
  onRemove: (boxId: string) => void
  onChange: (boxId: string, field: keyof BoxInputUI, value: number) => void
  onComplete: (boxId: string) => void
}

export default function BoxInputCard({
  box,
  index,
  onRemove,
  onChange,
  onComplete,
}: BoxInputCardProps) {
  const isComplete = box.width > 0 && box.depth > 0 && box.height > 0 && box.count > 0
  const isConfirmed = box.completed === true

  return (
    <div className={`rounded-lg p-3 space-y-2 ${isConfirmed ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          박스 {index + 1} {isConfirmed && <span className="text-green-600">✓ 완료</span>}
        </span>
        <button
          onClick={() => onRemove(box.id)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          삭제
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-slate-600 mb-1">가로(mm)</label>
          <input
            type="number"
            min="0"
            value={box.width || ''}
            onChange={(e) => onChange(box.id, 'width', Number(e.target.value))}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={isConfirmed}
            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-600 mb-1">세로(mm)</label>
          <input
            type="number"
            min="0"
            value={box.depth || ''}
            onChange={(e) => onChange(box.id, 'depth', Number(e.target.value))}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={isConfirmed}
            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-600 mb-1">높이(mm)</label>
          <input
            type="number"
            min="0"
            value={box.height || ''}
            onChange={(e) => onChange(box.id, 'height', Number(e.target.value))}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={isConfirmed}
            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-600 mb-1">개수</label>
          <input
            type="number"
            min="0"
            value={box.count || ''}
            onChange={(e) => onChange(box.id, 'count', Number(e.target.value))}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={isConfirmed}
            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
          />
        </div>
      </div>

      {!isConfirmed && (
        <button
          onClick={() => onComplete(box.id)}
          disabled={!isComplete}
          className={`w-full py-2 text-xs font-bold rounded transition-colors ${
            isComplete
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          입력 완료
        </button>
      )}
    </div>
  )
}
