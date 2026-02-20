/**
 * Modal Registry - ModalKey → Component 매핑
 * (라우트 모달 인터페이스 준비 - 실제 라우팅은 PR7+ 이후)
 *
 * 현재는 ServiceConsole.tsx에서 직접 모달 컴포넌트를 렌더링하며,
 * 추후 이 레지스트리를 통해 라우트 기반 모달을 지원한다.
 */

import type { ModalKey } from './modalTypes'

// 모달 레지스트리 인터페이스 (확장 포인트)
export interface ModalRegistryEntry {
  key: ModalKey
  // componentPath: string  // 추후 동적 import 경로 (PR7+)
}

// MVP: 정적 매핑만 정의 (실제 라우팅 미적용)
export const MODAL_REGISTRY: ModalRegistryEntry[] = [
  { key: 'INPUT' },
  { key: 'SEARCH_RESULT' },
  { key: 'PRODUCT_DETAIL' },
]
