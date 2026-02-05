// 서비스 콘솔 - 조립 컴포넌트
// 3행 그리드 레이아웃 UI 재설계
// PR4: 검색 결과 Context 연동 + 결과 모달 표시 + 실시간 지도 필터링
// PR6: 단일 파이프라인 통합 - previewCount로 건수 표시

import { useState } from 'react'
import { useServiceConsoleState, type ServiceType } from './hooks'
import { StorageTabSection, TransportTabSection, BothTabSection } from './sections'
import { SlotCounter, SearchResultModal } from './ui'
import { useSearchResult } from '../../../contexts/SearchResultContext'
import { CyberCorners, CyberTopBar, CyberStripes } from '../../common/CyberDecorations'

// 탭 버튼 컴포넌트
interface TabButtonProps {
  label: string
  isActive: boolean
  tabType: ServiceType
  onClick: () => void
}

// Neon Green 통일 스타일 (White Cyberpunk HUD V2)
const tabActiveStyles: Record<ServiceType, string> = {
  storage: 'text-black font-bold cyber-tab-active',
  transport: 'text-black font-bold cyber-tab-active',
  both: 'text-black font-bold cyber-tab-active',
}

function TabButton({ label, isActive, tabType, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 text-sm font-semibold transition-colors cyber-tab ${
        isActive
          ? tabActiveStyles[tabType]
          : 'text-black opacity-60 hover:opacity-100'
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
      className="w-full py-4 text-white font-bold text-lg transition-all hover:shadow-lg cyber-button bg-gradient-to-r from-neonGreen to-neonGreen-dark hover:from-neonGreen-dark hover:to-neonGreen"
      style={{
        boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
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
      className="h-full flex flex-col overflow-hidden shadow-2xl cyber-panel-main text-neonGreen"
      style={{
        cursor: 'default',
        position: 'relative',
        boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
      }}
    >
      {/* 사이버 데코레이션 */}
      <CyberCorners variant="main" />
      <CyberTopBar />
      <CyberStripes side="right" />

      {/* 타이틀 */}
      <div className="p-6 border-b-3 border-neonGreen relative" style={{ borderBottomWidth: '3px' }}>
        <h1 className="text-2xl font-bold text-black">내 손 안의 작은 물류 허브</h1>
        <p className="text-sm text-black opacity-70 mt-1">
          비어있는 공간과 경로를 원하는 조건으로 검색하고 결제까지! 신개념 물류 오픈마켓
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b-2 border-neonGreen">
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
      <div className="flex-1 overflow-y-auto p-4">
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
      <div className="p-4 border-t-3 border-neonGreen relative" style={{ borderTopWidth: '3px' }}>
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
