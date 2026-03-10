interface DealConfirmCardProps {
  totalCost: number
  onCancel: () => void
  onConfirm: () => void
}

export function DealConfirmCard({ totalCost, onCancel, onConfirm }: DealConfirmCardProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-teal-600">✓</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">거래를 확정하시겠습니까?</h3>
          <p className="text-sm text-slate-600">
            거래 신청이 완료되면 업체에서 확인 후 연락드립니다.
          </p>
          <div className="mt-4 p-4 bg-teal-50 rounded-lg">
            <div className="text-sm text-slate-600">최종 예상 금액</div>
            <div className="text-2xl font-bold text-teal-700 mt-1">
              {Math.round(totalCost).toLocaleString()}원
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            확정
          </button>
        </div>
      </div>
    </div>
  )
}
