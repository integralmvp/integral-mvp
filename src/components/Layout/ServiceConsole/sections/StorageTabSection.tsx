// 보관 탭 섹션 - 3행 그리드 레이아웃 재설계
// 1행: 화물 정보 | 물량 정보
// 2행: 보관 장소
// 3행: 보관 기간 (시작일 | 종료일)
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, StorageCondition } from '../../../../types/models'
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

interface StorageTabSectionProps {
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

// 모달 타입 정의
type ModalType = 'cargo' | 'quantity' | 'location' | 'date' | null

export default function StorageTabSection({
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

  return (
    <div className="space-y-3">
      {/* 1행: 화물 정보 | 물량 정보 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          colorScheme="blue"
          onClick={() => setActiveModal('cargo')}
        >
          {registeredCargos.length === 0 ? (
            <div className="flex items-center gap-1 text-blue-600">
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
                  className="w-full py-1 text-[10px] text-blue-600 hover:text-blue-800"
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
                  className="w-full py-1 text-[10px] text-blue-600 hover:text-blue-800"
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
          colorScheme="blue"
          onClick={() => setActiveModal('quantity')}
          disabled={registeredCargos.length === 0}
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400 text-xs">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-blue-600 text-xs">수량 입력하기</span>
          ) : (
            <div className="space-y-0.5">
              <div className="text-lg font-bold text-slate-800">
                {totalPallets} <span className="text-xs font-normal text-slate-500">Pallet</span>
              </div>
              <div className="text-xs text-slate-500">
                {totalCubes} Cube
              </div>
            </div>
          )}
        </GridCell>
      </div>

      {/* 2행: 보관 장소 */}
      <GridCell
        label="보관 장소"
        colorScheme="blue"
        onClick={() => setActiveModal('location')}
      >
        {storageCondition.location ? (
          <span className="text-slate-800">{storageCondition.location}</span>
        ) : (
          <span className="text-slate-400">장소를 선택해주세요</span>
        )}
      </GridCell>

      {/* 3행: 보관 기간 */}
      <div className="grid grid-cols-2 gap-3">
        <GridCell
          label="시작일"
          colorScheme="blue"
          onClick={() => setActiveModal('date')}
        >
          {storageCondition.startDate ? (
            <span className="text-slate-800">{formatDate(storageCondition.startDate)}</span>
          ) : (
            <span className="text-slate-400">선택</span>
          )}
        </GridCell>
        <GridCell
          label="종료일"
          colorScheme="blue"
          onClick={() => setActiveModal('date')}
        >
          {storageCondition.endDate ? (
            <span className="text-slate-800">{formatDate(storageCondition.endDate)}</span>
          ) : (
            <span className="text-slate-400">선택</span>
          )}
        </GridCell>
      </div>

      {/* === 모달들 === */}

      {/* 화물 등록 모달 */}
      <InputModal
        isOpen={activeModal === 'cargo'}
        onClose={() => setActiveModal(null)}
        title="화물 등록"
        colorScheme="blue"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-800">
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
            className="w-full py-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
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
        colorScheme="blue"
      >
        <div className="space-y-4">
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
              onSelectConfirm={() => {
                onConfirmQuantity()
                setActiveModal(null)
              }}
              isButtonDisabled={!allQuantitiesEntered}
            />
          )}
        </div>
      </InputModal>

      {/* 장소 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'location'}
        onClose={() => setActiveModal(null)}
        title="보관 장소 선택"
        colorScheme="blue"
      >
        <div className="space-y-4">
          <LocationDropdown
            value={storageCondition.location}
            onChange={(location) => {
              onUpdateCondition({ location })
              setActiveModal(null)
            }}
            placeholder="보관 장소 선택"
          />
        </div>
      </InputModal>

      {/* 날짜 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'date'}
        onClose={() => setActiveModal(null)}
        title="보관 기간 선택"
        colorScheme="blue"
      >
        <div className="space-y-4">
          <DatePicker
            mode="range"
            startDate={storageCondition.startDate}
            endDate={storageCondition.endDate}
            onStartDateChange={(date) => onUpdateCondition({ startDate: date })}
            onEndDateChange={(date) => onUpdateCondition({ endDate: date })}
          />
        </div>
      </InputModal>
    </div>
  )
}
