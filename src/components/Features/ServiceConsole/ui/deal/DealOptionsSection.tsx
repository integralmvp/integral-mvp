import type { DealOption } from '../../../../../types/models'

interface DealOptionsSectionProps {
  options: DealOption[]
  onToggle: (optionId: string) => void
}

export function DealOptionsSection({ options, onToggle }: DealOptionsSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">부가 옵션</h3>
      <div className="space-y-2">
        {options.map(option => (
          <label
            key={option.id}
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
              option.selected
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-slate-900">{option.name}</div>
              <div className="text-sm text-slate-600">{option.description}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-teal-700 font-bold">+{option.price.toLocaleString()}원</div>
              <input
                type="checkbox"
                checked={option.selected}
                onChange={() => onToggle(option.id)}
                className="w-5 h-5 text-teal-600 rounded"
              />
            </div>
          </label>
        ))}
      </div>
    </section>
  )
}
