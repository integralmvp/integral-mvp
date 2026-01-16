import { useState } from 'react'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import MapHeroSection from './components/hero/MapHeroSection'
import RouteProductCard from './components/routes/RouteProductCard'
import StorageProductCard from './components/storages/StorageProductCard'
import DealModal from './components/deal/DealModal'
import Toast from './components/common/Toast'
import { ROUTE_PRODUCTS, STORAGE_PRODUCTS } from './data/mockData'
import type { RouteProduct, StorageProduct } from './types/models'

function App() {
  // 거래 모달 상태
  const [isDealModalOpen, setIsDealModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<
    RouteProduct | StorageProduct | null
  >(null)
  const [selectedProductType, setSelectedProductType] = useState<
    'route' | 'storage'
  >('route')

  // 토스트 상태
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 거래 모달 열기
  const handleDealClick = (
    product: RouteProduct | StorageProduct,
    type: 'route' | 'storage'
  ) => {
    setSelectedProduct(product)
    setSelectedProductType(type)
    setIsDealModalOpen(true)
  }

  // 예약 성공 처리
  const handleBookingSuccess = () => {
    setToastMessage('MVP 시연 버전입니다. 실제 예약 기능은 추후 구현됩니다.')
    setIsToastVisible(true)
  }

  return (
    <div className="App">
      {/* 네비게이션 (고정) */}
      <Navigation />

      {/* Hero 섹션 - 지도 히어로 (PR2) */}
      <MapHeroSection />

      {/* Features 섹션 - 핵심 기능 소개 (PR3에서 구현 예정) */}
      <section
        id="features"
        className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100"
      >
        <div className="text-center px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            핵심 기능 섹션
          </h2>
          <p className="text-lg text-gray-600">
            PR3에서 4대 핵심 기능 카드 추가 예정
          </p>
          <p className="text-sm text-gray-500 mt-2">
            (경로 상품 거래, 공간 상품 거래, 경로 통합, 규정 자동 매칭)
          </p>
        </div>
      </section>

      {/* Routes 섹션 - 경로 상품 리스트 (PR2) */}
      <section id="routes" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              경로 상품
            </h2>
            <p className="text-lg text-gray-600">
              제주 도내 및 입·출도 경로를 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROUTE_PRODUCTS.map((route) => (
              <RouteProductCard
                key={route.id}
                route={route}
                onDetailClick={() => {
                  setToastMessage('상세 모달은 PR3에서 구현됩니다.')
                  setIsToastVisible(true)
                }}
                onDealClick={() => handleDealClick(route, 'route')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Storages 섹션 - 공간 상품 리스트 (PR2) */}
      <section id="storages" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              공간 상품
            </h2>
            <p className="text-lg text-gray-600">
              제주 각 지역의 보관 공간을 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORAGE_PRODUCTS.map((storage) => (
              <StorageProductCard
                key={storage.id}
                storage={storage}
                onDetailClick={() => {
                  setToastMessage('상세 모달은 PR3에서 구현됩니다.')
                  setIsToastVisible(true)
                }}
                onDealClick={() => handleDealClick(storage, 'storage')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 - 사용자 유형 CTA (PR4에서 구현 예정) */}
      <section
        id="cta"
        className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100"
      >
        <div className="text-center px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            사용자 CTA
          </h2>
          <p className="text-lg text-gray-600">
            PR4에서 화주/사업자용 CTA 버튼 추가 예정
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <Footer />

      {/* 거래 모달 */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        product={selectedProduct}
        productType={selectedProductType}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* 토스트 */}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  )
}

export default App
