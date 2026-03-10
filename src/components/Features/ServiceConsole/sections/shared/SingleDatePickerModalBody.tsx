import { DatePicker } from '../../ui'

interface SingleDatePickerModalBodyProps {
  date: string | undefined
  onDateChange: (date: string | undefined) => void
  onConfirm: () => void
}

export function SingleDatePickerModalBody({
  date,
  onDateChange,
  onConfirm,
}: SingleDatePickerModalBodyProps) {
  return (
    <div className="space-y-4">
      <DatePicker
        mode="single"
        date={date}
        onDateChange={onDateChange}
      />
      {date && (
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
