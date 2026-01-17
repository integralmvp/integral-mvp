// 좌측 콘솔 - 인기 상품 + 현황
import { ROUTE_PRODUCTS, STORAGE_PRODUCTS } from '../../data/mockData'

interface ProductItem {
  id: string
  type: 'space' | 'route'
  title: string
  subtitle: string
  price: number
}

export default function LeftConsole() {
  // 인기 상품 샘플 (실제로는 API에서 가져옴)
  const popularProducts: ProductItem[] = [
    {
      id: 'S1',
      type: 'space',
      title: '제주시 상온',
      subtitle: '30P',
      price: 45000,
    },
    {
      id: 'R4',
      type: 'route',
      title: '부산→제주',
      subtitle: '11톤',
      price: 350000,
    },
    {
      id: 'S2',
      type: 'space',
      title: '제주시 냉장',
      subtitle: '15P',
      price: 80000,
    },
    {
      id: 'R1',
      type: 'route',
      title: '제주→서귀포',
      subtitle: '5톤',
      price: 180000,
    },
    {
      id: 'S4',
      type: 'space',
      title: '서귀포 냉동',
      subtitle: '20P',
      price: 120000,
    },
  ]

  // 총 파렛트 수
  const totalPallets = STORAGE_PRODUCTS.reduce((sum, storage) => {
    const capacity = parseInt(storage.capacity.match(/\d+/)?.[0] || '0')
    return sum + capacity
  }, 0)

  // 총 경로 수
  const totalRoutes = ROUTE_PRODUCTS.length

  return (
    <aside className="w-60 bg-slate-900/85 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
      {/* 인기 상품 섹션 */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <span>🔥</span> 실시간 인기 상품
        </h2>

        <div className="space-y-2">
          {popularProducts.map((product, index) => (
            <ProductCard key={product.id} rank={index + 1} product={product} />
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-slate-700/50 mx-4"></div>

      {/* 보유 현황 섹션 */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <span>📊</span> 보유 상품 현황
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">📦 공간 상품</span>
            <span className="stat-number text-2xl text-white">{totalPallets}</span>
          </div>
          <div className="text-xs text-slate-500 text-right">파렛트</div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">🚛 경로 상품</span>
            <span className="stat-number text-2xl text-white">{totalRoutes}</span>
          </div>
          <div className="text-xs text-slate-500 text-right">건</div>
        </div>
      </div>
    </aside>
  )
}

// 인기 상품 카드
interface ProductCardProps {
  rank: number
  product: ProductItem
}

function ProductCard({ rank, product }: ProductCardProps) {
  const isSpace = product.type === 'space'

  return (
    <div
      className={`
      p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02]
      ${
        isSpace
          ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20'
          : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
      }
    `}
    >
      <div className="flex items-start gap-2">
        {/* 순위 뱃지 */}
        <span
          className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          ${isSpace ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}
        `}
        >
          {rank}
        </span>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-0.5">
            {isSpace ? (
              <>
                <span className="text-orange-400">◉</span> 공간
              </>
            ) : (
              <>
                <span className="text-blue-400">━▶</span> 경로
              </>
            )}
          </div>
          <div className="text-sm text-white font-medium truncate">
            {product.title}
          </div>
          <div className="text-xs text-slate-400">{product.subtitle}</div>
        </div>

        {/* 가격 */}
        <div className="text-right">
          <div className="text-sm font-bold text-white">
            ₩{(product.price / 1000).toFixed(0)}K
          </div>
        </div>
      </div>
    </div>
  )
}
