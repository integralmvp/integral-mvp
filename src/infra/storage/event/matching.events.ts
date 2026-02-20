/**
 * Matching Event Helpers
 * EVT_MATCHING_RUN / EVT_OFFER_SELECTED 타입 헬퍼
 *
 * INFO_* 시그니처 기준: 매칭 파이프라인 이벤트 전용
 * 저수준 기록은 eventLog.ts의 logEvent() 위임
 */

import { logEvent } from './eventLog'
import type { PlatformEvent } from '../../../types/models'
import type { MatchingRunFields, OfferSelectedFields } from '../../dataspec/fields'

/**
 * EVT_MATCHING_RUN - 매칭 파이프라인 실행
 */
export function logMatchingRun(
  demandId: string,
  fields: MatchingRunFields
): PlatformEvent {
  return logEvent({
    eventType: 'SEARCH_EXECUTED',
    subject: { kind: 'demand', id: demandId },
    fields: fields as unknown as Record<string, unknown>,
  })
}

/**
 * EVT_OFFER_SELECTED - 상품 선택
 */
export function logOfferSelected(
  demandId: string,
  fields: OfferSelectedFields
): PlatformEvent {
  return logEvent({
    eventType: 'MATCH_CONFIRMED',
    subject: { kind: 'demand', id: demandId },
    fields: fields as unknown as Record<string, unknown>,
  })
}
