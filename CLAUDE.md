# INTEGRAL MVP - CLAUDE.md

## 프로젝트 개요

- **프로젝트명**: CUBE
- **목적**: 제주 물류, 유통 오픈마켓 플랫폼 - 공간과 경로를 상품화하는 공유 물류 서비스
- **현재 단계**: 상품 거래 페이지 안정화 완료, 다음 단계는 **상품 등록 페이지 + 백엔드 연결 준비**

> 핵심: 현재 상품 거래 페이지는 **큐브 거래 엔진 + Code Data System(CDS) + 규정/자원/조건/거래 레이어**가 실제 코드에 연결된 상태이며, 이후 개발은 이 구조를 절대 깨지 않는 방향으로 진행한다.

---

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **스타일링**: Tailwind CSS
- **지도**: Mapbox GL JS
- **폰트**: Pretendard

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
````

---

## 핵심 설계 원칙 (불변)

1. **Cube 단일 계산 단위 유지**
   모든 내부 수량 계산은 Cube 기반으로 수행한다. Pallet은 표시/거래 단위일 뿐 내부 SoT가 아니다.

2. **Code Data System(CDS) 중심 구조 유지**
   데이터는 `id + signature + fields + codedata` 원칙을 따른다.
   문자열 하드코딩보다 codedata를 우선한다.

3. **서비스 레이어 순서 고정**
   `Regulation → Resource → Condition → Trade`
   이 순서를 역전하거나 UI에서 우회 구현하지 않는다.

4. **매칭 결과 단일 진실 소스 유지**
   검색/프리뷰/지도/리스트는 반드시 동일한 매칭 파이프라인 결과를 사용한다.
   컴포넌트별 shadow 계산 금지.

5. **Repository Pattern 유지**
   현재 localStorage 기반 repo는 향후 DB/API 구현으로 교체될 예정이므로,
   상위 레이어는 repo 인터페이스를 기준으로만 작업한다. direct mock import 금지.

6. **RegionCode 단일 소스 유지**
   지역 필터링/검색/매칭은 법정동 10자리 코드 기반으로만 수행한다.
   표시용 adapter 값은 로직에 사용하지 않는다.

---

## 시스템 2축 (불변)

### 1) Cube 거래 엔진

엔진은 다음 책임만 가진다.

* 박스 치수/중량 기반 Cube 계산
* STORAGE / ROUTE mode 분기
* billableCubes 계산
* storage/route 비용 계산

핵심 SoT 필드:

* `unitPricePerCube`
* `capacityCubes`
* `remainingCubes`
* `totalCubes`

핵심 함수:

* `computeDemand()`
* `calcBillableCubes()`
* `calcStorageEstimate()`
* `calcRouteEstimate()`

> 엔진은 순수 함수 계층이다. React import, localStorage 접근, UI 로직 포함 금지.

### 2) Code Data System (CDS)

CDS는 다음 네 요소로 구성된다.

* `id`
* `signature`
* `fields`
* `codedata`

핵심 codedata:

* `ItemCode`
* `WeightBand`
* `SizeBand`
* `FeatureCode`
* `RegionCode`

이벤트는 append-only 원칙을 따른다.
보정이 필요하면 기존 이벤트 수정이 아니라 **새 이벤트 추가**로 처리한다.

---

## 서비스 레이어 구조 (불변)

### Regulation

크기 / 중량 / 품목 / 최소물량 규정 필터

### Resource

`remainingCubes` 기반 자원 필터

### Condition

RegionCode 기반 조건 필터
(날짜는 현재 MVP에서 저장은 되지만 매칭에는 반영하지 않음)

### Trade

상품 선택 → 비용 계산 → 거래 확정 → 이벤트 기록

> 후속 개발에서도 이 4레이어는 하나의 파이프라인으로 유지해야 한다.

---

## 코드 컨벤션 (불변 - 유지)

### 폴더 및 책임 규칙

| 위치                    | 용도                         |
| --------------------- | -------------------------- |
| `components/common/`  | 공용 컴포넌트 (2곳 이상 사용, 도메인 무관) |
| `{feature}/ui/`       | Feature 내부 UI 컴포넌트         |
| `{feature}/sections/` | 화면 섹션 단위 구성                |
| `{feature}/hooks/`    | 상태/로직 훅                    |
| `{feature}/utils/`    | 변환/검증/보조 로직                |

**중요**: Feature 내부에 `components/` 폴더 생성 금지, 반드시 `ui/` 사용

### 컴포넌트 크기 가드레일

* 조립(컨테이너) 컴포넌트: 200줄 목표
* 단일 컴포넌트: 최대 300줄 초과 금지
* 300줄 초과 시 `sections/` 또는 `ui/`로 분리

### UI / 로직 / 계산 분리 원칙

* JSX 내부에서 계산/변환 로직 작성 금지
* 계산/변환은 `engine/` 또는 `utils/`에서 수행
* 상태 및 핸들러는 `hooks/`로 분리
* `engine/`에는 순수 함수만 허용 (React import 금지)

### 타입 정책

| 타입 종류        | 위치                             |
| ------------ | ------------------------------ |
| 도메인 타입       | `types/domain/`                |
| UI 타입        | `types/ui/`                    |
| 하위 호환 bridge | `types/models.ts`              |
| 엔진/레이어 타입    | `layers/types/` 또는 각 도메인 인접 위치 |

### 확장 대비 가드레일

**탭 섹션 비대화 방지**

* `sections/`의 탭 컴포넌트는 조립/분기 역할만 수행
* 내부 로직/폼/UI는 `ui/` 또는 더 작은 섹션으로 분리

**상태 훅 비대화 방지**

* 상태 훅은 단일 진실 소스 역할만 수행
* 계산/파생 로직은 `utils/` 또는 `engine/`으로 이동
* 상태가 커질 경우 slice 개념으로 분리 훅 추가 허용

**검증 로직 분산 금지**

* 입력/조건 검증 로직은 `utils/`의 validation 파일로 집중
* UI 컴포넌트에 검증 로직 분산 작성 금지

### 작업 청소 규칙

작업 종료 시 반드시 수행:

* 미사용 파일/컴포넌트 삭제
* 미사용 export 제거
* dead code 제거
* import 정리
 
---

## 현재 데이터 흐름 기준

현재 상품 거래 페이지의 데이터 흐름은 다음을 기준으로 유지한다.

```text
seed records
→ builders
→ repo(localStorage)
→ facade/mockData
→ UI / matching pipeline
```

설명:

* `records`는 seed 데이터
* `builders`는 seed를 UI DTO로 변환
* `repo`는 현재 localStorage 기반 SoT
* `mockData.ts`는 facade 역할만 수행
* 실제 검색/거래/차감은 repo 기준으로 동작해야 한다

향후 DB 연결 시:

* `records` / `mockData facade`는 제거 가능
* `repo` 구현만 API/DB로 교체
* `engine`, `layers`, `components`는 최대한 유지

> 즉, 현재 구조는 DB 이전 단계의 완충 구조이며, 상위 계층은 repo 인터페이스에 의존해야 한다.

---

## 상품 거래 페이지 현재 정책

### 현재 활성

* 보관 상품
* 운송 상품
* 화물 등록
* 매칭 검색
* 상품 상세
* 거래 시작/확정
* 지도 marker 연동

### 정책적으로 보류

* 보관+운송 연계 상품(BOTH 실서비스)
* 날짜 필터 실매칭 반영
* 정렬 고도화
* 실제 결제/정산 확정
* 백엔드/실시간 데이터

> 보류 기능은 TODO가 아니라 **정책 잠금 상태**로 취급한다.

---

## 프로젝트 구조 (현재 기준 요약)

```text
src/
├── engine/                    # Cube 거래 엔진, pricing 순수 함수
├── infra/
│   ├── dataspec/             # codedata / id / signature / fields
│   └── storage/              # repo / eventLog (localStorage 기반)
├── layers/                   # regulation / resource / condition / trade 흐름
├── data/mock/                # records / builders / adapters / facade
├── types/                    # domain / ui 중심 타입
├── contexts/                 # SearchResultContext
├── components/
│   ├── Layout/
│   ├── Features/ServiceConsole/
│   ├── Features/Map/
│   └── Visualizations/
└── hooks/
```

핵심 원칙:

* `engine/` = 순수 계산
* `infra/dataspec/` = 코드와 데이터 정의
* `infra/storage/` = 영속성 추상화
* `layers/` = 정책/파이프라인
* `components/` = UI
* `types/` = 타입 정의
* `data/mock/` = DB 전 단계 seed/facade

---

## 다음 개발 단계 (우선순위)

### 1. 상품 등록 페이지

* StorageProduct / RouteProduct 생성 폼
* 공급자 상품 CRUD
* 규정/자원/정산 필드 입력 UI
* offer.repo CRUD 활용

### 2. 공급자 데이터 등록/관리

* provider.repo CRUD 보강
* 공급자 대시보드
* 상품 상태 관리

### 3. 거래 생성 고도화

* Deal 상태 흐름 정교화
* 옵션 요금 체계 정리
* 거래 목록/이력 UI

### 4. 정산 엔진 고도화

* billable cubes 정책 정교화
* 정산서/영수증
* 실제 정산 이벤트 설계

### 5. 백엔드 연결

* `infra/storage/` 구현부만 API/DB로 교체
* 상위 구조(engine/layers/components)는 최대한 유지

---

## 절대 깨지면 안 되는 것

1. `unitPricePerCube`를 가격 SoT로 유지
2. `remainingCubes`를 자원 SoT로 유지
3. Cube 계산을 engine 외부에서 재구현하지 않기
4. RegionCode 외의 표시용 id를 필터링 로직에 사용하지 않기
5. direct mock import로 검색/거래 흐름 우회하지 않기
6. `runMatchingPipeline()` 외의 별도 검색 진실 소스 만들지 않기
7. UI에서 규정/자원 판정을 임의로 재구현하지 않기
8. 이벤트 로그를 수정형으로 바꾸지 않기

---

## 문서 역할

이 문서는 **현재 상품 거래 페이지 구조를 기준으로 이후 개발 전반의 참조 기준**이다.
세부 분석은 상품 거래 페이지 최종 전수조사 보고서를 참조하고,
이 문서는 그 보고서의 **요약 / 지침서 버전**으로 유지한다.
