# [9] 페이지 구조 및 라우팅 설계

> **INTEGRAL MVP 전체 코드베이스 정밀 분석 보고서**
> 작성 기준: 현재 레포 실제 코드 (2026-02-19)
> 섹션 9/11: 페이지 구조 및 라우팅 설계

---

## 9-1. 현재 SPA 구조 개요

### 라우터 현황

```
package.json → react-router-dom: 없음
```

**react-router-dom이 설치되어 있지 않다.** URL 기반 라우팅이 전혀 없으며, 앱 전체가 단일 `index.html` → 단일 `App.tsx` → 단일 `CommandLayout.tsx`로 구성된 완전한 SPA이다.

### 마운트 트리

```
main.tsx
└── <React.StrictMode>
    └── <App />
        └── <SearchResultProvider>       ← 전역 Context (검색 결과 공유)
            └── <CommandLayout />        ← 45%/55% 고정 그리드 레이아웃
                ├── <ServiceConsole />   ← 왼쪽 45% (화물등록, 조건입력, 검색)
                │   ├── <StorageTabSection />
                │   ├── <TransportTabSection />
                │   └── <BothTabSection />
                │       └── (공통 모달들)
                │           ├── <SearchResultModal />
                │           ├── <DealPage />
                │           └── <ProductDetailModal />
                └── <MapboxContainer />  ← 오른쪽 55% (Mapbox + 마커)
                    └── <HeaderWidget />
```

---

## 9-2. 화면 전환 메커니즘 (라우팅 대신 상태)

라우팅이 없으므로 모든 "화면 전환"은 React state와 조건부 렌더링으로 구현된다.

### 9-2-1. 탭 전환 (ServiceType)

```typescript
// useServiceConsoleState.ts:46
export type ServiceType = 'storage' | 'transport' | 'both'

// ServiceConsole.tsx에서 activeTab 상태로 탭 분기
{activeTab === 'storage' && <StorageTabSection />}
{activeTab === 'transport' && <TransportTabSection />}
{activeTab === 'both' && <BothTabSection />}
```

| 탭 | 값 | 렌더링 컴포넌트 |
|----|----|---------------|
| 보관 | `'storage'` | `StorageTabSection.tsx` |
| 운송 | `'transport'` | `TransportTabSection.tsx` |
| 보관+운송 | `'both'` | `BothTabSection.tsx` |

### 9-2-2. 플로우 단계 전환 (FlowStep)

```typescript
// useServiceConsoleState.ts:49
export type FlowStep = 'cargo-registration' | 'quantity-input' | 'condition-input'
```

한 탭 내에서 3단계를 순차 진행:

```
cargo-registration  →  quantity-input  →  condition-input
   (화물 등록)          (수량 입력)         (조건 입력 + 검색)
```

각 탭 섹션 내부에서 `currentStep`에 따라 조건부 렌더링:
```tsx
{currentStep === 'cargo-registration' && <CargoRegistrationCard />}
{currentStep === 'quantity-input' && <QuantityInputCard />}
{currentStep === 'condition-input' && <StorageConditionForm />}
```

### 9-2-3. 모달 스택 (오버레이 레이어)

```
(배경) CommandLayout
  ↓ overlay z-50
  SearchResultModal      ← 검색 결과 리스트
    ↓ overlay z-50
    ProductDetailModal   ← 상품 상세 보기
      ↓ (선택 후 닫기)
    DealPage             ← 거래 신청 폼 (전체화면 오버레이)
      ↓ overlay z-50
      ContractModal      ← 계약서 동의 (DealPage 내부 z-50)
```

**모달 트리거 상태:**
```typescript
// ServiceConsole 레벨
isSearchResultOpen: boolean
isDealPageOpen: boolean

// DealPage 내부
showContractModal: boolean
showConfirmCard: boolean
```

모달 간 전환은 URL 변경 없이 순수 boolean 플래그로 제어된다.

---

## 9-3. 실제 "페이지" 역할 컴포넌트 목록

URL은 하나지만 논리적으로 다음 화면들이 존재한다:

| 논리적 화면 | 구현 방식 | 트리거 |
|------------|---------|--------|
| 메인 (탐색) | 기본 렌더링 | 최초 진입 |
| 보관 탐색 | `activeTab='storage'` | 탭 클릭 |
| 운송 탐색 | `activeTab='transport'` | 탭 클릭 |
| 보관+운송 탐색 | `activeTab='both'` | 탭 클릭 |
| 화물 등록 | `currentStep='cargo-registration'` | 내부 상태 |
| 수량 입력 | `currentStep='quantity-input'` | 내부 상태 |
| 조건 입력 | `currentStep='condition-input'` | 내부 상태 |
| 검색 결과 | `isSearchResultOpen=true` | 검색 버튼 |
| 상품 상세 | `isDetailOpen=true` | 상품 카드 클릭 |
| 거래 신청 | `isDealPageOpen=true` | "이 상품 선택" |
| 계약서 동의 | DealPage 내 `showContractModal=true` | 거래 신청 버튼 |
| 거래 완료 | DealPage 내 `showConfirmCard=true` | 계약 동의 후 |

---

## 9-4. 현재 구조의 제약사항

### 제약 1: URL 공유 불가

어느 상태에 있든 URL은 항상 `/`이다. 검색 결과나 특정 상품을 URL로 공유할 수 없다.

```
현재: https://integral-mvp.com/ (모든 상태 동일)
이상: https://integral-mvp.com/search?type=storage&location=5011000000
```

### 제약 2: 브라우저 히스토리 없음

`뒤로 가기` 버튼이 앱 내 이전 상태로 돌아가지 않는다. 모달을 닫는 행위가 히스토리에 기록되지 않으므로, 뒤로 가기 시 사이트 자체를 이탈한다.

### 제약 3: 새로고침 시 상태 초기화

현재 탭, FlowStep, 화물 등록 상태가 모두 초기화된다. localStorage에 저장된 cargoStore/demandStore는 유지되지만 UI 상태는 리셋된다.

### 제약 4: 모달 중첩 깊이

최대 4단계(배경 → SearchResultModal → DealPage → ContractModal)의 중첩이 발생하며, z-index가 모두 `z-50`으로 동일하여 중첩 계층 충돌 위험이 있다.

---

## 9-5. 라우팅 추가 시 영향 분석

### 9-5-1. 라우팅 추가 필요 시점

| 기능 요구사항 | 라우팅 필요 여부 |
|-------------|---------------|
| 상품 등록 페이지 분리 | **필요** (별도 URL: `/register`) |
| 거래 내역 페이지 | **필요** (`/deals`, `/deals/:id`) |
| 관리자 대시보드 | **필요** (`/admin`) |
| 현재 검색/거래 플로우 | 불필요 (현재대로 모달 유지 가능) |

### 9-5-2. 라우팅 도입 시 변경 필요 지점

**1. App.tsx**
```tsx
// 변경 전
<SearchResultProvider>
  <CommandLayout />
</SearchResultProvider>

// 변경 후 (react-router-dom v6 기준)
<BrowserRouter>
  <SearchResultProvider>
    <Routes>
      <Route path="/" element={<CommandLayout />} />
      <Route path="/register" element={<ProductRegistrationPage />} />
      <Route path="/deals" element={<DealsPage />} />
    </Routes>
  </SearchResultProvider>
</BrowserRouter>
```

**2. SearchResultContext 범위**
- 현재: `CommandLayout` 하위 전체 공유
- 라우팅 추가 시: Route 전환 간 Context 상태 초기화 주의 필요
- `SearchResultProvider`는 Router 외부에 배치하여 페이지 전환 간 유지

**3. CommandLayout 의존성**
- `useMapLayers.ts` → `useSearchResult()` → Context 상태
- 지도 레이어가 URL 변경으로 마운트/언마운트되면 Mapbox 인스턴스 재초기화 발생
- 지도는 별도 persistent 레이아웃으로 유지하거나 Context 바깥으로 이동 필요

**4. useServiceConsoleState 스코프**
- 현재 훅은 `ServiceConsole` 컴포넌트 내부에서만 사용
- 라우팅 추가 시 상태가 페이지 전환에 따라 리셋됨
- 필요하다면 Context로 격상하여 페이지 간 공유 가능

### 9-5-3. 라우팅 없이 해결 가능한 것

MVP 수준에서는 라우팅 없이도 다음이 가능하다:
- `activeTab` URL 파라미터 대신 localStorage 기반 상태 복원
- `window.location.hash`를 간단한 SPA 라우팅 대안으로 활용 (비표준)
- 브라우저 History API 직접 사용 (`pushState`)으로 뒤로가기 지원

---

## 9-6. 현재 파일 구조의 라우팅 준비도

| 항목 | 현황 | 라우팅 준비도 |
|------|------|-------------|
| 라우터 라이브러리 | 미설치 | 추가 필요 (react-router-dom v6) |
| 전역 Context | SearchResultContext 1개 | 추가 라우트 간 공유 가능 |
| 지도 컴포넌트 | 항상 마운트 | 라우팅 시 unmount 위험 (Mapbox 재초기화) |
| 모달 상태 | 컴포넌트 로컬 state | 라우팅 연동 필요 없음 |
| localStorage | 이미 상태 영속화 | 페이지 전환 간 데이터 유지 가능 |
| 인증 Guard | 없음 | PrivateRoute 패턴 추가 시 용이 |

---

## 9-7. 컴포넌트 파일 위치와 논리적 화면 매핑

```
src/
├── App.tsx                                  ← 앱 루트 (라우터 추가 위치)
├── components/
│   ├── Layout/
│   │   ├── CommandLayout.tsx               ← 메인 레이아웃 (항상 존재)
│   │   └── ServiceConsole/                 ← 검색/탐색 "화면"
│   │       ├── ServiceConsole.tsx          ← 탭 + 모달 오케스트레이션
│   │       ├── sections/                   ← 탭별 콘텐츠 섹션
│   │       │   ├── StorageTabSection.tsx   ← 보관 탐색 플로우
│   │       │   ├── TransportTabSection.tsx ← 운송 탐색 플로우
│   │       │   └── BothTabSection.tsx      ← 연계 탐색 플로우
│   │       └── ui/
│   │           ├── DealPage.tsx            ← 거래 신청 "화면" (모달)
│   │           └── SearchResultModal.tsx   ← 검색 결과 "화면" (모달)
│   └── Map/
│       └── MapboxContainer/               ← 항상 렌더링 (지도)
├── contexts/
│   └── SearchResultContext.tsx            ← 전역 상태 (라우팅 간 공유 가능)
```

---

*근거 파일: `src/App.tsx`, `src/main.tsx`, `package.json`, `components/Layout/CommandLayout.tsx`, `components/Layout/ServiceConsole/hooks/useServiceConsoleState.ts`, `components/Layout/ServiceConsole/ServiceConsole.tsx`*
