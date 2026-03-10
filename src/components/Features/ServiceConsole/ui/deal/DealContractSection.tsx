import type { StorageProduct, RouteProduct } from '../../../../../types/models'

interface DealContractSectionProps {
  agreed: boolean
  onChange: (agreed: boolean) => void
  storageProduct?: StorageProduct
  routeProduct?: RouteProduct
  onViewContract: () => void
}

export function DealContractSection({
  agreed,
  onChange,
  storageProduct,
  routeProduct,
  onViewContract,
}: DealContractSectionProps) {
  return (
    <section>
      <label className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 text-teal-600 rounded mt-0.5"
        />
        <div className="flex-1">
          <div className="font-medium text-slate-900">전자 간이 계약서에 동의합니다</div>
          <div className="text-sm text-slate-600 mt-1">
            {storageProduct && `${storageProduct.provider.name} - ${storageProduct.provider.contractTemplate}`}
            {routeProduct && `${routeProduct.provider.name} - ${routeProduct.provider.contractTemplate}`}
          </div>
          <button
            onClick={onViewContract}
            className="text-sm text-teal-600 hover:text-teal-700 underline mt-2"
          >
            계약서 전문 보기
          </button>
        </div>
      </label>
    </section>
  )
}
