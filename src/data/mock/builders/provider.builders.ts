/**
 * Provider Builders
 * InfoProviderRecord → ProviderInfo UI DTO 변환
 */

import type { InfoProviderRecord } from '../../../infra/dataspec/fields/info/provider.fields'
import type { ProviderInfo } from '../../../types/domain/provider'

/**
 * InfoProviderRecord → ProviderInfo
 */
export function buildProviderInfoFromRecord(record: InfoProviderRecord): ProviderInfo {
  return {
    id: record.id,
    name: record.fields.name,
    serviceType: record.fields.serviceType,
    verified: record.fields.verified,
    description: record.fields.description,
    contractTemplate: record.fields.contractTemplate,
    pickupAvailable: record.fields.pickupAvailable,
    weightLimitKg: record.fields.weightLimitKg,
  }
}
