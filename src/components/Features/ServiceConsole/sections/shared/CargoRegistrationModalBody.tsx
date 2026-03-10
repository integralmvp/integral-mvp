import type { CargoUI, RegisteredCargo } from '../../../../../types/models'
import { CargoRegistrationCard, CargoSummaryCard } from '../../ui'

interface CargoRegistrationModalBodyProps {
  registeredCargos: RegisteredCargo[]
  pendingCargos: CargoUI[]
  onAddCargo: () => void
  onRemoveCargo: (cargoId: string) => void
  onUpdateCargo: (cargoId: string, updates: Partial<CargoUI>) => void
  onCompleteCargo: (cargoId: string) => void
  onClose: () => void
}

export function CargoRegistrationModalBody({
  registeredCargos,
  pendingCargos,
  onAddCargo,
  onRemoveCargo,
  onUpdateCargo,
  onCompleteCargo,
  onClose,
}: CargoRegistrationModalBodyProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
        <p className="text-xs text-slate-600">
          박스 규격, 품목, 중량을 입력하여 화물을 등록합니다.
        </p>
      </div>

      {/* 등록된 화물 목록 */}
      {registeredCargos.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">등록된 화물</div>
          <div className="flex flex-wrap gap-2">
            {registeredCargos.map((cargo, idx) => (
              <CargoSummaryCard
                key={cargo.id}
                cargo={cargo}
                index={idx}
                onRemove={onRemoveCargo}
              />
            ))}
          </div>
        </div>
      )}

      {/* 등록 대기 중인 화물 카드 */}
      {pendingCargos.map((cargo, index) => (
        <CargoRegistrationCard
          key={cargo.id}
          cargo={cargo}
          index={registeredCargos.length + index}
          onRemove={onRemoveCargo}
          onChange={onUpdateCargo}
          onComplete={onCompleteCargo}
        />
      ))}

      {/* 화물 추가 버튼 */}
      <button
        onClick={onAddCargo}
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
      >
        + 화물 추가하기
      </button>

      {registeredCargos.length > 0 && pendingCargos.length === 0 && (
        <button
          onClick={onClose}
          className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-lg transition-colors"
        >
          등록을 완료하시겠습니까?
        </button>
      )}
    </div>
  )
}
