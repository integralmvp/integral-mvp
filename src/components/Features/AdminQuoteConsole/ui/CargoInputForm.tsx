// 화물 제원 입력폼 — 길이·폭·높이(mm)·중량(kg)·권역·차량대수 + 거래처·품목(검증된 드롭다운)
import type { AdminQuoteForm } from '../hooks/useAdminQuote'
import type { Region } from '../../../../engine/cubeCoordinate'
import { ADMIN_ITEM_OPTIONS, ITEM_UNSPECIFIED } from '../utils/labels'

interface CargoInputFormProps {
  form: AdminQuoteForm
  setField: <K extends keyof AdminQuoteForm>(key: K, value: AdminQuoteForm[K]) => void
  /** 필수 제원(길이·폭·높이·중량)이 모두 유효한지 — 조회 버튼 활성 조건 */
  canRun: boolean
  onRunQuote: () => void
}

const REGIONS: Region[] = ['시내', '시외']

function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-slate-600">
        {label} <span className="text-slate-400">({unit})</span>
      </span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                   focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
    </label>
  )
}

export default function CargoInputForm({ form, setField, canRun, onRunQuote }: CargoInputFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">화물 제원 입력</h2>

      <div className="grid grid-cols-2 gap-3">
        <NumberField label="길이" unit="mm" value={form.lengthMm} placeholder="6000"
          onChange={v => setField('lengthMm', v)} />
        <NumberField label="폭" unit="mm" value={form.widthMm} placeholder="600"
          onChange={v => setField('widthMm', v)} />
        <NumberField label="높이" unit="mm" value={form.heightMm} placeholder="600"
          onChange={v => setField('heightMm', v)} />
        <NumberField label="중량" unit="kg" value={form.weightKg} placeholder="300"
          onChange={v => setField('weightKg', v)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* 권역 선택 */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">권역</span>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {REGIONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setField('region', r)}
                className={`flex-1 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors ${
                  form.region === r
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <NumberField label="차량대수" unit="대" value={form.vehicleCount}
          onChange={v => setField('vehicleCount', v)} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">거래처 <span className="text-slate-400">(옵션)</span></span>
          <input
            type="text"
            value={form.client}
            onChange={e => setField('client', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                       focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">품목 <span className="text-slate-400">(단가 조건행 반영)</span></span>
          {/* 검증된 품목만 선택 — 오타/공백으로 조건행을 놓치는 문제 차단 */}
          <select
            value={form.item}
            onChange={e => setField('item', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                       focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="">{ITEM_UNSPECIFIED}</option>
            {ADMIN_ITEM_OPTIONS.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 견적 조회 — 완성된 입력에서만 견적 산출 (입력 도중 자동 계산 없음) */}
      <button
        type="button"
        disabled={!canRun}
        onClick={onRunQuote}
        className="mt-3 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white transition-colors
                   hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        견적 조회
      </button>
      {!canRun && (
        <p className="mt-1.5 text-[10px] text-slate-400">
          길이·폭·높이·중량을 모두 입력하면 조회할 수 있습니다
        </p>
      )}
    </div>
  )
}
