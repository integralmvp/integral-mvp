// 관리자 견적 콘솔 — 조립 전용 (폼 → 실시간 결과 → 저장/목록)
// 히어로 플로우: 화물 제원 → 큐브 좌표계 환산 → 최소 적합 차종 → 청구큐브 → 냉동 단가 룩업 → 견적가
import { useAdminQuote } from './hooks/useAdminQuote'
import CargoInputForm from './ui/CargoInputForm'
import QuoteResultCard from './ui/QuoteResultCard'
import QuoteList from './ui/QuoteList'

export default function AdminQuoteConsole() {
  const {
    form, setField, canRun, runQuote, result, resetForm, canSave, handleSave, quotes, handleDelete,
  } = useAdminQuote()

  // 견적 등록 성공 시 폼·결과 리셋 (초기화 버튼과 동일 동작 공유) — 목록은 유지
  const handleSaveAndReset = () => {
    if (handleSave()) resetForm()
  }

  return (
    // 입력폼·결과카드는 고정, 견적목록이 flex-1(최소 180px)로 남은 높이를 받아 내부 스크롤.
    // 뷰포트가 작아 전부 못 담으면 루트 overflow-y-auto가 fallback 스크롤 (목록 잘림 방지)
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
      <div className="shrink-0">
        <CargoInputForm
          form={form}
          setField={setField}
          canRun={canRun}
          onRunQuote={runQuote}
          onReset={resetForm}
        />
      </div>
      <div className="shrink-0">
        <QuoteResultCard derived={result} canSave={canSave} onSave={handleSaveAndReset} />
      </div>
      <div className="min-h-[180px] flex-1 shrink-0">
        <QuoteList quotes={quotes} onDelete={handleDelete} />
      </div>
    </div>
  )
}
