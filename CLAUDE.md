# INTEGRAL MVP - 개발 가이드

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: INTEGRAL
- **목적**: 제주 물류 공유 플랫폼 - 공간과 경로를 상품화하는 공유 물류 서비스
- **버전**: MVP v3.0 (설득용 시연 목적)

### ⚠️ 중요: MVP의 본질
> **이 프로젝트는 설득용 시연 목적이며, 실제 운영 목적이 아닙니다.**
>
> - 투자자/이해관계자에게 3-5분 내 서비스 가치를 전달하는 것이 목표
> - 실제 거래 기능 없음 (모든 것이 더미 데이터 기반)
> - 백엔드/데이터베이스 없음
> - "이 서비스가 작동한다면 어떻게 보일까?"를 시각화하는 프로토타입

---

## 🎯 핵심 설계 원칙

1. **직관성 우선** - 별도 설명 없이 화면만으로 서비스 이해 가능
2. **지도 중심 UI** - 모든 가치는 지도에서 시각적으로 전달
3. **싱글 페이지 구조** - 별도 라우팅 없이 모달로 모든 정보 접근
4. **더미 데이터 기반** - 백엔드 없음, 모든 데이터는 mockData에서 관리
5. **룰 기반 로직** - 복잡한 알고리즘 대신 단순 조건문 기반

---

## ⚙️ 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **스타일링**: Tailwind CSS
- **지도**: Mapbox GL JS (light-v11 스타일)
- **폰트**: Pretendard (메인), Inter (숫자)

### 환경변수
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── Layout/
│   │   ├── CommandLayout.tsx          # 전체 레이아웃 (지도 배경 + 좌측 블러)
│   │   └── ServiceConsole.tsx         # 서비스 콘솔 (탭 + 아코디언 폼)
│   ├── Map/
│   │   └── MapboxContainer.tsx        # Mapbox 지도 (메인 + 미니맵)
│   ├── common/                        # 공통 컴포넌트 (PR3 사용 예정)
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── ProductCard.tsx
│   │   └── Toast.tsx
│   ├── deal/                          # 거래 모달 (PR3 사용 예정)
│   │   ├── DealModal.tsx
│   │   ├── CargoConditionForm.tsx
│   │   ├── ProductSummary.tsx
│   │   ├── CostEstimate.tsx
│   │   └── RegulationMatchResult.tsx
│   ├── routes/                        # 경로 카드 (PR3 사용 예정)
│   │   └── RouteProductCard.tsx
│   └── storages/                      # 공간 카드 (PR3 사용 예정)
│       └── StorageProductCard.tsx
├── types/
│   └── models.ts                      # 데이터 모델 타입 정의
├── data/
│   └── mockData.ts                    # 더미 데이터
└── utils/
    ├── regulationEngine.ts            # 규정 매칭 룰 엔진 (PR3)
    └── costCalculator.ts              # 비용 계산 유틸리티 (PR3)
```

---

## ✅ 완료된 작업

### PR1: 프로젝트 초기 설정
- Vite + React + TypeScript 구축
- Tailwind CSS 설정
- 기본 레이아웃 골격

### PR2-4: UI 전면 개편 ✅ 완료
**레이아웃 구조:**
- 전체 화면 Mapbox 지도 배경
- 좌측 45%: 블러 오버레이 (backdrop-filter: blur(12px))
- 로고: 좌측 상단 (INTEGRAL, 흰색)
- 서비스 콘솔: 좌측 하단 위젯

**서비스 콘솔 (ServiceConsole):**
- 3개 탭: 보관 | 운송 | 보관+운송
- 에어비앤비식 아코디언 폼
- 각 탭별 맞춤형 입력 필드
- 검색 버튼 (탭별 색상 변경)
- 반투명 배경: rgba(255, 255, 255, 0.3) + blur(8px)

**지도 (MapboxContainer):**
- **메인 지도**
  - 라이트 스타일 (light-v11)
  - 제주도 중심 [126.5312, 33.4996]
  - centerOffset으로 우측 배치 (좌측 블러 영역 보정)
  - 아이소메트릭 3D 파렛트 마커 (주황색 #ff6b35)
  - 베지어 곡선 경로 (파란색 실선)
- **미니맵 (이중 맵)**
  - 한반도 전체 + 제주 (zoom 4.5)
  - 크기: 280x200px
  - 입도/출도 경로 + 화살표
  - interactive: false
- **헤더 위젯**
  - "서비스 현황 실시간 모니터링" + 현재 시각
  - 범례 아이콘 (◆공간 ━도내 ┄입도 ┄출도)
  - 우측 상단 플로팅

**기술적 구현:**
- centerOffset 사용: 좌측 45% 블러 영역 보정
- 이중 Mapbox 인스턴스 (메인 + 미니맵)
- 미니맵 경로 화살표 (bearing 계산 + symbol layer)
- 파렛트 마커 호버 팝업 (호버 전용)

**삭제된 요소:**
- 우주 배경 (SpaceBackground)
- 다크 테마 위젯들 (PopularProducts, ProductStats)
- 별도 헤더 컴포넌트 (Header, CommandHeader)
- SVG 기반 미니맵 (MainlandMinimap)
- 네온 글로우 효과

---

## 🎯 다음 작업 (PR 로드맵)

### PR3: 서비스 콘솔 기능 구현
#### PR3-1: 아코디언 폼 + 탭 전환
- 탭 전환 로직 완성
- 아코디언 expand/collapse 애니메이션
- 탭별 필드 동적 렌더링

#### PR3-2: 보관면적 선택 (모듈/면적 → 파렛트 환산)
**단위 선택:** 포장박스 모듈 | 면적

**포장박스 모듈:**
- 소형/중형/대형 선택 (가로×세로 시각화)
- 박스 개수 입력
- 파렛트 환산: 적재높이 180cm 기준
- 시각화 이미지 + 안내문구

**면적 단위:**
- 면적(㎡) 입력
- 파렛트 환산 로직
- 규격: 1100×1100mm 기준

**파렛트 환산 표시:**
- 결과 표시: "약 X개 파렛트"
- 시각화 이미지
- 안내문구: "1파렛트 = 1.1m × 1.1m"

#### PR3-3: 품목 드롭다운 + 캘린더
- **품목 드롭다운**
  - 택배사 취급품목 목록
  - 검색 기능
  - 다중 선택 가능
- **캘린더 (보관기간)**
  - 시작일 ~ 종료일 선택
  - 기간 표시
- **캘린더 (운송날짜)**
  - 단일 날짜 선택

#### PR3-4: 보관+운송 순서 로직
- 순서 선택: 보관 먼저 | 운송 먼저
- 입력 필드 동적 재배치
- 플로우 시각화

### PR4: 검색 매칭 + 지도 연동
- 검색 버튼 클릭 → 매칭 결과 표시
- 지도에 매칭된 상품 하이라이트
- 필터링 로직
- 상품 카드 리스트
- 거래 모달 연결

### PR5: 거래 모달 + 규정 매칭
- DealModal 구현
- 규정 매칭 엔진 연결
- 비용 계산 로직
- 거래 완료 토스트

### PR6: 마무리 + 최적화
- 반응형 디자인
- 애니메이션 최적화
- 데모 시나리오 완성
- 성능 최적화

---

## 🎨 디자인 시스템

### 색상 (라이트 테마)
| 요소 | 색상 |
|------|------|
| 지도 배경 | Mapbox light-v11 |
| 블러 오버레이 | rgba(14, 165, 233, 0.15) + blur(12px) |
| 서비스 콘솔 | rgba(255, 255, 255, 0.3) + blur(8px) |
| 공간 상품 마커 | #ff6b35 (주황색) |
| 도내 경로 | #3b82f6 (파란색, 실선) |
| 입도 경로 | #10b981 (녹색, 점선) |
| 출도 경로 | #a855f7 (보라색, 점선) |

### 버튼
| 버튼 | 스타일 |
|------|--------|
| 보관하기 | blue-500 → blue-600 그라데이션 |
| 운송하기 | emerald-500 → emerald-600 그라데이션 |
| 보관+운송 | purple-500 → purple-600 그라데이션 |

### 위젯 스타일
- 배경: white/90 + backdrop-blur-sm
- 테두리: border-slate-300
- 그림자: shadow-lg
- 둥근 모서리: rounded-lg

---

## 🚫 제약사항 및 금지사항

### ❌ 절대 구현하지 말 것
1. **로그인/회원가입 시스템** - MVP 범위 초과
2. **실제 결제 시스템** - 더미 데이터 기반 시연용
3. **백엔드 서버** - 프론트엔드 더미 데이터만
4. **데이터베이스** - mockData.ts로 충분
5. **별도 페이지 라우팅** - 싱글 페이지 구조 유지
6. **실시간 데이터 연동** - 더미 데이터 기반
7. **실제 거래 실행** - 더미 ID 생성 + 토스트만

### ✅ 허용되는 범위
1. 더미 데이터 기반 모든 UI
2. 모달 기반 상세 페이지
3. 룰 기반 규정 매칭
4. 더미 비용 계산
5. 성공 토스트 피드백

---

## 📝 코딩 스타일

### 컴포넌트
- 기능별로 분리 (과도한 추상화 지양)
- Props 타입은 인터페이스로 명시
- 재사용 가능한 컴포넌트는 `common/`에

### 타입 정의
- 모든 타입은 `types/models.ts`에 집중
- `export interface` 사용
- 타입 이름은 PascalCase

### 스타일링
- Tailwind 유틸리티 클래스 우선
- 커스텀 CSS 최소화
- 일관된 색상 팔레트 유지

---

## 📊 데이터 모델 (핵심)

### 경로 상품 (RouteProduct)
```typescript
{
  id: string;
  origin: { name, lat, lng };
  destination: { name, lat, lng };
  vehicleType: string;
  cargoTypes: CargoType[];
  price: number;
  priceUnit: string;
  routeScope: RouteScope;      // "INTRA_JEJU" | "SEA"
  direction?: Direction;        // "INBOUND" | "OUTBOUND"
}
```

### 공간 상품 (StorageProduct)
```typescript
{
  id: string;
  location: { name, lat, lng, region };
  storageType: StorageType;    // "상온" | "냉장" | "냉동"
  capacity: string;
  price: number;
  priceUnit: string;
  features: string[];
}
```

### 더미 데이터 개수
- 경로 상품: 8개 (도내 4개, 입도 2개, 출도 2개)
- 공간 상품: 8개
- 유니트 로드 모듈: 3개 (소형, 중형, 대형)
- 취급 특이사항: 6개
- 규정 룰: 5개

---

## 🎯 우선순위

### P0 (필수 - PR3/4)
- 서비스 콘솔 기능 완성
- 보관면적 → 파렛트 환산
- 검색 매칭 로직
- 상품 카드/리스트

### P1 (권장 - PR5)
- 거래 모달
- 규정 매칭/비용 계산
- 호버 효과/툴팁

### P2 (선택 - PR6)
- 반응형 디자인
- 부드러운 애니메이션
- 추가 시각 효과

---

## 🔄 Git 브랜치

- `main`: 프로덕션 (PR 머지 후)
- PR2-4 완료: UI 전면 개편 (머지 완료)

---

## 📝 기술적 구현 세부사항

### centerOffset을 활용한 지도 배치
```tsx
// 좌측 45% 블러 영역만큼 오른쪽으로 offset
const container = map.current.getContainer()
const width = container.clientWidth
const offsetX = (width * 0.45) / 2

map.current.easeTo({
  center: [126.5312, 33.4996],  // 제주도 중심 그대로
  offset: [offsetX, 0],         // x만 오른쪽으로 이동
  duration: 0,
})
```

### 이중 맵 구현 (메인 + 미니맵)
- 두 개의 독립적인 Mapbox 인스턴스
- 메인: 제주도 중심, zoom 9, interactive
- 미니맵: 한반도 전체, zoom 4.5, interactive: false
- 미니맵에 입도/출도 경로 + 화살표 표시

### 미니맵 경로 화살표
- bearing 계산: `Math.atan2(dy, dx) * (180 / Math.PI)`
- Mapbox symbol layer 사용
- 화살표 이미지: SVG data URI
- icon-rotate: bearing 기반 회전

### 베지어 곡선 경로
- 시작점/끝점 + 중간 제어점으로 2차 베지어 곡선 생성
- 50개 포인트로 부드러운 곡선 표현
- 중간 제어점: 위로 볼록 (midLat + 0.08)

### 파렛트 마커 호버
- Mapbox Marker의 `position: absolute` 유지 필수
- 호버 효과는 inner div에만 적용
- 팝업: closeButton: false, closeOnClick: false

---

**작성일**: 2025.01.14
**최종 수정**: 2025.01.22 (PR2-4 완료 + 파일 정리)
