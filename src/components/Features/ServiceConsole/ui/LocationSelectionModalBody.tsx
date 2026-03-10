import { LocationDropdown } from '../ui'

interface LocationSelectionModalBodyProps {
  value: string | undefined
  onChange: (code: string | undefined) => void
  placeholder: string
  onConfirm: () => void
}

export function LocationSelectionModalBody({
  value,
  onChange,
  placeholder,
  onConfirm,
}: LocationSelectionModalBodyProps) {
  return (
    <div className="space-y-4">
      <LocationDropdown
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      {value && (
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-lg transition-colors"
        >
          선택하시겠습니까?
        </button>
      )}
    </div>
  )
}
