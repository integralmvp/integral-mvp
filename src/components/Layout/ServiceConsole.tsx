// 서비스 콘솔 - 탭 + 아코디언 폼 (PR3-2 재설계)
import { useState } from 'react'
import type { StorageAreaSelection, AreaInputType, BoxSize, ModuleInputs, ModuleInput } from '../../types/models'
import { PACKAGE_BOX_MODULES } from '../../data/mockData'
import { calcPallets, calculatePalletsFromArea } from '../../utils/palletCalculator'

type ServiceType = 'storage' | 'transport' | 'both'

// 높이 프리셋 (mm)
const HEIGHT_PRESETS = [200, 300, 400, 600, 800, 1000, 1200]

export default function ServiceConsole() {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  // 보관면적 선택 상태 (보관 탭)
  const [storageArea, setStorageArea] = useState<StorageAreaSelection>({
    inputType: 'module',
    selectedModules: new Set(),
    moduleInputs: {},
  })

  // 운송면적 선택 상태 (운송 탭)
  const [transportArea, setTransportArea] = useState<StorageAreaSelection>({
    inputType: 'module',
    selectedModules: new Set(),
    moduleInputs: {},
  })

  // 보관+운송 탭 상태
  const [bothStorageArea, setBothStorageArea] = useState<StorageAreaSelection>({
    inputType: 'module',
    selectedModules: new Set(),
    moduleInputs: {},
  })
  const [bothTransportArea, setBothTransportArea] = useState<StorageAreaSelection>({
    inputType: 'module',
    selectedModules: new Set(),
    moduleInputs: {},
  })

  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  const handleSearch = () => {
    console.log('=== 검색 시작 ===')
    console.log('활성 탭:', activeTab)

    if (activeTab === 'storage') {
      console.log('보관 수요면적:', {
        ...storageArea,
        selectedModules: Array.from(storageArea.selectedModules || []),
      })
    } else if (activeTab === 'transport') {
      console.log('운송 수요면적:', {
        ...transportArea,
        selectedModules: Array.from(transportArea.selectedModules || []),
      })
    } else if (activeTab === 'both') {
      console.log('보관 수요면적:', {
        ...bothStorageArea,
        selectedModules: Array.from(bothStorageArea.selectedModules || []),
      })
      console.log('운송 수요면적:', {
        ...bothTransportArea,
        selectedModules: Array.from(bothTransportArea.selectedModules || []),
      })
    }

    console.log('=== 검색 완료 ===')
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      {/* 타이틀 */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">내 손 안의 작은 물류 허브</h1>
        <p className="text-sm text-slate-600 mt-1">비어있는 공간과 경로를 원하는 조건으로 검색하고 결제까지! 신개념 물류 오픈마켓</p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'storage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          보관
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'transport'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          운송
        </button>
        <button
          onClick={() => setActiveTab('both')}
          className={`flex-1 py-4 text-sm font-semibold transition-colors ${
            activeTab === 'both'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          보관+운송
        </button>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* 보관 탭 */}
        {activeTab === 'storage' && (
          <>
            <AccordionField
              id="storage-area"
              label="수요면적"
              placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'storage-area'}
              onToggle={() => handleFieldClick('storage-area')}
              summary={getStorageAreaSummary(storageArea)}
            >
              <StorageAreaField
                selection={storageArea}
                onChange={setStorageArea}
              />
            </AccordionField>
            <AccordionField
              id="storage-product"
              label="품목"
              placeholder="화물의 내용물 품목을 선택합니다."
              expanded={expandedField === 'storage-product'}
              onToggle={() => handleFieldClick('storage-product')}
            />
            <AccordionField
              id="storage-period"
              label="보관기간"
              placeholder="보관을 원하시는 기간을 선택합니다."
              expanded={expandedField === 'storage-period'}
              onToggle={() => handleFieldClick('storage-period')}
            />
          </>
        )}

        {/* 운송 탭 */}
        {activeTab === 'transport' && (
          <>
            <AccordionField
              id="transport-area"
              label="수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'transport-area'}
              onToggle={() => handleFieldClick('transport-area')}
              summary={getStorageAreaSummary(transportArea)}
            >
              <StorageAreaField
                selection={transportArea}
                onChange={setTransportArea}
              />
            </AccordionField>
            <AccordionField
              id="transport-product"
              label="품목"
              placeholder="화물의 내용물 품목을 선택합니다."
              expanded={expandedField === 'transport-product'}
              onToggle={() => handleFieldClick('transport-product')}
            />
            <AccordionField
              id="transport-date"
              label="운송날짜"
              placeholder="운송을 원하시는 날짜를 선택합니다."
              expanded={expandedField === 'transport-date'}
              onToggle={() => handleFieldClick('transport-date')}
            />
          </>
        )}

        {/* 보관+운송 탭 */}
        {activeTab === 'both' && (
          <>
            <AccordionField
              id="both-order"
              label="순서"
              placeholder="보관 후 운송 또는 운송 후 보관"
              expanded={expandedField === 'both-order'}
              onToggle={() => handleFieldClick('both-order')}
            />
            <AccordionField
              id="both-storage-area"
              label="보관 수요면적"
              placeholder="화물량을 보관 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-storage-area'}
              onToggle={() => handleFieldClick('both-storage-area')}
              summary={getStorageAreaSummary(bothStorageArea)}
            >
              <StorageAreaField
                selection={bothStorageArea}
                onChange={setBothStorageArea}
              />
            </AccordionField>
            <AccordionField
              id="both-transport-area"
              label="운송 수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-transport-area'}
              onToggle={() => handleFieldClick('both-transport-area')}
              summary={getStorageAreaSummary(bothTransportArea)}
            >
              <StorageAreaField
                selection={bothTransportArea}
                onChange={setBothTransportArea}
              />
            </AccordionField>
            <AccordionField
              id="both-product"
              label="품목"
              placeholder="화물량의 내용물 품목을 선택합니다."
              expanded={expandedField === 'both-product'}
              onToggle={() => handleFieldClick('both-product')}
            />
            <AccordionField
              id="both-period"
              label="보관기간"
              placeholder="보관을 원하시는 기간을 선택합니다."
              expanded={expandedField === 'both-period'}
              onToggle={() => handleFieldClick('both-period')}
            />
            <AccordionField
              id="both-date"
              label="운송날짜"
              placeholder="운송을 원하시는 날짜를 선택합니다."
              expanded={expandedField === 'both-date'}
              onToggle={() => handleFieldClick('both-date')}
            />
          </>
        )}
      </div>

      {/* 검색 버튼 */}
      <div className="p-6 border-t border-slate-200">
        <button
          onClick={handleSearch}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-lg ${
            activeTab === 'storage'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              : activeTab === 'transport'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
          }`}
        >
          🔍 검색하기
        </button>
      </div>
    </div>
  )
}

// ============ 헬퍼 함수 ============

/**
 * 보관면적 선택 요약 문구 생성
 */
function getStorageAreaSummary(selection: StorageAreaSelection): string | undefined {
  if (selection.inputType === 'module' && selection.selectedModules && selection.selectedModules.size > 0) {
    const modulesArray = Array.from(selection.selectedModules)
    if (selection.estimatedPallets !== undefined && selection.estimatedPallets > 0) {
      return `${modulesArray.join(', ')} → 약 ${selection.estimatedPallets}P`
    }
    return `${modulesArray.join(', ')} 선택됨`
  }
  if (selection.inputType === 'area' && selection.areaInSquareMeters && selection.estimatedPallets) {
    return `${selection.areaInSquareMeters}㎡ → 약 ${selection.estimatedPallets}P`
  }
  return undefined
}

// ============ 컴포넌트 ============

// 아코디언 필드 컴포넌트
interface AccordionFieldProps {
  id: string
  label: string
  placeholder: string
  expanded: boolean
  onToggle: () => void
  summary?: string
  children?: React.ReactNode
}

function AccordionField({ label, placeholder, expanded, onToggle, summary, children }: AccordionFieldProps) {
  return (
    <div
      className={`border rounded-xl transition-all cursor-pointer ${
        expanded
          ? 'border-slate-400 bg-white shadow-md'
          : 'border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-slate-400">
            {expanded ? '▲' : '▼'}
          </span>
        </div>

        {expanded && (
          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            {children || (
              <input
                type="text"
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            )}
          </div>
        )}

        {!expanded && (
          <div className="mt-1 text-xs text-slate-400">
            {summary || placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

// 보관면적 선택 필드
interface StorageAreaFieldProps {
  selection: StorageAreaSelection
  onChange: (selection: StorageAreaSelection) => void
}

function StorageAreaField({ selection, onChange }: StorageAreaFieldProps) {
  const handleInputTypeChange = (inputType: AreaInputType) => {
    onChange({
      inputType,
      selectedModules: new Set(),
      moduleInputs: {},
    })
  }

  const handleModuleToggle = (moduleName: BoxSize) => {
    const newSelectedModules = new Set<BoxSize>(selection.selectedModules || new Set<BoxSize>())
    if (newSelectedModules.has(moduleName)) {
      newSelectedModules.delete(moduleName)
      // 모듈 선택 해제 시 입력값도 삭제
      const newInputs = { ...selection.moduleInputs }
      delete newInputs[moduleName]

      // 팔레트 재계산
      const result = calcPallets(newSelectedModules, newInputs)

      onChange({
        ...selection,
        selectedModules: newSelectedModules,
        moduleInputs: newInputs,
        estimatedPallets: result.pallets,
      })
    } else {
      newSelectedModules.add(moduleName)
      onChange({
        ...selection,
        selectedModules: newSelectedModules,
      })
    }
  }

  const handleModuleInputChange = (moduleName: BoxSize, field: 'count' | 'height', value: number) => {
    const newInputs: ModuleInputs = { ...selection.moduleInputs }

    if (!newInputs[moduleName]) {
      newInputs[moduleName] = { count: 0, height: 0 }
    }

    newInputs[moduleName] = {
      ...newInputs[moduleName],
      [field]: value,
    } as ModuleInput

    // 팔레트 재계산
    const result = calcPallets(selection.selectedModules || new Set(), newInputs)

    onChange({
      ...selection,
      moduleInputs: newInputs,
      estimatedPallets: result.pallets,
    })
  }

  const handleAreaChange = (areaInSquareMeters: number) => {
    const estimatedPallets = areaInSquareMeters > 0
      ? calculatePalletsFromArea(areaInSquareMeters)
      : undefined

    onChange({
      ...selection,
      areaInSquareMeters,
      estimatedPallets,
    })
  }

  // 팔레트 계산 결과
  const selectedModules = selection.selectedModules || new Set()
  const moduleInputs = selection.moduleInputs || {}
  const calcResult = selection.inputType === 'module' && selectedModules.size > 0
    ? calcPallets(selectedModules, moduleInputs)
    : null

  return (
    <div className="space-y-4">
      {/* 단위 선택 */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">단위 선택</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleInputTypeChange('module')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selection.inputType === 'module'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            포장박스 모듈
          </button>
          <button
            onClick={() => handleInputTypeChange('area')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selection.inputType === 'area'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            면적
          </button>
        </div>
      </div>

      {/* 포장박스 모듈 선택 (다중 선택) */}
      {selection.inputType === 'module' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              모듈 선택 (중복 선택 가능)
            </label>
            <div className="flex gap-2">
              {PACKAGE_BOX_MODULES.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleToggle(module.name)}
                  className={`flex-1 py-2 px-2 border rounded-lg text-center transition-all ${
                    selectedModules.has(module.name)
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-xs font-bold">{module.label}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {module.width}×{module.depth}mm
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 선택된 모듈별 상세 입력 */}
          {selectedModules.size > 0 && (
            <div className="border border-slate-200 rounded-lg p-3 space-y-3">
              <div className="text-xs font-semibold text-slate-700 mb-2">
                선택된 모듈 상세 입력
              </div>

              {Array.from(selectedModules).map((moduleName) => {
                const module = PACKAGE_BOX_MODULES.find(m => m.name === moduleName)
                if (!module) return null

                const input = moduleInputs[moduleName] || { count: 0, height: 0 }

                return (
                  <div key={module.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      {module.label}
                    </div>

                    {/* 박스 개수 */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        박스 개수
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={input.count || ''}
                        onChange={(e) => handleModuleInputChange(moduleName, 'count', Number(e.target.value))}
                        placeholder="개수"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* 박스 높이 */}
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-1">
                        박스 높이 (mm)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={input.height || ''}
                        onChange={(e) => handleModuleInputChange(moduleName, 'height', Number(e.target.value))}
                        placeholder="높이(mm)"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* 높이 프리셋 버튼 */}
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {HEIGHT_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleModuleInputChange(moduleName, 'height', preset)}
                            className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[9px] text-slate-700 transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 환산 결과 */}
          {calcResult && calcResult.pallets > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-900">
                    약 {calcResult.pallets}개 파렛트
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    1파렛트 = 1.1m × 1.1m, 최대 적재 높이 1.8m 기준
                  </div>

                  {/* 혼합 적재 보정 배지 */}
                  {selectedModules.size > 1 && (
                    <div className="mt-1.5">
                      <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-medium rounded">
                        혼합 적재 보정 +10% 적용
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 경고 메시지 */}
              {calcResult.warnings && calcResult.warnings.length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  {calcResult.warnings.map((warning, idx) => (
                    <div key={idx} className="text-[10px] text-orange-700 mt-1">
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 면적 입력 */}
      {selection.inputType === 'area' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">면적 (㎡)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={selection.areaInSquareMeters || ''}
              onChange={(e) => handleAreaChange(Number(e.target.value))}
              placeholder="면적을 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* 환산 결과 */}
          {selection.estimatedPallets !== undefined && selection.estimatedPallets > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-900">
                    약 {selection.estimatedPallets}개 파렛트
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    1파렛트 = 1.1m × 1.1m
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
