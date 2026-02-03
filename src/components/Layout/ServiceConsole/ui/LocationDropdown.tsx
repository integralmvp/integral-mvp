/**
 * 장소 드롭다운 컴포넌트 - RegionCode 기반 (PR6 일원화)
 *
 * - 법정동 코드(RegionCode) 기반으로 옵션 생성
 * - value/onChange는 RegionCode(10자리 문자열)를 사용
 * - 표시 레이블은 name을 사용
 */
import { useMemo } from 'react'
import { JEJU_REGION_CODES, getRegionByCode, type RegionCode as RegionCodeType } from '../../../../data/regionCodesJeju'

interface LocationDropdownProps {
  value?: string              // RegionCode (10자리)
  onChange: (regionCode: string) => void
  placeholder?: string
  disabled?: boolean
  locked?: boolean           // 잠금 상태 (자동 지정 시)
  lockedValue?: string       // 잠금 시 표시할 지역명 (name)
}

export default function LocationDropdown({
  value,
  onChange,
  placeholder = '지역 선택',
  disabled = false,
  locked = false,
  lockedValue,
}: LocationDropdownProps) {
  // 활성화된 지역만 필터링하여 계층별로 분류
  const { provinces, jejuDistricts, jejuTowns, seogwipoDistricts, seogwipoTowns } = useMemo(() => {
    const activeRegions = JEJU_REGION_CODES.filter(r => r.active)

    return {
      // 도 레벨 (제주특별자치도)
      provinces: activeRegions.filter(r => r.level === 'province'),
      // 제주시 동 (501101xxxx)
      jejuDistricts: activeRegions.filter(r =>
        r.level === 'district' && r.code.startsWith('5011')
      ),
      // 제주시 읍면 (50110250xx ~ 5011033xxx)
      jejuTowns: activeRegions.filter(r =>
        r.level === 'town' && r.code.startsWith('5011')
      ),
      // 서귀포시 동 (501301xxxx)
      seogwipoDistricts: activeRegions.filter(r =>
        r.level === 'district' && r.code.startsWith('5013')
      ),
      // 서귀포시 읍면 (50130250xx ~ 5013032xxx)
      seogwipoTowns: activeRegions.filter(r =>
        r.level === 'town' && r.code.startsWith('5013')
      ),
    }
  }, [])

  // 선택된 지역 정보 조회 (코드 → 이름)
  const selectedRegion = value ? getRegionByCode(value) : undefined
  const displayName = lockedValue || selectedRegion?.name || placeholder

  // 잠금 상태일 때 읽기 전용 표시
  if (locked) {
    return (
      <div className="relative">
        <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm text-slate-600 flex items-center justify-between">
          <span>{getSimpleName(displayName)}</span>
          <span className="text-xs text-slate-400">자동 지정</span>
        </div>
      </div>
    )
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>

      {/* 도 전체 */}
      <optgroup label="제주 전역">
        {provinces.map(region => (
          <option key={region.code} value={region.code}>
            {getSimpleName(region.name)}
          </option>
        ))}
        {/* 시 레벨 - 별도 항목으로 추가 */}
        <option value="5011000000">제주시 전체</option>
        <option value="5013000000">서귀포시 전체</option>
      </optgroup>

      {/* 제주시 읍면 */}
      {jejuTowns.length > 0 && (
        <optgroup label="제주시 읍면">
          {jejuTowns.map(region => (
            <option key={region.code} value={region.code}>
              {getSimpleName(region.name)}
            </option>
          ))}
        </optgroup>
      )}

      {/* 제주시 동 (주요 동만 표시) */}
      {jejuDistricts.length > 0 && (
        <optgroup label="제주시 동">
          {jejuDistricts
            .filter(isMainDistrict)
            .map(region => (
              <option key={region.code} value={region.code}>
                {getSimpleName(region.name)}
              </option>
            ))}
        </optgroup>
      )}

      {/* 서귀포시 읍면 */}
      {seogwipoTowns.length > 0 && (
        <optgroup label="서귀포시 읍면">
          {seogwipoTowns.map(region => (
            <option key={region.code} value={region.code}>
              {getSimpleName(region.name)}
            </option>
          ))}
        </optgroup>
      )}

      {/* 서귀포시 동 (주요 동만 표시) */}
      {seogwipoDistricts.length > 0 && (
        <optgroup label="서귀포시 동">
          {seogwipoDistricts
            .filter(isMainDistrict)
            .map(region => (
              <option key={region.code} value={region.code}>
                {getSimpleName(region.name)}
              </option>
            ))}
        </optgroup>
      )}
    </select>
  )
}

/**
 * 지역명을 간결하게 변환
 * "제주특별자치도 제주시" → "제주시"
 * "제주시 애월읍" → "애월읍"
 */
function getSimpleName(fullName: string): string {
  // 공백으로 분리하여 마지막 부분 반환
  const parts = fullName.split(' ')
  return parts[parts.length - 1]
}

/**
 * 주요 동인지 판단 (MVP에서는 대표 동만 표시)
 * 일도일동, 이도이동 등 세부 동은 제외하고 대표 동만 표시
 */
function isMainDistrict(region: RegionCodeType): boolean {
  const name = region.name
  // "일동", "이동", "삼동" 등 세부 분할된 동은 제외
  if (/[일이삼]동$/.test(name) && !/^[가-힣]+동$/.test(getSimpleName(name))) {
    return false
  }
  // 대표적인 동들
  const mainDistricts = [
    '노형동', '연동', '건입동', '봉개동', '외도동', '이호동', '도두동',
    '서귀동', '중문동', '대포동', '강정동', '토평동', '보목동',
  ]
  const simpleName = getSimpleName(name)
  // 주요 동이거나 "동"으로 끝나면서 숫자가 없는 경우
  return mainDistricts.some(d => simpleName.includes(d)) ||
         (/동$/.test(simpleName) && !/[일이삼]동$/.test(simpleName))
}
