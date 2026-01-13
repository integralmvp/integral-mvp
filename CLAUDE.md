# INTEGRAL MVP - 개발 가이드

## 📋 프로젝트 개요

### 기본 정보
- **프로젝트명**: INTEGRAL (가칭)
- **버전**: MVP v3.0
- **목적**: 물류 경로·공간 공유 오픈마켓 설득용 시연 MVP
- **기술 스택**: Vite + React + TypeScript + Tailwind CSS + Kakao Maps API
- **개발 기간**: 2025.01.14 ~

### ⚠️ 중요: MVP의 본질
> **이 프로젝트는 설득용 시연 목적이며, 실제 운영 목적이 아닙니다.**
>
> - 투자자/이해관계자에게 3-5분 내 서비스 가치를 전달하는 것이 목표
> - 실제 거래 기능 없음 (모든 것이 더미 데이터 기반)
> - 백엔드/데이터베이스 없음
> - "이 서비스가 작동한다면 어떻게 보일까?"를 시각화하는 프로토타입

---

## 🎯 핵심 설계 원칙

### 1. 직관성 우선
- 별도 설명 없이 화면만으로 서비스 이해 가능
- 랜딩 3초 내 "물류 자원을 거래하는 플랫폼"임을 파악 가능

### 2. 지도 중심 UI
- 모든 가치는 지도에서 시각적으로 전달
- 경로(선) + 공간(히트맵) 시각화가 핵심

### 3. 싱글 페이지 구조
- 별도 라우팅 없이 스크롤/앵커/모달로 모든 정보 접근
- 사용자는 페이지 이동 없이 전체 서비스 경험 가능

### 4. 거래 가능성 시연
- 거래 모달 플로우를 통해 "실제로 거래가 일어난다"는 인상 강화
- 규정 매칭, 비용 계산 등 스마트한 중개 기능 시연

### 5. 더미 데이터 기반
- 백엔드 없음, 모든 데이터는 `src/data/mockData.ts`에서 관리
- 실시간 데이터 연동 없음

### 6. 룰 기반 로직
- 복잡한 알고리즘 대신 단순 조건문(if-else) 기반
- 규정 매칭, 비용 계산 등 모두 룰 기반으로 구현

---

## 📁 폴더 구조

```
integral-mvp/
├─ public/                      # 정적 파일
├─ src/
│  ├─ components/
│  │  ├─ layout/               # 레이아웃 컴포넌트
│  │  │  ├─ Navigation.tsx    # 상단 네비게이션 바 (고정)
│  │  │  └─ Footer.tsx         # 푸터
│  │  │
│  │  ├─ common/               # 공통 재사용 컴포넌트
│  │  │  ├─ Modal.tsx          # 모달 컨테이너
│  │  │  ├─ Badge.tsx          # 배지 (통합가능, 규정상태 등)
│  │  │  ├─ Button.tsx         # CTA 버튼
│  │  │  └─ Toast.tsx          # 토스트 알림
│  │  │
│  │  ├─ hero/                 # 🌟 지도 히어로 섹션 (가장 중요)
│  │  │  ├─ MapHeroSection.tsx
│  │  │  ├─ KakaoMapView.tsx
│  │  │  ├─ MessageOverlay.tsx
│  │  │  ├─ RoutePolyline.tsx  # 경로 시각화
│  │  │  ├─ StorageHeatmap.tsx # 공간 히트맵
│  │  │  └─ MapTooltip.tsx
│  │  │
│  │  ├─ features/             # 핵심 기능 소개 섹션
│  │  │  ├─ CoreFeaturesSection.tsx
│  │  │  └─ FeatureCard.tsx
│  │  │
│  │  ├─ routes/               # 경로 상품 섹션
│  │  │  ├─ RouteProductsSection.tsx
│  │  │  ├─ RouteProductCard.tsx
│  │  │  └─ RouteDetailModal.tsx
│  │  │
│  │  ├─ storages/             # 공간 상품 섹션
│  │  │  ├─ StorageProductsSection.tsx
│  │  │  ├─ StorageProductCard.tsx
│  │  │  └─ StorageDetailModal.tsx
│  │  │
│  │  ├─ deal/                 # 🌟 거래 모달 (신규)
│  │  │  ├─ DealModal.tsx
│  │  │  ├─ ProductSummary.tsx
│  │  │  ├─ CargoConditionForm.tsx
│  │  │  ├─ UnitLoadSelector.tsx
│  │  │  ├─ HandlingOptionsCheckbox.tsx
│  │  │  ├─ RegulationMatchResult.tsx
│  │  │  ├─ MatchStatusBadge.tsx
│  │  │  ├─ RestrictionList.tsx
│  │  │  ├─ CostEstimate.tsx
│  │  │  └─ BookingConfirmButton.tsx
│  │  │
│  │  └─ cta/                  # 사용자 CTA 섹션
│  │     └─ UserTypeCTA.tsx
│  │
│  ├─ types/
│  │  └─ models.ts             # 모든 데이터 모델 타입 정의
│  │
│  ├─ data/
│  │  └─ mockData.ts           # 더미 데이터 (6 routes, 6 storages 등)
│  │
│  ├─ utils/
│  │  ├─ mapHelpers.ts         # 지도 관련 유틸리티
│  │  ├─ regulationEngine.ts   # 규정 매칭 룰 엔진
│  │  └─ costCalculator.ts     # 비용 계산 유틸리티
│  │
│  ├─ App.tsx                  # 메인 싱글 페이지
│  ├─ main.tsx
│  └─ index.css
│
├─ .env                        # 환경 변수 (Kakao Maps API 키)
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ tailwind.config.js
```

---

## 🗺️ 페이지 구조

### 싱글 페이지 구성 (앵커 섹션)

```
/ (루트 - 전체 스크롤 가능)
│
├─ Navigation Bar (고정)
│  ├─ 로고 (클릭 시 최상단 이동)
│  ├─ 경로 찾기 (#routes)
│  ├─ 공간 찾기 (#storages)
│  └─ 서비스 소개 (#features)
│
├─ #hero - 지도 히어로 섹션 (80vh+)
│  ├─ Kakao Map (전체 화면)
│  ├─ 경로 시각화 (Polyline)
│  ├─ 공간 히트맵 (Polygon)
│  └─ 메시지 오버레이
│
├─ #features - 핵심 기능 소개
│  └─ 4개 Feature Card
│
├─ #routes - 경로 상품 리스트
│  └─ 6개 Route Product Card
│     ├─ "상세 보기" → RouteDetailModal
│     └─ "거래하기" → DealModal
│
├─ #storages - 공간 상품 리스트
│  └─ 6개 Storage Product Card
│     ├─ "상세 보기" → StorageDetailModal
│     └─ "거래하기" → DealModal
│
├─ #cta - 사용자 유형 CTA
│  ├─ 화주용 버튼
│  └─ 사업자용 버튼
│
└─ Footer
```

### 모달 레이어 (라우팅 없음)

```
[모달들 - URL 변경 없이 오버레이로 표시]
├─ RouteDetailModal      # 경로 상세 정보
├─ StorageDetailModal    # 공간 상세 정보
├─ DealModal            # 🌟 거래 모달 (핵심)
└─ MVPNoticeModal       # MVP 안내 모달
```

---

## 💼 거래 모달 플로우 (핵심 기능)

### 진입점
- 경로/공간 상품 카드의 **"거래하기"** 버튼 클릭

### 모달 구성 (5단계)

```
┌─────────────────────────────────────────┐
│  1. 선택 상품 요약                       │
│     - 경로: 출발지 → 도착지, 가격        │
│     - 공간: 위치, 유형, 가격             │
├─────────────────────────────────────────┤
│  2. 화물 조건 입력                       │
│     ○ 소형  ○ 대형  ○ 특수              │
│     □ 파손주의  □ 냉장  □ 냉동          │
│     □ 위험물  □ 온도민감  □ 적재방향     │
│     물동량: [___] 파렛트                 │
├─────────────────────────────────────────┤
│  3. 규정 매칭 결과 (실시간 업데이트)      │
│     [● 가능] / [! 주의] / [✗ 불가]      │
│     - 제한 사항 1                        │
│     - 제한 사항 2                        │
├─────────────────────────────────────────┤
│  4. 예상 비용 (더미 계산)                │
│     기본 가격: 180,000원                 │
│     특수 취급: +18,000원                 │
│     총 예상: 198,000원                   │
├─────────────────────────────────────────┤
│  5. [예약 요청(데모)] 버튼               │
└─────────────────────────────────────────┘
         ↓ 클릭
┌─────────────────────────────────────────┐
│  ✓ 예약 성공!                           │
│  거래 ID: DEAL-20250114-001             │
└─────────────────────────────────────────┘
   (3초 후 자동 닫힘)
```

### 규정 매칭 로직 (룰 기반)

**5가지 규정 룰 (더미)**:
1. **냉장 화물 규정**: 냉장/냉동 화물 → 냉장/냉동 차량/공간만 가능
2. **위험물 규정**: 위험물 → 허가된 차량만 가능
3. **대형 유니트 로드 규정**: 대형 화물 → 5톤 이상 차량만 가능
4. **용량 초과 규정**: 요청 물동량 > 가용 용량 → 불가
5. **적재 방향 주의**: 적재 방향 특이사항 → 주의 (사전 협의 필요)

**구현 위치**: `src/utils/regulationEngine.ts`

---

## 📊 데이터 모델

### 주요 타입 (src/types/models.ts)

#### 1. 경로 상품 (RouteProduct)
```typescript
{
  id: string;
  origin: { name, lat, lng };
  destination: { name, lat, lng };
  schedule: string;
  capacity: string;
  vehicleType: string;
  cargoTypes: CargoType[];
  price: number;
  priceUnit: string;
  canIntegrateWith?: string[];    // 통합 가능한 경로 ID
  regulationStatus: RegulationStatus;
}
```

#### 2. 공간 상품 (StorageProduct)
```typescript
{
  id: string;
  location: { name, lat, lng, region };
  storageType: StorageType;
  capacity: string;
  price: number;
  priceUnit: string;
  features: string[];
  connectedRoutes?: string[];     // 연결 가능한 경로 ID
  regulationStatus: RegulationStatus;
}
```

#### 3. 화물 조건 (CargoCondition)
```typescript
{
  unitLoadModule: "소형" | "대형" | "특수";
  handlingOptions: HandlingOption[];
  quantity: number;
  notes?: string;
}
```

#### 4. 규정 매칭 결과 (MatchResult)
```typescript
{
  status: "가능" | "주의" | "불가";
  message: string;
  restrictions?: { reason, detail }[];
  warnings?: string[];
}
```

#### 5. 비용 추정 (CostEstimate)
```typescript
{
  basePrice: number;
  handlingFee?: number;
  totalPrice: number;
  breakdown: { label, amount }[];
}
```

---

## 🚀 개발 단계 (PR 순서)

### PR1: 프로젝트 스캐폴딩 + 레이아웃
**목표**: 개발 환경 구축 + 전체 페이지 골격

**작업**:
- Vite + React + TypeScript 초기화
- Tailwind CSS 설정
- Kakao Maps API 키 설정 (.env)
- 폴더 구조 생성
- Navigation, Footer 구현
- 섹션별 컨테이너 빈 틀
- 앵커 스크롤 네비게이션

**완료 기준**:
- 메뉴 클릭 시 해당 섹션으로 스크롤 작동
- 전체 레이아웃이 와이어프레임과 일치

---

### PR2: 지도 히어로 + 더미 데이터 + 거래 모달 UI
**목표**: 서비스 핵심 가치 전달 + 거래 가능성 시각화

**작업**:
- Kakao Maps 통합
- 더미 데이터 생성 (mockData.ts)
  - RouteProduct 6개
  - StorageProduct 6개
  - RegionHeatmap 데이터
  - 유니트 로드 모듈 (3개)
  - 취급 특이사항 옵션 (6개)
  - 규정 룰 샘플 (5개)
- 경로 시각화 (Polyline)
- 공간 히트맵 (Polygon)
- 메시지 오버레이
- 거래 모달 전체 UI 구현 (기능 연결 제외)
- 상품 카드에 "거래하기" 버튼 추가

**완료 기준**:
- 지도에 경로/공간 시각화됨
- "거래하기" 버튼 클릭 시 거래 모달 오픈
- 모달 내 모든 UI 요소 표시 (더미 상태)

---

### PR3: 상품 리스트 + 상세 모달 + 규정 매칭 로직
**목표**: 상품 탐색 + 거래 규정 매칭 기능 구현

**작업**:
- 핵심 기능 소개 섹션
- 경로/공간 상품 리스트
- 상세 모달 (RouteDetailModal, StorageDetailModal)
- 배지 컴포넌트
- 규정 룰 엔진 (regulationEngine.ts)
- 비용 계산기 (costCalculator.ts)
- 거래 모달 기능 연결
  - 화물 조건 입력 → 규정 매칭 실시간
  - 예상 비용 실시간 계산
  - 예약 요청 → 성공 토스트

**완료 기준**:
- 카드/지도 클릭 시 상세 모달 오픈
- 거래 모달에서 화물 조건 입력 시 매칭 결과 실시간 변경
- "예약 요청" 클릭 시 성공 토스트 + 거래 ID 표시

---

### PR4: 경로 통합 + CTA + 데모 마무리
**목표**: 차별화 기능 완성 + 설득용 요소 마무리

**작업**:
- 경로 통합 배지 표시
- 공간-경로 연결 UI
- 호버 툴팁
- 사용자 CTA 섹션
- MVP 안내 모달
- 반응형 디자인
- 성능 최적화
- 전체 데모 시나리오 테스트

**완료 기준**:
- "통합가능" 배지 표시
- 공간-경로 연결 표시
- 3-5분 시연 최적화
- 모든 인터랙션 자연스럽게 작동

---

## ⚙️ 기술 명세

### Kakao Maps API
- **라이브러리**: Kakao Maps JavaScript API
- **환경 변수**: `VITE_KAKAO_MAP_API_KEY`
- **주요 기능**:
  - 지도 표시: `kakao.maps.Map`
  - 경로 시각화: `kakao.maps.Polyline`
  - 공간 히트맵: `kakao.maps.Polygon`
  - 마커: `kakao.maps.Marker`

### 줌 레벨 정의
- **Level 1** (줌 7-9): 전국 뷰, 주요 경로만
- **Level 2** (줌 10-12): 권역 뷰, 상세 경로 + 시/군/구 히트맵

### 히트맵 명도 기준
| 단계 | 색상 | 기준 |
|------|------|------|
| 0 | 투명/회색 | 등록 공간 없음 |
| 1 | 연한 녹색 | 파렛트 1-20개 |
| 2 | 중간 녹색 | 파렛트 21-50개 |
| 3 | 진한 녹색 | 파렛트 51개 이상 |

---

## 🚫 제약사항 및 금지사항

### ❌ 절대 구현하지 말 것

1. **로그인/회원가입 시스템**
   - 이유: MVP 범위 초과, 설득 목적에 불필요

2. **실제 결제 시스템**
   - 이유: 더미 데이터 기반 시연용

3. **백엔드 서버**
   - 이유: 모든 데이터는 프론트엔드 더미 데이터

4. **데이터베이스**
   - 이유: mockData.ts로 충분

5. **별도 페이지 라우팅**
   - 이유: 싱글 페이지 구조 유지

6. **실시간 데이터 연동**
   - 이유: 더미 데이터 기반

7. **실제 거래 실행**
   - 예약 요청은 더미 ID 생성 + 토스트만

8. **복잡한 알고리즘**
   - 이유: 룰 기반 간단 로직으로 충분

### ✅ 허용되는 범위

1. **더미 데이터 기반 모든 UI**
2. **모달 기반 상세 페이지**
3. **앵커 기반 섹션 스크롤**
4. **룰 기반 규정 매칭**
5. **더미 비용 계산**
6. **성공 토스트 피드백**

---

## 🎨 디자인 원칙

### 1. 지도 중심
- 지도가 시각적 주인공
- 다른 요소는 보조 역할

### 2. 직관성
- 클릭 가능한 요소는 명확히 구분
- 호버 시 시각적 피드백

### 3. 신뢰감
- B2B 서비스에 적합한 전문적 톤
- 과도한 애니메이션 지양

### 4. 상태 표현
- 색상/아이콘으로 정보 전달
  - 가능: 녹색
  - 주의: 노란색
  - 불가: 빨간색

### 5. 반응형
- 데스크톱 우선 (1280px+)
- 태블릿 대응 (768px+)

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

### 더미 데이터
- `data/mockData.ts`에서 export
- 타입과 일치하도록 작성
- 6개 경로, 6개 공간 유지

### 스타일링
- Tailwind 유틸리티 클래스 우선
- 커스텀 CSS 최소화
- 일관된 색상 팔레트 유지

### 함수
- 유틸리티 함수는 `utils/`에
- 순수 함수 지향
- 명확한 함수명 (동사 + 명사)

---

## 🎬 데모 시나리오

### 3-5분 시연 순서

1. **랜딩** (10초)
   - 지도에서 경로/공간 즉시 인식
   - "물류 자원을 거래하는 플랫폼" 이해

2. **지도 탐색** (30초)
   - 지도 확대/축소
   - 경로 클릭 → 간단 정보
   - 공간 히트맵 확인

3. **경로 상품 탐색** (1분)
   - 메뉴에서 "경로 찾기" 클릭
   - 카드 리스트 확인
   - 카드 클릭 → 상세 모달

4. **거래 프로세스** (2분) 🌟 핵심
   - "거래하기" 버튼 클릭
   - 화물 조건 입력
     - 유니트 로드: "대형" 선택
     - 취급 특이사항: "냉장" 체크
   - 규정 매칭 결과 실시간 확인
   - 예상 비용 확인
   - "예약 요청" 클릭
   - 성공 토스트 + 거래 ID 확인

5. **차별화 기능** (1분)
   - "통합가능" 배지 확인
   - 공간 카드에서 "경로 연결" 확인
   - 규정 자동 매칭 강조

6. **마무리** (30초)
   - CTA 섹션 확인
   - 서비스 가치 요약

---

## 🎯 우선순위

### P0 (필수 - 반드시 구현)
- Navigation, Footer
- 지도 히어로 섹션 (지도, 경로, 히트맵, 오버레이)
- 상품 카드 (경로, 공간)
- 상세 모달
- **거래 모달 전체**
- 규정 매칭 로직
- 비용 계산

### P1 (권장 - 시간 허용 시 구현)
- 호버 효과
- 툴팁
- 핵심 기능 소개 섹션
- 통합가능 배지
- 사용자 CTA

### P2 (선택 - 시간 남을 시 구현)
- 푸터 상세 정보
- 부드러운 애니메이션
- 추가 시각 효과

---

## 📌 자주 참조할 사항

### 더미 데이터 개수
- 경로 상품: 6개
- 공간 상품: 6개
- 유니트 로드 모듈: 3개 (소형, 대형, 특수)
- 취급 특이사항: 6개
- 규정 룰: 5개

### 주요 파일 경로
- 타입 정의: `src/types/models.ts`
- 더미 데이터: `src/data/mockData.ts`
- 규정 엔진: `src/utils/regulationEngine.ts`
- 비용 계산: `src/utils/costCalculator.ts`

### 환경 변수
```env
VITE_KAKAO_MAP_API_KEY=your_api_key_here
```

### Git 브랜치 전략
- `main`: 프로덕션 (최종 MVP)
- `claude/integral-homepage-v3-bD1AM`: 현재 개발 브랜치
- PR 단위로 기능 개발

---

## 🔄 개발 시 체크리스트

### PR 전 확인사항
- [ ] TypeScript 타입 에러 없음
- [ ] 콘솔 에러 없음
- [ ] 더미 데이터와 타입 일치
- [ ] 우선순위 준수 (P0 > P1 > P2)
- [ ] 금지사항 위반 없음
- [ ] 싱글 페이지 구조 유지
- [ ] 데모 시나리오 작동

### 컴포넌트 작성 시
- [ ] Props 타입 정의
- [ ] 재사용 가능성 고려
- [ ] Tailwind 클래스 사용
- [ ] 접근성 고려 (시맨틱 태그)

### 데이터 작업 시
- [ ] `types/models.ts`에 타입 정의
- [ ] `data/mockData.ts`에 더미 데이터
- [ ] 타입과 데이터 일치

---

## 📚 참고 자료

### PRD 문서
- PRD v3.0 참조 (별도 문서)
- 모든 기능 명세는 PRD 기준

### Kakao Maps API
- 공식 문서: https://apis.map.kakao.com/web/

### Tailwind CSS
- 공식 문서: https://tailwindcss.com/docs

---

## 💡 개발 팁

### 지도 성능 최적화
- 줌 레벨에 따라 표시 데이터 조절
- 불필요한 재렌더링 방지 (React.memo)

### 모달 관리
- 모달 상태는 상위 컴포넌트에서 관리
- 모달 닫힐 때 상태 초기화

### 규정 매칭
- 화물 조건 변경 시 실시간 재계산
- useEffect로 의존성 관리

### 토스트 알림
- 3초 후 자동 닫힘
- 여러 토스트 동시 표시 고려

---

## 🎉 최종 목표

> **투자자가 3-5분 시연을 보고:**
>
> 1. "물류 경로와 공간을 거래하는 플랫폼이구나" ✅
> 2. "지도에서 바로 확인하고 거래할 수 있네" ✅
> 3. "규정도 자동으로 확인해주는구나" ✅
> 4. "실제로 작동하는 서비스네" ✅
> 5. "이거 투자할 만하다!" 🎯

**이것이 이 MVP의 유일한 목표입니다.**

---

**작성일**: 2025.01.14
**최종 수정**: 2025.01.14
