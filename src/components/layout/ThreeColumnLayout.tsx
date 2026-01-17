// 3칸 레이아웃 (25% | 50% | 25%)
interface ThreeColumnLayoutProps {
  leftPanel: React.ReactNode
  centerPanel: React.ReactNode
  rightPanel: React.ReactNode
}

export default function ThreeColumnLayout({
  leftPanel,
  centerPanel,
  rightPanel,
}: ThreeColumnLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* 1칸: 서비스 선택 (25%) */}
      <div className="w-1/4 border-r border-gray-200 bg-white overflow-y-auto">
        {leftPanel}
      </div>

      {/* 2칸: 지도 (50%) */}
      <div className="w-1/2 bg-gray-50 relative">
        {centerPanel}
      </div>

      {/* 3칸: 안내 패널 (25%) */}
      <div className="w-1/4 border-l border-gray-200 bg-white overflow-y-auto">
        {rightPanel}
      </div>
    </div>
  )
}
