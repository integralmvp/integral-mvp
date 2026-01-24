// 서비스 콘솔 - 탭 + 아코디언 폼 (Phase 2+3: 통합 엔진 적용)
import { useState, useEffect } from 'react'
import type { BoxInputUI } from '../../types/models'
import { computeDemand, computeDemandFromArea, type DemandResult, type BoxInput, cubesToCBM, palletsToCBM, cbmToWarehouseCount, cbmToTruckCount } from '../../engine'
import { PalletIcon3D, CubeIcon3D, WarehouseIcon, TruckIcon } from '../visualizations'

type ServiceType = 'storage' | 'transport' | 'both'

// 박스 ID 생성용
let boxIdCounter = 0

// UI BoxInput → Engine BoxInput 변환
function toEngineBoxInput(uiBox: BoxInputUI): BoxInput {
  return {
    widthMm: uiBox.width,
    depthMm: uiBox.depth,
    heightMm: uiBox.height,
    count: uiBox.count,
  }
}

export default function ServiceConsole() {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  // 보관 탭 상태
  const [storageBoxes, setStorageBoxes] = useState<BoxInputUI[]>([])
  const [storageAreaM2, setStorageAreaM2] = useState<number>(0)
  const [storageInputType, setStorageInputType] = useState<'box' | 'area'>('box')
  const [storageResult, setStorageResult] = useState<DemandResult | null>(null)
  const [storageSelectedPallets, setStorageSelectedPallets] = useState<number | null>(null)

  // 운송 탭 상태
  const [transportBoxes, setTransportBoxes] = useState<BoxInputUI[]>([])
  const [transportAreaM2, setTransportAreaM2] = useState<number>(0)
  const [transportInputType, setTransportInputType] = useState<'box' | 'area'>('box')
  const [transportResult, setTransportResult] = useState<DemandResult | null>(null)
  const [transportSelectedCubes, setTransportSelectedCubes] = useState<number | null>(null)

  // 보관+운송 탭 상태 (추후 구현)
  const [bothStorageSelectedPallets] = useState<number | null>(null)
  const [bothTransportSelectedCubes] = useState<number | null>(null)

  // 보관 탭: 계산 트리거 (완료된 박스만)
  useEffect(() => {
    if (storageInputType === 'box' && storageBoxes.length > 0) {
      // 완료된 박스만 필터링
      const completedBoxes = storageBoxes.filter(b => b.completed === true)

      if (completedBoxes.length > 0) {
        const engineBoxes = completedBoxes.map(toEngineBoxInput)
        const result = computeDemand(engineBoxes, 'STORAGE')
        setStorageResult(result)

        // UNCLASSIFIED 처리
        if (result.hasUnclassified) {
          console.warn('[보관] UNCLASSIFIED 박스 감지 → 면적 단위 전환 권장')
        }
      } else {
        setStorageResult(null)
      }
    } else if (storageInputType === 'area' && storageAreaM2 > 0) {
      const result = computeDemandFromArea(storageAreaM2, 'STORAGE')
      setStorageResult({
        demandCubes: result.demandCubes,
        demandPallets: result.demandPallets,
        moduleSummary: [],
        hasUnclassified: false,
        detail: null as any,
      })
    } else {
      setStorageResult(null)
    }
  }, [storageBoxes, storageAreaM2, storageInputType])

  // 운송 탭: 계산 트리거 (완료된 박스만)
  useEffect(() => {
    if (transportInputType === 'box' && transportBoxes.length > 0) {
      // 완료된 박스만 필터링
      const completedBoxes = transportBoxes.filter(b => b.completed === true)

      if (completedBoxes.length > 0) {
        const engineBoxes = completedBoxes.map(toEngineBoxInput)
        const result = computeDemand(engineBoxes, 'ROUTE')
        setTransportResult(result)

        // UNCLASSIFIED 처리
        if (result.hasUnclassified) {
          console.warn('[운송] UNCLASSIFIED 박스 감지 → 면적 단위 전환 권장')
        }
      } else {
        setTransportResult(null)
      }
    } else if (transportInputType === 'area' && transportAreaM2 > 0) {
      const result = computeDemandFromArea(transportAreaM2, 'ROUTE')
      setTransportResult({
        demandCubes: result.demandCubes,
        moduleSummary: [],
        hasUnclassified: false,
        detail: null as any,
      })
    } else {
      setTransportResult(null)
    }
  }, [transportBoxes, transportAreaM2, transportInputType])

  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  // 아코디언 자동 진행
  const advanceAccordion = (nextFieldId: string) => {
    setExpandedField(nextFieldId)
  }

  // 보관: 파렛트 선택 확정
  const handleStorageSelectPallets = () => {
    if (storageResult && storageResult.demandPallets) {
      setStorageSelectedPallets(storageResult.demandPallets)
      advanceAccordion('storage-product')
    }
  }

  // 운송: 큐브 선택 확정
  const handleTransportSelectCubes = () => {
    if (transportResult && transportResult.demandCubes) {
      setTransportSelectedCubes(transportResult.demandCubes)
      advanceAccordion('transport-product')
    }
  }

  const handleSearch = () => {
    console.log('=== 검색 시작 ===')
    console.log('활성 탭:', activeTab)

    if (activeTab === 'storage') {
      console.log('선택된 파렛트:', storageSelectedPallets)
    } else if (activeTab === 'transport') {
      console.log('선택된 큐브:', transportSelectedCubes)
    } else if (activeTab === 'both') {
      console.log('보관 파렛트:', bothStorageSelectedPallets)
      console.log('운송 큐브:', bothTransportSelectedCubes)
    }

    console.log('=== 검색 완료 ===')
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
              summary={getStorageSummary(storageResult, storageSelectedPallets)}
            >
              <AreaInputField
                inputType={storageInputType}
                boxes={storageBoxes}
                areaM2={storageAreaM2}
                result={storageResult}
                mode="STORAGE"
                onInputTypeChange={setStorageInputType}
                onBoxesChange={setStorageBoxes}
                onAreaChange={setStorageAreaM2}
                onSelectConfirm={handleStorageSelectPallets}
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
              summary={getTransportSummary(transportResult, transportSelectedCubes)}
            >
              <AreaInputField
                inputType={transportInputType}
                boxes={transportBoxes}
                areaM2={transportAreaM2}
                result={transportResult}
                mode="ROUTE"
                onInputTypeChange={setTransportInputType}
                onBoxesChange={setTransportBoxes}
                onAreaChange={setTransportAreaM2}
                onSelectConfirm={handleTransportSelectCubes}
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

        {/* 보관+운송 탭 (기존 유지, 추후 구현) */}
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
            />
            <AccordionField
              id="both-transport-area"
              label="운송 수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-transport-area'}
              onToggle={() => handleFieldClick('both-transport-area')}
            />
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

function getStorageSummary(result: DemandResult | null, selectedPallets: number | null): string | undefined {
  if (selectedPallets !== null) {
    return `선택됨: ${selectedPallets} 파렛트`
  }
  if (result && result.demandPallets) {
    return `${result.demandPallets} 파렛트 필요`
  }
  return undefined
}

function getTransportSummary(result: DemandResult | null, selectedCubes: number | null): string | undefined {
  if (selectedCubes !== null) {
    return `선택됨: ${selectedCubes} 큐브`
  }
  if (result && result.demandCubes) {
    return `${result.demandCubes} 큐브 필요`
  }
  return undefined
}

// ============ 컴포넌트 ============

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

// ============ 면적 입력 필드 ============

interface AreaInputFieldProps {
  inputType: 'box' | 'area'
  boxes: BoxInputUI[]
  areaM2: number
  result: DemandResult | null
  mode: 'STORAGE' | 'ROUTE'
  onInputTypeChange: (type: 'box' | 'area') => void
  onBoxesChange: (boxes: BoxInputUI[]) => void
  onAreaChange: (areaM2: number) => void
  onSelectConfirm: () => void
}

function AreaInputField({
  inputType,
  boxes,
  areaM2: _areaM2,
  result,
  mode,
  onInputTypeChange,
  onBoxesChange,
  onAreaChange,
  onSelectConfirm,
}: AreaInputFieldProps) {
  const [showModuleDetails, setShowModuleDetails] = useState(false)
  const [tempAreaM2, setTempAreaM2] = useState<number>(0)
  const [areaConfirmed, setAreaConfirmed] = useState(false)
  const [conversionConfirmed, setConversionConfirmed] = useState(false)

  const handleAddBox = () => {
    const newBox: BoxInputUI = {
      id: `box-${++boxIdCounter}`,
      width: 0,
      depth: 0,
      height: 0,
      count: 0,
      completed: false,
    }
    onBoxesChange([...boxes, newBox])
  }

  const handleRemoveBox = (boxId: string) => {
    onBoxesChange(boxes.filter(b => b.id !== boxId))
  }

  const handleBoxChange = (boxId: string, field: keyof BoxInputUI, value: number) => {
    if (field === 'id' || field === 'completed') return
    onBoxesChange(
      boxes.map(box =>
        box.id === boxId ? { ...box, [field]: value, completed: false } : box
      )
    )
  }

  const handleBoxComplete = (boxId: string) => {
    onBoxesChange(
      boxes.map(box =>
        box.id === boxId ? { ...box, completed: true } : box
      )
    )
  }

  const handleSwitchToArea = () => {
    setTempAreaM2(0)
    setAreaConfirmed(false)
    onInputTypeChange('area')
  }

  const isButtonDisabled = () => {
    if (result?.hasUnclassified) return true
    if (mode === 'STORAGE') {
      return !result?.demandPallets || result.demandPallets <= 0
    } else {
      return !result?.demandCubes || result.demandCubes <= 0
    }
  }

  const isBoxComplete = (box: BoxInputUI) => {
    return box.width > 0 && box.depth > 0 && box.height > 0 && box.count > 0
  }

  return (
    <div className="space-y-4" style={{ cursor: 'default' }}>
      {/* 플로우 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <p className="text-xs text-blue-800">
          {mode === 'STORAGE'
            ? '📝 박스 입력 → 자동 분류 → 파렛트 환산'
            : '📝 박스 입력 → 자동 분류 → 큐브 환산'}
        </p>
      </div>

      {/* 단위 선택 */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">단위 선택</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onInputTypeChange('box')
              setTempAreaM2(0)
              setAreaConfirmed(false)
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              inputType === 'box'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            포장 단위
          </button>
          <button
            onClick={() => {
              onInputTypeChange('area')
              setTempAreaM2(0)
              setAreaConfirmed(false)
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              inputType === 'area'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            면적 단위
          </button>
        </div>
      </div>

      {/* 포장 단위 입력 */}
      {inputType === 'box' && (
        <>
          {/* 박스 입력 리스트 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-700">
                박스 정보 입력
              </label>
              <button
                onClick={handleAddBox}
                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
              >
                + 박스 종류 추가
              </button>
            </div>

            {boxes.length > 0 ? (
              <div className="space-y-2">
                {boxes.map((box, index) => {
                  const isComplete = isBoxComplete(box)
                  const isConfirmed = box.completed === true

                  return (
                    <div key={box.id} className={`rounded-lg p-3 space-y-2 ${isConfirmed ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          박스 {index + 1} {isConfirmed && <span className="text-green-600">✓ 완료</span>}
                        </span>
                        <button
                          onClick={() => handleRemoveBox(box.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-1">
                            가로(mm)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={box.width || ''}
                            onChange={(e) => handleBoxChange(box.id, 'width', Number(e.target.value))}
                            onWheel={(e) => e.currentTarget.blur()}
                            disabled={isConfirmed}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-1">
                            세로(mm)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={box.depth || ''}
                            onChange={(e) => handleBoxChange(box.id, 'depth', Number(e.target.value))}
                            onWheel={(e) => e.currentTarget.blur()}
                            disabled={isConfirmed}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-1">
                            높이(mm)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={box.height || ''}
                            onChange={(e) => handleBoxChange(box.id, 'height', Number(e.target.value))}
                            onWheel={(e) => e.currentTarget.blur()}
                            disabled={isConfirmed}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-600 mb-1">
                            개수
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={box.count || ''}
                            onChange={(e) => handleBoxChange(box.id, 'count', Number(e.target.value))}
                            onWheel={(e) => e.currentTarget.blur()}
                            disabled={isConfirmed}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      {/* 입력 완료 버튼 */}
                      {!isConfirmed && (
                        <button
                          onClick={() => handleBoxComplete(box.id)}
                          disabled={!isComplete}
                          className={`w-full py-2 text-xs font-bold rounded transition-colors ${
                            isComplete
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          입력 완료
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-300 rounded">
                "+ 박스 종류 추가" 버튼을 눌러 박스 정보를 입력하세요
              </div>
            )}
          </div>

          {/* UNCLASSIFIED 경고 */}
          {result?.hasUnclassified && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-orange-600">⚠️</span>
                <div className="flex-1">
                  <p className="text-xs text-orange-800 font-medium">
                    표준 모듈 범위를 벗어났습니다. 면적 입력 방식으로 전환해주세요.
                  </p>
                  <button
                    onClick={handleSwitchToArea}
                    className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                  >
                    면적 단위로 전환
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 포장 모듈 자동 분류 결과 */}
          {result && result.moduleSummary && result.moduleSummary.length > 0 && !result.hasUnclassified && (
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  표준 포장 모듈 자동 분류 결과
                </span>
              </div>

              {/* 모듈 시각적 표시 */}
              <div className="flex gap-1.5 mb-3">
                {['소형', '중형', '대형'].map(moduleName => {
                  const isSelected = result.moduleSummary?.some(agg => agg.module === moduleName)
                  const moduleSpec = moduleName === '소형'
                    ? { width: 550, depth: 275 }
                    : moduleName === '중형'
                    ? { width: 550, depth: 366 }
                    : { width: 650, depth: 450 }

                  return (
                    <div
                      key={moduleName}
                      className={`flex-1 py-2 px-2 border rounded text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{moduleName}</div>
                      <div className="text-[9px] mt-0.5">
                        {moduleSpec.width}×{moduleSpec.depth}mm
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 환산 결과 요약 (펼치기/접기) */}
              <div>
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => setShowModuleDetails(!showModuleDetails)}
                >
                  <span className="text-xs font-semibold text-slate-700">
                    환산 결과 요약
                  </span>
                  <span className="text-xs text-blue-600 hover:text-blue-800">
                    {showModuleDetails ? '접기' : '펼치기'}
                  </span>
                </div>

                {showModuleDetails && (
                  <div className="space-y-2">
                    {result.moduleSummary.map((summary, idx) => {
                      // 모드별 환산 값 계산
                      const pallets = mode === 'STORAGE' ? Math.ceil(summary.estimatedCubes / 128) : null
                      const cubes = summary.estimatedCubes

                      return (
                        <div key={idx} className="bg-slate-50 rounded p-2">
                          <div className="text-xs text-slate-800">
                            {mode === 'STORAGE' ? (
                              <span>
                                <span className="font-bold">{summary.module} 모듈</span>, 높이 {summary.heightMax}mm, {summary.boxCount}개 박스 = 총 <span className="font-bold text-blue-700">{pallets} 파렛트</span>
                              </span>
                            ) : (
                              <span>
                                <span className="font-bold">{summary.module} 모듈</span>, 높이 {summary.heightMax}mm, {summary.boxCount}개 박스 = 총 <span className="font-bold text-emerald-700">{cubes} 큐브</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 최종 결과 + 시각화 */}
          {result && !result.hasUnclassified && (
            <div className="border border-slate-300 rounded-lg p-4 space-y-4">
              {/* 안내사항 타이틀 */}
              <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                📋 안내사항
              </div>

              {/* 파렛트/큐브 기준 시각화 */}
              <div className="flex items-center justify-center">
                {mode === 'STORAGE' ? (
                  <PalletIcon3D showDimensions={true} size={100} />
                ) : (
                  <CubeIcon3D showDimensions={true} size={100} />
                )}
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">
                  {mode === 'STORAGE' ? `${result.demandPallets} 파렛트` : `${result.demandCubes} 큐브`}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-slate-200"></div>

              {/* 창고/트럭 기준 시각화 */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2 text-center">
                  참고: 기준 창고/트럭 규모 환산
                </div>
                <div className="flex items-center justify-center gap-6">
                  <WarehouseIcon
                    count={
                      mode === 'STORAGE'
                        ? cbmToWarehouseCount(palletsToCBM(result.demandPallets || 0))
                        : cbmToWarehouseCount(cubesToCBM(result.demandCubes))
                    }
                    size={60}
                  />
                  <TruckIcon
                    count={
                      mode === 'STORAGE'
                        ? cbmToTruckCount(palletsToCBM(result.demandPallets || 0))
                        : cbmToTruckCount(cubesToCBM(result.demandCubes))
                    }
                    size={60}
                  />
                </div>
              </div>

              {/* 보조 정보 */}
              <div className="bg-slate-50 rounded p-2 text-center">
                <div className="text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {mode === 'STORAGE'
                      ? `${palletsToCBM(result.demandPallets || 0)} CBM`
                      : `${cubesToCBM(result.demandCubes)} CBM`}
                    {' '}(구매 공간 기준 체적)
                  </span>
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="text-[10px] text-slate-500 text-center leading-relaxed">
                구매자의 이해를 돕기 위한 정보이며, 현장 적재 상황에 따라 사용 형태는 달라질 수 있습니다.
              </div>

              {/* 구분선 */}
              <div className="border-t border-slate-200"></div>

              {/* 체크박스 확인 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="conversion-confirmed"
                  checked={conversionConfirmed}
                  onChange={(e) => setConversionConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="conversion-confirmed" className="text-xs text-slate-700 cursor-pointer select-none">
                  환산 결과를 확인했습니다
                </label>
              </div>

              {/* 환산 상세 결과 (체크 후 펼침) */}
              {conversionConfirmed && (
                <div className="space-y-3 border-t border-slate-200 pt-3">
                  <div className="text-xs font-semibold text-slate-700">
                    환산 상세 결과
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-blue-900">
                      {mode === 'STORAGE'
                        ? `총 ${result.demandPallets} 파렛트`
                        : `총 ${result.demandCubes} 큐브`}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      {mode === 'STORAGE'
                        ? '1파렛트 = 1.1m × 1.1m × 1.8m'
                        : '1큐브 = 250mm × 250mm × 250mm (0.015625m³)'}
                    </div>
                  </div>

                  {/* CTA 버튼 */}
                  <button
                    onClick={onSelectConfirm}
                    disabled={isButtonDisabled()}
                    className={`w-full py-2 text-sm font-bold rounded-lg transition-colors ${
                      isButtonDisabled()
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : mode === 'STORAGE'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {mode === 'STORAGE'
                      ? `${result.demandPallets} 파렛트를 선택하시겠습니까?`
                      : `${result.demandCubes} 큐브로 운송을 요청하시겠습니까?`}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 면적 단위 입력 */}
      {inputType === 'area' && (
        <>
          <div className={`rounded-lg p-3 space-y-2 ${areaConfirmed ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700">
                면적 (㎡) {areaConfirmed && <span className="text-green-600">✓ 완료</span>}
              </label>
            </div>
            <input
              type="number"
              min="0"
              step="0.1"
              value={tempAreaM2 || ''}
              onChange={(e) => {
                setTempAreaM2(Number(e.target.value))
                setAreaConfirmed(false)
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={areaConfirmed}
              placeholder="면적을 입력하세요"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-100"
            />

            {/* 입력 완료 버튼 */}
            {!areaConfirmed && (
              <button
                onClick={() => {
                  if (tempAreaM2 > 0) {
                    onAreaChange(tempAreaM2)
                    setAreaConfirmed(true)
                  }
                }}
                disabled={!tempAreaM2 || tempAreaM2 <= 0}
                className={`w-full py-2 text-xs font-bold rounded transition-colors ${
                  tempAreaM2 && tempAreaM2 > 0
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                입력 완료
              </button>
            )}
          </div>

          {result && areaConfirmed && (
            <div className="border border-slate-300 rounded-lg p-4 space-y-4">
              {/* 안내사항 타이틀 */}
              <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">
                📋 안내사항
              </div>

              {/* 파렛트/큐브 기준 시각화 */}
              <div className="flex items-center justify-center">
                {mode === 'STORAGE' ? (
                  <PalletIcon3D showDimensions={true} size={100} />
                ) : (
                  <CubeIcon3D showDimensions={true} size={100} />
                )}
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-slate-900">
                  {mode === 'STORAGE' ? `${result.demandPallets} 파렛트` : `${result.demandCubes} 큐브`}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-slate-200"></div>

              {/* 창고/트럭 기준 시각화 */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2 text-center">
                  참고: 기준 창고/트럭 규모 환산
                </div>
                <div className="flex items-center justify-center gap-6">
                  <WarehouseIcon
                    count={
                      mode === 'STORAGE'
                        ? cbmToWarehouseCount(palletsToCBM(result.demandPallets || 0))
                        : cbmToWarehouseCount(cubesToCBM(result.demandCubes))
                    }
                    size={60}
                  />
                  <TruckIcon
                    count={
                      mode === 'STORAGE'
                        ? cbmToTruckCount(palletsToCBM(result.demandPallets || 0))
                        : cbmToTruckCount(cubesToCBM(result.demandCubes))
                    }
                    size={60}
                  />
                </div>
              </div>

              {/* 보조 정보 */}
              <div className="bg-slate-50 rounded p-2 text-center">
                <div className="text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {mode === 'STORAGE'
                      ? `${palletsToCBM(result.demandPallets || 0)} CBM`
                      : `${cubesToCBM(result.demandCubes)} CBM`}
                    {' '}(구매 공간 기준 체적)
                  </span>
                </div>
              </div>

              {/* 안내 문구 */}
              <div className="text-[10px] text-slate-500 text-center leading-relaxed">
                구매자의 이해를 돕기 위한 정보이며, 현장 적재 상황에 따라 사용 형태는 달라질 수 있습니다.
              </div>

              {/* 구분선 */}
              <div className="border-t border-slate-200"></div>

              {/* 체크박스 확인 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="conversion-confirmed-area"
                  checked={conversionConfirmed}
                  onChange={(e) => setConversionConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="conversion-confirmed-area" className="text-xs text-slate-700 cursor-pointer select-none">
                  환산 결과를 확인했습니다
                </label>
              </div>

              {/* 환산 상세 결과 (체크 후 펼침) */}
              {conversionConfirmed && (
                <div className="space-y-3 border-t border-slate-200 pt-3">
                  <div className="text-xs font-semibold text-slate-700">
                    환산 상세 결과
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-bold text-blue-900">
                      {mode === 'STORAGE'
                        ? `총 ${result.demandPallets} 파렛트`
                        : `총 ${result.demandCubes} 큐브`}
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      {mode === 'STORAGE'
                        ? '1파렛트 = 1.1m × 1.1m × 1.8m'
                        : '1큐브 = 250mm × 250mm × 250mm (0.015625m³)'}
                    </div>
                  </div>

                  {/* CTA 버튼 */}
                  <button
                    onClick={onSelectConfirm}
                    disabled={isButtonDisabled()}
                    className={`w-full py-2 text-sm font-bold rounded-lg transition-colors ${
                      isButtonDisabled()
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : mode === 'STORAGE'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {mode === 'STORAGE'
                      ? `${result.demandPallets} 파렛트를 선택하시겠습니까?`
                      : `${result.demandCubes} 큐브로 운송을 요청하시겠습니까?`}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
