// 보관+운송 탭 섹션 - PR3-3 UI 재설계
// 순서 선택 → 화물 등록 → 물량 입력 → 조건 입력 흐름
import type {
  CargoUI,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  ServiceOrder,
} from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import {
  AccordionField,
  CargoRegistrationCard,
  RegisteredCargoCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  OrderSelector,
  ConversionResult,
} from '../ui'

interface BothTabSectionProps {
  expandedField: string | null
  onFieldClick: (fieldId: string) => void

  // 순서 선택
  serviceOrder: ServiceOrder
  onServiceOrderChange: (order: ServiceOrder) => void

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
  transportCondition: TransportCondition
  onUpdateStorageCondition: (updates: Partial<StorageCondition>) => void
  onUpdateTransportCondition: (updates: Partial<TransportCondition>) => void
}

export default function BothTabSection({
  expandedField,
  onFieldClick,
  serviceOrder,
  onServiceOrderChange,
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
  transportCondition,
  onUpdateStorageCondition,
  onUpdateTransportCondition,
}: BothTabSectionProps) {
  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 단계별 완료 여부
  const orderSelected = serviceOrder !== null
  const hasRegisteredCargos = registeredCargos.length > 0
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 자동 지정 로직 (보관 후 운송: 운송날짜 = 보관종료일, 운송 후 보관: 보관시작일 = 운송날짜)
  const getAutoTransportDate = () => {
    if (serviceOrder === 'storage-first' && storageCondition.endDate) {
      return storageCondition.endDate
    }
    return transportCondition.transportDate
  }

  const getAutoStorageStartDate = () => {
    if (serviceOrder === 'transport-first' && transportCondition.transportDate) {
      return transportCondition.transportDate
    }
    return storageCondition.startDate
  }

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
    if (storageCondition.location) parts.push('보관장소')
    if (storageCondition.startDate && storageCondition.endDate) parts.push('보관기간')
    if (transportCondition.origin) parts.push('출발지')
    if (transportCondition.destination) parts.push('도착지')
    return parts.length > 0 ? `${parts.join(', ')} 설정됨` : '조건을 입력해주세요.'
  }

  // 보관 조건 섹션 렌더링
  const renderStorageCondition = () => (
    <div className="space-y-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
      <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
        <span>📦</span> 보관 조건
      </div>

      {/* 보관 장소 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">보관 장소</label>
        <LocationDropdown
          value={storageCondition.location}
          onChange={(location) => onUpdateStorageCondition({ location })}
          placeholder="보관 장소 선택"
        />
      </div>

      {/* 보관 기간 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">보관 기간</label>
        {serviceOrder === 'transport-first' ? (
          // 운송 후 보관: 시작일 자동 지정
          <DatePicker
            mode="range"
            startDate={getAutoStorageStartDate()}
            endDate={storageCondition.endDate}
            locked={!!transportCondition.transportDate}
            lockedLabel={transportCondition.transportDate ? `${transportCondition.transportDate} (운송일 자동 지정)` : undefined}
            onEndDateChange={(date) => onUpdateStorageCondition({ endDate: date })}
          />
        ) : (
          <DatePicker
            mode="range"
            startDate={storageCondition.startDate}
            endDate={storageCondition.endDate}
            onStartDateChange={(date) => onUpdateStorageCondition({ startDate: date })}
            onEndDateChange={(date) => onUpdateStorageCondition({ endDate: date })}
          />
        )}
      </div>
    </div>
  )

  // 운송 조건 섹션 렌더링
  const renderTransportCondition = () => (
    <div className="space-y-4 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
      <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
        <span>🚚</span> 운송 조건
      </div>

      {/* 출발지 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">출발지</label>
        <LocationDropdown
          value={transportCondition.origin}
          onChange={(origin) => onUpdateTransportCondition({ origin })}
          placeholder="출발지 선택"
          locked={serviceOrder === 'storage-first' && !!storageCondition.location}
          lockedValue={serviceOrder === 'storage-first' && storageCondition.location ? '보관장소 (자동 지정)' : undefined}
        />
      </div>

      {/* 도착지 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">도착지</label>
        <LocationDropdown
          value={transportCondition.destination}
          onChange={(destination) => onUpdateTransportCondition({ destination })}
          placeholder="도착지 선택"
          locked={serviceOrder === 'transport-first' && !!storageCondition.location}
          lockedValue={serviceOrder === 'transport-first' && storageCondition.location ? '보관장소 (자동 지정)' : undefined}
        />
      </div>

      {/* 운송 날짜 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">운송 날짜</label>
        {serviceOrder === 'storage-first' ? (
          // 보관 후 운송: 날짜 자동 지정
          <DatePicker
            mode="single"
            date={getAutoTransportDate()}
            locked={!!storageCondition.endDate}
            lockedLabel={storageCondition.endDate ? `${storageCondition.endDate} (보관종료일 자동 지정)` : undefined}
          />
        ) : (
          <DatePicker
            mode="single"
            date={transportCondition.transportDate}
            onDateChange={(date) => onUpdateTransportCondition({ transportDate: date })}
          />
        )}
      </div>
    </div>
  )

  // 순서 선택 전: 순서 선택 UI만 표시
  if (!orderSelected) {
    return (
      <div className="space-y-4">
        <OrderSelector
          value={serviceOrder}
          onChange={(order) => {
            onServiceOrderChange(order)
            // 순서 선택 시 화물 등록 아코디언으로 이동
            if (order) {
              onFieldClick('cargo-registration')
            }
          }}
        />
      </div>
    )
  }

  // 순서 선택 후: 화물 등록부터 입력란 표시
  return (
    <>
      {/* 선택된 순서 표시 */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {serviceOrder === 'storage-first' ? '📦 → 🚚' : '🚚 → 📦'}
            </span>
            <span className="text-sm font-semibold text-purple-700">
              {serviceOrder === 'storage-first' ? '보관 후 운송' : '운송 후 보관'}
            </span>
          </div>
          <button
            onClick={() => onServiceOrderChange(null)}
            className="text-xs text-purple-600 hover:text-purple-800"
          >
            변경
          </button>
        </div>
      </div>

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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
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
            className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            + 화물 추가하기
          </button>

          {/* 다음 단계로 버튼 */}
          {hasRegisteredCargos && pendingCargos.length === 0 && (
            <button
              onClick={() => onFieldClick('quantity-input')}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors"
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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
              등록된 화물별 수량을 입력하면 필요한 파렛트/큐브 수가 자동으로 계산됩니다.
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

      {/* 3. 조건 입력 (순서에 따라 배치) */}
      <AccordionField
        id="condition-input"
        label="보관+운송 조건"
        placeholder="보관과 운송 조건을 입력해주세요."
        expanded={expandedField === 'condition-input'}
        onToggle={() => allQuantitiesEntered && onFieldClick('condition-input')}
        summary={getConditionSummary()}
      >
        <div className="space-y-4">
          {/* 안내 문구 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
              {serviceOrder === 'storage-first'
                ? '보관 조건을 먼저 입력하면 운송 날짜가 자동 지정됩니다.'
                : '운송 조건을 먼저 입력하면 보관 시작일이 자동 지정됩니다.'}
            </p>
          </div>

          {/* 순서에 따라 조건 섹션 배치 */}
          {serviceOrder === 'storage-first' ? (
            <>
              {renderStorageCondition()}
              {renderTransportCondition()}
            </>
          ) : (
            <>
              {renderTransportCondition()}
              {renderStorageCondition()}
            </>
          )}
        </div>
      </AccordionField>
    </>
  )
}
