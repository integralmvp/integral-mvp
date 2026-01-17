// 관제 센터 레이아웃
import Header from './Header'
import CenterTitle from './CenterTitle'
import MapboxContainer from '../Map/MapboxContainer'
import SpaceBackground from '../Background/SpaceBackground'
import PopularProducts from '../Widgets/PopularProducts'
import ProductStats from '../Widgets/ProductStats'
import ServicePanel from '../Widgets/ServicePanel'

export default function CommandLayout() {
  // 목업 인기 상품 데이터 (임시)
  const mockPopularProducts = [
    {
      id: 'space-1',
      type: 'space' as const,
      title: '제주시 상온 30P',
      pricePerPallet: 1500,
      routeType: null
    },
    {
      id: 'route-5',
      type: 'route' as const,
      title: '부산→제주 11톤',
      pricePerPallet: 32000,
      routeType: '입도'
    },
    {
      id: 'space-3',
      type: 'space' as const,
      title: '제주시 냉장 15P',
      pricePerPallet: 5300,
      routeType: null
    },
    {
      id: 'route-1',
      type: 'route' as const,
      title: '제주→서귀포 5톤',
      pricePerPallet: 36000,
      routeType: '도내'
    },
    {
      id: 'space-4',
      type: 'space' as const,
      title: '애월 상온 20P',
      pricePerPallet: 1800,
      routeType: null
    },
    {
      id: 'route-6',
      type: 'route' as const,
      title: '목포→제주 8톤',
      pricePerPallet: 28000,
      routeType: '입도'
    },
    {
      id: 'space-5',
      type: 'space' as const,
      title: '성산 냉동 12P',
      pricePerPallet: 6200,
      routeType: null
    },
    {
      id: 'route-2',
      type: 'route' as const,
      title: '제주→성산 3.5톤',
      pricePerPallet: 18000,
      routeType: '도내'
    }
  ]

  // 목업 통계 데이터 (임시)
  const mockStats = {
    space: {
      total: 112,
      used: 89
    },
    route: {
      total: 6,
      used: 4
    }
  }

  return (
    <div className="h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* 우주 배경 */}
      <SpaceBackground />

      {/* 투명 헤더 (로고/LIVE) */}
      <Header />

      {/* 중앙 글로우 타이틀 */}
      <CenterTitle />

      {/* 메인 영역 */}
      <div className="h-full w-full">
        {/* 중앙 지도 */}
        <div className="absolute inset-0">
          <MapboxContainer />
        </div>

        {/* 좌측 위젯 - 인기 상품 */}
        <PopularProducts products={mockPopularProducts} />

        {/* 좌측 위젯 - 보유 현황 */}
        <ProductStats
          spaceStats={mockStats.space}
          routeStats={mockStats.route}
        />

        {/* 우측 위젯 - 서비스 선택 */}
        <ServicePanel />
      </div>
    </div>
  )
}
