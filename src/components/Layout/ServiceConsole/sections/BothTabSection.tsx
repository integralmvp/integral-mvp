// 보관+운송 탭 섹션 - 3행 그리드 레이아웃 재설계
// 상단: 순서 전환 UI (보관 ↔ 운송) - 순서에 따라 버튼 재정렬
// 동일 영역에서 보관/운송 그리드 전환 렌더링
import { useState, useEffect } from 'react'
import type {
  CargoUI,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  ServiceOrder,
} from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import { JEJU_LOCATIONS } from '../../../../data/mockData'
import {
  GridCell,
  CargoCarousel,
  InputModal,
  CargoRegistrationCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  ConversionResult,
  CargoSummaryCard,
} from '../ui'

interface BothTabSectionProps {
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

// 현재 보고 있는 서비스 타입
type ActiveView = 'storage' | 'transport'

// 모달 타입 정의
type ModalType = 'cargo' | 'quantity' | 'storage-location' | 'storage-date' | 'transport-origin' | 'transport-destination' | 'transport-date' | null

export default function BothTabSection({
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
  totalCubes: _totalCubes,
  totalPallets,
  demandResult,
  storageCondition,
  transportCondition,
  onUpdateStorageCondition,
  onUpdateTransportCondition,
}: BothTabSectionProps) {
  // 기본 순서: 보관 → 운송 (storage-first)
  const effectiveOrder = serviceOrder || 'storage-first'

  // 현재 보고 있는 뷰 (첫 순서에 해당하는 뷰로 시작)
  const [activeView, setActiveView] = useState<ActiveView>(
    effectiveOrder === 'transport-first' ? 'transport' : 'storage'
  )
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 임시 상태
  const [tempStorageLocation, setTempStorageLocation] = useState<string | undefined>(storageCondition.location)
  const [tempStartDate, setTempStartDate] = useState<string | undefined>(storageCondition.startDate)
  const [tempEndDate, setTempEndDate] = useState<string | undefined>(storageCondition.endDate)
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

  // 보관 조건 완료 체크
  const isStorageComplete = !!(
    storageCondition.location &&
    storageCondition.startDate &&
    storageCondition.endDate
  )

  // 운송 조건 완료 체크
  const isTransportComplete = !!(
    transportCondition.origin &&
    transportCondition.destination &&
    transportCondition.transportDate
  )

  // 첫 순서 입력창 완료 시 자동 전환
  useEffect(() => {
    if (effectiveOrder === 'storage-first' && activeView === 'storage' && isStorageComplete) {
      // 보관이 먼저이고 보관 완료 시 → 운송으로 전환
      setActiveView('transport')
    } else if (effectiveOrder === 'transport-first' && activeView === 'transport' && isTransportComplete) {
      // 운송이 먼저이고 운송 완료 시 → 보관으로 전환
      setActiveView('storage')
    }
  }, [effectiveOrder, activeView, isStorageComplete, isTransportComplete])

  // 순서 전환 핸들러 (버튼 순서도 함께 변경)
  const handleOrderSwap = () => {
    const newOrder = effectiveOrder === 'storage-first' ? 'transport-first' : 'storage-first'
    onServiceOrderChange(newOrder)
    // 새 순서의 첫 번째 뷰로 전환
    setActiveView(newOrder === 'storage-first' ? 'storage' : 'transport')
  }

  // 뷰 전환 핸들러 (버튼 클릭)
  const handleViewChange = (view: ActiveView) => {
    setActiveView(view)
  }

  // 자동 지정 날짜 계산
  const getAutoTransportDate = () => {
    if (effectiveOrder === 'storage-first' && storageCondition.endDate) {
      return storageCondition.endDate
    }
    return transportCondition.transportDate
  }

  const getAutoStorageStartDate = () => {
    if (effectiveOrder === 'transport-first' && transportCondition.transportDate) {
      return transportCondition.transportDate
    }
    return storageCondition.startDate
  }

  // 잠금 상태 체크
  const isTransportDateLocked = effectiveOrder === 'storage-first' && !!storageCondition.endDate
  const isStorageStartDateLocked = effectiveOrder === 'transport-first' && !!transportCondition.transportDate

  // 출발지/도착지 토글
  const handleSwapLocations = () => {
    onUpdateTransportCondition({
      origin: transportCondition.destination,
      destination: transportCondition.origin,
    })
  }

  // 모달 열기 (임시 상태 초기화)
  const openModal = (modal: ModalType) => {
    if (modal === 'storage-location') setTempStorageLocation(storageCondition.location)
    if (modal === 'storage-date') {
      setTempStartDate(getAutoStorageStartDate())
      setTempEndDate(storageCondition.endDate)
    }
    if (modal === 'transport-origin') setTempOrigin(transportCondition.origin)
    if (modal === 'transport-destination') setTempDestination(transportCondition.destination)
    if (modal === 'transport-date') setTempTransportDate(getAutoTransportDate())
    setActiveModal(modal)
  }

  // 확정 핸들러들
  const confirmStorageLocation = () => {
    if (tempStorageLocation) onUpdateStorageCondition({ location: tempStorageLocation })
    setActiveModal(null)
  }

  const confirmStorageDate = () => {
    onUpdateStorageCondition({ startDate: tempStartDate, endDate: tempEndDate })
    setActiveModal(null)
  }

  const confirmOrigin = () => {
    if (tempOrigin) onUpdateTransportCondition({ origin: tempOrigin })
    setActiveModal(null)
  }

  const confirmDestination = () => {
    if (tempDestination) onUpdateTransportCondition({ destination: tempDestination })
    setActiveModal(null)
  }

  const confirmTransportDate = () => {
    if (tempTransportDate) onUpdateTransportCondition({ transportDate: tempTransportDate })
    setActiveModal(null)
  }

  // 첫 번째 버튼과 두 번째 버튼 결정 (순서에 따라)
  const firstButton = effectiveOrder === 'storage-first' ? 'storage' : 'transport'
  const secondButton = effectiveOrder === 'storage-first' ? 'transport' : 'storage'

  return (
    <div className="space-y-3">
      {/* 상단: 순서 전환 UI - 순서에 따라 버튼 재정렬 */}
      <div className="flex items-center justify-center gap-2 py-2">
        {/* 첫 번째 버튼 */}
        <button
          onClick={() => handleViewChange(firstButton)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === firstButton
              ? firstButton === 'storage'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {firstButton === 'storage' ? '📦 보관' : '🚚 운송'}
        </button>

        {/* 쌍방 화살표 버튼 */}
        <button
          onClick={handleOrderSwap}
          className="w-10 h-10 flex items-center justify-center text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors"
          title="순서 전환"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* 두 번째 버튼 */}
        <button
          onClick={() => handleViewChange(secondButton)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === secondButton
              ? secondButton === 'storage'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {secondButton === 'storage' ? '📦 보관' : '🚚 운송'}
        </button>
      </div>

      {/* 현재 순서 표시 */}
      <div className="text-center text-xs text-slate-500">
        현재 순서: {effectiveOrder === 'storage-first' ? '보관 → 운송' : '운송 → 보관'}
      </div>

      {/* 1행: 화물 정보 | 물량 정보 (공통) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          emoji="📦"
          colorScheme="purple"
          onClick={() => setActiveModal('cargo')}
          tall
        >
          <CargoCarousel
            cargos={registeredCargos}
            onRemove={onRemoveCargo}
            onAddClick={() => setActiveModal('cargo')}
            colorScheme="purple"
          />
        </GridCell>

        {/* 물량 정보 */}
        <GridCell
          label="물량 정보"
          emoji="📊"
          colorScheme="purple"
          onClick={() => setActiveModal('quantity')}
          disabled={registeredCargos.length === 0}
          tall
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-purple-600">수량 입력하기</span>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {totalPallets}
              </div>
              <div className="text-sm text-slate-500">파레트</div>
            </div>
          )}
        </GridCell>
      </div>

      {/* === 보관 뷰 그리드 === */}
      {activeView === 'storage' && (
        <>
          {/* 2행: 보관 장소 */}
          <GridCell
            label="보관 장소"
            emoji="📍"
            colorScheme="blue"
            onClick={() => openModal('storage-location')}
          >
            {storageCondition.location ? (
              <span className="text-lg">{getLocationName(storageCondition.location)}</span>
            ) : (
              <span className="text-slate-400">장소를 선택해주세요</span>
            )}
          </GridCell>

          {/* 3행: 보관 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <GridCell
              label={isStorageStartDateLocked ? '시작일 🔒' : '시작일'}
              emoji="📅"
              colorScheme="blue"
              onClick={() => !isStorageStartDateLocked && openModal('storage-date')}
              disabled={isStorageStartDateLocked}
            >
              {getAutoStorageStartDate() ? (
                <div className="text-center">
                  <span className="text-lg">{formatDate(getAutoStorageStartDate())}</span>
                  {isStorageStartDateLocked && (
                    <div className="text-[9px] text-blue-500">운송일 자동</div>
                  )}
                </div>
              ) : (
                <span className="text-slate-400">선택</span>
              )}
            </GridCell>
            <GridCell
              label="종료일"
              emoji="📅"
              colorScheme="blue"
              onClick={() => openModal('storage-date')}
            >
              {storageCondition.endDate ? (
                <span className="text-lg">{formatDate(storageCondition.endDate)}</span>
              ) : (
                <span className="text-slate-400">선택</span>
              )}
            </GridCell>
          </div>
        </>
      )}

      {/* === 운송 뷰 그리드 === */}
      {activeView === 'transport' && (
        <>
          {/* 2행: 출발지 ↔ 도착지 */}
          <div className="flex items-stretch gap-2">
            <div className="flex-1">
              <GridCell
                label="출발지"
                emoji="🚚"
                colorScheme="emerald"
                onClick={() => openModal('transport-origin')}
              >
                {transportCondition.origin ? (
                  <span className="text-lg">{getLocationName(transportCondition.origin)}</span>
                ) : (
                  <span className="text-slate-400">선택</span>
                )}
              </GridCell>
            </div>

            <button
              onClick={handleSwapLocations}
              className="flex-shrink-0 w-10 flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              title="출발지/도착지 교환"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>

            <div className="flex-1">
              <GridCell
                label="도착지"
                emoji="📍"
                colorScheme="emerald"
                onClick={() => openModal('transport-destination')}
              >
                {transportCondition.destination ? (
                  <span className="text-lg">{getLocationName(transportCondition.destination)}</span>
                ) : (
                  <span className="text-slate-400">선택</span>
                )}
              </GridCell>
            </div>
          </div>

          {/* 3행: 운송 날짜 */}
          <GridCell
            label={isTransportDateLocked ? '운송 날짜 🔒' : '운송 날짜'}
            emoji="📅"
            colorScheme="emerald"
            onClick={() => !isTransportDateLocked && openModal('transport-date')}
            disabled={isTransportDateLocked}
          >
            {getAutoTransportDate() ? (
              <div className="text-center">
                <span className="text-lg">{formatDate(getAutoTransportDate())}</span>
                {isTransportDateLocked && (
                  <div className="text-[9px] text-emerald-500">보관종료일 자동</div>
                )}
              </div>
            ) : (
              <span className="text-slate-400">날짜를 선택해주세요</span>
            )}
          </GridCell>
        </>
      )}

      {/* === 모달들 === */}

      {/* 화물 등록 모달 */}
      <InputModal
        isOpen={activeModal === 'cargo'}
        onClose={() => setActiveModal(null)}
        title="화물 등록"
        colorScheme="purple"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
              박스 규격, 품목, 중량을 입력하여 화물을 등록합니다.
            </p>
          </div>

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

          <button
            onClick={onAddCargo}
            className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors"
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
        colorScheme="purple"
      >
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
            <p className="text-xs text-purple-800">
              등록된 화물별 수량을 입력하면 필요한 파레트/큐브 수가 자동으로 계산됩니다.
            </p>
          </div>

          {registeredCargos.map(cargo => (
            <QuantityInputCard
              key={cargo.id}
              cargo={cargo}
              onQuantityChange={onUpdateQuantity}
            />
          ))}

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

      {/* 보관 장소 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'storage-location'}
        onClose={() => setActiveModal(null)}
        title="보관 장소 선택"
        colorScheme="blue"
      >
        <div className="space-y-4">
          <LocationDropdown
            value={tempStorageLocation}
            onChange={setTempStorageLocation}
            placeholder="보관 장소 선택"
          />

          {tempStorageLocation && (
            <button
              onClick={confirmStorageLocation}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>

      {/* 보관 기간 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'storage-date'}
        onClose={() => setActiveModal(null)}
        title="보관 기간 선택"
        colorScheme="blue"
      >
        <div className="space-y-4">
          {isStorageStartDateLocked && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-800">
                🔒 시작일은 운송 날짜로 자동 설정됩니다.
              </p>
            </div>
          )}
          <DatePicker
            mode="range"
            startDate={tempStartDate}
            endDate={tempEndDate}
            locked={isStorageStartDateLocked}
            lockedLabel={isStorageStartDateLocked ? `${formatDate(tempStartDate)} (운송일)` : undefined}
            onStartDateChange={(d) => !isStorageStartDateLocked && setTempStartDate(d)}
            onEndDateChange={setTempEndDate}
          />

          {(tempStartDate || tempEndDate) && (
            <button
              onClick={confirmStorageDate}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
            >
              선택하시겠습니까?
            </button>
          )}
        </div>
      </InputModal>

      {/* 출발지 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'transport-origin'}
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
        isOpen={activeModal === 'transport-destination'}
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

      {/* 운송 날짜 선택 모달 */}
      <InputModal
        isOpen={activeModal === 'transport-date'}
        onClose={() => setActiveModal(null)}
        title="운송 날짜 선택"
        colorScheme="emerald"
      >
        <div className="space-y-4">
          {isTransportDateLocked ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-800">
                🔒 운송 날짜는 보관 종료일로 자동 설정됩니다.
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {formatDate(getAutoTransportDate())}
              </p>
            </div>
          ) : (
            <>
              <DatePicker
                mode="single"
                date={tempTransportDate}
                onDateChange={setTempTransportDate}
              />

              {tempTransportDate && (
                <button
                  onClick={confirmTransportDate}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  선택하시겠습니까?
                </button>
              )}
            </>
          )}
        </div>
      </InputModal>
    </div>
  )
}
