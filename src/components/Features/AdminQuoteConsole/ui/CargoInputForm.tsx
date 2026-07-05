// 화물 제원 입력폼 — 길이·폭·높이(mm)·중량(kg)·권역·차량대수 + 거래처·품목 옵션
import type { AdminQuoteForm } from '../hooks/useAdminQuote'
import type { Region } from '../../../../engine/cubeCoordinate'

interface CargoInputFormProps {
  form: AdminQuoteForm
  setField: <K extends keyof AdminQuoteForm>(key: K, value: AdminQuoteForm[K]) => void
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

export default function CargoInputForm({ form, setField }: CargoInputFormProps) {
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
          <span className="text-xs font-semibold text-slate-600">품목 <span className="text-slate-400">(옵션)</span></span>
          <input
            type="text"
            value={form.item}
            onChange={e => setField('item', e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800
                       focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </label>
      </div>
    </div>
  )
}
