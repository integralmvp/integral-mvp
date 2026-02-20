/**
 * Domain Types - Codes
 * 플랫폼 코드 타입 정의 (RegionCode, 밴드 re-export)
 */

export type { WeightBand, SizeBand } from '../../infra/dataspec/codedata/bands/bands'
export type { FeatureCode } from '../../infra/dataspec/codedata/features/featureCodes'

// 법정동 코드 - 10자리 문자열 (UI/State/Store/Engine 단일 진실 소스)
export type RegionCode = string
