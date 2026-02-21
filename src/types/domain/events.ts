/**
 * Domain Types - Platform Events
 * 플랫폼 이벤트 도메인 타입 정의
 */

import type { WeightBand, SizeBand } from './codes'
import type { ModuleClassification } from './cargo'

// ============ 이벤트 대상 ============
export interface EventSubject {
  kind: 'cargo' | 'demand' | 'offer' | 'deal'
  id: string
}

// ============ 이벤트 시그니처 (선택적) ============
export interface EventSignature {
  itemCode?: string
  weightBand?: WeightBand
  sizeBand?: SizeBand
  moduleClass?: ModuleClassification
  serviceType?: string
}

// ============ 이벤트 타입 ============
export type PlatformEventType =
  | 'CARGO_CREATED'
  | 'CARGO_REMOVED'
  | 'CARGO_SIGNATURE_UPDATED'
  | 'RULE_CHECKED'
  | 'RULES_PASSED'
  | 'QUANTITY_SET'
  | 'CUBE_CALCULATED'
  | 'RESOURCE_READY'
  | 'STORAGE_LOCATION_SET'
  | 'STORAGE_PERIOD_SET'
  | 'TRANSPORT_ORIGIN_SET'
  | 'TRANSPORT_DESTINATION_SET'
  | 'TRANSPORT_DATE_SET'
  | 'SEARCH_EXECUTED'
  | 'DEMAND_SESSION_CREATED'
  | 'RESOURCE_CHECKED'
  | 'MATCH_CONFIRMED'
  | 'DEAL_CREATED'
  | 'DEAL_SUBMITTED'
  | 'DEAL_CONFIRMED'
  | 'SETTLEMENT_CALCULATED'
  | 'RESOURCE_ALLOCATED'
  | 'DEAL_CANCELLED'
  | 'RESOURCE_RELEASED'

// ============ PlatformEvent ============
export interface PlatformEvent {
  eventId: string
  ts: string

  eventType: PlatformEventType
  actorId: string

  subject: EventSubject
  signature?: EventSignature
  fields?: Record<string, unknown>
}

// ============ Event Field 상세 타입 ============
export interface SearchExecutedFields {
  resultCount: number
}
