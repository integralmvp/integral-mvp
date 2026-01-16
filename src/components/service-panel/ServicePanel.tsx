// 서비스 선택 패널 (1칸)
import { useState } from 'react'
import ServiceButton from './ServiceButton'
import FlowPlaceholder from './FlowPlaceholder'

export default function ServicePanel() {
  const [selectedService, setSelectedService] = useState<
    'storage' | 'transport' | null
  >(null)

  const handleSelectService = (service: 'storage' | 'transport') => {
    setSelectedService(service)
  }

  return (
    <div className="p-6 flex flex-col h-full">
      {/* 버튼 영역 */}
      <div className="space-y-4">
        {selectedService === null && (
          <>
            <ServiceButton
              icon="📦"
              label="보관하기"
              isSelected={false}
              isMinimized={false}
              onClick={() => handleSelectService('storage')}
            />
            <ServiceButton
              icon="🚛"
              label="운송하기"
              isSelected={false}
              isMinimized={false}
              onClick={() => handleSelectService('transport')}
            />
          </>
        )}

        {selectedService === 'storage' && (
          <>
            <ServiceButton
              icon="📦"
              label="보관하기"
              isSelected={true}
              isMinimized={true}
              onClick={() => setSelectedService(null)}
            />
            <FlowPlaceholder serviceType="storage" />
          </>
        )}

        {selectedService === 'transport' && (
          <>
            <ServiceButton
              icon="🚛"
              label="운송하기"
              isSelected={true}
              isMinimized={true}
              onClick={() => setSelectedService(null)}
            />
            <FlowPlaceholder serviceType="transport" />
          </>
        )}
      </div>
    </div>
  )
}
