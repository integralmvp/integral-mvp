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

// Teal 통일 스타일 (플랫폼 상징 컬러)
const tabActiveStyles: Record<ServiceType, string> = {
  storage: 'text-teal-700 border-b-2 border-teal-700',
  transport: 'text-teal-700 border-b-2 border-teal-700',
  both: 'text-teal-700 border-b-2 border-teal-700',
}

function TabButton({ label, isActive, tabType, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 text-sm font-semibold transition-colors ${
        isActive
          ? tabActiveStyles[tabType]
          : 'text-slate-600 hover:text-slate-900'
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
      className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
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
      className="h-full flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        cursor: 'default'
      }}
    >
      {/* 타이틀 */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">내 손 안의 작은 물류 허브</h1>
        <p className="text-sm text-slate-600 mt-1">
          비어있는 공간과 경로를 원하는 조건으로 검색하고 결제까지! 신개념 물류 오픈마켓
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-slate-200">
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
      <div className="p-4 border-t border-slate-200">
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
        selectedStorageId={state.selectedStorageId}
        selectedRouteId={state.selectedRouteId}
        onSelectStorage={actions.selectStorage}
        onSelectRoute={actions.selectRoute}
        onStartDeal={actions.startDeal}
      />
    </div>
  )
}
