// 순서 선택 컴포넌트 - 보관+운송 탭에서 서비스 순서 선택
import type { ServiceOrder } from '../../../../types/models'

interface OrderSelectorProps {
  value: ServiceOrder
  onChange: (order: ServiceOrder) => void
}

export default function OrderSelector({
  value,
  onChange,
}: OrderSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-700">서비스 순서 선택</div>

      <div className="grid grid-cols-2 gap-3">
        {/* 보관 후 운송 */}
        <button
          onClick={() => onChange('storage-first')}
          className={`p-4 rounded-xl border-2 transition-all ${
            value === 'storage-first'
              ? 'border-purple-500 bg-purple-50'
              : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-lg">
              <span className={value === 'storage-first' ? 'text-blue-600' : 'text-slate-400'}>
                📦
              </span>
              <span className="text-slate-400">→</span>
              <span className={value === 'storage-first' ? 'text-emerald-600' : 'text-slate-400'}>
                🚚
              </span>
            </div>
            <div className={`text-sm font-semibold ${value === 'storage-first' ? 'text-purple-700' : 'text-slate-600'}`}>
              보관 후 운송
            </div>
            <div className="text-[10px] text-slate-500 text-center">
              화물을 먼저 보관한 후<br />운송을 진행합니다
            </div>
          </div>
        </button>

        {/* 운송 후 보관 */}
        <button
          onClick={() => onChange('transport-first')}
          className={`p-4 rounded-xl border-2 transition-all ${
            value === 'transport-first'
              ? 'border-purple-500 bg-purple-50'
              : 'border-slate-200 bg-white hover:border-slate-400'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-lg">
              <span className={value === 'transport-first' ? 'text-emerald-600' : 'text-slate-400'}>
                🚚
              </span>
              <span className="text-slate-400">→</span>
              <span className={value === 'transport-first' ? 'text-blue-600' : 'text-slate-400'}>
                📦
              </span>
            </div>
            <div className={`text-sm font-semibold ${value === 'transport-first' ? 'text-purple-700' : 'text-slate-600'}`}>
              운송 후 보관
            </div>
            <div className="text-[10px] text-slate-500 text-center">
              화물을 먼저 운송한 후<br />보관을 진행합니다
            </div>
          </div>
        </button>
      </div>

      {/* 선택 시 안내 */}
      {value && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-xs text-purple-800">
            {value === 'storage-first' ? (
              <>
                <span className="font-semibold">보관 후 운송</span>을 선택하셨습니다.
                <br />운송 날짜는 보관 종료일로 자동 지정됩니다.
              </>
            ) : (
              <>
                <span className="font-semibold">운송 후 보관</span>을 선택하셨습니다.
                <br />보관 시작일은 운송 날짜로 자동 지정됩니다.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
