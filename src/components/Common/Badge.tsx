// 배지 컴포넌트
interface BadgeProps {
  label: string
  variant?: 'intra' | 'inbound' | 'outbound' | 'roundtrip' | 'default'
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const variantStyles = {
    intra: 'bg-blue-100 text-blue-700 border-blue-300',
    inbound: 'bg-green-100 text-green-700 border-green-300',
    outbound: 'bg-orange-100 text-orange-700 border-orange-300',
    roundtrip: 'bg-purple-100 text-purple-700 border-purple-300',
    default: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${variantStyles[variant]}`}
    >
      {label}
    </span>
  )
}
