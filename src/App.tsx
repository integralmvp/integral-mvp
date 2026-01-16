// INTEGRAL MVP - PR2-1: 100vh 싱글 페이지 레이아웃
import Header from './components/layout/Header'
import IntroSection from './components/layout/IntroSection'
import ThreeColumnLayout from './components/layout/ThreeColumnLayout'
import ServicePanel from './components/service-panel/ServicePanel'
import MapSection from './components/map/MapSection'
import InfoPanel from './components/info-panel/InfoPanel'

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 헤더 */}
      <Header />

      {/* 소개 문구 */}
      <IntroSection />

      {/* 3칸 레이아웃 */}
      <ThreeColumnLayout
        leftPanel={<ServicePanel />}
        centerPanel={<MapSection />}
        rightPanel={<InfoPanel />}
      />
    </div>
  )
}

export default App
