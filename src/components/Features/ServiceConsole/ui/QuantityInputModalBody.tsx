import type { RegisteredCargo } from '../../../../types/models'
import type { DemandResult } from '../../../../engine/cube'
import { QuantityInputCard, ConversionResult } from '../ui'

interface QuantityInputModalBodyProps {
  registeredCargos: RegisteredCargo[]
  allQuantitiesEntered: boolean
  demandResult: DemandResult | null
  onUpdateQuantity: (cargoId: string, quantity: number, estimatedCubes: number) => void
  onConfirmQuantity: () => void
  onClose: () => void
  mode: 'STORAGE' | 'ROUTE'
  modeLabel: string
}

export function QuantityInputModalBody({
  registeredCargos,
  allQuantitiesEntered,
  demandResult,
  onUpdateQuantity,
  onConfirmQuantity,
  onClose,
  mode,
  modeLabel,
}: QuantityInputModalBodyProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
        <p className="text-xs text-slate-600">
          등록된 화물별 수량을 입력하면 필요한 {modeLabel} 수가 자동으로 계산됩니다.
        </p>
      </div>

      {/* 화물별 수량 입력 */}
      {registeredCargos.map(cargo => (
        <QuantityInputCard
          key={cargo.id}
          cargo={cargo}
          onQuantityChange={onUpdateQuantity}
          mode={mode}
        />
      ))}

      {/* 총 환산 결과 */}
      {allQuantitiesEntered && demandResult && (
        <ConversionResult
          result={demandResult}
          mode={mode}
          onSelectConfirm={() => {
            onConfirmQuantity()
            onClose()
          }}
          isButtonDisabled={!allQuantitiesEntered}
        />
      )}
    </div>
  )
}
