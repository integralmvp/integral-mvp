/**
 * Code Data System - 공통 필드 스키마
 *
 * 모든 INFO_* / EVT_* 레코드가 공유하는 공통 필드 정의.
 * 타입 + schema 객체(as const) 형태. 런타임 검증 없음.
 */

// ============ 공통 필드 타입 ============
export interface CommonFields {
  /** 레코드 고유 ID (prefix_{ULID} 형식) */
  id: string
  /** CDS 분류 키 (INFO_* / EVT_*) */
  signature: string
  /** 생성 시각 (ISO 8601) */
  createdAt: string
  /** 수정 시각 (ISO 8601, Info 데이터만) */
  updatedAt?: string
  /** 스키마 버전 (마이그레이션 대비) */
  version?: number
}

// ============ 공통 필드 스키마 객체 ============
export const COMMON_FIELD_SCHEMA = {
  id:         { type: 'string', required: true,  description: '레코드 고유 ID (prefix_{ULID})' },
  signature:  { type: 'string', required: true,  description: 'CDS 분류 키 (INFO_* / EVT_*)' },
  createdAt:  { type: 'string', required: true,  description: '생성 시각 (ISO 8601)' },
  updatedAt:  { type: 'string', required: false, description: '수정 시각 (ISO 8601)' },
  version:    { type: 'number', required: false, description: '스키마 버전' },
} as const
