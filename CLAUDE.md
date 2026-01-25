# INTEGRAL MVP - 개발 가이드

## 프로젝트 개요

- **프로젝트명**: INTEGRAL
- **목적**: 제주 물류 공유 플랫폼 - 공간과 경로를 상품화하는 공유 물류 서비스
- **버전**: MVP v3.0 (설득용 시연 목적)

> **핵심**: 투자자/이해관계자에게 3-5분 내 서비스 가치를 전달하는 프로토타입
> 백엔드/데이터베이스 없음, 모든 데이터는 mockData 기반

---

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **스타일링**: Tailwind CSS
- **지도**: Mapbox GL JS (light-v11)
- **폰트**: Pretendard (메인), Inter (숫자)

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

---

## 핵심 설계 원칙

1. **직관성 우선** - 별도 설명 없이 화면만으로 서비스 이해 가능
2. **지도 중심 UI** - 모든 가치는 지도에서 시각적으로 전달
3. **싱글 페이지 구조** - 별도 라우팅 없이 모달로 모든 정보 접근
4. **더미 데이터 기반** - 백엔드 없음, 모든 데이터는 mockData에서 관리
5. **룰 기반 로직** - 복잡한 알고리즘 대신 단순 조건문 기반

---

## 통합 엔진 설계 (불변 규칙)

### Cube 단일 내부 계산 단위

```
┌─────────────────────────────────────────────────────────┐
│  Cube = 250×250×250mm (0.015625 m³)                    │
│  - 모든 내부 계산의 유일한 단위                          │
│  - Pallet은 검색/매칭 기준에 사용하지 않음               │
└─────────────────────────────────────────────────────────┘
```

### 환산 비율

| 관계 | 비율 |
|------|------|
| 1 Pallet = N Cubes | **cubesPerPallet = 128** |
| 1 Pallet 바닥면적 | 1.21 m² (1.1m × 1.1m) |
| 1 Pallet 체적 | 2.178 m³ (1.1 × 1.1 × 1.8m) |

### 거래 단위

| 서비스 | 거래 단위 | 내부 계산 단위 |
|--------|----------|---------------|
| 보관 (Storage) | **Pallet** | Cube |
| 운송 (Route) | **Cube** | Cube |

### 면적↔파레트 환산 (운영계수 보정)

```typescript
// Storage 전용: 운영계수 = 1.30 (동선/여유/벽면 고려)

// 파레트 → 면적
requiredAreaM2 = pallets × 1.21 × 1.30

// 면적 → 파레트 (역보정)
effectiveAreaM2 = inputAreaM2 / 1.30
pallets = floor(effectiveAreaM2 / 1.21)
```

### 포장 모듈의 역할

```
┌─────────────────────────────────────────────────────────┐
│  포장 모듈 = "형상 검증 + 표준 분류" (계산 중심 아님)     │
│  - 소형(8분할): 550×275mm                               │
│  - 중형(6분할): 550×366mm                               │
│  - 대형(4분할): 650×450mm                               │
│  - 분류 버퍼: ±10mm (절대값), 90도 회전 허용            │
└─────────────────────────────────────────────────────────┘
```

### UNCLASSIFIED Fallback 규칙

- 어떤 표준 모듈에도 맞지 않는 박스 → `UNCLASSIFIED`
- 체적 기반 큐브 계산은 정상 수행
- UI에 경고 표시 (비표준 규격 안내)

### 핵심 제약 (매칭)

```typescript
// 모든 매칭의 필수 조건
offer.remainingCubes >= demandCubes
```

---

## Phase 작업 경계

### Phase 1-3: 완료 (PR3-2)

| Phase | 작업 내용 | 상태 |
|-------|----------|------|
| Phase 1 | Cube 설정, 형상 분류기, 큐브 계산 엔진 | ✅ 완료 |
| Phase 2 | 단위 변환 유틸리티 (cubesToPallets 등) | ✅ 완료 |
| Phase 3 | 운영계수 보정 환산 (palletsToAreaM2 등) | ✅ 완료 |
| Phase 4 | 매칭 타입 정의 + 함수 스텁 준비 | ✅ 완료 |

### PR4: 검색 매칭 구현 (예정)

| 작업 | 설명 |
|------|------|
| 필터링 로직 | filterStorageOffers, filterRouteOffers 구현 |
| 검증 로직 | validateStorageMatch, validateRouteMatch 구현 |
| 점수 계산 | scoreStorageMatch, scoreRouteMatch 구현 |
| 비용 계산 | estimateStorageCost, estimateRouteCost 구현 |
| 검색 함수 | searchStorageOffers, searchRouteOffers 구현 |
| 지도 연동 | 매칭 결과 지도 하이라이트 |
| UI 연결 | 상품 카드 리스트, 거래 모달 연결 |

---

## 프로젝트 구조

```
src/
├── engine/                    # 플랫폼 통합 엔진
│   ├── cubeConfig.ts         # Cube/Pallet 설정
│   ├── shapeClassifier.ts    # 형상 분류기
│   ├── cubeEngine.ts         # 큐브 수요 계산
│   ├── unitConvert.ts        # 단위 변환 유틸리티
│   ├── matchingTypes.ts      # 매칭 타입 정의 (Phase 4)
│   ├── matchingEngine.ts     # 매칭 함수 스텁 (Phase 4)
│   └── index.ts              # 통합 export
├── components/
│   ├── Layout/               # 레이아웃 (CommandLayout, ServiceConsole)
│   ├── Map/                  # 지도 (MapboxContainer)
│   ├── visualizations/       # 시각화 (CubeIcon3D, PalletIcon3D 등)
│   ├── common/               # 공통 컴포넌트
│   ├── deal/                 # 거래 모달
│   ├── routes/               # 경로 카드
│   └── storages/             # 공간 카드
├── types/
│   └── models.ts             # 데이터 모델 타입
└── data/
    └── mockData.ts           # 더미 데이터
```

---

## 제약사항

### 절대 구현하지 말 것
- 로그인/회원가입 시스템
- 실제 결제 시스템
- 백엔드 서버 / 데이터베이스
- 별도 페이지 라우팅
- 실시간 데이터 연동
- 실제 거래 실행

### 허용되는 범위
- 더미 데이터 기반 모든 UI
- 모달 기반 상세 페이지
- 룰 기반 규정 매칭
- 더미 비용 계산
- 성공 토스트 피드백

---

## 디자인 시스템 (간략)

| 요소 | 색상/스타일 |
|------|------------|
| 지도 배경 | Mapbox light-v11 |
| 공간 상품 마커 | #ff6b35 (주황색) |
| 도내 경로 | #3b82f6 (파란색, 실선) |
| 입도 경로 | #10b981 (녹색, 점선) |
| 출도 경로 | #a855f7 (보라색, 점선) |
| 보관 버튼 | blue-500 그라데이션 |
| 운송 버튼 | emerald-500 그라데이션 |
| 보관+운송 버튼 | purple-500 그라데이션 |

---

## PR 로드맵

| PR | 내용 | 상태 |
|----|------|------|
| PR1 | 프로젝트 초기 설정 | ✅ 완료 |
| PR2-4 | UI 전면 개편 | ✅ 완료 |
| PR3-2 | 통합 엔진 + 수요면적 UX | ✅ 완료 |
| PR4 | 검색 매칭 + 지도 연동 | 📋 예정 |
| PR5 | 거래 모달 + 규정 매칭 | 📋 예정 |
| PR6 | 마무리 + 최적화 | 📋 예정 |

---

**최종 수정**: 2025.01.25 (PR3-2 통합 엔진 완료)
