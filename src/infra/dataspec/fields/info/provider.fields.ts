/**
 * INFO_PROVIDER 최소 필드 스키마
 * (스텁 - PR7+ 에서 구체화)
 */

export interface ProviderFields {
  name: string
  serviceType: '보관' | '운송' | '통합'
  verified: boolean
}
