import type { ServiceType } from '../../hooks/useServiceConsoleState'

interface DealHeaderSectionProps {
  activeTab: ServiceType
  onClose: () => void
}

export function DealHeaderSection({ activeTab, onClose }: DealHeaderSectionProps) {
  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-sm font-medium opacity-90 mb-1">거래 신청서 작성</div>
          <h2 className="text-2xl font-bold">
            {activeTab === 'storage' && '보관 서비스 거래'}
            {activeTab === 'transport' && '운송 서비스 거래'}
            {activeTab === 'both' && '보관 + 운송 통합 거래'}
          </h2>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-light ml-4">×</button>
      </div>
    </div>
  )
}
