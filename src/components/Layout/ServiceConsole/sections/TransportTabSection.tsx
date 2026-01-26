// 운송 탭 섹션 - 3행 그리드 레이아웃 재설계
// 1행: 화물 정보 | 물량 정보
// 2행: 출발지 ↔ 도착지
// 3행: 운송 날짜
import { useState } from 'react'
import type { CargoUI, RegisteredCargo, TransportCondition } from '../../../../types/models'
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
  totalPallets: _totalPallets,
  demandResult,
  transportCondition,
  onUpdateCondition,
}: TransportTabSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 임시 상태
  const [tempOrigin, setTempOrigin] = useState<string | undefined>(transportCondition.origin)
  const [tempDestination, setTempDestination] = useState<string | undefined>(transportCondition.destination)
  const [tempTransportDate, setTempTransportDate] = useState<string | undefined>(transportCondition.transportDate)

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
    if (modal === 'origin') {
      setTempOrigin(transportCondition.origin)
    } else if (modal === 'destination') {
      setTempDestination(transportCondition.destination)
    } else if (modal === 'date') {
      setTempTransportDate(transportCondition.transportDate)
    }
    setActiveModal(modal)
  }

  // 출발지 선택 확정
  const confirmOrigin = () => {
    if (tempOrigin) {
      onUpdateCondition({ origin: tempOrigin })
    }
    setActiveModal(null)
  }

  // 도착지 선택 확정
  const confirmDestination = () => {
    if (tempDestination) {
      onUpdateCondition({ destination: tempDestination })
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

  // 출발지/도착지 토글
  const handleSwapLocations = () => {
    onUpdateCondition({
      origin: transportCondition.destination,
      destination: transportCondition.origin,
    })
  }

  return (
    <div className="space-y-2">
      {/* 1행: 화물 정보 | 물량 정보 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          emoji="📦"
          colorScheme="emerald"
          onClick={() => openModal('cargo')}
          tall
          headerAction={
            <CargoAddButton
              onClick={() => openModal('cargo')}
              colorScheme="emerald"
            />
          }
        >
          <CargoCarousel
            cargos={registeredCargos}
            onRemove={onRemoveCargo}
            colorScheme="emerald"
          />
        </GridCell>

        {/* 물량 정보 */}
        <GridCell
          label="물량 정보"
          emoji="📊"
          colorScheme="emerald"
          onClick={() => openModal('quantity')}
          disabled={registeredCargos.length === 0}
          tall
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400 text-xs">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-emerald-600 text-xs">수량 입력하기</span>
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
      <div className="flex items-center gap-1">
        {/* 출발지 */}
        <div className="flex-1">
          <GridCell
            label="출발지"
            emoji="🚚"
            colorScheme="emerald"
            onClick={() => openModal('origin')}
          >
            {transportCondition.origin ? (
              <span className="text-sm">{getLocationName(transportCondition.origin)}</span>
            ) : (
              <span className="text-slate-400 text-xs">선택</span>
            )}
          </GridCell>
        </div>

        {/* 양방향 화살표 버튼 */}
        <button
          onClick={handleSwapLocations}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          title="출발지/도착지 교환"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* 도착지 */}
        <div className="flex-1">
          <GridCell
            label="도착지"
            emoji="📍"
            colorScheme="emerald"
            onClick={() => openModal('destination')}
          >
            {transportCondition.destination ? (
              <span className="text-sm">{getLocationName(transportCondition.destination)}</span>
            ) : (
              <span className="text-slate-400 text-xs">선택</span>
            )}
          </GridCell>
        </div>
      </div>

      {/* 3행: 운송 날짜 */}
      <GridCell
        label="운송 날짜"
        emoji="📅"
        colorScheme="emerald"
        onClick={() => openModal('date')}
      >
        {transportCondition.transportDate ? (
          <span className="text-sm">{formatDate(transportCondition.transportDate)}</span>
        ) : (
          <span className="text-slate-400 text-xs">날짜를 선택해주세요</span>
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
            value={tempOrigin}
            onChange={setTempOrigin}
            placeholder="출발지 선택"
          />

          {tempOrigin && (
            <button
              onClick={confirmOrigin}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
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
            value={tempDestination}
            onChange={setTempDestination}
            placeholder="도착지 선택"
          />

          {tempDestination && (
            <button
              onClick={confirmDestination}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
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
        title="운송 날짜 선택"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          <DatePicker
            mode="single"
            date={tempTransportDate}
            onDateChange={setTempTransportDate}
          />

          {tempTransportDate && (
            <button
              onClick={confirmDate}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>
    </div>
  )
}
