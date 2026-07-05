// 관리자 견적 콘솔 — 조립 전용 (폼 → 실시간 결과 → 저장/목록)
// 히어로 플로우: 화물 제원 → 큐브 좌표계 환산 → 최소 적합 차종 → 청구큐브 → 냉동 단가 룩업 → 견적가
import { useAdminQuote } from './hooks/useAdminQuote'
import CargoInputForm from './ui/CargoInputForm'
import QuoteResultCard from './ui/QuoteResultCard'
import QuoteList from './ui/QuoteList'

export default function AdminQuoteConsole() {
  const { form, setField, derived, canSave, handleSave, quotes, handleDelete } = useAdminQuote()

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      <CargoInputForm form={form} setField={setField} />
      <QuoteResultCard derived={derived} canSave={canSave} onSave={handleSave} />
      <QuoteList quotes={quotes} onDelete={handleDelete} />
    </div>
  )
}
