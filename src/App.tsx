// INTEGRAL MVP - PR2-2: 관제 센터 UI + Mapbox
// PR4: SearchResultProvider 추가 (검색 결과 공유)
import CommandLayout from './components/Layout/CommandLayout'
import { SearchResultProvider } from './contexts/SearchResultContext'

function App() {
  return (
    <SearchResultProvider>
      <CommandLayout />
    </SearchResultProvider>
  )
}

export default App
