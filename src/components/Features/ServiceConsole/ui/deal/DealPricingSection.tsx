import type { StorageProduct, RouteProduct } from '../../../../../types/models'
import type { BillableCubesResult, EstimatedTotalResult } from '../../../../../engine/pricing/cubeSettlement'
import type { ServiceType } from '../../hooks/useServiceConsoleState'

/** 정산 계산 결과 타입 (DealPage.tsx 내부 costCalculation useMemo 반환 타입) */
export interface DealCostCalculation {
  baseCost: number
  cubeCost: number
  weightCost: number
  optionsCost: number
  totalCost: number
  totalWeightKg: number
  storageBillable: BillableCubesResult | null
  routeBillable: BillableCubesResult | null
  storageResult: EstimatedTotalResult | null
  routeResult: EstimatedTotalResult | null
  storageDays: number
  storageDaysIsEstimated: boolean
}

interface DealPricingSectionProps {
  activeTab: ServiceType
  storageProduct?: StorageProduct
  routeProduct?: RouteProduct
  costCalculation: DealCostCalculation
}

export function DealPricingSection({
  activeTab,
  storageProduct,
  routeProduct,
  costCalculation,
}: DealPricingSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">거래 요약</h3>
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">

        {/* Storage 정산 */}
        {storageProduct && costCalculation.storageBillable && (
          <div className="pb-4 border-b border-slate-300">
            <div className="text-sm font-semibold text-slate-700 mb-3">보관 서비스</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`p-3 rounded-lg border-2 ${
                costCalculation.storageBillable.billableCubes === costCalculation.storageBillable.volumeCubes
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <div className="text-xs text-slate-600 mb-1">총 부피</div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{costCalculation.storageBillable.volumeCubes} 큐브</div>
                  {costCalculation.storageBillable.billableCubes === costCalculation.storageBillable.volumeCubes && (
                    <span className="text-teal-600 text-lg">✓</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 ${
                costCalculation.storageBillable.billableCubes === costCalculation.storageBillable.weightCubes
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <div className="text-xs text-slate-600 mb-1">총 중량</div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{costCalculation.storageBillable.weightCubes} 큐브</div>
                  {costCalculation.storageBillable.billableCubes === costCalculation.storageBillable.weightCubes && (
                    <span className="text-teal-600 text-lg">✓</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-3 text-center">
              💡 두 큐브값 중 더 큰 값이 과금에 적용됩니다
            </div>
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-600 mb-2">정산 공식</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-teal-700">{costCalculation.storageBillable.billableCubes}큐브</span>
                <span className="text-slate-400">×</span>
                <span className="font-medium text-slate-700">₩{storageProduct.unitPricePerCube.toLocaleString()}/큐브</span>
                <span className="text-slate-400">×</span>
                <span className="font-medium text-slate-700">
                  {costCalculation.storageDays}일
                  {costCalculation.storageDaysIsEstimated && <span className="text-slate-400 text-xs ml-1">(추정)</span>}
                </span>
                <span className="text-slate-400">=</span>
                <span className="font-bold text-slate-900">₩{costCalculation.storageResult?.base.toLocaleString()}</span>
              </div>
              {costCalculation.storageBillable.weightSurchargeApplied && (
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <span>⚠</span>
                  <span>중량이 부피보다 커서 중량 기준으로 과금됩니다</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Route 정산 */}
        {routeProduct && costCalculation.routeBillable && (
          <div className={storageProduct ? 'pb-4 border-b border-slate-300' : ''}>
            <div className="text-sm font-semibold text-slate-700 mb-3">운송 서비스</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className={`p-3 rounded-lg border-2 ${
                costCalculation.routeBillable.billableCubes === costCalculation.routeBillable.volumeCubes
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <div className="text-xs text-slate-600 mb-1">총 부피</div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{costCalculation.routeBillable.volumeCubes} 큐브</div>
                  {costCalculation.routeBillable.billableCubes === costCalculation.routeBillable.volumeCubes && (
                    <span className="text-teal-600 text-lg">✓</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 ${
                costCalculation.routeBillable.billableCubes === costCalculation.routeBillable.weightCubes
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}>
                <div className="text-xs text-slate-600 mb-1">총 중량</div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{costCalculation.routeBillable.weightCubes} 큐브</div>
                  {costCalculation.routeBillable.billableCubes === costCalculation.routeBillable.weightCubes && (
                    <span className="text-teal-600 text-lg">✓</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-3 text-center">
              💡 두 큐브값 중 더 큰 값이 과금에 적용됩니다
            </div>
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-600 mb-2">정산 공식</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-teal-700">{costCalculation.routeBillable.billableCubes}큐브</span>
                <span className="text-slate-400">×</span>
                <span className="font-medium text-slate-700">₩{routeProduct.unitPricePerCube.toLocaleString()}/큐브</span>
                <span className="text-slate-400">=</span>
                <span className="font-bold text-slate-900">₩{costCalculation.routeResult?.base.toLocaleString()}</span>
              </div>
              {costCalculation.routeBillable.weightSurchargeApplied && (
                <div className="text-xs text-orange-600 flex items-center gap-1">
                  <span>⚠</span>
                  <span>중량이 부피보다 커서 중량 기준으로 과금됩니다</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 총 중량 정보 */}
        <div className="text-xs text-slate-600 bg-slate-100 rounded p-2">
          📦 총 중량: {costCalculation.totalWeightKg.toFixed(1)}kg
        </div>

        {/* 최종 정산 공식 시각화 */}
        <div className="pt-3 border-t-2 border-slate-300">
          <div className="text-sm font-semibold text-slate-700 mb-3">최종 정산</div>
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {activeTab === 'storage' ? '보관 비용' : activeTab === 'transport' ? '운송 비용' : '보관 + 운송 비용'}
              </span>
              <span className="font-bold text-slate-900">₩{costCalculation.baseCost.toLocaleString()}</span>
            </div>
            {costCalculation.optionsCost > 0 && (
              <>
                <div className="flex items-center justify-center text-slate-400">
                  <span className="text-lg">+</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">부가 옵션</span>
                  <span className="font-bold text-teal-600">₩{costCalculation.optionsCost.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="border-t border-slate-200"></div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-slate-900 text-lg">최종 예상 금액</span>
              <span className="font-bold text-teal-700 text-2xl">₩{Math.round(costCalculation.totalCost).toLocaleString()}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-3 space-y-1">
            <div>💡 큐브 당 단가(₩/Cube) 기준으로 계산됩니다</div>
            <div>💡 중량이 부피보다 무거울 경우 중량 기준 큐브로 과금됩니다</div>
          </div>
        </div>
      </div>
    </section>
  )
}
