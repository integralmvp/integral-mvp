// 보관+운송 탭 섹션 - 3행 그리드 레이아웃 재설계
// 상단: 순서 전환 UI (보관 ↔ 운송)
// 동일 영역에서 보관/운송 그리드 전환 렌더링
import { useState } from 'react'
import type {
  CargoUI,
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
  ServiceOrder,
} from '../../../../types/models'
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
  totalCubes,
  totalPallets,
  demandResult,
  storageCondition,
  transportCondition,
  onUpdateStorageCondition,
  onUpdateTransportCondition,
}: BothTabSectionProps) {
  // 현재 보고 있는 서비스 뷰 (보관/운송)
  const [activeView, setActiveView] = useState<ActiveView>(
    serviceOrder === 'transport-first' ? 'transport' : 'storage'
  )
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

  // 순서 전환 핸들러
  const handleOrderSwap = () => {
    if (serviceOrder === 'storage-first') {
      onServiceOrderChange('transport-first')
      setActiveView('transport')
    } else {
      onServiceOrderChange('storage-first')
      setActiveView('storage')
    }
  }

  // 뷰 전환 핸들러
  const handleViewChange = (view: ActiveView) => {
    setActiveView(view)
    // 순서도 함께 업데이트
    if (view === 'storage' && serviceOrder !== 'storage-first') {
      onServiceOrderChange('storage-first')
    } else if (view === 'transport' && serviceOrder !== 'transport-first') {
      onServiceOrderChange('transport-first')
    }
  }

  // 자동 지정 날짜 계산
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

  // 잠금 상태 체크
  const isTransportDateLocked = serviceOrder === 'storage-first' && !!storageCondition.endDate
  const isStorageStartDateLocked = serviceOrder === 'transport-first' && !!transportCondition.transportDate

  // 출발지/도착지 토글
  const handleSwapLocations = () => {
    onUpdateTransportCondition({
      origin: transportCondition.destination,
      destination: transportCondition.origin,
    })
  }

  // 순서 선택 전 UI
  if (!serviceOrder) {
    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="text-sm font-semibold text-purple-800 mb-3">
            서비스 순서를 선택해주세요
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onServiceOrderChange('storage-first')
                setActiveView('storage')
              }}
              className="py-4 px-3 border-2 border-purple-200 rounded-xl bg-white hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <div className="text-lg mb-1">📦 → 🚚</div>
              <div className="text-sm font-semibold text-purple-800">보관 후 운송</div>
            </button>
            <button
              onClick={() => {
                onServiceOrderChange('transport-first')
                setActiveView('transport')
              }}
              className="py-4 px-3 border-2 border-purple-200 rounded-xl bg-white hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <div className="text-lg mb-1">🚚 → 📦</div>
              <div className="text-sm font-semibold text-purple-800">운송 후 보관</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 상단: 순서 전환 UI */}
      <div className="flex items-center justify-center gap-2 py-2">
        <button
          onClick={() => handleViewChange('storage')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === 'storage'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📦 보관
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

        <button
          onClick={() => handleViewChange('transport')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeView === 'transport'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🚚 운송
        </button>
      </div>

      {/* 현재 순서 표시 */}
      <div className="text-center text-xs text-slate-500">
        현재 순서: {serviceOrder === 'storage-first' ? '보관 → 운송' : '운송 → 보관'}
      </div>

      {/* 1행: 화물 정보 | 물량 정보 (공통) */}
      <div className="grid grid-cols-2 gap-3">
        {/* 화물 정보 */}
        <GridCell
          label="화물 정보"
          colorScheme="purple"
          onClick={() => setActiveModal('cargo')}
        >
          {registeredCargos.length === 0 ? (
            <div className="flex items-center gap-1 text-purple-600">
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
                  className="w-full py-1 text-[10px] text-purple-600 hover:text-purple-800"
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
                  className="w-full py-1 text-[10px] text-purple-600 hover:text-purple-800"
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
          colorScheme="purple"
          onClick={() => setActiveModal('quantity')}
          disabled={registeredCargos.length === 0}
        >
          {registeredCargos.length === 0 ? (
            <span className="text-slate-400 text-xs">화물 등록 필요</span>
          ) : !allQuantitiesEntered ? (
            <span className="text-purple-600 text-xs">수량 입력하기</span>
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

      {/* === 보관 뷰 그리드 === */}
      {activeView === 'storage' && (
        <>
          {/* 2행: 보관 장소 */}
          <GridCell
            label="보관 장소"
            colorScheme="blue"
            onClick={() => setActiveModal('storage-location')}
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
              label={isStorageStartDateLocked ? '시작일 🔒' : '시작일'}
              colorScheme="blue"
              onClick={() => !isStorageStartDateLocked && setActiveModal('storage-date')}
              disabled={isStorageStartDateLocked}
            >
              {getAutoStorageStartDate() ? (
                <div>
                  <span className="text-slate-800">{formatDate(getAutoStorageStartDate())}</span>
                  {isStorageStartDateLocked && (
                    <div className="text-[9px] text-blue-500 mt-0.5">운송일 자동 설정</div>
                  )}
                </div>
              ) : (
                <span className="text-slate-400">선택</span>
              )}
            </GridCell>
            <GridCell
              label="종료일"
              colorScheme="blue"
              onClick={() => setActiveModal('storage-date')}
            >
              {storageCondition.endDate ? (
                <span className="text-slate-800">{formatDate(storageCondition.endDate)}</span>
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
                colorScheme="emerald"
                onClick={() => setActiveModal('transport-origin')}
              >
                {transportCondition.origin ? (
                  <span className="text-slate-800">{transportCondition.origin}</span>
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
                colorScheme="emerald"
                onClick={() => setActiveModal('transport-destination')}
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
            label={isTransportDateLocked ? '운송 날짜 🔒' : '운송 날짜'}
            colorScheme="emerald"
            onClick={() => !isTransportDateLocked && setActiveModal('transport-date')}
            disabled={isTransportDateLocked}
          >
            {getAutoTransportDate() ? (
              <div>
                <span className="text-slate-800">{formatDate(getAutoTransportDate())}</span>
                {isTransportDateLocked && (
                  <div className="text-[9px] text-emerald-500 mt-0.5">보관종료일 자동 설정</div>
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
              등록된 화물별 수량을 입력하면 필요한 파렛트/큐브 수가 자동으로 계산됩니다.
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
            value={storageCondition.location}
            onChange={(location) => {
              onUpdateStorageCondition({ location })
              setActiveModal(null)
            }}
            placeholder="보관 장소 선택"
          />
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
            startDate={getAutoStorageStartDate()}
            endDate={storageCondition.endDate}
            locked={isStorageStartDateLocked}
            lockedLabel={isStorageStartDateLocked ? `${formatDate(getAutoStorageStartDate())} (운송일)` : undefined}
            onStartDateChange={(date) => !isStorageStartDateLocked && onUpdateStorageCondition({ startDate: date })}
            onEndDateChange={(date) => onUpdateStorageCondition({ endDate: date })}
          />
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
            value={transportCondition.origin}
            onChange={(origin) => {
              onUpdateTransportCondition({ origin })
              setActiveModal(null)
            }}
            placeholder="출발지 선택"
          />
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
            value={transportCondition.destination}
            onChange={(destination) => {
              onUpdateTransportCondition({ destination })
              setActiveModal(null)
            }}
            placeholder="도착지 선택"
          />
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
            <DatePicker
              mode="single"
              date={transportCondition.transportDate}
              onDateChange={(date) => {
                onUpdateTransportCondition({ transportDate: date })
                setActiveModal(null)
              }}
            />
          )}
        </div>
      </InputModal>
    </div>
  )
}
