// 실시간 견적 결과카드 — 큐브 좌표 · 추천차종+초과사유 · 청구큐브·큐브당·견적가(강조)
// 계산 없음: useAdminQuote 파생값을 표시만 한다.
import { CubeIcon3D, TruckIcon } from '../../../Visualizations'
import type { AdminQuoteDerived } from '../hooks/useAdminQuote'
import { REASON_LABELS, formatWon, summarizeRejected } from '../utils/labels'

interface QuoteResultCardProps {
  derived: AdminQuoteDerived | null
  canSave: boolean
  onSave: () => void
}

function CoordChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-teal-50 px-2 py-1.5">
      <span className="text-[10px] font-semibold text-teal-600">{label}</span>
      <span className="text-sm font-bold text-teal-800">{value.toLocaleString('ko-KR')}</span>
    </div>
  )
}

export default function QuoteResultCard({ derived, canSave, onSave }: QuoteResultCardProps) {
  if (!derived) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 text-center text-sm text-slate-400">
        화물 제원(길이·폭·높이·중량)을 입력하면 견적이 실시간 계산됩니다
      </div>
    )
  }

  const { cargo, match, rejected, quoteResult, count } = derived
  const rejectSummary = summarizeRejected(
    rejected.map(r => ({ vehicle_name: r.vehicle.name, reasons: r.reasons })),
  )

  return (
    <div className="rounded-2xl border border-teal-200 bg-white/90 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">견적 결과</h2>

      {/* 큐브 좌표 (선/면/공간/중량) */}
      <div className="flex items-center gap-3">
        {/* 200mm 세계: 치수 라벨(250mm) 미표시 */}
        <CubeIcon3D showDimensions={false} size={72} />
        <div className="grid flex-1 grid-cols-4 gap-1.5">
          <CoordChip label="선큐브" value={cargo.line_cube} />
          <CoordChip label="면큐브" value={cargo.area_cube} />
          <CoordChip label="공간큐브" value={cargo.volume_cube} />
          <CoordChip label="중량큐브" value={cargo.weight_cube} />
        </div>
      </div>

      {/* 추천 차종 + 초과사유 */}
      <div className="mt-3 rounded-xl bg-slate-50 p-3">
        {match.matched && match.vehicle ? (
          <div className="flex items-center gap-3">
            <TruckIcon size={64} showLabel={false} />
            <div className="flex-1">
              <div className="text-xs font-semibold text-slate-500">추천 차종</div>
              <div className="text-xl font-black text-slate-800">{match.vehicle.name}</div>
              {rejectSummary && (
                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  {rejectSummary}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm font-bold text-red-600">
            {REASON_LABELS.NO_AVAILABLE_VEHICLE} — 최대 차종 규격을 초과했습니다
          </div>
        )}
      </div>

      {/* 청구큐브 · 큐브당 · 견적가 */}
      {quoteResult && quoteResult.견적가 !== null && quoteResult.큐브당 !== null && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-semibold text-slate-500">청구큐브</div>
            <div className="text-base font-bold text-slate-800">
              {formatWon(quoteResult.청구큐브)}
            </div>
            <div className="text-[10px] text-slate-400">부피큐브 × {count}대</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-semibold text-slate-500">큐브당 단가</div>
            <div className="text-base font-bold text-slate-800">
              {formatWon(quoteResult.큐브당)}<span className="text-xs font-semibold">원</span>
            </div>
            <div className="text-[10px] text-slate-400">병행 표시</div>
          </div>
          <div className="rounded-xl bg-teal-600 p-3 text-center shadow">
            <div className="text-[10px] font-semibold text-teal-100">견적가</div>
            <div className="text-lg font-black text-white">
              {formatWon(quoteResult.견적가)}<span className="text-xs font-bold">원</span>
            </div>
            <div className="text-[10px] text-teal-100">도내비 × {count}대</div>
          </div>
        </div>
      )}

      {/* 견적 저장 */}
      <button
        type="button"
        disabled={!canSave}
        onClick={onSave}
        className="mt-3 w-full rounded-xl bg-teal-700 py-2.5 text-sm font-bold text-white transition-colors
                   hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        견적 저장
      </button>

      <p className="mt-2 text-[10px] text-slate-400">
        * 차량 규격 일부(선·면큐브, 중간차종)는 시드값입니다 — 추후 실측 등록
      </p>
    </div>
  )
}
