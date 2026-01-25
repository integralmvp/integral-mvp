// 서비스 콘솔 - 조립 컴포넌트 (리팩토링 후: ~140줄)
import { useServiceConsoleState, type ServiceType } from './hooks'
import { StorageTabSection, TransportTabSection, BothTabSection } from './sections'

// 탭 버튼 컴포넌트
interface TabButtonProps {
  label: string
  isActive: boolean
  tabType: ServiceType
  onClick: () => void
}

// Tailwind는 동적 클래스를 지원하지 않으므로 전체 클래스 문자열 매핑
const tabActiveStyles: Record<ServiceType, string> = {
  storage: 'text-blue-600 border-b-2 border-blue-600',
  transport: 'text-emerald-600 border-b-2 border-emerald-600',
  both: 'text-purple-600 border-b-2 border-purple-600',
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

// 검색 버튼 컴포넌트
interface SearchButtonProps {
  activeTab: ServiceType
  onClick: () => void
}

function SearchButton({ activeTab, onClick }: SearchButtonProps) {
  const gradientMap: Record<ServiceType, string> = {
    storage: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    transport: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    both: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  }

  return (
    <button
      onClick={onClick}
      className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg bg-gradient-to-r ${gradientMap[activeTab]}`}
    >
      🔍 검색하기
    </button>
  )
}

export default function ServiceConsole() {
  const [state, actions] = useServiceConsoleState()

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

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {state.activeTab === 'storage' && (
          <StorageTabSection
            expandedField={state.expandedField}
            onFieldClick={actions.handleFieldClick}
            storageInputType={state.storageInputType}
            storageBoxes={state.storageBoxes}
            storageAreaM2={state.storageAreaM2}
            storageResult={state.storageResult}
            storageSelectedPallets={state.storageSelectedPallets}
            onInputTypeChange={actions.setStorageInputType}
            onBoxesChange={actions.setStorageBoxes}
            onAreaChange={actions.setStorageAreaM2}
            onSelectConfirm={actions.handleStorageSelectPallets}
          />
        )}

        {state.activeTab === 'transport' && (
          <TransportTabSection
            expandedField={state.expandedField}
            onFieldClick={actions.handleFieldClick}
            transportInputType={state.transportInputType}
            transportBoxes={state.transportBoxes}
            transportAreaM2={state.transportAreaM2}
            transportResult={state.transportResult}
            transportSelectedCubes={state.transportSelectedCubes}
            onInputTypeChange={actions.setTransportInputType}
            onBoxesChange={actions.setTransportBoxes}
            onAreaChange={actions.setTransportAreaM2}
            onSelectConfirm={actions.handleTransportSelectCubes}
          />
        )}

        {state.activeTab === 'both' && (
          <BothTabSection
            expandedField={state.expandedField}
            onFieldClick={actions.handleFieldClick}
          />
        )}
      </div>

      {/* 검색 버튼 */}
      <div className="p-6 border-t border-slate-200">
        <SearchButton activeTab={state.activeTab} onClick={actions.handleSearch} />
      </div>
    </div>
  )
}
