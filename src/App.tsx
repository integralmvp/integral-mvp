// INTEGRAL MVP - PR2-2: 관제 센터 UI + Mapbox
// PR4: SearchResultProvider 추가 (검색 결과 공유)
// ADMIN-MVP: ?mode=admin → 관리자 견적 화면 (화주 화면 미변경, additive 토글)
import CommandLayout from './components/Layout/CommandLayout'
import AdminLayout from './components/Layout/AdminLayout'
import { SearchResultProvider } from './contexts/SearchResultContext'

const isAdminMode = new URLSearchParams(window.location.search).get('mode') === 'admin'

function App() {
  if (isAdminMode) {
    return <AdminLayout />
  }

  return (
    <SearchResultProvider>
      <CommandLayout />
    </SearchResultProvider>
  )
}

export default App
