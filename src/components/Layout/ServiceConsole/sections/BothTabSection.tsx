// 보관+운송 탭 섹션 (추후 구현 예정)
import { AccordionField } from '../ui'

interface BothTabSectionProps {
  expandedField: string | null
  onFieldClick: (fieldId: string) => void
}

export default function BothTabSection({
  expandedField,
  onFieldClick,
}: BothTabSectionProps) {
  return (
    <>
      <AccordionField
        id="both-order"
        label="순서"
        placeholder="보관 후 운송 또는 운송 후 보관"
        expanded={expandedField === 'both-order'}
        onToggle={() => onFieldClick('both-order')}
      />
      <AccordionField
        id="both-storage-area"
        label="보관 수요면적"
        placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
        expanded={expandedField === 'both-storage-area'}
        onToggle={() => onFieldClick('both-storage-area')}
      />
      <AccordionField
        id="both-transport-area"
        label="운송 수요면적"
        placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
        expanded={expandedField === 'both-transport-area'}
        onToggle={() => onFieldClick('both-transport-area')}
      />
      <AccordionField
        id="both-product"
        label="품목"
        placeholder="화물량의 내용물 품목을 선택합니다."
        expanded={expandedField === 'both-product'}
        onToggle={() => onFieldClick('both-product')}
      />
      <AccordionField
        id="both-period"
        label="보관기간"
        placeholder="보관을 원하시는 기간을 선택합니다."
        expanded={expandedField === 'both-period'}
        onToggle={() => onFieldClick('both-period')}
      />
      <AccordionField
        id="both-date"
        label="운송날짜"
        placeholder="운송을 원하시는 날짜를 선택합니다."
        expanded={expandedField === 'both-date'}
        onToggle={() => onFieldClick('both-date')}
      />
    </>
  )
}
