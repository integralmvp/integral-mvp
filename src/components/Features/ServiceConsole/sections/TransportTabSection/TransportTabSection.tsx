// 운송 탭 섹션 - 3행 그리드 레이아웃 (1.35fr/1fr/1fr)
// 1행: 화물 정보 | 물량 정보
// 2행: 출발지 ↔ 도착지
// 3행: 운송 날짜
// PR6 일원화: RegionCode 기반 장소 관리
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, TransportCondition } from '../../../../../types/models'
import type { DemandResult } from '../../../../../engine/cube'
import { getRegionByCode } from '../../../../../infra/dataspec/codedata/regions/regionCodesJeju'
import { formatDate } from '../../utils/tabSectionUtils'
import { InputModal } from '../../modals'
import {
  GridCell,
  CargoCarousel,
  CargoAddButton,
  ResetButton,
} from '../../ui'
import { CargoRegistrationModalBody } from '../shared/CargoRegistrationModalBody'
import { QuantityInputModalBody } from '../shared/QuantityInputModalBody'
import { LocationSelectionModalBody } from '../shared/LocationSelectionModalBody'
import { TransportLocationRow } from '../shared/TransportLocationRow'
import { SingleDatePickerModalBody } from '../shared/SingleDatePickerModalBody'

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

  // PR4: 초기화 액션
  onResetQuantities?: () => void
  onResetTransportCondition?: () => void
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
  totalPallets: _totalPallets,
  demandResult,
  transportCondition,
  onUpdateCondition,
  onResetQuantities,
  onResetTransportCondition,
}: TransportTabSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 임시 상태 (PR6: RegionCode 기반으로 통일)
  const [tempOriginCode, setTempOriginCode] = useState<string | undefined>(transportCondition.originCode)
  const [tempDestinationCode, setTempDestinationCode] = useState<string | undefined>(transportCondition.destinationCode)
  const [tempTransportDate, setTempTransportDate] = useState<string | undefined>(transportCondition.transportDate)

  // 등록 대기 중인 화물 (미완료)
  const pendingCargos = cargos.filter(c => !c.completed)

  // 물량 입력 완료 여부
  const allQuantitiesEntered = registeredCargos.length > 0 &&
    registeredCargos.every(c => c.quantity !== undefined && c.quantity > 0)

  // 모달 열기 (임시 상태 초기화)
  const openModal = (modal: ModalType) => {
    if (modal === 'origin') {
      setTempOriginCode(transportCondition.originCode)
    } else if (modal === 'destination') {
      setTempDestinationCode(transportCondition.destinationCode)
    } else if (modal === 'date') {
      setTempTransportDate(transportCondition.transportDate)
    }
    setActiveModal(modal)
  }

  // 출발지 선택 확정 (RegionCode 저장)
  const confirmOrigin = () => {
    if (tempOriginCode) {
      const region = getRegionByCode(tempOriginCode)
      const displayName = region ? region.name.split(' ').pop() : tempOriginCode
      // originCode(필터용)와 origin(표시용) 모두 저장
      onUpdateCondition({
        originCode: tempOriginCode,
        origin: displayName,
      })
    }
    setActiveModal(null)
  }

  // 도착지 선택 확정 (RegionCode 저장)
  const confirmDestination = () => {
    if (tempDestinationCode) {
      const region = getRegionByCode(tempDestinationCode)
      const displayName = region ? region.name.split(' ').pop() : tempDestinationCode
      // destinationCode(필터용)와 destination(표시용) 모두 저장
      onUpdateCondition({
        destinationCode: tempDestinationCode,
        destination: displayName,
      })
    }
    setActiveModal(null)
  }

  // 날짜 선택 확정
  const confirmDate = () => {
    if (tempTransportDate) {
      onUpdateCondition({ transportDate: tempTransportDate })
    }
    setActiveModal(null)
  }

  // 출발지/도착지 토글 (코드와 표시명 모두 교환)
  const handleSwapLocations = () => {
    onUpdateCondition({
      originCode: transportCondition.destinationCode,
      origin: transportCondition.destination,
      destinationCode: transportCondition.originCode,
      destination: transportCondition.origin,
    })
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
                {totalCubes}
              </div>
              <div className="text-xs text-slate-500">큐브</div>
            </div>
          )}
        </GridCell>
      </div>

      {/* 2행: 출발지 ↔ 도착지 */}
      <TransportLocationRow
        transportCondition={transportCondition}
        onOpenOrigin={() => openModal('origin')}
        onOpenDestination={() => openModal('destination')}
        onSwap={handleSwapLocations}
        onResetTransportCondition={onResetTransportCondition}
      />

      {/* 3행: 운송 날짜 */}
      <div className="min-h-0">
        <GridCell
          label="운송 날짜"
          icon="calendar"
          onClick={() => openModal('date')}
        >
          {transportCondition.transportDate ? (
            <span className="text-sm font-medium">{formatDate(transportCondition.transportDate)}</span>
          ) : (
            <span className="text-slate-400 text-xs">날짜를 선택해주세요</span>
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
          mode="ROUTE"
          modeLabel="큐브"
        />
      </InputModal>

      {/* 출발지 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'origin'}
        onClose={() => setActiveModal(null)}
        title="출발지 선택"
      >
        <LocationSelectionModalBody
          value={tempOriginCode}
          onChange={setTempOriginCode}
          placeholder="출발지 선택"
          onConfirm={confirmOrigin}
        />
      </InputModal>

      {/* 도착지 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'destination'}
        onClose={() => setActiveModal(null)}
        title="도착지 선택"
      >
        <LocationSelectionModalBody
          value={tempDestinationCode}
          onChange={setTempDestinationCode}
          placeholder="도착지 선택"
          onConfirm={confirmDestination}
        />
      </InputModal>

      {/* 날짜 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'date'}
        onClose={() => setActiveModal(null)}
        title="운송 날짜 선택"
      >
        <SingleDatePickerModalBody
          date={tempTransportDate}
          onDateChange={setTempTransportDate}
          onConfirm={confirmDate}
        />
      </InputModal>
    </div>
  )
}
