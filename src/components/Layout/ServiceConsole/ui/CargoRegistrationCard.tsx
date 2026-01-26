// 화물 등록 카드 컴포넌트 - 박스 규격 + 품목 + 중량을 한 번에 입력
import { useState } from 'react'
import type { CargoUI, WeightRange } from '../../../../types/models'
import { classifyModule } from '../../../../engine'
import { PRODUCT_CATEGORIES, WEIGHT_RANGES } from '../../../../data/mockData'

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

  // 분류 결과 적용
  const handleClassify = () => {
    if (classification) {
      onChange(cargo.id, { moduleType: classification.module })
      setShowClassifyResult(true)
    }
  }

  // 모든 정보가 입력되었는지 확인
  const isComplete = hasBoxDimensions &&
    cargo.moduleType &&
    cargo.productCategory &&
    cargo.weightRange

  const isConfirmed = cargo.completed === true

  // 선택된 품목 카테고리
  const selectedCategory = PRODUCT_CATEGORIES.find(c => c.code === cargo.productCategory)

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

        {/* 분류 버튼 */}
        {hasBoxDimensions && !showClassifyResult && !isConfirmed && (
          <button
            onClick={handleClassify}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition-colors"
          >
            포장 모듈 분류하기
          </button>
        )}

        {/* 분류 결과 표시 (기존 ModuleClassifyResult 스타일 재사용) */}
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

      {/* 2. 품목 선택 */}
      {(showClassifyResult || isConfirmed) && cargo.moduleType && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">품목</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={cargo.productCategory || ''}
              onChange={(e) => onChange(cargo.id, { productCategory: e.target.value, productSubCategory: undefined })}
              disabled={isConfirmed}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
            >
              <option value="">대분류 선택</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
              ))}
            </select>
            <select
              value={cargo.productSubCategory || ''}
              onChange={(e) => onChange(cargo.id, { productSubCategory: e.target.value })}
              disabled={isConfirmed || !cargo.productCategory}
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs disabled:bg-slate-100"
            >
              <option value="">소분류 선택</option>
              {selectedCategory?.subCategories?.map(sub => (
                <option key={sub.code} value={sub.code}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 3. 중량 선택 */}
      {(showClassifyResult || isConfirmed) && cargo.moduleType && cargo.productCategory && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">중량 구간</label>
          <div className="flex flex-wrap gap-1.5">
            {WEIGHT_RANGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onChange(cargo.id, { weightRange: value as WeightRange })}
                disabled={isConfirmed}
                className={`px-3 py-1.5 border rounded text-xs transition-colors ${
                  cargo.weightRange === value
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                } disabled:cursor-not-allowed`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 등록 정보 요약 및 등록 버튼 */}
      {isComplete && !isConfirmed && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-xs font-semibold text-blue-900 mb-2">등록 정보 요약</div>
            <div className="text-xs text-blue-800 space-y-1">
              <div>규격: {cargo.width}×{cargo.depth}×{cargo.height}mm ({cargo.moduleType})</div>
              <div>품목: {selectedCategory?.name} - {selectedCategory?.subCategories?.find(s => s.code === cargo.productSubCategory)?.name || '-'}</div>
              <div>중량: {WEIGHT_RANGES.find(w => w.value === cargo.weightRange)?.label}</div>
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
