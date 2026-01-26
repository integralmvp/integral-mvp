// 보관+운송 탭 섹션 - 3행 그리드 레이아웃 (1.35fr/1fr/1fr)
// 상단: 순서 전환 UI (보관 ↔ 운송) - 순서에 따라 버튼 재정렬
// 동일 영역에서 보관/운송 그리드 전환 렌더링
import { useState, useEffect, useRef } from 'react'
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
  CargoAddButton,
  InputModal,
  CargoRegistrationCard,
  QuantityInputCard,
  LocationDropdown,
  DatePicker,
  ConversionResult,
  CargoSummaryCard,
  ResetButton,
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

  // PR4: 초기화 액션
  onResetQuantities?: () => void
  onResetStorageCondition?: () => void
  onResetTransportCondition?: () => void
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
  onResetQuantities,
  onResetStorageCondition,
  onResetTransportCondition,
}: BothTabSectionProps) {
  // 기본 순서: 보관 → 운송 (storage-first)
  const effectiveOrder = serviceOrder || 'storage-first'

  // 현재 보고 있는 뷰 (첫 순서에 해당하는 뷰로 시작)
  const [activeView, setActiveView] = useState<ActiveView>(
    effectiveOrder === 'transport-first' ? 'transport' : 'storage'
  )
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 자동 전환 완료 여부 추적 (한 번만 자동 전환)
  const hasAutoSwitched = useRef(false)

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

  // 첫 순서 입력창 완료 시 자동 전환 (한 번만)
  useEffect(() => {
    if (hasAutoSwitched.current) return

    if (effectiveOrder === 'storage-first' && activeView === 'storage' && isStorageComplete) {
      setActiveView('transport')
      hasAutoSwitched.current = true
    } else if (effectiveOrder === 'transport-first' && activeView === 'transport' && isTransportComplete) {
      setActiveView('storage')
      hasAutoSwitched.current = true
    }
  }, [effectiveOrder, activeView, isStorageComplete, isTransportComplete])

  // 순서 전환 핸들러 (버튼 순서도 함께 변경)
  const handleOrderSwap = () => {
    const newOrder = effectiveOrder === 'storage-first' ? 'transport-first' : 'storage-first'
    onServiceOrderChange(newOrder)
    setActiveView(newOrder === 'storage-first' ? 'storage' : 'transport')
    hasAutoSwitched.current = false // 순서 변경 시 자동 전환 리셋
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
    <div className="flex flex-col h-full">
      {/* 상단: 순서 전환 UI - 순서에 따라 버튼 재정렬 */}
      <div className="flex items-center justify-center gap-2 py-1.5 -mt-3 flex-shrink-0">
        {/* 첫 번째 버튼 */}
        <button
          onClick={() => handleViewChange(firstButton)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === firstButton
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {firstButton === 'storage' ? '보관' : '운송'}
        </button>

        {/* 쌍방 화살표 버튼 */}
        <button
          onClick={handleOrderSwap}
          className="w-7 h-7 flex items-center justify-center text-blue-900 hover:text-blue-950 hover:bg-blue-50 rounded-full transition-colors"
          title="순서 전환"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        {/* 두 번째 버튼 */}
        <button
          onClick={() => handleViewChange(secondButton)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === secondButton
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {secondButton === 'storage' ? '보관' : '운송'}
        </button>
      </div>

      {/* 그리드 영역 */}
      <div className="grid grid-rows-[1.45fr_1fr_1fr] gap-3 flex-1 min-h-0">
        {/* 1행: 화물 정보 | 물량 정보 (공통) */}
        <div className="grid grid-cols-2 gap-2 min-h-0">
          {/* 화물 정보 */}
          <GridCell
            label="화물 정보"
            icon="cargo"
            onClick={() => setActiveModal('cargo')}
            headerAction={
              <CargoAddButton onClick={() => setActiveModal('cargo')} />
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
            onClick={() => setActiveModal('quantity')}
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

        {/* === 보관 뷰 그리드 === */}
        {activeView === 'storage' && (
          <>
            {/* 2행: 보관 장소 */}
            <div className="min-h-0">
              <GridCell
                label="보관 장소"
                icon="location"
                onClick={() => openModal('storage-location')}
                headerAction={
                  <ResetButton
                    onClick={() => onResetStorageCondition?.()}
                    disabled={!storageCondition.location && !storageCondition.startDate && !storageCondition.endDate}
                  />
                }
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
                label={isStorageStartDateLocked ? '시작일 (자동)' : '시작일'}
                icon="calendar"
                onClick={() => !isStorageStartDateLocked && openModal('storage-date')}
                disabled={isStorageStartDateLocked}
              >
                {getAutoStorageStartDate() ? (
                  <div className="text-center">
                    <span className="text-sm font-medium">{formatDate(getAutoStorageStartDate())}</span>
                    {isStorageStartDateLocked && (
                      <div className="text-[8px] text-slate-500">운송일 연동</div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">선택</span>
                )}
              </GridCell>
              <GridCell
                label="종료일"
                icon="calendar"
                onClick={() => openModal('storage-date')}
              >
                {storageCondition.endDate ? (
                  <span className="text-sm font-medium">{formatDate(storageCondition.endDate)}</span>
                ) : (
                  <span className="text-slate-400 text-xs">선택</span>
                )}
              </GridCell>
            </div>
          </>
        )}

        {/* === 운송 뷰 그리드 === */}
        {activeView === 'transport' && (
          <>
            {/* 2행: 출발지 ↔ 도착지 */}
            <div className="flex items-stretch gap-1 min-h-0">
              <div className="flex-1">
                <GridCell
                  label="출발지"
                  icon="origin"
                  onClick={() => openModal('transport-origin')}
                  headerAction={
                    <ResetButton
                      onClick={() => onResetTransportCondition?.()}
                      disabled={!transportCondition.origin && !transportCondition.destination && !transportCondition.transportDate}
                    />
                  }
                >
                  {transportCondition.origin ? (
                    <span className="text-sm font-medium">{getLocationName(transportCondition.origin)}</span>
                  ) : (
                    <span className="text-slate-400 text-xs">선택</span>
                  )}
                </GridCell>
              </div>

              <button
                onClick={handleSwapLocations}
                className="flex-shrink-0 w-7 flex items-center justify-center text-blue-900 hover:text-blue-950 hover:bg-blue-50 rounded-lg transition-colors"
                title="출발지/도착지 교환"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              <div className="flex-1">
                <GridCell
                  label="도착지"
                  icon="destination"
                  onClick={() => openModal('transport-destination')}
                >
                  {transportCondition.destination ? (
                    <span className="text-sm font-medium">{getLocationName(transportCondition.destination)}</span>
                  ) : (
                    <span className="text-slate-400 text-xs">선택</span>
                  )}
                </GridCell>
              </div>
            </div>

            {/* 3행: 운송 날짜 */}
            <div className="min-h-0">
              <GridCell
                label={isTransportDateLocked ? '운송 날짜 (자동)' : '운송 날짜'}
                icon="calendar"
                onClick={() => !isTransportDateLocked && openModal('transport-date')}
                disabled={isTransportDateLocked}
              >
                {getAutoTransportDate() ? (
                  <div className="text-center">
                    <span className="text-sm font-medium">{formatDate(getAutoTransportDate())}</span>
                    {isTransportDateLocked && (
                      <div className="text-[8px] text-slate-500">보관종료일 연동</div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">날짜를 선택해주세요</span>
                )}
              </GridCell>
            </div>
          </>
        )}
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
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
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
      >
        <div className="space-y-4">
          {isStorageStartDateLocked && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
              <p className="text-xs text-slate-600">
                시작일은 운송 날짜로 자동 설정됩니다.
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
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
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
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
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
              className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
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
      >
        <div className="space-y-4">
          {isTransportDateLocked ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">
                운송 날짜는 보관 종료일로 자동 설정됩니다.
              </p>
              <p className="text-xs text-slate-500 mt-1">
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
                  className="w-full py-3 bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold rounded-lg transition-colors"
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
