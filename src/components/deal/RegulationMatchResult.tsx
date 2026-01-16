// 규정 매칭 결과 컴포넌트 (PR2: 더미 고정 상태)
export default function RegulationMatchResult() {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <span>✅</span>
        규정 매칭 결과
      </h3>

      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-semibold text-green-800">거래 가능</span>
        </div>
        <p className="text-sm text-green-700 mt-2">
          입력하신 화물 조건으로 거래가 가능합니다.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          * PR2 시연 버전: 실제 규정 매칭은 PR3에서 구현됩니다.
        </p>
      </div>
    </div>
  )
}
