// 운송 탭 섹션
import type { BoxInputUI } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import { AccordionField, AreaInputField } from '../ui'
import { getTransportSummary } from '../utils/consoleMappers'

interface TransportTabSectionProps {
  expandedField: string | null
  onFieldClick: (fieldId: string) => void
  // 수요면적 관련
  transportInputType: 'box' | 'area'
  transportBoxes: BoxInputUI[]
  transportAreaM2: number
  transportResult: DemandResult | null
  transportSelectedCubes: number | null
  onInputTypeChange: (type: 'box' | 'area') => void
  onBoxesChange: (boxes: BoxInputUI[]) => void
  onAreaChange: (areaM2: number) => void
  onSelectConfirm: () => void
}

export default function TransportTabSection({
  expandedField,
  onFieldClick,
  transportInputType,
  transportBoxes,
  transportAreaM2,
  transportResult,
  transportSelectedCubes,
  onInputTypeChange,
  onBoxesChange,
  onAreaChange,
  onSelectConfirm,
}: TransportTabSectionProps) {
  return (
    <>
      <AccordionField
        id="transport-area"
        label="수요면적"
        placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
        expanded={expandedField === 'transport-area'}
        onToggle={() => onFieldClick('transport-area')}
        summary={getTransportSummary(transportResult, transportSelectedCubes)}
      >
        <AreaInputField
          inputType={transportInputType}
          boxes={transportBoxes}
          areaM2={transportAreaM2}
          result={transportResult}
          mode="ROUTE"
          onInputTypeChange={onInputTypeChange}
          onBoxesChange={onBoxesChange}
          onAreaChange={onAreaChange}
          onSelectConfirm={onSelectConfirm}
        />
      </AccordionField>
      <AccordionField
        id="transport-product"
        label="품목"
        placeholder="화물의 내용물 품목을 선택합니다."
        expanded={expandedField === 'transport-product'}
        onToggle={() => onFieldClick('transport-product')}
      />
      <AccordionField
        id="transport-date"
        label="운송날짜"
        placeholder="운송을 원하시는 날짜를 선택합니다."
        expanded={expandedField === 'transport-date'}
        onToggle={() => onFieldClick('transport-date')}
      />
    </>
  )
}
