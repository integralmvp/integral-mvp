import { getRegionByCode } from '../../../../infra/dataspec/codedata/regions/regionCodesJeju'

export const formatDate = (date?: string): string | null => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export const getLocationName = (regionCode?: string): string | null => {
  if (!regionCode) return null
  const region = getRegionByCode(regionCode)
  if (!region) return regionCode
  // 간결한 이름 반환 (예: "제주시 애월읍" → "애월읍")
  const parts = region.name.split(' ')
  return parts[parts.length - 1]
}
