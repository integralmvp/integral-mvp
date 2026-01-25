// 보관 탭 섹션
import type { BoxInputUI } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import { AccordionField, AreaInputField } from '../ui'
import { getStorageSummary } from '../utils/consoleMappers'

interface StorageTabSectionProps {
  expandedField: string | null
  onFieldClick: (fieldId: string) => void
  // 수요면적 관련
  storageInputType: 'box' | 'area'
  storageBoxes: BoxInputUI[]
  storageAreaM2: number
  storageResult: DemandResult | null
  storageSelectedPallets: number | null
  onInputTypeChange: (type: 'box' | 'area') => void
  onBoxesChange: (boxes: BoxInputUI[]) => void
  onAreaChange: (areaM2: number) => void
  onSelectConfirm: () => void
}

export default function StorageTabSection({
  expandedField,
  onFieldClick,
  storageInputType,
  storageBoxes,
  storageAreaM2,
  storageResult,
  storageSelectedPallets,
  onInputTypeChange,
  onBoxesChange,
  onAreaChange,
  onSelectConfirm,
}: StorageTabSectionProps) {
  return (
    <>
      <AccordionField
        id="storage-area"
        label="수요면적"
        placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
        expanded={expandedField === 'storage-area'}
        onToggle={() => onFieldClick('storage-area')}
        summary={getStorageSummary(storageResult, storageSelectedPallets)}
      >
        <AreaInputField
          inputType={storageInputType}
          boxes={storageBoxes}
          areaM2={storageAreaM2}
          result={storageResult}
          mode="STORAGE"
          onInputTypeChange={onInputTypeChange}
          onBoxesChange={onBoxesChange}
          onAreaChange={onAreaChange}
          onSelectConfirm={onSelectConfirm}
        />
      </AccordionField>
      <AccordionField
        id="storage-product"
        label="품목"
        placeholder="화물의 내용물 품목을 선택합니다."
        expanded={expandedField === 'storage-product'}
        onToggle={() => onFieldClick('storage-product')}
      />
      <AccordionField
        id="storage-period"
        label="보관기간"
        placeholder="보관을 원하시는 기간을 선택합니다."
        expanded={expandedField === 'storage-period'}
        onToggle={() => onFieldClick('storage-period')}
      />
    </>
  )
}
