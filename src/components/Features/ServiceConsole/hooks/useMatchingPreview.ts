// 매칭 프리뷰 + 검색 서브훅 - 파이프라인 실행 + 검색 스냅샷
import { useState, useMemo, useEffect, useCallback } from 'react'
import type {
  RegisteredCargo,
  StorageCondition,
  TransportCondition,
} from '../../../../types/models'
import {
  runMatchingPipeline,
  runCombinedPipeline,
  type SearchConditions,
} from '../../../../layers/matching'
import {
  logDemandSessionCreated,
  logResourceChecked,
} from '../../../../infra/storage/event/eventLog'
import { recordSearchExecution } from '../../../../infra/storage'
import { getAllStorageOffers, getAllRouteOffers } from '../../../../infra/storage/info/offer.repo'
import { useSearchResult } from '../../../../contexts/SearchResultContext'
import type { SearchResult } from '../../../../layers/types'
import type { UIServiceType, PreviewMatch } from './useServiceConsoleState'

export interface MatchingPreviewResult {
  previewMatch: PreviewMatch
  searchResult: SearchResult | null
  isSearching: boolean
  handleSearch: () => void
  resetSearch: () => void
}

export function useMatchingPreview(
  activeTab: UIServiceType,
  registeredCargos: RegisteredCargo[],
  totalCubes: number,
  totalPallets: number,
  storageCondition: StorageCondition,
  transportCondition: TransportCondition,
  currentDemandId: string | null
): MatchingPreviewResult {
  const [searchResult, setSearchResultLocal] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const { setPreviewResult, setSearchResult: setSearchResultContext } = useSearchResult()

  const previewMatch = useMemo<PreviewMatch>(() => {
    const session = {
      demandId: currentDemandId || undefined,
      totalCubes,
      totalPallets,
      cargos: registeredCargos.map(cargo => ({
        id: cargo.id,
        sumCm: cargo.sumCm,
        weightKg: cargo.weightKg,
        moduleType: cargo.moduleType,
        itemCode: cargo.itemCode,
        weightBand: cargo.weightBand,
        sizeBand: cargo.sizeBand,
      })),
    }

    const conditions: SearchConditions = {
      storageLocationCode: storageCondition.locationCode,
      storageLocation: storageCondition.location,
      startDate: storageCondition.startDate,
      endDate: storageCondition.endDate,
      originCode: transportCondition.originCode,
      destinationCode: transportCondition.destinationCode,
      origin: transportCondition.origin,
      destination: transportCondition.destination,
      transportDate: transportCondition.transportDate,
    }

    if (activeTab === 'storage') {
      const result = runMatchingPipeline({
        mode: 'STORAGE',
        offers: getAllStorageOffers(),
        session,
        conditions,
        sort: 'LATEST',
      })
      return {
        storageProducts: result.matchedOffers,
        routeProducts: [],
        matchedOfferIds: result.matchedOfferIds,
        counts: result.counts,
      }
    }

    if (activeTab === 'transport') {
      const result = runMatchingPipeline({
        mode: 'ROUTE',
        offers: getAllRouteOffers(),
        session,
        conditions,
        sort: 'LATEST',
      })
      return {
        storageProducts: [],
        routeProducts: result.matchedOffers,
        matchedOfferIds: result.matchedOfferIds,
        counts: result.counts,
      }
    }

    // both 탭
    const combinedResult = runCombinedPipeline({
      storageOffers: getAllStorageOffers(),
      routeOffers: getAllRouteOffers(),
      session,
      conditions,
      sort: 'LATEST',
    })
    return {
      storageProducts: combinedResult.storage.matchedOffers,
      routeProducts: combinedResult.route.matchedOffers,
      matchedOfferIds: combinedResult.combinedIds,
      counts: combinedResult.combinedCounts,
    }
  }, [
    activeTab,
    registeredCargos,
    totalCubes,
    totalPallets,
    storageCondition,
    transportCondition,
    currentDemandId,
  ])

  // Context에 프리뷰 결과 동기화 (지도 하이라이트용)
  useEffect(() => {
    const hasCargoOrCondition =
      registeredCargos.length > 0 ||
      storageCondition.locationCode ||
      transportCondition.originCode ||
      transportCondition.destinationCode

    if (hasCargoOrCondition) {
      setPreviewResult({
        storageProducts: previewMatch.storageProducts,
        routeProducts: previewMatch.routeProducts,
        matchedOfferIds: previewMatch.matchedOfferIds,
        counts: previewMatch.counts,
        updatedAt: new Date().toISOString(),
      })
    } else {
      setPreviewResult(null)
    }
  }, [
    previewMatch,
    registeredCargos.length,
    storageCondition.locationCode,
    transportCondition.originCode,
    transportCondition.destinationCode,
    setPreviewResult,
  ])

  const handleSearch = useCallback(() => {
    console.log('=== PR6 검색 시작 (단일 파이프라인) ===')
    setIsSearching(true)

    const sessionMode = activeTab === 'transport' ? 'ROUTE' : 'STORAGE'
    if (currentDemandId) {
      logDemandSessionCreated(
        currentDemandId,
        sessionMode,
        totalCubes,
        sessionMode === 'STORAGE' ? totalPallets : undefined
      )
    }

    const result: SearchResult = {
      storageProducts: previewMatch.storageProducts,
      routeProducts: previewMatch.routeProducts,
      counts: previewMatch.counts,
      searchedAt: new Date().toISOString(),
    }

    setSearchResultLocal(result)
    setSearchResultContext(result)
    setIsSearching(false)

    const totalResourcePassed = previewMatch.matchedOfferIds.length
    if (currentDemandId) {
      const totalFailed =
        previewMatch.counts.afterResource - previewMatch.counts.afterConditions
      logResourceChecked(currentDemandId, totalResourcePassed, totalFailed)
      recordSearchExecution(currentDemandId, totalResourcePassed, {
        afterRegulation: previewMatch.counts.afterRegulation,
        afterResource: previewMatch.counts.afterResource,
        afterConditions: previewMatch.counts.afterConditions,
      })
    }

    console.log('=== PR6 검색 완료, 결과:', totalResourcePassed, '건 ===')
  }, [
    activeTab,
    previewMatch,
    totalCubes,
    totalPallets,
    currentDemandId,
    setSearchResultContext,
  ])

  const resetSearch = useCallback(() => {
    setSearchResultLocal(null)
    setSearchResultContext(null)
    setPreviewResult(null)
    setIsSearching(false)
  }, [setSearchResultContext, setPreviewResult])

  return { previewMatch, searchResult, isSearching, handleSearch, resetSearch }
}
