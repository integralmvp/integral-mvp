import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'

function App() {
  return (
    <div className="App">
      {/* 네비게이션 (고정) */}
      <Navigation />

      {/* Hero 섹션 - 지도 히어로 (PR2) */}
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100"
      >
        <div className="text-center px-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            지도 히어로 영역
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            PR2에서 Kakao Maps + 경로 시각화 + 공간 히트맵 추가 예정
          </p>
          <div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
            80vh+ 영역
          </div>
        </div>
      </section>

      {/* Features 섹션 - 핵심 기능 소개 (PR3) */}
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

      {/* Routes 섹션 - 경로 상품 리스트 (PR3) */}
      <section
        id="routes"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100"
      >
        <div className="text-center px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            경로 상품 리스트
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            PR3에서 6개 경로 상품 카드 + 상세 모달 추가 예정
          </p>
          <p className="text-sm text-gray-500">
            각 카드에 "상세 보기" 및 "거래하기" 버튼 포함
          </p>
        </div>
      </section>

      {/* Storages 섹션 - 공간 상품 리스트 (PR3) */}
      <section
        id="storages"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100"
      >
        <div className="text-center px-6">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            공간 상품 리스트
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            PR3에서 6개 공간 상품 카드 + 상세 모달 추가 예정
          </p>
          <p className="text-sm text-gray-500">
            각 카드에 "상세 보기" 및 "거래하기" 버튼 포함
          </p>
        </div>
      </section>

      {/* CTA 섹션 - 사용자 유형 CTA (PR4) */}
      <section
        id="cta"
        className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100"
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
    </div>
  )
}

export default App
