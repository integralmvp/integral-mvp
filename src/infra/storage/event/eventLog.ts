/**
 * Event Log Store
 *
 * append-only 이벤트 로그 저장/조회
 * 분석/추적용 사건 데이터 관리
 */

import type {
  PlatformEvent,
  PlatformEventType,
  EventSubject,
  CargoTaxonomyContext,
} from '../../../types/models'
import { STORAGE_KEYS } from '../keys'
import { makeEventId } from '../../dataspec/id/makeId'

// MVP 기본 액터 ID
const DEFAULT_ACTOR_ID = 'demo-user'

// 최대 이벤트 수 (메모리/성능 관리)
const MAX_EVENTS = 1000

/**
 * 이벤트 로그 저장소에서 모든 이벤트 로드
 */
function loadEvents(): PlatformEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS)
    if (!raw) return []
    return JSON.parse(raw) as PlatformEvent[]
  } catch {
    console.error('[EventLog] Failed to load events')
    return []
  }
}

/**
 * 이벤트 로그 저장
 */
function saveEvents(events: PlatformEvent[]): void {
  try {
    // 최대 이벤트 수 제한 (오래된 것부터 제거)
    const trimmed = events.length > MAX_EVENTS
      ? events.slice(events.length - MAX_EVENTS)
      : events

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(trimmed))
  } catch (error) {
    console.error('[EventLog] Failed to save events:', error)
  }
}

/**
 * 이벤트 기록 (append-only)
 */
export function logEvent(params: {
  eventType: PlatformEventType
  subject: EventSubject
  actorId?: string
  context?: CargoTaxonomyContext
  fields?: Record<string, unknown>
}): PlatformEvent {
  const event: PlatformEvent = {
    eventId: makeEventId(),
    ts: new Date().toISOString(),
    eventType: params.eventType,
    actorId: params.actorId || DEFAULT_ACTOR_ID,
    subject: params.subject,
    context: params.context,
    fields: params.fields,
  }

  const events = loadEvents()
  events.push(event)
  saveEvents(events)

  // 디버깅용 콘솔 로그 (개발 모드에서만)
  // Node.js 환경에서 import.meta.env가 undefined일 수 있음
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log(`[Event] ${event.eventType}`, {
      subject: event.subject,
      fields: event.fields,
    })
  }

  return event
}

/**
 * 모든 이벤트 조회
 */
export function getEvents(): PlatformEvent[] {
  return loadEvents()
}

/**
 * 필터링된 이벤트 조회
 */
export function getFilteredEvents(filter: {
  eventType?: PlatformEventType | PlatformEventType[]
  subjectKind?: EventSubject['kind']
  subjectId?: string
  since?: string  // ISO timestamp
  until?: string  // ISO timestamp
}): PlatformEvent[] {
  let events = loadEvents()

  // eventType 필터
  if (filter.eventType) {
    const types = Array.isArray(filter.eventType)
      ? filter.eventType
      : [filter.eventType]
    events = events.filter(e => types.includes(e.eventType))
  }

  // subject 필터
  if (filter.subjectKind) {
    events = events.filter(e => e.subject.kind === filter.subjectKind)
  }
  if (filter.subjectId) {
    events = events.filter(e => e.subject.id === filter.subjectId)
  }

  // 시간 범위 필터
  if (filter.since) {
    events = events.filter(e => e.ts >= filter.since!)
  }
  if (filter.until) {
    events = events.filter(e => e.ts <= filter.until!)
  }

  return events
}

/**
 * 특정 대상의 이벤트 히스토리 조회
 */
export function getEventHistory(subject: EventSubject): PlatformEvent[] {
  return getFilteredEvents({
    subjectKind: subject.kind,
    subjectId: subject.id,
  })
}

/**
 * 최근 N개 이벤트 조회
 */
export function getRecentEvents(count: number = 50): PlatformEvent[] {
  const events = loadEvents()
  return events.slice(-count)
}

/**
 * 이벤트 로그 초기화 (개발용)
 */
export function clearEventLog(): void {
  localStorage.removeItem(STORAGE_KEYS.EVENTS)
}

// ============ 편의 함수: 특정 이벤트 타입별 로깅 ============

/**
 * 화물 생성 이벤트
 */
export function logCargoCreated(cargoId: string, context?: CargoTaxonomyContext): PlatformEvent {
  return logEvent({
    eventType: 'CARGO_CREATED',
    subject: { kind: 'cargo', id: cargoId },
    context,
  })
}

/**
 * 화물 삭제 이벤트
 */
export function logCargoRemoved(cargoId: string): PlatformEvent {
  return logEvent({
    eventType: 'CARGO_REMOVED',
    subject: { kind: 'cargo', id: cargoId },
  })
}

/**
 * 화물 택소노미 업데이트 이벤트
 */
export function logCargoTaxonomyUpdated(cargoId: string, context: CargoTaxonomyContext): PlatformEvent {
  return logEvent({
    eventType: 'CARGO_TAXONOMY_UPDATED',
    subject: { kind: 'cargo', id: cargoId },
    context,
  })
}

/**
 * @deprecated logCargoSignatureUpdated → logCargoTaxonomyUpdated로 리네임
 */
export function logCargoSignatureUpdated(cargoId: string, context: CargoTaxonomyContext): PlatformEvent {
  return logCargoTaxonomyUpdated(cargoId, context)
}

/**
 * 규정 체크 이벤트
 */
export function logRuleChecked(
  subject: EventSubject,
  passed: boolean,
  reasons: string[]
): PlatformEvent {
  return logEvent({
    eventType: 'RULE_CHECKED',
    subject,
    fields: { passed, reasons },
  })
}

/**
 * 규정 통과 이벤트
 */
export function logRulesPassed(demandId: string): PlatformEvent {
  return logEvent({
    eventType: 'RULES_PASSED',
    subject: { kind: 'demand', id: demandId },
  })
}

/**
 * 물량 설정 이벤트
 */
export function logQuantitySet(
  demandId: string,
  quantitiesByCargoId: Record<string, number>
): PlatformEvent {
  return logEvent({
    eventType: 'QUANTITY_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { quantitiesByCargoId },
  })
}

/**
 * 큐브 계산 이벤트
 */
export function logCubeCalculated(
  demandId: string,
  mode: 'STORAGE' | 'ROUTE',
  cubes: number,
  packingFactor: number
): PlatformEvent {
  return logEvent({
    eventType: 'CUBE_CALCULATED',
    subject: { kind: 'demand', id: demandId },
    fields: { mode, cubes, packingFactor },
  })
}

/**
 * 자원 준비 완료 이벤트
 */
export function logResourceReady(demandId: string, totalCubes: number, totalPallets?: number): PlatformEvent {
  return logEvent({
    eventType: 'RESOURCE_READY',
    subject: { kind: 'demand', id: demandId },
    fields: { totalCubes, totalPallets },
  })
}

/**
 * 보관 장소 설정 이벤트
 */
export function logStorageLocationSet(demandId: string, location: string): PlatformEvent {
  return logEvent({
    eventType: 'STORAGE_LOCATION_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { location },
  })
}

/**
 * 보관 기간 설정 이벤트
 */
export function logStoragePeriodSet(demandId: string, startDate: string, endDate: string): PlatformEvent {
  return logEvent({
    eventType: 'STORAGE_PERIOD_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { startDate, endDate },
  })
}

/**
 * 운송 출발지 설정 이벤트
 */
export function logTransportOriginSet(demandId: string, origin: string): PlatformEvent {
  return logEvent({
    eventType: 'TRANSPORT_ORIGIN_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { origin },
  })
}

/**
 * 운송 도착지 설정 이벤트
 */
export function logTransportDestinationSet(demandId: string, destination: string): PlatformEvent {
  return logEvent({
    eventType: 'TRANSPORT_DESTINATION_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { destination },
  })
}

/**
 * 운송 날짜 설정 이벤트
 */
export function logTransportDateSet(demandId: string, transportDate: string): PlatformEvent {
  return logEvent({
    eventType: 'TRANSPORT_DATE_SET',
    subject: { kind: 'demand', id: demandId },
    fields: { transportDate },
  })
}

/**
 * 검색 실행 이벤트
 *
 * PR6: counts 필드 추가 - 파이프라인 단계별 건수
 */
export function logSearchExecuted(
  demandId: string,
  resultCount: number,
  counts?: {
    afterRegulation: number
    afterResource: number
    afterConditions: number
  }
): PlatformEvent {
  return logEvent({
    eventType: 'SEARCH_EXECUTED',
    subject: { kind: 'demand', id: demandId },
    fields: {
      resultCount,
      ...(counts && {
        afterRegulation: counts.afterRegulation,
        afterResource: counts.afterResource,
        afterConditions: counts.afterConditions,
      }),
    },
  })
}

// ============ PR5: 세션/자원 관련 이벤트 ============

/**
 * 수요 세션 생성 이벤트
 */
export function logDemandSessionCreated(
  sessionId: string,
  mode: 'STORAGE' | 'ROUTE',
  totalCubes: number,
  totalPallets?: number
): PlatformEvent {
  return logEvent({
    eventType: 'DEMAND_SESSION_CREATED',
    subject: { kind: 'demand', id: sessionId },
    fields: { mode, totalCubes, totalPallets },
  })
}

/**
 * 자원 체크 완료 이벤트
 */
export function logResourceChecked(
  demandId: string,
  passedCount: number,
  failedCount: number
): PlatformEvent {
  return logEvent({
    eventType: 'RESOURCE_CHECKED',
    subject: { kind: 'demand', id: demandId },
    fields: { passedCount, failedCount },
  })
}

// ============ PR7: 거래 관련 이벤트 ============

/**
 * 상품 선택 확정 이벤트 (리스트에서 [선택] 클릭)
 */
export function logMatchConfirmed(
  demandId: string,
  offerId: string,
  offerType: 'storage' | 'route'
): PlatformEvent {
  return logEvent({
    eventType: 'MATCH_CONFIRMED',
    subject: { kind: 'demand', id: demandId },
    fields: { offerId, offerType },
  })
}

/**
 * 거래 생성 이벤트 (거래 페이지 진입)
 */
export function logDealCreated(
  dealId: string,
  demandId: string,
  selectedOfferIds: string[]
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_CREATED',
    subject: { kind: 'deal', id: dealId },
    fields: { demandId, selectedOfferIds },
  })
}

/**
 * 거래 신청 완료 이벤트 (계약 동의 후 최종 제출)
 */
export function logDealSubmitted(
  dealId: string,
  totalCost: number,
  contractAgreed: boolean
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_SUBMITTED',
    subject: { kind: 'deal', id: dealId },
    fields: { totalCost, contractAgreed },
  })
}

/**
 * 거래 확정 이벤트 (계약서 동의 완료)
 */
export function logDealConfirmed(
  dealId: string,
  billableCubes: number,
  totalWeightKg: number
): PlatformEvent {
  return logEvent({
    eventType: 'DEAL_CONFIRMED',
    subject: { kind: 'deal', id: dealId },
    fields: { billableCubes, totalWeightKg },
  })
}

/**
 * 정산 계산 완료 이벤트
 */
export function logSettlementCalculated(
  dealId: string,
  volumeCubes: number,
  weightCubes: number,
  billableCubes: number,
  unitPricePerCube: number,
  totalCost: number
): PlatformEvent {
  return logEvent({
    eventType: 'SETTLEMENT_CALCULATED',
    subject: { kind: 'deal', id: dealId },
    fields: { volumeCubes, weightCubes, billableCubes, unitPricePerCube, totalCost },
  })
}

/**
 * 자원 할당 완료 이벤트 (재고 차감)
 */
export function logResourceAllocated(
  dealId: string,
  offerId: string,
  offerType: 'storage' | 'route',
  billableCubes: number,
  totalWeightKg: number
): PlatformEvent {
  return logEvent({
    eventType: 'RESOURCE_ALLOCATED',
    subject: { kind: 'deal', id: dealId },
    fields: { offerId, offerType, billableCubes, totalWeightKg },
  })
}

/**
 * 자원 복원 이벤트 (거래 취소 시)
 */
export function logResourceReleased(
  dealId: string,
  offerId: string,
  offerType: 'storage' | 'route',
  billableCubes: number,
  totalWeightKg: number
): PlatformEvent {
  return logEvent({
    eventType: 'RESOURCE_RELEASED',
    subject: { kind: 'deal', id: dealId },
    fields: { offerId, offerType, billableCubes, totalWeightKg },
  })
}
