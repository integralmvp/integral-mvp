// 저장된 견적 목록 — adminQuote.repo(localStorage) 누적분 표시
import type { AdminQuoteRecord } from '../../../../infra/storage/info/adminQuote.repo'
import { formatWon, summarizeRejected } from '../utils/labels'

interface QuoteListProps {
  quotes: AdminQuoteRecord[]
  onDelete: (id: string) => void
}

export default function QuoteList({ quotes, onDelete }: QuoteListProps) {
  return (
    // 부모가 준 높이 안에서 헤더 고정 + 목록(ul)만 내부 스크롤
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 shrink-0 text-sm font-bold text-slate-800">
        견적 목록 <span className="text-xs font-semibold text-slate-400">({quotes.length}건)</span>
      </h2>

      {quotes.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400">저장된 견적이 없습니다</div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {quotes.map(q => {
            const rejectSummary = summarizeRejected(q.reject_summary)
            return (
              <li
                key={q.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{q.matched_vehicle_name}</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {q.권역} · {q.대수}대
                    </span>
                    {(q.cargo.거래처 || q.cargo.품목) && (
                      <span className="truncate text-[11px] text-slate-400">
                        {[q.cargo.거래처, q.cargo.품목].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {q.cargo.length_mm}×{q.cargo.width_mm}×{q.cargo.height_mm}mm · {q.cargo.weight_kg}kg
                    {' · '}청구큐브 {formatWon(q.청구큐브)} · 큐브당 {formatWon(q.큐브당)}원
                  </div>
                  {rejectSummary && (
                    <div className="mt-0.5 text-[10px] font-semibold text-amber-600">{rejectSummary}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-teal-700">{formatWon(q.견적가)}원</div>
                  <button
                    type="button"
                    onClick={() => onDelete(q.id)}
                    className="mt-0.5 text-[10px] text-slate-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
