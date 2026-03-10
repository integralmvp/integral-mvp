interface DealContractModalProps {
  onClose: () => void
  onAgree: () => void
}

export function DealContractModal({ onClose, onAgree }: DealContractModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">전자 간이 계약서</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-slate-700">
          <section>
            <h4 className="font-bold text-slate-900 mb-2">제 1 조 (목적)</h4>
            <p>본 계약은 물류 서비스 제공에 관한 사항을 정함을 목적으로 합니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 mb-2">제 2 조 (서비스 내용)</h4>
            <p>
              갑(서비스 제공자)은 을(이용자)에게 화물 보관 및 운송 서비스를 제공하며,
              을은 본 계약에서 정한 요금을 지불합니다.
            </p>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 mb-2">제 3 조 (요금 및 결제)</h4>
            <p>
              서비스 요금은 실제 사용량 및 중량에 따라 산정되며,
              등록된 결제 수단으로 후불 결제됩니다.
            </p>
          </section>
          <section>
            <h4 className="font-bold text-slate-900 mb-2">제 4 조 (책임 및 면책)</h4>
            <p>
              갑은 정상적인 관리 범위 내에서 발생한 화물 손상에 대해 책임을 지며,
              천재지변 등 불가항력적 사유로 인한 손해는 면책됩니다.
            </p>
          </section>
        </div>
        <div className="p-6 border-t border-slate-200">
          <button
            onClick={() => { onAgree(); onClose() }}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
          >
            동의하고 닫기
          </button>
        </div>
      </div>
    </div>
  )
}
