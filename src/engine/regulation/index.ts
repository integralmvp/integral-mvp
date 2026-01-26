/**
 * Regulation Engine - Export Hub
 *
 * PR4: 규정 엔진 모듈 진입점
 */

// Types
export type {
  RegulationDecision,
  RegulationReason,
  CheckRegulationParams,
  CargoForRegulation,
  DemandForRegulation,
  ConditionsForRegulation,
  OfferRegulationFields,
  CargoSignature,
  OfferSignature,
  RegulationSummary,
} from './regulationTypes'

export { REGULATION_DEFAULTS } from './regulationTypes'

// Functions
export {
  checkRegulation,
  filterOffersByRegulation,
  adaptCargoForRegulation,
  getRegulationReasonMessage,
  getRegulationSummaryMessage,
} from './regulationEngine'
