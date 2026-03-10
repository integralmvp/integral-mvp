// 보관 탭 섹션 - 3행 그리드 레이아웃 (1.35fr/1fr/1fr)
// 1행: 화물 정보 | 물량 정보
// 2행: 보관 장소
// 3행: 보관 기간 (시작일 | 종료일)
// PR6 일원화: RegionCode 기반 장소 관리
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, StorageCondition } from '../../../../../types/models'
import type { DemandResult } from '../../../../../engine/cube'
import { getRegionByCode } from '../../../../../infra/dataspec/codedata/regions/regionCodesJeju'
import { formatDate, getLocationName } from '../../utils/tabSectionUtils'
import { InputModal } from '../../modals'
import {
  GridCell,
  CargoCarousel,
  CargoAddButton,
  DatePicker,
  ResetButton,
} from '../../ui'
import { CargoRegistrationModalBody } from '../shared/CargoRegistrationModalBody'
import { QuantityInputModalBody } from '../shared/QuantityInputModalBody'
import { LocationSelectionModalBody } from '../shared/LocationSelectionModalBody'

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

  // PR4: 초기화 액션
  onResetQuantities?: () => void
  onResetStorageCondition?: () => void
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
  onResetQuantities,
  onResetStorageCondition,
}: StorageTabSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 임시 상태 (모달에서 "선택하시겠습니까?" 버튼 누르기 전까지)
  // PR6: locationCode(RegionCode) 기반으로 통일
  const [tempLocationCode, setTempLocationCode] = useState<string | undefined>(storageCondition.locationCode)
  const [tempStartDate, setTempStartDate] = useState<string | undefined>(storageCondition.startDate)
  const [tempEndDate, setTempEndDate] = useState<string | undefined>(storageCondition.endDate)

  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 물량 입력 완료 여부
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 모달 열기 (임시 상태 초기화)
  const openModal = (modal: ModalType) => {
    if (modal === 'location') {
      setTempLocationCode(storageCondition.locationCode)
    } else if (modal === 'date') {
      setTempStartDate(storageCondition.startDate)
      setTempEndDate(storageCondition.endDate)
    }
    setActiveModal(modal)
  }

  // 장소 선택 확정 (RegionCode 저장)
  const confirmLocation = () => {
    if (tempLocationCode) {
      const region = getRegionByCode(tempLocationCode)
      const displayName = region ? region.name.split(' ').pop() : tempLocationCode
      // locationCode(필터용)와 location(표시용) 모두 저장
      onUpdateCondition({
        locationCode: tempLocationCode,
        location: displayName,
      })
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
          headerAction={
            <ResetButton
              onClick={() => onResetQuantities?.()}
              disabled={!allQuantitiesEntered}
            />
          }
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
          headerAction={
            <ResetButton
              onClick={() => onResetStorageCondition?.()}
              disabled={!storageCondition.locationCode && !storageCondition.startDate && !storageCondition.endDate}
            />
          }
        >
          {storageCondition.locationCode ? (
            <span className="text-sm font-medium">{getLocationName(storageCondition.locationCode)}</span>
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
        <CargoRegistrationModalBody
          registeredCargos={registeredCargos}
          pendingCargos={pendingCargos}
          onAddCargo={onAddCargo}
          onRemoveCargo={onRemoveCargo}
          onUpdateCargo={onUpdateCargo}
          onCompleteCargo={onCompleteCargo}
          onClose={() => setActiveModal(null)}
        />
      </InputModal>

      {/* 물량 입력 모달 */}
      <InputModal
        isOpen={activeModal === 'quantity'}
        onClose={() => setActiveModal(null)}
        title="물량 입력"
      >
        <QuantityInputModalBody
          registeredCargos={registeredCargos}
          allQuantitiesEntered={allQuantitiesEntered}
          demandResult={demandResult}
          onUpdateQuantity={onUpdateQuantity}
          onConfirmQuantity={onConfirmQuantity}
          onClose={() => setActiveModal(null)}
          mode="STORAGE"
          modeLabel="파레트"
        />
      </InputModal>

      {/* 장소 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'location'}
        onClose={() => setActiveModal(null)}
        title="보관 장소 선택"
      >
        <LocationSelectionModalBody
          value={tempLocationCode}
          onChange={setTempLocationCode}
          placeholder="보관 장소 선택"
          onConfirm={confirmLocation}
        />
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
              className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>
    </div>
  )
}
