// 서비스 플로우 Placeholder
interface FlowPlaceholderProps {
  serviceType: 'storage' | 'transport'
}

export default function FlowPlaceholder({ serviceType }: FlowPlaceholderProps) {
  const serviceName = serviceType === 'storage' ? '보관' : '운송'

  return (
    <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {serviceName} 서비스 플로우
        </h3>
        <p className="text-sm">PR3에서 구현 예정</p>
      </div>
    </div>
  )
}
