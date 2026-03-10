import type { ServiceType } from '../../hooks/useServiceConsoleState'

interface DealPickupSectionProps {
  activeTab: ServiceType
  pickupRequested: boolean
  onPickupRequestChange: (value: boolean) => void
  pickupLocation: string
  onPickupLocationChange: (value: string) => void
  dropoffLocation: string
  onDropoffLocationChange: (value: string) => void
}

export function DealPickupSection({
  activeTab,
  pickupRequested,
  onPickupRequestChange,
  pickupLocation,
  onPickupLocationChange,
  dropoffLocation,
  onDropoffLocationChange,
}: DealPickupSectionProps) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900 mb-3">
        {activeTab === 'storage' ? '픽업 요청' : '위탁 방식'}
      </h3>
      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pickupRequested}
            onChange={(e) => onPickupRequestChange(e.target.checked)}
            className="w-5 h-5 text-teal-600 rounded"
          />
          <span className="text-slate-900 font-medium">
            {activeTab === 'storage' ? '픽업 서비스 이용' : '픽업 요청'}
          </span>
        </label>

        {pickupRequested && activeTab === 'storage' && (
          <div>
            <label className="block text-sm text-slate-600 mb-2">픽업 장소</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => onPickupLocationChange(e.target.value)}
              placeholder="픽업 장소를 입력하세요"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        {!pickupRequested && activeTab === 'transport' && (
          <div>
            <label className="block text-sm text-slate-600 mb-2">위탁 장소</label>
            <select
              value={dropoffLocation}
              onChange={(e) => onDropoffLocationChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="">위탁 장소 선택</option>
              <option value="제주항">제주항</option>
              <option value="서귀포항">서귀포항</option>
              <option value="제주공항">제주공항</option>
            </select>
          </div>
        )}
      </div>
    </section>
  )
}
