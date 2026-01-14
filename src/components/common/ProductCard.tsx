import { ProductCardProps } from '../../types/models';

/**
 * ProductCard - 기본 상품 카드 컴포넌트
 * PR1: 기본 구조만 정의
 * PR3: RouteProductCard, StorageProductCard로 확장 예정
 */
const ProductCard = ({
  id,
  title,
  subtitle,
  price,
  priceUnit,
  badges,
  onClick,
}: ProductCardProps) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
      onClick={onClick}
    >
      {/* 배지 (통합가능, 규정상태 등) */}
      {badges && badges.length > 0 && (
        <div className="flex gap-2 mb-3">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* 제목 */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

      {/* 부제목 (옵션) */}
      {subtitle && <p className="text-gray-600 text-sm mb-4">{subtitle}</p>}

      {/* 가격 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-2xl font-bold text-primary">
          {price.toLocaleString()}원
          <span className="text-sm text-gray-600 font-normal">/{priceUnit}</span>
        </p>
      </div>

      {/* ID (디버깅용, 나중에 제거 가능) */}
      <p className="text-xs text-gray-400 mt-2">ID: {id}</p>
    </div>
  );
};

export default ProductCard;
