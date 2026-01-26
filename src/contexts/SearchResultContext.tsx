/**
 * SearchResultContext - 검색 결과 공유 Context
 *
 * PR4: ServiceConsole ↔ MapboxContainer 간 검색 결과 공유
 * 지도에서 검색 결과 상품을 하이라이트하기 위해 사용
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { StorageProduct, RouteProduct } from '../types/models'
import type { RegulationSummary } from '../engine/regulation'

// 검색 결과 타입
export interface SearchResultData {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  summary: RegulationSummary | null
  searchedAt: string
}

// Context 값 타입
interface SearchResultContextValue {
  searchResult: SearchResultData | null
  highlightedIds: Set<string>
  setSearchResult: (result: SearchResultData | null) => void
  clearSearchResult: () => void
}

// Context 생성
const SearchResultContext = createContext<SearchResultContextValue | undefined>(undefined)

// Provider 컴포넌트
export function SearchResultProvider({ children }: { children: ReactNode }) {
  const [searchResult, setSearchResultState] = useState<SearchResultData | null>(null)

  // 하이라이트할 상품 ID 목록 계산
  const highlightedIds = searchResult
    ? new Set([
        ...searchResult.storageProducts.map(p => p.id),
        ...searchResult.routeProducts.map(p => p.id),
      ])
    : new Set<string>()

  const setSearchResult = useCallback((result: SearchResultData | null) => {
    setSearchResultState(result)
  }, [])

  const clearSearchResult = useCallback(() => {
    setSearchResultState(null)
  }, [])

  return (
    <SearchResultContext.Provider
      value={{
        searchResult,
        highlightedIds,
        setSearchResult,
        clearSearchResult,
      }}
    >
      {children}
    </SearchResultContext.Provider>
  )
}

// Hook
export function useSearchResult() {
  const context = useContext(SearchResultContext)
  if (context === undefined) {
    throw new Error('useSearchResult must be used within a SearchResultProvider')
  }
  return context
}

// 하이라이트 여부만 확인하는 간단한 Hook
export function useIsHighlighted(id: string): boolean {
  const { highlightedIds, searchResult } = useSearchResult()
  // 검색 결과가 없으면 모든 상품 표시
  if (!searchResult) return true
  return highlightedIds.has(id)
}
