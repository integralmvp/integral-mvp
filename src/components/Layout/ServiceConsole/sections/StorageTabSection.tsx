// 보관 탭 섹션 - 3행 그리드 레이아웃 (1.35fr/1fr/1fr)
// 1행: 화물 정보 | 물량 정보
// 2행: 보관 장소
// 3행: 보관 기간 (시작일 | 종료일)
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, StorageCondition } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import { JEJU_LOCATIONS } from '../../../../data/mockData'
import {
  GridCell,
  CargoCarousel,
  CargoAddButton,
  InputModal,
  CargoRegistrationCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  ConversionResult,
  CargoSummaryCard,
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
  totalCubes: _totalCubes,
  totalPallets,
  demandResult,
  storageCondition,
  onUpdateCondition,
}: StorageTabSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 임시 상태 (모달에서 "선택하시겠습니까?" 버튼 누르기 전까지)
  const [tempLocation, setTempLocation] = useState<string | undefined>(storageCondition.location)
  const [tempStartDate, setTempStartDate] = useState<string | undefined>(storageCondition.startDate)
  const [tempEndDate, setTempEndDate] = useState<string | undefined>(storageCondition.endDate)

  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 물량 입력 완료 여부
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 날짜 포맷
  const formatDate = (date?: string) => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  // 장소명 가져오기
  const getLocationName = (locationId?: string) => {
    if (!locationId) return null
    const loc = JEJU_LOCATIONS.find(l => l.id === locationId)
    return loc?.name || locationId
  }

  // 모달 열기 (임시 상태 초기화)
  const openModal = (modal: ModalType) => {
    if (modal === 'location') {
      setTempLocation(storageCondition.location)
    } else if (modal === 'date') {
      setTempStartDate(storageCondition.startDate)
      setTempEndDate(storageCondition.endDate)
    }
    setActiveModal(modal)
  }

  // 장소 선택 확정
  const confirmLocation = () => {
    if (tempLocation) {
      onUpdateCondition({ location: tempLocation })
    }
    setActiveModal(null)
  }

  // 날짜 선택 확정
  const confirmDate = () => {
    onUpdateCondition({ startDate: tempStartDate, endDate: tempEndDate })
    setActiveModal(null)
  }

  return (
    <div className="grid grid-rows-[1.35fr_1fr_1fr] gap-3 h-full">
      {/* 1행: 화물 정보 | 물량 정보 */}
      <div className="grid grid-cols-2 gap-2 min-h-0">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          icon="cargo"
          onClick={() => openModal('cargo')}
          headerAction={
            <CargoAddButton onClick={() => openModal('cargo')} />
          }
        >
          <CargoCarousel
            cargos={registeredCargos}
            onRemove={onRemoveCargo}
          />
        </GridCell>

        {/* 물량 정보 */}
        <GridCell
          label="물량 정보"
          icon="volume"
          onClick={() => openModal('quantity')}
          disabled={registeredCargos.length === 0}
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400 text-xs">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-slate-500 text-xs">수량 입력하기</span>
          ) : (
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">
                {totalPallets}
              </div>
              <div className="text-xs text-slate-500">파레트</div>
            </div>
          )}
        </GridCell>
      </div>

      {/* 2행: 보관 장소 */}
      <div className="min-h-0">
        <GridCell
          label="보관 장소"
          icon="location"
          onClick={() => openModal('location')}
        >
          {storageCondition.location ? (
            <span className="text-sm font-medium">{getLocationName(storageCondition.location)}</span>
          ) : (
            <span className="text-slate-400 text-xs">장소를 선택해주세요</span>
          )}
        </GridCell>
      </div>

      {/* 3행: 보관 기간 */}
      <div className="grid grid-cols-2 gap-2 min-h-0">
        <GridCell
          label="시작일"
          icon="calendar"
          onClick={() => openModal('date')}
        >
          {storageCondition.startDate ? (
            <span className="text-sm font-medium">{formatDate(storageCondition.startDate)}</span>
          ) : (
            <span className="text-slate-400 text-xs">선택</span>
          )}
        </GridCell>
        <GridCell
          label="종료일"
          icon="calendar"
          onClick={() => openModal('date')}
        >
          {storageCondition.endDate ? (
            <span className="text-sm font-medium">{formatDate(storageCondition.endDate)}</span>
          ) : (
            <span className="text-slate-400 text-xs">선택</span>
          )}
        </GridCell>
      </div>

      {/* === 모달들 === */}

      {/* 화물 등록 모달 */}
      <InputModal
        isOpen={activeModal === 'cargo'}
        onClose={() => setActiveModal(null)}
        title="화물 등록"
      >
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
              onClick={() => setActiveModal(null)}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
            >
              등록을 완료하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>

      {/* 물량 입력 모달 */}
      <InputModal
        isOpen={activeModal === 'quantity'}
        onClose={() => setActiveModal(null)}
        title="물량 입력"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
            <p className="text-xs text-slate-600">
              등록된 화물별 수량을 입력하면 필요한 파레트 수가 자동으로 계산됩니다.
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
      >
        <div className="space-y-4">
          <LocationDropdown
            value={tempLocation}
            onChange={setTempLocation}
            placeholder="보관 장소 선택"
          />

          {tempLocation && (
            <button
              onClick={confirmLocation}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>

      {/* 날짜 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'date'}
        onClose={() => setActiveModal(null)}
        title="보관 기간 선택"
      >
        <div className="space-y-4">
          <DatePicker
            mode="range"
            startDate={tempStartDate}
            endDate={tempEndDate}
            onStartDateChange={setTempStartDate}
            onEndDateChange={setTempEndDate}
          />

          {(tempStartDate || tempEndDate) && (
            <button
              onClick={confirmDate}
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>
    </div>
  )
}
