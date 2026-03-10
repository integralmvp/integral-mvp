interface DealMemoSectionProps {
  value: string
  onChange: (value: string) => void
}

export function DealMemoSection({ value, onChange }: DealMemoSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">요청 사항 (선택)</h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="추가 요청 사항이 있으시면 입력해주세요"
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 resize-none h-24"
      />
    </section>
  )
}
