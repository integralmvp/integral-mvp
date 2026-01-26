// 보관 탭 섹션 - PR3-3 UI 재설계
// 화물 등록 → 물량 입력 → 조건 입력 흐름
import type { CargoUI, RegisteredCargo, StorageCondition } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import {
  AccordionField,
  CargoRegistrationCard,
  RegisteredCargoCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  ConversionResult,
} from '../ui'

interface StorageTabSectionProps {
  expandedField: string | null
  onFieldClick: (fieldId: string) => void

  // 화물 등록
  cargos: CargoUI[]
  registeredCargos: RegisteredCargo[]
  onAddCargo: () => void
  onRemoveCargo: (cargoId: string) => void
  onUpdateCargo: (cargoId: string, updates: Partial<CargoUI>) => void
  onCompleteCargo: (cargoId: string) => void

  // 물량 입력
  onUpdateQuantity: (cargoId: string, quantity: number, estimatedCubes: number) => void
  onConfirmQuantity: () => void
  totalCubes: number
  totalPallets: number
  demandResult: DemandResult | null

  // 조건 입력
  storageCondition: StorageCondition
  onUpdateCondition: (updates: Partial<StorageCondition>) => void
}

export default function StorageTabSection({
  expandedField,
  onFieldClick,
  cargos,
  registeredCargos,
  onAddCargo,
  onRemoveCargo,
  onUpdateCargo,
  onCompleteCargo,
  onUpdateQuantity,
  onConfirmQuantity,
  totalCubes,
  totalPallets,
  demandResult,
  storageCondition,
  onUpdateCondition,
}: StorageTabSectionProps) {
  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 화물 등록 완료 여부
  const hasRegisteredCargos = registeredCargos.length > 0

  // 물량 입력 완료 여부
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 요약 문구 생성
  const getCargoSummary = () => {
    if (registeredCargos.length === 0) return '화물 정보를 등록해주세요.'
    return `${registeredCargos.length}건의 화물이 등록됨`
  }

  const getQuantitySummary = () => {
    if (!hasRegisteredCargos) return '화물을 먼저 등록해주세요.'
    if (!allQuantitiesEntered) return '화물별 수량을 입력해주세요.'
    return `총 ${totalPallets} 파렛트 (${totalCubes} 큐브)`
  }

  const getConditionSummary = () => {
    if (!allQuantitiesEntered) return '물량을 먼저 입력해주세요.'
    const parts = []
    if (storageCondition.location) parts.push('장소 설정됨')
    if (storageCondition.startDate && storageCondition.endDate) parts.push('기간 설정됨')
    return parts.length > 0 ? parts.join(', ') : '보관 조건을 입력해주세요.'
  }

  return (
    <>
      {/* 1. 화물 등록 */}
      <AccordionField
        id="cargo-registration"
        label="화물 등록"
        placeholder="화물 정보를 입력해주세요."
        expanded={expandedField === 'cargo-registration'}
        onToggle={() => onFieldClick('cargo-registration')}
        summary={getCargoSummary()}
      >
        <div className="space-y-4">
          {/* 안내 문구 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-800">
              박스 규격, 품목, 중량을 입력하여 화물을 등록합니다. 여러 종류의 화물을 등록할 수 있습니다.
            </p>
          </div>

          {/* 등록된 화물 목록 */}
          {registeredCargos.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">등록된 화물</div>
              {registeredCargos.map(cargo => (
                <RegisteredCargoCard key={cargo.id} cargo={cargo} />
              ))}
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
            className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            + 화물 추가하기
          </button>

          {/* 다음 단계로 버튼 */}
          {hasRegisteredCargos && pendingCargos.length === 0 && (
            <button
              onClick={() => onFieldClick('quantity-input')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              물량 입력으로 이동
            </button>
          )}
        </div>
      </AccordionField>

      {/* 2. 물량 입력 */}
      <AccordionField
        id="quantity-input"
        label="물량 입력"
        placeholder="화물별 수량을 입력해주세요."
        expanded={expandedField === 'quantity-input'}
        onToggle={() => hasRegisteredCargos && onFieldClick('quantity-input')}
        summary={getQuantitySummary()}
      >
        <div className="space-y-4">
          {/* 안내 문구 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-800">
              등록된 화물별 수량을 입력하면 필요한 파렛트 수가 자동으로 계산됩니다.
            </p>
          </div>

          {/* 화물별 수량 입력 */}
          {registeredCargos.map(cargo => (
            <QuantityInputCard
              key={cargo.id}
              cargo={cargo}
              onQuantityChange={onUpdateQuantity}
            />
          ))}

          {/* 총 환산 결과 */}
          {allQuantitiesEntered && demandResult && (
            <ConversionResult
              result={demandResult}
              mode="STORAGE"
              onSelectConfirm={onConfirmQuantity}
              isButtonDisabled={!allQuantitiesEntered}
            />
          )}
        </div>
      </AccordionField>

      {/* 3. 조건 입력 */}
      <AccordionField
        id="condition-input"
        label="보관 조건"
        placeholder="보관 장소와 기간을 선택해주세요."
        expanded={expandedField === 'condition-input'}
        onToggle={() => allQuantitiesEntered && onFieldClick('condition-input')}
        summary={getConditionSummary()}
      >
        <div className="space-y-4">
          {/* 안내 문구 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-800">
              보관 장소와 기간을 선택하면 조건에 맞는 상품이 필터링됩니다.
            </p>
          </div>

          {/* 보관 장소 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">보관 장소</label>
            <LocationDropdown
              value={storageCondition.location}
              onChange={(location) => onUpdateCondition({ location })}
              placeholder="보관 장소 선택"
            />
          </div>

          {/* 보관 기간 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">보관 기간</label>
            <DatePicker
              mode="range"
              startDate={storageCondition.startDate}
              endDate={storageCondition.endDate}
              onStartDateChange={(date) => onUpdateCondition({ startDate: date })}
              onEndDateChange={(date) => onUpdateCondition({ endDate: date })}
            />
          </div>
        </div>
      </AccordionField>
    </>
  )
}
