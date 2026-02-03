// 서비스 콘솔 - 조립 컴포넌트
// 3행 그리드 레이아웃 UI 재설계
// PR4: 검색 결과 Context 연동 + 결과 모달 표시 + 실시간 지도 필터링
// PR6: 단일 파이프라인 통합 - previewCount로 건수 표시

import { useState } from 'react'
import { useServiceConsoleState, type ServiceType } from './hooks'
import { StorageTabSection, TransportTabSection, BothTabSection } from './sections'
import { SlotCounter, SearchResultModal } from './ui'
import { useSearchResult } from '../../../contexts/SearchResultContext'

// 탭 버튼 컴포넌트
interface TabButtonProps {
  label: string
  isActive: boolean
  tabType: ServiceType
  onClick: () => void
}

// 사이버펑크 스타일 (활성 탭 - 화이트)
const tabActiveStyles: Record<ServiceType, string> = {
  storage: 'text-white border-b-2 border-white',
  transport: 'text-white border-b-2 border-white',
  both: 'text-white border-b-2 border-white',
}

function TabButton({ label, isActive, tabType, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 text-sm font-semibold transition-colors ${
        isActive
          ? tabActiveStyles[tabType]
          : 'text-white/50 hover:text-white/80'
      }`}
    >
      {label}
    </button>
  )
}

// 검색 버튼 컴포넌트 (슬롯 애니메이션 건수 표시)
interface SearchButtonProps {
  activeTab: ServiceType
  productCount: number
  onClick: () => void
}

function SearchButton({ activeTab: _activeTab, productCount, onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 text-cyber-dark font-bold text-lg transition-all hover:shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #00F0FF 0%, #00B8C4 100%)',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: 'none',
      }}
    >
      <SlotCounter value={productCount} className="font-bold" />
      건의 상품 검색하기
    </button>
  )
}

export default function ServiceConsole() {
  const [state, actions] = useServiceConsoleState()
  const { searchResult } = useSearchResult()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // PR6: previewCount를 직접 사용 (단일 파이프라인에서 계산됨)
  // 화물이 없으면 전체 상품 수를 표시 (8개)
  const displayCount = state.registeredCargos.length > 0
    ? state.previewCount
    : state.activeTab === 'storage' ? 8
    : state.activeTab === 'transport' ? 8
    : 16

  // 검색 버튼 클릭 핸들러
  const handleSearchClick = () => {
    actions.handleSearch()
    setIsModalOpen(true)
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'transparent',
        cursor: 'default'
      }}
    >
      {/* 타이틀 */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: '3px solid rgba(0, 240, 255, 0.6)' }}
      >
        <h1 className="text-lg font-bold text-white">내 손 안의 작은 물류 허브</h1>
        <p className="text-xs text-white/60 mt-0.5">
          비어있는 공간과 경로를 원하는 조건으로 검색하고 결제까지!
        </p>
      </div>

      {/* 탭 */}
      <div
        className="flex"
        style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.6)' }}
      >
        <TabButton
          label="보관"
          isActive={state.activeTab === 'storage'}
          tabType="storage"
          onClick={() => actions.setActiveTab('storage')}
        />
        <TabButton
          label="운송"
          isActive={state.activeTab === 'transport'}
          tabType="transport"
          onClick={() => actions.setActiveTab('transport')}
        />
        <TabButton
          label="보관+운송"
          isActive={state.activeTab === 'both'}
          tabType="both"
          onClick={() => actions.setActiveTab('both')}
        />
      </div>

      {/* 폼 영역 - 3행 그리드 레이아웃 */}
      <div className="flex-1 overflow-y-auto">
        {state.activeTab === 'storage' && (
          <StorageTabSection
            cargos={state.cargos}
            registeredCargos={state.registeredCargos}
            onAddCargo={actions.addCargo}
            onRemoveCargo={actions.removeCargo}
            onUpdateCargo={actions.updateCargo}
            onCompleteCargo={actions.completeCargo}
            onUpdateQuantity={actions.updateCargoQuantity}
            onConfirmQuantity={actions.confirmQuantityInput}
            totalCubes={state.totalCubes}
            totalPallets={state.totalPallets}
            demandResult={state.demandResult}
            storageCondition={state.storageCondition}
            onUpdateCondition={actions.updateStorageCondition}
            onResetQuantities={actions.resetQuantities}
            onResetStorageCondition={actions.resetStorageCondition}
          />
        )}

        {state.activeTab === 'transport' && (
          <TransportTabSection
            cargos={state.cargos}
            registeredCargos={state.registeredCargos}
            onAddCargo={actions.addCargo}
            onRemoveCargo={actions.removeCargo}
            onUpdateCargo={actions.updateCargo}
            onCompleteCargo={actions.completeCargo}
            onUpdateQuantity={actions.updateCargoQuantity}
            onConfirmQuantity={actions.confirmQuantityInput}
            totalCubes={state.totalCubes}
            totalPallets={state.totalPallets}
            demandResult={state.demandResult}
            transportCondition={state.transportCondition}
            onUpdateCondition={actions.updateTransportCondition}
            onResetQuantities={actions.resetQuantities}
            onResetTransportCondition={actions.resetTransportCondition}
          />
        )}

        {state.activeTab === 'both' && (
          <BothTabSection
            serviceOrder={state.serviceOrder}
            onServiceOrderChange={actions.setServiceOrder}
            cargos={state.cargos}
            registeredCargos={state.registeredCargos}
            onAddCargo={actions.addCargo}
            onRemoveCargo={actions.removeCargo}
            onUpdateCargo={actions.updateCargo}
            onCompleteCargo={actions.completeCargo}
            onUpdateQuantity={actions.updateCargoQuantity}
            onConfirmQuantity={actions.confirmQuantityInput}
            totalCubes={state.totalCubes}
            totalPallets={state.totalPallets}
            demandResult={state.demandResult}
            storageCondition={state.storageCondition}
            transportCondition={state.transportCondition}
            onUpdateStorageCondition={actions.updateStorageCondition}
            onUpdateTransportCondition={actions.updateTransportCondition}
            onResetQuantities={actions.resetQuantities}
            onResetStorageCondition={actions.resetStorageCondition}
            onResetTransportCondition={actions.resetTransportCondition}
          />
        )}
      </div>

      {/* 검색 버튼 - 하단 고정 */}
      <div style={{ borderTop: '3px solid rgba(0, 240, 255, 0.6)' }}>
        <SearchButton
          activeTab={state.activeTab}
          productCount={displayCount}
          onClick={handleSearchClick}
        />
      </div>

      {/* PR4: 검색 결과 모달 */}
      <SearchResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storageProducts={searchResult?.storageProducts || []}
        routeProducts={searchResult?.routeProducts || []}
        activeTab={state.activeTab}
        summary={null}
        registeredCargos={state.registeredCargos}
        totalCubes={state.totalCubes}
        totalPallets={state.totalPallets}
        storageCondition={state.storageCondition}
        transportCondition={state.transportCondition}
        serviceOrder={state.serviceOrder}
      />
    </div>
  )
}
