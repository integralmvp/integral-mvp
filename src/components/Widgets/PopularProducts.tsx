// 인기 상품 리스트 위젯
interface Product {
  id: string
  type: 'space' | 'route'
  title: string
  pricePerPallet: number
  routeType?: string | null
}

interface PopularProductsProps {
  products: Product[]
}

export default function PopularProducts({ products }: PopularProductsProps) {
  return (
    <div className="absolute left-6 top-36 z-20 w-64 mb-6">
      {/* 타이틀 */}
      <h2 className="text-white text-sm font-semibold tracking-wide">
        실시간 인기 상품
      </h2>

      {/* 구분선 */}
      <div className="w-full h-px bg-white/50 mt-2 mb-3"></div>

      {/* 컨텐츠 (투명 배경 + 스크롤) - 4개 완전히 보이도록 높이 조정 */}
      <div
        className="bg-[rgba(64,73,91,0.2)] backdrop-blur-sm rounded-lg p-3 space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
        }}
      >
        {products.map((product, index) => (
          <ProductItem key={product.id} rank={index + 1} product={product} />
        ))}
      </div>
    </div>
  )
}

// 상품 아이템
interface ProductItemProps {
  rank: number
  product: Product
}

function ProductItem({ rank, product }: ProductItemProps) {
  const isSpace = product.type === 'space'

  return (
    <div className="flex items-center gap-3 py-1.5 hover:bg-white/5 rounded transition-colors cursor-pointer">
      {/* 순위 */}
      <span
        className={`
        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
        ${
          isSpace
            ? 'bg-orange-500/30 text-orange-400'
            : 'bg-cyan-500/30 text-cyan-400'
        }
      `}
        style={{
          boxShadow: isSpace
            ? '0 0 8px rgba(255, 107, 53, 0.5)'
            : '0 0 8px rgba(0, 191, 255, 0.5)'
        }}
      >
        {rank}
      </span>

      {/* 타입 아이콘 + 상품명 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isSpace ? (
            <span className="text-orange-400 text-xs">◉</span>
          ) : (
            <span className="text-cyan-400 text-xs">→</span>
          )}
          <span className="text-white text-sm truncate">{product.title}</span>
        </div>
        <div className="text-white/50 text-xs">
          {isSpace ? '공간' : `경로 (${product.routeType})`}
        </div>
      </div>

      {/* 가격 (원/파렛트) */}
      <div className="text-right">
        <span
          className={`
          text-sm font-mono
          ${isSpace ? 'text-orange-400' : 'text-cyan-400'}
        `}
        >
          ₩{(product.pricePerPallet / 1000).toFixed(1)}K/P
        </span>
      </div>
    </div>
  )
}
