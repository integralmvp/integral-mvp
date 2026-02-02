/**
 * SearchResultContext - 검색 결과 공유 Context
 *
 * PR4: ServiceConsole ↔ MapboxContainer 간 검색 결과 공유
 * PR6: Preview/Search 분리 - 하이라이트는 Preview 기반
 *
 * 핵심 원칙:
 * - previewResult: 실시간 업데이트 (수량/조건 변경 시)
 * - searchResult: 검색 버튼 클릭 시 스냅샷
 * - highlightedIds: previewResult 기반 (지도 하이라이트)
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { StorageProduct, RouteProduct } from '../types/models'
import type { PipelineCounts } from '../engine/matching'

// 검색 결과 타입 (스냅샷용)
export interface SearchResultData {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  counts: PipelineCounts
  searchedAt: string
}

// 프리뷰 결과 타입 (실시간 업데이트용)
export interface PreviewResultData {
  storageProducts: StorageProduct[]
  routeProducts: RouteProduct[]
  matchedOfferIds: string[]
  counts: PipelineCounts
  updatedAt: string
}

// Context 값 타입
interface SearchResultContextValue {
  // 프리뷰 (실시간, 지도 하이라이트 기준)
  previewResult: PreviewResultData | null
  setPreviewResult: (result: PreviewResultData | null) => void

  // 검색 결과 (클릭 스냅샷, 리스트 출력 기준)
  searchResult: SearchResultData | null
  setSearchResult: (result: SearchResultData | null) => void

  // 하이라이트 ID (프리뷰 기반)
  highlightedIds: Set<string>

  // 초기화
  clearAll: () => void
}

// Context 생성
const SearchResultContext = createContext<SearchResultContextValue | undefined>(undefined)

// Provider 컴포넌트
export function SearchResultProvider({ children }: { children: ReactNode }) {
  const [previewResult, setPreviewResultState] = useState<PreviewResultData | null>(null)
  const [searchResult, setSearchResultState] = useState<SearchResultData | null>(null)

  // 하이라이트할 상품 ID 목록 계산 (프리뷰 기반)
  const highlightedIds = useMemo(() => {
    if (!previewResult) {
      return new Set<string>()
    }
    return new Set(previewResult.matchedOfferIds)
  }, [previewResult])

  const setPreviewResult = useCallback((result: PreviewResultData | null) => {
    setPreviewResultState(result)
  }, [])

  const setSearchResult = useCallback((result: SearchResultData | null) => {
    setSearchResultState(result)
  }, [])

  const clearAll = useCallback(() => {
    setPreviewResultState(null)
    setSearchResultState(null)
  }, [])

  return (
    <SearchResultContext.Provider
      value={{
        previewResult,
        setPreviewResult,
        searchResult,
        setSearchResult,
        highlightedIds,
        clearAll,
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
  const { highlightedIds, previewResult } = useSearchResult()
  // 프리뷰 결과가 없으면 모든 상품 표시
  if (!previewResult) return true
  return highlightedIds.has(id)
}

// 프리뷰 건수 확인 Hook
export function usePreviewCount(): number {
  const { previewResult } = useSearchResult()
  if (!previewResult) return 0
  return previewResult.matchedOfferIds.length
}
