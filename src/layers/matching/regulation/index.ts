/**
 * Regulation Layer - Export Hub
 * PR4: 규정 엔진 모듈 진입점
 */

// Types (from layers/types)
export type {
  RegulationDecision,
  RegulationReason,
  CheckRegulationParams,
  CargoForRegulation,
  DemandForRegulation,
  ConditionsForRegulation,
  OfferRegulationFields,
  CargoSignature,
  OfferRegulationProfile,
  RegulationSummary,
} from '../../types/regulationTypes'

export { REGULATION_DEFAULTS } from '../../types/regulationTypes'

// Functions
export {
  checkRegulation,
  filterOffersByRegulation,
  adaptCargoForRegulation,
  getRegulationReasonMessage,
  getRegulationSummaryMessage,
} from './regulationEngine'

// Rules sub-module
export {
  checkCargoRules,
  checkCargoRulesWithLogging,
  checkQuickRules,
  checkQuickRulesWithLogging,
  getRuleReasonMessage,
  getRuleResultMessages,
  hasWarnings,
  getPlatformLimits,
} from './rules'
export type { RuleCheckResult, RuleReason } from './rules'
