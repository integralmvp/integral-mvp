/**
 * ID 생성 유틸리티
 *
 * 식별코드(ID): 의미 압축 금지. ULID 또는 UUIDv4 사용
 * 형식: {prefix}_{ULID or UUID}
 * 예: cargo_01H..., demand_01H..., evt_01H...
 */

/**
 * 타임스탬프 기반 고유 ID 생성 (ULID-like)
 * 외부 라이브러리 없이 구현
 *
 * 형식: {prefix}_{timestamp_base32}_{random_base32}
 */
export function makeId(prefix: string): string {
  // 타임스탬프 (밀리초)를 base32로 인코딩
  const timestamp = Date.now()
  const timestampPart = timestamp.toString(36).padStart(10, '0')

  // 랜덤 부분 생성
  const randomPart = generateRandomPart()

  return `${prefix}_${timestampPart}${randomPart}`
}

/**
 * 랜덤 문자열 생성 (16자)
 */
function generateRandomPart(): string {
  // crypto.randomUUID() 사용 가능하면 활용
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  }

  // 폴백: Math.random() 기반
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 화물 ID 생성
 */
export function makeCargoId(): string {
  return makeId('cargo')
}

/**
 * 수요 세션 ID 생성
 */
export function makeDemandId(): string {
  return makeId('demand')
}

/**
 * 이벤트 ID 생성
 */
export function makeEventId(): string {
  return makeId('evt')
}

/**
 * ID에서 prefix 추출
 */
export function getIdPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+)_/)
  return match ? match[1] : null
}

/**
 * ID 유효성 검사
 */
export function isValidId(id: string, expectedPrefix?: string): boolean {
  if (!id || typeof id !== 'string') return false

  const parts = id.split('_')
  if (parts.length < 2) return false

  const prefix = parts[0]
  if (expectedPrefix && prefix !== expectedPrefix) return false

  return true
}
