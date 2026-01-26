/**
 * PLATFORM_ITEM_CODESET v0.1
 * 플랫폼 표준 품목 코드셋
 *
 * - ICxx 코드를 Cargo/Offer에서 사용
 * - Cargo는 기본 단일 선택
 * - 검색 지원: 코드/라벨/키워드
 */

export type ItemCode = {
  code: string
  label: string
  keywords: string[]
  flags?: {
    fragile?: boolean
    perishable?: boolean
    tempRequired?: boolean
    liquid?: boolean
    battery?: boolean
    hazmatLike?: boolean
    oversizeRisk?: boolean
  }
}

export const PLATFORM_ITEM_CODES: ItemCode[] = [
  // 일반 품목 (IC01-IC04)
  { code: 'IC01', label: '일반잡화(비파손)', keywords: ['잡화', '생활', '소품', '문구'] },
  { code: 'IC02', label: '의류/패션/섬유', keywords: ['의류', '옷', '신발', '가방', '섬유'] },
  { code: 'IC03', label: '도서/인쇄물/서류', keywords: ['도서', '책', '인쇄', '서류', '문서'] },
  { code: 'IC04', label: '완구/취미/스포츠', keywords: ['완구', '장난감', '취미', '스포츠'] },
  { code: 'IC05', label: '가구/인테리어(소형)', keywords: ['가구', '인테리어'], flags: { oversizeRisk: true } },

  // 식품류 (IC10-IC14)
  { code: 'IC10', label: '식품(상온·가공)', keywords: ['식품', '가공', '상온', '과자', '라면', '통조림'] },
  { code: 'IC11', label: '농산물(신선)', keywords: ['농산', '과일', '채소', '신선'], flags: { perishable: true } },
  { code: 'IC12', label: '축산/수산(신선)', keywords: ['축산', '수산', '고기', '생선', '해산물'], flags: { perishable: true, tempRequired: true } },
  { code: 'IC13', label: '냉장/냉동 식품(포장완료)', keywords: ['냉장', '냉동', '아이스팩'], flags: { tempRequired: true } },
  { code: 'IC14', label: '음료(병/캔/페트)', keywords: ['음료', '물', '주스', '탄산'], flags: { liquid: true } },

  // 취급주의 품목 (IC20-IC24)
  { code: 'IC20', label: '유리/도자기/사기(파손주의)', keywords: ['유리', '도자기', '사기', '그릇'], flags: { fragile: true } },
  { code: 'IC21', label: '전자기기/가전(배터리 없음/분리)', keywords: ['전자', '가전', '기기'], flags: { fragile: true } },
  { code: 'IC22', label: '배터리 포함 전자/리튬배터리', keywords: ['배터리', '리튬', '보조배터리'], flags: { battery: true, hazmatLike: true } },
  { code: 'IC23', label: '정밀/고가품', keywords: ['정밀', '고가', '시계', '카메라', '귀금속'], flags: { fragile: true } },
  { code: 'IC24', label: '예술품/액자/피규어', keywords: ['예술', '액자', '피규어', '아트'], flags: { fragile: true, oversizeRisk: true } },

  // 액체/화학류 (IC30-IC34)
  { code: 'IC30', label: '액체류(누수위험·비위험)', keywords: ['액체', '샴푸', '세제', '화장품'], flags: { liquid: true } },
  { code: 'IC31', label: '페인트/도료(수성 중심)', keywords: ['페인트', '도료', '수성'], flags: { liquid: true } },
  { code: 'IC32', label: '윤활유/오일/연료성 액체', keywords: ['윤활', '오일', '연료'], flags: { liquid: true, hazmatLike: true } },
  { code: 'IC33', label: '화학제품/세정제(강산·강알칼리 제외)', keywords: ['화학', '세정'], flags: { hazmatLike: true } },
  { code: 'IC34', label: '위험물/인화성/폭발물/독극물(특수)', keywords: ['위험물', '인화', '폭발', '독극물'], flags: { hazmatLike: true } },

  // 의료/의약품 (IC40-IC41)
  { code: 'IC40', label: '의약품/의료기기(상온)', keywords: ['의약', '의료', '의료기기'] },
  { code: 'IC41', label: '검체/생물/냉장필수(특수)', keywords: ['검체', '생물'], flags: { tempRequired: true, hazmatLike: true } },

  // 특수 규격 (IC50-IC52)
  { code: 'IC50', label: '중량물(특수)', keywords: ['중량', '무거움'], flags: { oversizeRisk: true } },
  { code: 'IC51', label: '장척/대형(특수)', keywords: ['장척', '대형', '긴'], flags: { oversizeRisk: true } },
  { code: 'IC52', label: '이사/벌크/혼합짐', keywords: ['이사', '벌크', '혼합', '다품목'], flags: { oversizeRisk: true } },

  // 기타
  { code: 'IC99', label: '기타(분류불가/미정)', keywords: ['기타', '미정', '분류불가'] },
]

/**
 * 품목 코드로 아이템 조회
 */
export function getItemByCode(code: string): ItemCode | undefined {
  return PLATFORM_ITEM_CODES.find(item => item.code === code)
}

/**
 * 검색어로 품목 필터링 (코드/라벨/키워드 검색)
 */
export function searchItems(query: string): ItemCode[] {
  if (!query.trim()) return PLATFORM_ITEM_CODES

  const q = query.toLowerCase().trim()
  return PLATFORM_ITEM_CODES.filter(item =>
    item.code.toLowerCase().includes(q) ||
    item.label.toLowerCase().includes(q) ||
    item.keywords.some(kw => kw.toLowerCase().includes(q))
  )
}

/**
 * 특정 플래그를 가진 품목 필터링
 */
export function getItemsByFlag(flag: keyof NonNullable<ItemCode['flags']>): ItemCode[] {
  return PLATFORM_ITEM_CODES.filter(item => item.flags?.[flag])
}

/**
 * 위험물/특수 처리가 필요한 품목 코드 목록
 */
export const SPECIAL_HANDLING_CODES = ['IC34', 'IC41']

/**
 * 기본 제한 품목 코드 (플랫폼 기본 게이트에서 차단)
 */
export const RESTRICTED_CODES = ['IC34']
