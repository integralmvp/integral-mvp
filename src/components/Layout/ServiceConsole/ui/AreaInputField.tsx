// 면적 입력 필드 컴포넌트
import { useState } from 'react'
import type { BoxInputUI } from '../../../../types/models'
import type { DemandResult } from '../../../../engine'
import BoxInputCard from './BoxInputCard'
import ModuleClassifyResult from './ModuleClassifyResult'
import ConversionResult from './ConversionResult'

// 박스 ID 생성용
let boxIdCounter = 0

export interface AreaInputFieldProps {
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

export default function AreaInputField({
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
  const [tempAreaM2, setTempAreaM2] = useState<number>(0)
  const [areaConfirmed, setAreaConfirmed] = useState(false)

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
                {boxes.map((box, index) => (
                  <BoxInputCard
                    key={box.id}
                    box={box}
                    index={index}
                    onRemove={handleRemoveBox}
                    onChange={handleBoxChange}
                    onComplete={handleBoxComplete}
                  />
                ))}
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
          {result && <ModuleClassifyResult result={result} />}

          {/* 환산 결과 */}
          {result && !result.hasUnclassified && (
            <ConversionResult
              result={result}
              mode={mode}
              isAreaInput={false}
              onSelectConfirm={onSelectConfirm}
              isButtonDisabled={isButtonDisabled()}
            />
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
            <ConversionResult
              result={result}
              mode={mode}
              isAreaInput={true}
              onSelectConfirm={onSelectConfirm}
              isButtonDisabled={isButtonDisabled()}
            />
          )}
        </>
      )}
    </div>
  )
}
