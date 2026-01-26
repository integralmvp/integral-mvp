// 운송 탭 섹션 - 3행 그리드 레이아웃 재설계
// 1행: 화물 정보 | 물량 정보
// 2행: 출발지 ↔ 도착지
// 3행: 운송 날짜
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, TransportCondition } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import {
  GridCell,
  CargoSummaryCard,
  InputModal,
  CargoRegistrationCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  ConversionResult,
} from '../ui'

interface TransportTabSectionProps {
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
  transportCondition: TransportCondition
  onUpdateCondition: (updates: Partial<TransportCondition>) => void
}

// 모달 타입 정의
type ModalType = 'cargo' | 'quantity' | 'origin' | 'destination' | 'date' | null

export default function TransportTabSection({
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
  transportCondition,
  onUpdateCondition,
}: TransportTabSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [showAllCargos, setShowAllCargos] = useState(false)

  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 물량 입력 완료 여부
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 화물 표시 (기본 2개, 확장 시 전체)
  const visibleCargos = showAllCargos ? registeredCargos : registeredCargos.slice(0, 2)
  const hiddenCargoCount = registeredCargos.length - 2

  // 날짜 포맷
  const formatDate = (date?: string) => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  // 출발지/도착지 토글
  const handleSwapLocations = () => {
    onUpdateCondition({
      origin: transportCondition.destination,
      destination: transportCondition.origin,
    })
  }

  return (
    <div className="space-y-3">
      {/* 1행: 화물 정보 | 물량 정보 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          colorScheme="emerald"
          onClick={() => setActiveModal('cargo')}
        >
          {registeredCargos.length === 0 ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <span className="text-lg">+</span>
              <span>화물 추가</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {visibleCargos.map((cargo, idx) => (
                <CargoSummaryCard
                  key={cargo.id}
                  cargo={cargo}
                  index={idx}
                  onRemove={onRemoveCargo}
                  compact
                />
              ))}
              {hiddenCargoCount > 0 && !showAllCargos && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllCargos(true)
                  }}
                  className="w-full py-1 text-[10px] text-emerald-600 hover:text-emerald-800"
                >
                  화물 {hiddenCargoCount}개 더 보기 ▾
                </button>
              )}
              {showAllCargos && hiddenCargoCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllCargos(false)
                  }}
                  className="w-full py-1 text-[10px] text-emerald-600 hover:text-emerald-800"
                >
                  접기 ▴
                </button>
              )}
            </div>
          )}
        </GridCell>

        {/* 물량 정보 */}
        <GridCell
          label="물량 정보"
          colorScheme="emerald"
          onClick={() => setActiveModal('quantity')}
          disabled={registeredCargos.length === 0}
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400 text-xs">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-emerald-600 text-xs">수량 입력하기</span>
          ) : (
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-slate-800">
                {totalCubes} <span className="text-xs font-normal text-slate-500">Cube</span>
              </div>
              <div className="text-xs text-slate-500">
                {totalPallets} Pallet
              </div>
            </div>
          )}
        </GridCell>
      </div>

      {/* 2행: 출발지 ↔ 도착지 */}
      <div className="flex items-stretch gap-2">
        {/* 출발지 */}
        <div className="flex-1">
          <GridCell
            label="출발지"
            colorScheme="emerald"
            onClick={() => setActiveModal('origin')}
          >
            {transportCondition.origin ? (
              <span className="text-slate-800">{transportCondition.origin}</span>
            ) : (
              <span className="text-slate-400">선택</span>
            )}
          </GridCell>
        </div>

        {/* 양방향 화살표 버튼 */}
        <button
          onClick={handleSwapLocations}
          className="flex-shrink-0 w-10 flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          title="출발지/도착지 교환"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* 도착지 */}
        <div className="flex-1">
          <GridCell
            label="도착지"
            colorScheme="emerald"
            onClick={() => setActiveModal('destination')}
          >
            {transportCondition.destination ? (
              <span className="text-slate-800">{transportCondition.destination}</span>
            ) : (
              <span className="text-slate-400">선택</span>
            )}
          </GridCell>
        </div>
      </div>

      {/* 3행: 운송 날짜 */}
      <GridCell
        label="운송 날짜"
        colorScheme="emerald"
        onClick={() => setActiveModal('date')}
      >
        {transportCondition.transportDate ? (
          <span className="text-slate-800">{formatDate(transportCondition.transportDate)}</span>
        ) : (
          <span className="text-slate-400">날짜를 선택해주세요</span>
        )}
      </GridCell>

      {/* === 모달들 === */}

      {/* 화물 등록 모달 */}
      <InputModal
        isOpen={activeModal === 'cargo'}
        onClose={() => setActiveModal(null)}
        title="화물 등록"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
            <p className="text-xs text-emerald-800">
              박스 규격, 품목, 중량을 입력하여 화물을 등록합니다.
            </p>
          </div>

          {/* 등록된 화물 목록 */}
          {registeredCargos.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">등록된 화물</div>
              {registeredCargos.map((cargo, idx) => (
                <CargoSummaryCard
                  key={cargo.id}
                  cargo={cargo}
                  index={idx}
                  onRemove={onRemoveCargo}
                />
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
            className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            + 화물 추가하기
          </button>
        </div>
      </InputModal>

      {/* 물량 입력 모달 */}
      <InputModal
        isOpen={activeModal === 'quantity'}
        onClose={() => setActiveModal(null)}
        title="물량 입력"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
            <p className="text-xs text-emerald-800">
              등록된 화물별 수량을 입력하면 필요한 큐브 수가 자동으로 계산됩니다.
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
              mode="ROUTE"
              onSelectConfirm={() => {
                onConfirmQuantity()
                setActiveModal(null)
              }}
              isButtonDisabled={!allQuantitiesEntered}
            />
          )}
        </div>
      </InputModal>

      {/* 출발지 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'origin'}
        onClose={() => setActiveModal(null)}
        title="출발지 선택"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <LocationDropdown
            value={transportCondition.origin}
            onChange={(origin) => {
              onUpdateCondition({ origin })
              setActiveModal(null)
            }}
            placeholder="출발지 선택"
          />
        </div>
      </InputModal>

      {/* 도착지 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'destination'}
        onClose={() => setActiveModal(null)}
        title="도착지 선택"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <LocationDropdown
            value={transportCondition.destination}
            onChange={(destination) => {
              onUpdateCondition({ destination })
              setActiveModal(null)
            }}
            placeholder="도착지 선택"
          />
        </div>
      </InputModal>

      {/* 날짜 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'date'}
        onClose={() => setActiveModal(null)}
        title="운송 날짜 선택"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <DatePicker
            mode="single"
            date={transportCondition.transportDate}
            onDateChange={(date) => {
              onUpdateCondition({ transportDate: date })
              setActiveModal(null)
            }}
          />
        </div>
      </InputModal>
    </div>
  )
}
