// 서비스 콘솔 - 변환 함수
import type { BoxInputUI } from '../../../../types/models'
import type { BoxInput, DemandResult } from '../../../../engine'

// UI BoxInput → Engine BoxInput 변환
export function toEngineBoxInput(uiBox: BoxInputUI): BoxInput {
  return {
    widthMm: uiBox.width,
    depthMm: uiBox.depth,
    heightMm: uiBox.height,
    count: uiBox.count,
  }
}

// 보관 탭 요약 텍스트 생성
export function getStorageSummary(
  result: DemandResult | null,
  selectedPallets: number | null
): string | undefined {
  if (selectedPallets !== null) {
    return `선택됨: ${selectedPallets} 파렛트`
  }
  if (result && result.demandPallets) {
    return `${result.demandPallets} 파렛트 필요`
  }
  return undefined
}

// 운송 탭 요약 텍스트 생성
export function getTransportSummary(
  result: DemandResult | null,
  selectedCubes: number | null
): string | undefined {
  if (selectedCubes !== null) {
    return `선택됨: ${selectedCubes} 큐브`
  }
  if (result && result.demandCubes) {
    return `${result.demandCubes} 큐브 필요`
  }
  return undefined
}
