# INTEGRAL

제주 물류 공유 플랫폼 - 공간과 경로를 상품화하는 공유 물류 서비스

## 기술 스택

- Vite + React + TypeScript
- Tailwind CSS
- Mapbox GL JS (지도)
- 폰트: Pretendard, Inter, JetBrains Mono

## 환경변수

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

## 프로젝트 구조

```
src/
├── components/
│   ├── Layout/
│   │   ├── CommandHeader.tsx    # 헤더 (로고/타이틀/LIVE)
│   │   ├── CommandLayout.tsx    # 전체 레이아웃
│   │   ├── LeftConsole.tsx      # 좌측 (인기상품/현황)
│   │   └── RightConsole.tsx     # 우측 (서비스 버튼)
│   └── Map/
│       ├── MapboxContainer.tsx  # Mapbox 지도
│       └── MainlandMinimap.tsx  # 육지 미니맵
└── styles/
    └── fonts.css                # 폰트 설정
```

## 완료된 작업

### PR1: 초기 설정
- Vite + React + TypeScript 구축
- Tailwind CSS 설정
- 기본 레이아웃

### PR2-2: UI 개편 + Mapbox 도입
- 관제 센터 스타일 다크 테마
- 3칸 레이아웃 (좌측콘솔 | 지도 | 우측콘솔)
- Mapbox GL JS (Kakao Maps 대체)
- 파렛트 아이콘 마커 (크기 비례, 주황색)
- 3레이어 입체 곡선 화살표
- LIVE 실시간 표시 + 펄스 애니메이션
- 육지 미니맵 (인천/목포/부산)

## 디자인 시스템

### 색상
- 배경: slate-900/800 그라데이션
- 공간 상품: orange-500
- 도내 경로: blue-600 (실선)
- 입도: emerald-500 (점선)
- 출도: purple-500 (점선)

### 버튼
- 보관하기: blue 그라데이션
- 운송하기: emerald 그라데이션

## 다음 작업

### PR2-3 예정: 다크 테마 + 야광 효과
- 우주 배경 + 별 효과
- 투명 헤더 (로고/LIVE만 선 구분)
- 지도 위 글로우 타이틀
- 아이소메트릭 3D 파렛트 마커
- 야광 곡선 화살표
- 위젯 리디자인
- 보유 현황 막대 그래프

---

**작성일**: 2025.01.14
**최종 수정**: 2025.01.17 (PR2-2 반영)
