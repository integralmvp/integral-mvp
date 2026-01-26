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
  EventSignature,
} from '../types/models'
import { STORAGE_KEYS } from './storageKeys'
import { makeEventId } from './id'

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
  signature?: EventSignature
  fields?: Record<string, unknown>
}): PlatformEvent {
  const event: PlatformEvent = {
    eventId: makeEventId(),
    ts: new Date().toISOString(),
    eventType: params.eventType,
    actorId: params.actorId || DEFAULT_ACTOR_ID,
    subject: params.subject,
    signature: params.signature,
    fields: params.fields,
  }

  const events = loadEvents()
  events.push(event)
  saveEvents(events)

  // 디버깅용 콘솔 로그 (개발 모드에서만)
  if (import.meta.env.DEV) {
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
export function logCargoCreated(cargoId: string, signature?: EventSignature): PlatformEvent {
  return logEvent({
    eventType: 'CARGO_CREATED',
    subject: { kind: 'cargo', id: cargoId },
    signature,
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
 * 화물 시그니처 업데이트 이벤트
 */
export function logCargoSignatureUpdated(cargoId: string, signature: EventSignature): PlatformEvent {
  return logEvent({
    eventType: 'CARGO_SIGNATURE_UPDATED',
    subject: { kind: 'cargo', id: cargoId },
    signature,
  })
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
 */
export function logSearchExecuted(demandId: string, resultCount: number): PlatformEvent {
  return logEvent({
    eventType: 'SEARCH_EXECUTED',
    subject: { kind: 'demand', id: demandId },
    fields: { resultCount },
  })
}
