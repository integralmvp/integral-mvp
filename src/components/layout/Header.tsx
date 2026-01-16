// 최소화된 헤더
export default function Header() {
  return (
    <header className="h-[60px] border-b border-gray-200 bg-white flex items-center justify-between px-8">
      <div className="text-2xl font-bold text-gray-900">INTEGRAL</div>
      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
        문의하기
      </button>
    </header>
  )
}
