// 화물 조건 입력 폼 컴포넌트
import type { UnitLoadModule, HandlingOption } from '../../types/models'
import { UNIT_LOAD_MODULES, HANDLING_OPTIONS } from '../../data/mockData'

interface CargoConditionFormProps {
  unitLoadModule: UnitLoadModule
  handlingOptions: HandlingOption[]
  quantity: number
  onUnitLoadChange: (module: UnitLoadModule) => void
  onHandlingOptionToggle: (option: HandlingOption) => void
  onQuantityChange: (quantity: number) => void
}

export default function CargoConditionForm({
  unitLoadModule,
  handlingOptions,
  quantity,
  onUnitLoadChange,
  onHandlingOptionToggle,
  onQuantityChange,
}: CargoConditionFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>📋</span>
        화물 조건 입력
      </h3>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        {/* 유니트 로드 모듈 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            유니트 로드:
          </label>
          <div className="flex gap-3">
            {UNIT_LOAD_MODULES.map((module) => (
              <label
                key={module}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="unitLoad"
                  value={module}
                  checked={unitLoadModule === module}
                  onChange={() => onUnitLoadChange(module)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{module}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 취급 특이사항 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            취급 특이사항:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HANDLING_OPTIONS.map((option) => (
              <label
                key={option}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={handlingOptions.includes(option)}
                  onChange={() => onHandlingOptionToggle(option)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 물동량 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            물동량:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-600">파렛트</span>
          </div>
        </div>
      </div>
    </div>
  )
}
