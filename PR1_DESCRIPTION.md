# PR1: 프로젝트 스캐폴딩 + 레이아웃 기반 구조

## PR 생성 방법
1. GitHub에서 다음 URL로 이동:
   https://github.com/integralmvp/integral-mvp/pull/new/claude/integral-homepage-v3-bD1AM

2. 아래 내용을 PR 설명란에 복사하여 붙여넣기

---

## PR1: 프로젝트 스캐폴딩 + 레이아웃 기반 구조 완성

### 🎯 목표
이후 PR2~PR4가 바로 얹힐 수 있는 설득용 MVP 단일 페이지의 안정적인 뼈대를 만든다.

---

## ✅ 완료된 작업

### 1. 프로젝트 초기화
- ✅ Vite + React + TypeScript 프로젝트 설정
- ✅ Tailwind CSS 설정 (커스텀 색상 팔레트 포함)
- ✅ PostCSS 설정
- ✅ TypeScript 컴파일 에러 없음
- ✅ 프로덕션 빌드 성공

### 2. 폴더 구조 생성 (CLAUDE.md 기준)
```
src/
├─ components/
│  ├─ layout/         # Navigation, Footer ✅
│  ├─ common/         # ProductCard ✅
│  ├─ hero/           # PR2 준비
│  ├─ features/       # PR3 준비
│  ├─ routes/         # PR3 준비
│  ├─ storages/       # PR3 준비
│  ├─ deal/           # PR3 준비
│  └─ cta/            # PR4 준비
├─ types/             # models.ts ✅
├─ data/              # PR2에서 더미 데이터 추가 예정
└─ utils/             # PR3에서 유틸리티 함수 추가 예정
```

### 3. 레이아웃 컴포넌트

#### Navigation.tsx
- 상단 고정 네비게이션 바 (sticky)
- 로고 + 메뉴 (경로 찾기, 공간 찾기, 서비스 소개)
- 앵커 스크롤 네비게이션 구현
- 반투명 배경 (지도 위 가독성 확보)

#### Footer.tsx
- 서비스명, 한 줄 소개
- 문의 정보 (더미)
- 저작권 표시

### 4. App.tsx - 싱글 페이지 앵커 섹션 레이아웃
5개 섹션을 앵커로 구분하고 각 섹션에 placeholder 텍스트 배치:
- `#hero` - 지도 히어로 영역 (80vh, 파란색)
- `#features` - 핵심 기능 섹션 (녹색)
- `#routes` - 경로 상품 리스트 (보라색)
- `#storages` - 공간 상품 리스트 (주황색)
- `#cta` - 사용자 CTA (분홍색)

### 5. ProductCard 기본 컴포넌트
- 재사용 가능한 상품 카드 UI 구조
- Props 타입 정의
- PR3에서 RouteProductCard, StorageProductCard로 확장 예정

### 6. 타입 정의 (models.ts)
- 기본 타입: Location, CargoType, StorageType, RegulationStatus
- 상품 타입: RouteProduct, StorageProduct
- ProductCardProps (PR1용)
- PR2, PR3에서 거래 관련 타입 확장 예정

### 7. 환경 변수
- `.env.example` 생성 (Kakao Maps API 키 플레이스홀더)

---

## 🔜 PR2에서 추가될 요소

### #hero 섹션 (지도 히어로)
- 📍 Kakao Maps 통합
- 📍 경로 시각화 (Polyline + 마커)
- 📍 공간 히트맵 (Polygon + 명도)
- 📍 메시지 오버레이

### 더미 데이터 (src/data/mockData.ts)
- 📍 RouteProduct 6개
- 📍 StorageProduct 6개
- 📍 RegionHeatmap 데이터
- 📍 유니트 로드 모듈 (3개)
- 📍 취급 특이사항 옵션 (6개)
- 📍 규정 룰 샘플 (5개)

### 거래 모달 UI (src/components/deal/)
- 📍 DealModal 컨테이너
- 📍 ProductSummary, CargoConditionForm, RegulationMatchResult 등
- 📍 UI만 구현 (기능 연결은 PR3)

### 상품 카드 업데이트
- 📍 "거래하기" 버튼 추가

---

## 🧪 테스트 완료
- ✅ `npx tsc --noEmit` - TypeScript 컴파일 에러 없음
- ✅ `npm run build` - 프로덕션 빌드 성공
- ✅ 앵커 스크롤 네비게이션 코드 구현 완료
- ✅ 모든 섹션 placeholder 렌더링 준비

---

## 📋 체크리스트
- [x] Vite + React + TypeScript 프로젝트 초기화
- [x] Tailwind CSS 설정
- [x] 폴더 구조 생성 (CLAUDE.md 기준)
- [x] .env.example 생성
- [x] models.ts 기본 타입 정의
- [x] Navigation 컴포넌트 (앵커 스크롤 포함)
- [x] Footer 컴포넌트
- [x] App.tsx 앵커 섹션 레이아웃 (5개 섹션)
- [x] ProductCard 기본 컴포넌트
- [x] TypeScript 에러 없음
- [x] 프로덕션 빌드 성공

---

## 🚫 PR1에서 하지 않은 것 (의도적)
- ❌ Kakao Maps API 실제 로드/렌더링 → PR2
- ❌ 실제 더미 데이터 바인딩 → PR2
- ❌ 거래 모달 구현 → PR2, PR3
- ❌ 규정 매칭, 경로 통합 로직 → PR3, PR4

---

## 📌 다음 단계: PR2
**목표**: 서비스 핵심 가치 전달 + 거래 가능성 시각화

**작업 내용**:
- Kakao Maps 통합 및 경로/공간 시각화
- 더미 데이터 생성 (6개 경로, 6개 공간)
- 거래 모달 전체 UI 구현 (기능 연결 제외)
- 상품 카드에 "거래하기" 버튼 추가

**완료 기준**:
- 지도에 경로/공간 시각화됨
- "거래하기" 버튼 클릭 시 거래 모달 오픈
- 모달 내 모든 UI 요소 표시 (더미 상태)
