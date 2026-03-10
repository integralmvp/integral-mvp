interface DealFooterButtonsProps {
  onCancel: () => void
  onSubmit: () => void
  canSubmit: boolean
}

export function DealFooterButtons({ onCancel, onSubmit, canSubmit }: DealFooterButtonsProps) {
  return (
    <div className="p-6 border-t border-slate-200 bg-slate-50">
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
        >
          취소
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
            canSubmit
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          거래 신청
        </button>
      </div>
    </div>
  )
}
