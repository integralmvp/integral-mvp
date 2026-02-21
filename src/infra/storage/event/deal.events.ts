/**
 * Deal Event Helpers
 * EVT_DEAL_* 타입 헬퍼
 *
 * INFO_* 시그니처 기준: 거래 이벤트 전용
 * 저수준 기록은 eventLog.ts의 logEvent() 위임
 */

import { logEvent } from './eventLog'
import type { PlatformEvent } from '../../../types/models'
import type {
  DealRequestedFields,
  DealAcceptedFields,
  DealRejectedFields,
  DealCompletedFields,
} from '../../dataspec/fields'

/**
 * EVT_DEAL_REQUESTED - 거래 신청
 */
export function logDealRequested(
  dealId: string,
  fields: DealRequestedFields
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_SUBMITTED',
    subject: { kind: 'deal', id: dealId },
    fields: fields as unknown as Record<string, unknown>,
  })
}

/**
 * EVT_DEAL_ACCEPTED - 거래 수락 (확정)
 */
export function logDealAccepted(
  dealId: string,
  fields: DealAcceptedFields
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_CONFIRMED',
    subject: { kind: 'deal', id: dealId },
    fields: fields as unknown as Record<string, unknown>,
  })
}

/**
 * EVT_DEAL_REJECTED - 거래 거절 (취소)
 */
export function logDealRejected(
  dealId: string,
  fields: DealRejectedFields
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_CANCELLED',
    subject: { kind: 'deal', id: dealId },
    fields: fields as unknown as Record<string, unknown>,
  })
}

/**
 * EVT_DEAL_COMPLETED - 거래 완료
 */
export function logDealCompleted(
  dealId: string,
  fields: DealCompletedFields
): PlatformEvent {
  return logEvent({
    eventType: 'SETTLEMENT_CALCULATED',
    subject: { kind: 'deal', id: dealId },
    fields: fields as unknown as Record<string, unknown>,
  })
}
