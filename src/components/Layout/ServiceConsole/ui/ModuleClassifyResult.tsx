// 표준 포장 모듈 자동 분류 결과 컴포넌트
import type { DemandResult } from '../../../../engine'

interface ModuleClassifyResultProps {
  result: DemandResult
}

const MODULE_SPECS = {
  '소형': { width: 550, depth: 275 },
  '중형': { width: 550, depth: 366 },
  '대형': { width: 650, depth: 450 },
} as const

export default function ModuleClassifyResult({ result }: ModuleClassifyResultProps) {
  if (!result.moduleSummary || result.moduleSummary.length === 0 || result.hasUnclassified) {
    return null
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="mb-2">
        <span className="text-xs font-semibold text-slate-700">
          표준 포장 모듈 자동 분류 결과
        </span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {(['소형', '중형', '대형'] as const).map(moduleName => {
          const isSelected = result.moduleSummary?.some(agg => agg.module === moduleName)
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
    </div>
  )
}
