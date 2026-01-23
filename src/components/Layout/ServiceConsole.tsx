// 서비스 콘솔 - 탭 + 아코디언 폼 (PR3-2 최종: 박스 실측 → 자동 분류 → 선택 확정)
import { useState, useEffect } from 'react'
import type { BoxInput, BoxBasedAreaSelection, ModuleInputs } from '../../types/models'
import {
  classifyBoxes,
  aggregateByModule,
  hasUnclassifiedBoxes,
  runClassificationTests,
  validateClassification,
  validatePalletCalculation
} from '../../utils/boxClassifier'
import { calcPallets, calculatePalletsFromArea } from '../../utils/palletCalculator'

type ServiceType = 'storage' | 'transport' | 'both'

// 박스 ID 생성용
let boxIdCounter = 0

export default function ServiceConsole() {
  const [activeTab, setActiveTab] = useState<ServiceType>('storage')
  const [expandedField, setExpandedField] = useState<string | null>(null)

  // 선택 확정된 파렛트 수
  const [selectedStoragePallets, setSelectedStoragePallets] = useState<number | null>(null)
  const [selectedTransportPallets, setSelectedTransportPallets] = useState<number | null>(null)
  const [selectedBothStoragePallets, setSelectedBothStoragePallets] = useState<number | null>(null)
  const [selectedBothTransportPallets, setSelectedBothTransportPallets] = useState<number | null>(null)

  // 보관 탭 상태
  const [storageArea, setStorageArea] = useState<BoxBasedAreaSelection>({
    inputType: 'box',
    boxes: [],
  })

  // 운송 탭 상태
  const [transportArea, setTransportArea] = useState<BoxBasedAreaSelection>({
    inputType: 'box',
    boxes: [],
  })

  // 보관+운송 탭 상태
  const [bothStorageArea, setBothStorageArea] = useState<BoxBasedAreaSelection>({
    inputType: 'box',
    boxes: [],
  })
  const [bothTransportArea, setBothTransportArea] = useState<BoxBasedAreaSelection>({
    inputType: 'box',
    boxes: [],
  })

  const handleFieldClick = (fieldId: string) => {
    setExpandedField(expandedField === fieldId ? null : fieldId)
  }

  const handleSelectPallets = (fieldId: string, pallets: number) => {
    // 파렛트 확정 저장
    if (activeTab === 'storage' && fieldId === 'storage-area') {
      setSelectedStoragePallets(pallets)
      setExpandedField('storage-product') // 다음 아코디언으로 이동
    } else if (activeTab === 'transport' && fieldId === 'transport-area') {
      setSelectedTransportPallets(pallets)
      setExpandedField('transport-product')
    } else if (activeTab === 'both' && fieldId === 'both-storage-area') {
      setSelectedBothStoragePallets(pallets)
      setExpandedField('both-transport-area')
    } else if (activeTab === 'both' && fieldId === 'both-transport-area') {
      setSelectedBothTransportPallets(pallets)
      setExpandedField('both-product')
    }
  }

  const handleSearch = () => {
    console.log('=== 검색 시작 ===')
    console.log('활성 탭:', activeTab)

    if (activeTab === 'storage') {
      console.log('보관 수요면적:', storageArea)
      console.log('선택된 파렛트:', selectedStoragePallets)
    } else if (activeTab === 'transport') {
      console.log('운송 수요면적:', transportArea)
      console.log('선택된 파렛트:', selectedTransportPallets)
    } else if (activeTab === 'both') {
      console.log('보관 수요면적:', bothStorageArea)
      console.log('선택된 보관 파렛트:', selectedBothStoragePallets)
      console.log('운송 수요면적:', bothTransportArea)
      console.log('선택된 운송 파렛트:', selectedBothTransportPallets)
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
              summary={getAreaSummary(storageArea, selectedStoragePallets)}
            >
              <AreaInputField
                fieldId="storage-area"
                selection={storageArea}
                onChange={setStorageArea}
                onSelectPallets={handleSelectPallets}
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
              summary={getAreaSummary(transportArea, selectedTransportPallets)}
            >
              <AreaInputField
                fieldId="transport-area"
                selection={transportArea}
                onChange={setTransportArea}
                onSelectPallets={handleSelectPallets}
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
              summary={getAreaSummary(bothStorageArea, selectedBothStoragePallets)}
            >
              <AreaInputField
                fieldId="both-storage-area"
                selection={bothStorageArea}
                onChange={setBothStorageArea}
                onSelectPallets={handleSelectPallets}
              />
            </AccordionField>
            <AccordionField
              id="both-transport-area"
              label="운송 수요면적"
              placeholder="화물량을 운송 시 필요한 면적으로 환산합니다."
              expanded={expandedField === 'both-transport-area'}
              onToggle={() => handleFieldClick('both-transport-area')}
              summary={getAreaSummary(bothTransportArea, selectedBothTransportPallets)}
            >
              <AreaInputField
                fieldId="both-transport-area"
                selection={bothTransportArea}
                onChange={setBothTransportArea}
                onSelectPallets={handleSelectPallets}
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

function getAreaSummary(selection: BoxBasedAreaSelection, selectedPallets: number | null): string | undefined {
  // 선택 확정된 경우
  if (selectedPallets !== null) {
    return `선택됨: ${selectedPallets} 파렛트`
  }

  // 입력 중인 경우
  if (selection.inputType === 'box' && selection.boxes && selection.boxes.length > 0) {
    if (selection.estimatedPallets !== undefined && selection.estimatedPallets > 0) {
      return `박스 ${selection.boxes.length}종 → ${selection.estimatedPallets} 파렛트`
    }
    return `박스 ${selection.boxes.length}종 입력됨`
  }
  if (selection.inputType === 'area' && selection.areaInSquareMeters && selection.estimatedPallets) {
    return `${selection.areaInSquareMeters}㎡ → ${selection.estimatedPallets} 파렛트`
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

// ============ 면적 입력 필드 (박스 기반 + 면적 fallback) ============

interface AreaInputFieldProps {
  fieldId: string
  selection: BoxBasedAreaSelection
  onChange: (selection: BoxBasedAreaSelection) => void
  onSelectPallets: (fieldId: string, pallets: number) => void
}

function AreaInputField({ fieldId, selection, onChange, onSelectPallets }: AreaInputFieldProps) {
  const [showModuleDetails, setShowModuleDetails] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // 분류 테스트 실행 (컴포넌트 마운트 시 1회)
  useEffect(() => {
    const testResult = runClassificationTests()
    if (!testResult.passed) {
      console.warn('분류 테스트 실패:', testResult.errors)
    }
  }, [])

  // 박스 입력 변경 시 자동 분류 및 계산
  useEffect(() => {
    if (selection.inputType === 'box' && selection.boxes && selection.boxes.length > 0) {
      // 자동 분류
      const classifiedBoxes = classifyBoxes(selection.boxes)
      const hasUnclassified = hasUnclassifiedBoxes(classifiedBoxes)

      // 분류 검증
      const classValidation = validateClassification(classifiedBoxes)

      // 모듈별 집계
      const moduleAggregates = aggregateByModule(classifiedBoxes)

      // calcPallets 호출을 위한 inputs 구성
      const inputs: ModuleInputs = {}
      moduleAggregates.forEach(agg => {
        inputs[agg.moduleName] = {
          count: agg.countTotal,
          height: agg.heightMax,
        }
      })

      // 선택된 모듈 Set 구성
      const selectedModules = new Set(moduleAggregates.map(agg => agg.moduleName))

      // 최종 팔레트 계산 (기존 calcPallets 사용)
      const result = calcPallets(selectedModules, inputs)

      // 팔레트 계산 검증
      const palletValidation = validatePalletCalculation(moduleAggregates, result.pallets)

      // 검증 에러 수집
      const errors = [...classValidation.errors, ...palletValidation.errors]
      setValidationErrors(errors)

      if (errors.length > 0) {
        console.warn('검증 에러:', errors)
      }

      onChange({
        ...selection,
        classifiedBoxes,
        moduleAggregates,
        hasUnclassified,
        estimatedPallets: result.pallets,
      })
    }
  }, [selection.boxes])

  const handleInputTypeChange = (inputType: 'box' | 'area') => {
    onChange({
      inputType,
      boxes: inputType === 'box' ? [] : undefined,
      areaInSquareMeters: inputType === 'area' ? 0 : undefined,
    })
    setValidationErrors([])
  }

  const handleAddBox = () => {
    const newBox: BoxInput = {
      id: `box-${++boxIdCounter}`,
      width: 0,
      depth: 0,
      height: 0,
      count: 0,
    }

    onChange({
      ...selection,
      boxes: [...(selection.boxes || []), newBox],
    })
  }

  const handleRemoveBox = (boxId: string) => {
    onChange({
      ...selection,
      boxes: (selection.boxes || []).filter(b => b.id !== boxId),
    })
  }

  const handleBoxChange = (boxId: string, field: keyof BoxInput, value: number) => {
    onChange({
      ...selection,
      boxes: (selection.boxes || []).map(box =>
        box.id === boxId ? { ...box, [field]: value } : box
      ),
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

  const handleSwitchToArea = () => {
    onChange({
      inputType: 'area',
      areaInSquareMeters: 0,
    })
    setValidationErrors([])
  }

  const handleSelectPalletsClick = () => {
    if (selection.estimatedPallets) {
      onSelectPallets(fieldId, selection.estimatedPallets)
    }
  }

  return (
    <div className="space-y-4">
      {/* 플로우 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <p className="text-xs text-blue-800">
          📝 입력한 박스 → 표준 모듈로 자동 분류 → 모듈별 적재량을 합산해 파렛트로 환산합니다.
        </p>
      </div>

      {/* 단위 선택 */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">단위 선택</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleInputTypeChange('box')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selection.inputType === 'box'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            포장 단위
          </button>
          <button
            onClick={() => handleInputTypeChange('area')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selection.inputType === 'area'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            면적 단위
          </button>
        </div>
      </div>

      {/* 포장 단위 입력 */}
      {selection.inputType === 'box' && (
        <>
          {/* 검증 실패 경고 */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600">❌</span>
                <div className="flex-1">
                  <p className="text-xs text-red-800 font-medium">계산 검증 실패</p>
                  {validationErrors.map((err, idx) => (
                    <p key={idx} className="text-xs text-red-700 mt-1">• {err}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* UNCLASSIFIED 경고 */}
          {selection.hasUnclassified && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-orange-600">⚠️</span>
                <div className="flex-1">
                  <p className="text-xs text-orange-800 font-medium">
                    일부 박스는 표준 포장 모듈로 분류 불가
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    면적 단위로 계산을 권장합니다.
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

            {selection.boxes && selection.boxes.length > 0 ? (
              <div className="space-y-2">
                {selection.boxes.map((box, index) => (
                  <div key={box.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        박스 {index + 1}
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
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
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
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
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
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
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
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-300 rounded">
                "+ 박스 종류 추가" 버튼을 눌러 박스 정보를 입력하세요
              </div>
            )}
          </div>

          {/* 분류 결과 */}
          {selection.classifiedBoxes && selection.classifiedBoxes.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  표준 포장 모듈 자동 분류 결과
                </span>
              </div>

              <div className="flex gap-1.5">
                {['소형', '중형', '대형'].map(moduleName => {
                  const isSelected = selection.moduleAggregates?.some(agg => agg.moduleName === moduleName)
                  return (
                    <div
                      key={moduleName}
                      className={`flex-1 py-1.5 px-2 border rounded text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{moduleName}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 모듈별 요약 */}
          {selection.moduleAggregates && selection.moduleAggregates.length > 0 && (
            <div className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  모듈별 적재량 요약
                </span>
                <button
                  onClick={() => setShowModuleDetails(!showModuleDetails)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showModuleDetails ? '접기' : '펼치기'}
                </button>
              </div>

              {showModuleDetails && (
                <div className="space-y-2">
                  {selection.moduleAggregates.map(agg => (
                    <div key={agg.moduleName} className="bg-slate-50 rounded p-2">
                      <div className="text-xs font-bold text-slate-800 mb-1">
                        {agg.moduleName}
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        <div>• 높이 최대 {agg.heightMax}mm</div>
                        <div>• 총 {agg.countTotal}박스</div>
                        <div>
                          • {agg.palletsStandalone} 파렛트
                          <span className="text-slate-500 ml-1">(단독 적재 가정)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 최종 총 파렛트 + CTA */}
          {selection.estimatedPallets !== undefined && selection.estimatedPallets > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-900">
                    총 필요 공간: {selection.estimatedPallets} 파렛트
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    1파렛트 = 1.1m × 1.1m, 최대 적재 높이 1.8m 기준
                  </div>

                  {/* 혼합 적재 보정 배지 */}
                  {selection.moduleAggregates && selection.moduleAggregates.length > 1 && (
                    <div className="mt-1.5">
                      <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-medium rounded">
                        혼합 적재 보정 +10% 적용
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={handleSelectPalletsClick}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                {selection.estimatedPallets} 파렛트를 선택하시겠습니까?
              </button>
            </div>
          )}
        </>
      )}

      {/* 면적 단위 입력 */}
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

          {selection.estimatedPallets !== undefined && selection.estimatedPallets > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-blue-900">
                    {selection.estimatedPallets} 파렛트
                  </div>
                  <div className="text-xs text-blue-700 mt-0.5">
                    1파렛트 = 1.1m × 1.1m
                  </div>
                </div>
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={handleSelectPalletsClick}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                {selection.estimatedPallets} 파렛트를 선택하시겠습니까?
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
