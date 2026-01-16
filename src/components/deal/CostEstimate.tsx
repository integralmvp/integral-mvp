// 예상 비용 컴포넌트 (PR2: 기본 가격만 표시)
interface CostEstimateProps {
  basePrice: number
}

export default function CostEstimate({ basePrice }: CostEstimateProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>💰</span>
        예상 비용
      </h3>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">기본 가격:</span>
          <span className="font-semibold text-gray-900">
            {basePrice.toLocaleString()}원
          </span>
        </div>

        <div className="pt-3 border-t border-gray-300">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">총 예상 비용:</span>
            <span className="font-bold text-blue-600 text-lg">
              {basePrice.toLocaleString()}원
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          * PR2 시연 버전: 상세 비용 계산은 PR3에서 구현됩니다.
        </p>
      </div>
    </div>
  )
}
