// 화물 등록 카드 컴포넌트 - 박스 규격 + 품목 + 중량을 한 번에 입력
// Code Data System 연동: 품목 코드셋, 밴드 자동 계산
import { useState, useMemo } from 'react'
import type { CargoUI } from '../../../../types/models'
import { classifyModule } from '../../../../engine'
import { getItemByCode } from '../../../../data/itemCodes'
import {
  getWeightBand,
  getSizeBand,
  calculateSumCm,
  getWeightBandLabel,
  getSizeBandLabel,
} from '../../../../data/bands'
import ItemCodeDropdown from './ItemCodeDropdown'

interface CargoRegistrationCardProps {
  cargo: CargoUI
  index: number
  onRemove: (cargoId: string) => void
  onChange: (cargoId: string, updates: Partial<CargoUI>) => void
  onComplete: (cargoId: string) => void
}

const MODULE_SPECS = {
  '소형': { width: 550, depth: 275, label: '8분할' },
  '중형': { width: 550, depth: 366, label: '6분할' },
  '대형': { width: 650, depth: 450, label: '4분할' },
} as const

export default function CargoRegistrationCard({
  cargo,
  index,
  onRemove,
  onChange,
  onComplete,
}: CargoRegistrationCardProps) {
  const [showClassifyResult, setShowClassifyResult] = useState(false)

  // 박스 규격이 모두 입력되었는지 확인
  const hasBoxDimensions = cargo.width > 0 && cargo.depth > 0 && cargo.height > 0

  // 분류 결과 계산
  const classification = hasBoxDimensions
    ? classifyModule({ widthMm: cargo.width, depthMm: cargo.depth, heightMm: cargo.height, count: 1 })
    : null

  // 3변합 및 밴드 자동 계산
  const calculatedBands = useMemo(() => {
    if (!hasBoxDimensions) return null

    const sumCm = calculateSumCm(cargo.width, cargo.depth, cargo.height)
    const sizeBand = getSizeBand(sumCm)
    const weightKg = cargo.weightKg || 0
    const weightBand = getWeightBand(weightKg)

    return { sumCm, sizeBand, weightBand }
  }, [cargo.width, cargo.depth, cargo.height, cargo.weightKg, hasBoxDimensions])

  // 분류 결과 적용
  const handleClassify = () => {
    if (classification && calculatedBands) {
      onChange(cargo.id, {
        moduleType: classification.module,
        sumCm: calculatedBands.sumCm,
        sizeBand: calculatedBands.sizeBand,
      })
      setShowClassifyResult(true)
    }
  }

  // 중량 변경 시 밴드 자동 업데이트
  const handleWeightChange = (weightKg: number) => {
    const weightBand = getWeightBand(weightKg)
    onChange(cargo.id, { weightKg, weightBand })
  }

  // 모든 정보가 입력되었는지 확인
  const isComplete = hasBoxDimensions &&
    cargo.moduleType &&
    cargo.itemCode &&
    cargo.weightKg !== undefined && cargo.weightKg > 0

  const isConfirmed = cargo.completed === true

  // 선택된 품목
  const selectedItem = cargo.itemCode ? getItemByCode(cargo.itemCode) : undefined

  return (
    <div className={`rounded-lg p-4 space-y-4 ${isConfirmed ? 'bg-green-50 border-2 border-green-300' : 'bg-slate-50 border border-slate-200'}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">
          화물 {index + 1} {isConfirmed && <span className="text-green-600">✓ 등록완료</span>}
        </span>
        <button
          onClick={() => onRemove(cargo.id)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          삭제
        </button>
      </div>

      {/* 1. 박스 규격 입력 */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">박스 규격</label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-slate-600 mb-1">가로(mm)</label>
            <input
              type="number"
              min="0"
              value={cargo.width || ''}
              onChange={(e) => {
                onChange(cargo.id, { width: Number(e.target.value), moduleType: undefined })
                setShowClassifyResult(false)
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isConfirmed}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
              placeholder="가로"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 mb-1">세로(mm)</label>
            <input
              type="number"
              min="0"
              value={cargo.depth || ''}
              onChange={(e) => {
                onChange(cargo.id, { depth: Number(e.target.value), moduleType: undefined })
                setShowClassifyResult(false)
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isConfirmed}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
              placeholder="세로"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 mb-1">높이(mm)</label>
            <input
              type="number"
              min="0"
              value={cargo.height || ''}
              onChange={(e) => {
                onChange(cargo.id, { height: Number(e.target.value), moduleType: undefined })
                setShowClassifyResult(false)
              }}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isConfirmed}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
              placeholder="높이"
            />
          </div>
        </div>

        {/* 3변합 표시 */}
        {hasBoxDimensions && calculatedBands && (
          <div className="text-[10px] text-slate-500">
            3변합: {calculatedBands.sumCm.toFixed(1)}cm
            <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
              {getSizeBandLabel(calculatedBands.sizeBand)}
            </span>
          </div>
        )}

        {/* 분류 버튼 */}
        {hasBoxDimensions && !showClassifyResult && !isConfirmed && (
          <button
            onClick={handleClassify}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition-colors"
          >
            포장 모듈 분류하기
          </button>
        )}

        {/* 분류 결과 표시 */}
        {(showClassifyResult || isConfirmed) && cargo.moduleType && (
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              포장 모듈 분류 결과
            </div>
            <div className="flex gap-1.5">
              {(['소형', '중형', '대형'] as const).map(moduleName => {
                const isSelected = cargo.moduleType === moduleName
                const moduleSpec = MODULE_SPECS[moduleName]

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
            {cargo.moduleType === 'UNCLASSIFIED' && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                비표준 규격입니다. 체적 기반으로 계산됩니다.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. 품목 선택 (플랫폼 표준 코드셋) */}
      {(showClassifyResult || isConfirmed) && cargo.moduleType && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">품목</label>
          <ItemCodeDropdown
            value={cargo.itemCode}
            onChange={(code) => onChange(cargo.id, { itemCode: code })}
            disabled={isConfirmed}
          />
          {selectedItem?.flags && Object.keys(selectedItem.flags).length > 0 && (
            <div className="text-[10px] text-orange-600 mt-1">
              {selectedItem.flags.hazmatLike && '* 취급 주의 품목입니다'}
              {selectedItem.flags.tempRequired && '* 온도 관리가 필요한 품목입니다'}
            </div>
          )}
        </div>
      )}

      {/* 3. 중량 입력 (kg 실수) */}
      {(showClassifyResult || isConfirmed) && cargo.moduleType && cargo.itemCode && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">중량</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.1"
              value={cargo.weightKg || ''}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              onWheel={(e) => e.currentTarget.blur()}
              disabled={isConfirmed}
              className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
              placeholder="중량 입력"
            />
            <span className="text-xs text-slate-600">kg</span>
          </div>
          {cargo.weightKg !== undefined && cargo.weightKg > 0 && cargo.weightBand && (
            <div className="text-[10px] text-slate-500">
              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                {getWeightBandLabel(cargo.weightBand)}
              </span>
              {cargo.weightKg > 20 && (
                <span className="ml-2 text-orange-600">* 일반 택배 기준(20kg) 초과</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 등록 정보 요약 및 등록 버튼 */}
      {isComplete && !isConfirmed && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs font-semibold text-blue-900 mb-2">등록 정보 요약</div>
            <div className="text-xs text-blue-800 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">규격:</span>
                <span>{cargo.width}×{cargo.depth}×{cargo.height}mm</span>
                <span className="px-1 py-0.5 bg-blue-100 rounded text-[10px]">
                  {cargo.moduleType}
                </span>
                {cargo.sizeBand && (
                  <span className="px-1 py-0.5 bg-slate-200 rounded text-[10px] text-slate-600">
                    {cargo.sizeBand}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">품목:</span>
                {selectedItem && (
                  <>
                    <span className="text-[10px] text-slate-400 font-mono">{selectedItem.code}</span>
                    <span>{selectedItem.label}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">중량:</span>
                <span>{cargo.weightKg}kg</span>
                {cargo.weightBand && (
                  <span className="px-1 py-0.5 bg-slate-200 rounded text-[10px] text-slate-600">
                    {cargo.weightBand}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onComplete(cargo.id)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            이 화물을 등록하시겠습니까?
          </button>
        </div>
      )}
    </div>
  )
}
