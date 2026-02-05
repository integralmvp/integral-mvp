# 디자인 시안 2: White Neon Green Cyberpunk Theme

> **브랜치**: `claude/white-cyberpunk-ui-tJDUi`
> **작성일**: 2026-02-05
> **테마**: 화이트 사이버펑크 HUD - 밝은 배경 + 네온 그린 포인트

---

## 1. 디자인 컨셉 개요

### 핵심 컨셉
**"White Cyberpunk HUD - 밝은 관제 시스템"**

- **베이스**: 화이트/아주 연한 쿨 그레이 배경
- **포인트**: 진하고 차분한 네온 그린 (#10b981)
- **스타일**: 각진 프레임, HUD 인터페이스
- **무드**: 깨끗하고 미래지향적이면서도 가독성 높은 UI

### 디자인 목표
1. **직관성 향상**: 화이트 배경으로 정보 가독성 극대화
2. **차별화**: 사이버펑크 프레임으로 독특한 브랜드 아이덴티티
3. **눈의 피로 최소화**: 과도한 어두운 배경이나 쨍한 색상 지양
4. **관제 시스템 감성**: HUD 스타일로 전문성과 신뢰감 전달

---

## 2. 컬러 팔레트

### 주요 컬러

| 용도 | 컬러 코드 | 변수명 | 설명 |
|------|----------|--------|------|
| **네온 그린** | `#10b981` | `neonGreen` | 메인 포인트 컬러 (emerald-500) |
| 네온 그린 밝음 | `#34d399` | `neonGreen-light` | 호버/강조 (emerald-400) |
| 네온 그린 어두움 | `#059669` | `neonGreen-dark` | 버튼 그라데이션 (emerald-600) |
| 네온 그린 글로우 | `#6ee7b7` | `neonGreen-glow` | 글로우 효과용 (emerald-300) |

### 배경 컬러

| 용도 | 컬러 코드 | 변수명 | 설명 |
|------|----------|--------|------|
| 화이트 배경 | `#ffffff` | `cyber-bg` | 기본 배경 |
| 연한 그레이 | `#f8fafc` | `cyber-bgAlt` | 보조 배경 (slate-50) |
| 패널 배경 | `rgba(255,255,255,0.85)` | `cyber-panel` | 반투명 화이트 |

### 보더 컬러

| 용도 | 컬러 코드 | 변수명 | 설명 |
|------|----------|--------|------|
| 기본 보더 | `#e2e8f0` | `cyber-border` | 일반 구분선 (slate-200) |
| 강조 보더 | `#10b981` | `cyber-borderAccent` | 네온 그린 보더 |

### 텍스트 컬러

| 용도 | 컬러 코드 | 변수명 | 설명 |
|------|----------|--------|------|
| 메인 텍스트 | `#0f172a` | `cyber-text` | 짙은 텍스트 (slate-900) |
| 보조 텍스트 | `#64748b` | `cyber-textAlt` | 중간 톤 (slate-500) |

---

## 3. 타이포그래피

### 폰트 패밀리

| 용도 | 폰트 | 변수명 | 적용 영역 |
|------|------|--------|----------|
| **사이버 폰트** | **Orbitron** | `--font-cyber` | **로고 "CUBE"** |
| 기본 폰트 | Pretendard | `--font-primary` | 본문, UI 텍스트 |
| 숫자 폰트 | Inter | `--font-number` | 통계, 건수 |
| 모노스페이스 | JetBrains Mono | `--font-mono` | 시각, 코드 |

### 폰트 사용 규칙
- **로고 영역**: Orbitron (사이버틱 감성)
- **본문/UI**: Pretendard (가독성 우선)
- **시각 표시**: JetBrains Mono (모노스페이스)
- **숫자 카운터**: Inter (명확한 가독성)

---

## 4. 프레임 디자인

### 사이버펑크 프레임 요소

#### 4.1 메인 패널 (ServiceConsole)
- **보더**: 2px solid 네온 그린
- **배경**: 반투명 화이트 (0.85 opacity)
- **블러**: backdrop-filter blur(8px)
- **코너 장식**: 좌상단/우하단 각진 네온 그린 라인 (40px)
- **그림자**: 네온 그린 글로우 (0 0 10px rgba(16,185,129,0.3))

#### 4.2 헤더 위젯 (HeaderWidget)
- **프레임**: cyber-frame 클래스 적용
- **보더**: 2px solid 네온 그린
- **배경**: 반투명 화이트
- **코너**: clip-path로 각진 형태 (8px 절개)
- **그림자**: 네온 그린 글로우

#### 4.3 미니맵
- **프레임**: cyber-frame 클래스 적용
- **보더**: 2px solid 네온 그린
- **배경**: 반투명 화이트
- **크기**: 200px × 170px

#### 4.4 검색 버튼
- **프레임**: cyber-button 클래스 적용
- **코너**: clip-path로 각진 형태 (4px 절개)
- **배경**: 네온 그린 그라데이션
- **그림자**: 네온 그린 글로우

### CSS 클래스

```css
/* 메인 패널 프레임 */
.cyber-panel {
  border: 2px solid var(--color-border-accent);
  background: var(--color-panel-bg);
  backdrop-filter: blur(8px);
  position: relative;
}

/* 코너 장식 - 좌상단 */
.cyber-panel::before {
  border-top: 4px solid var(--color-neon-green);
  border-left: 4px solid var(--color-neon-green);
  width: 40px;
  height: 40px;
}

/* 코너 장식 - 우하단 */
.cyber-panel::after {
  border-bottom: 4px solid var(--color-neon-green);
  border-right: 4px solid var(--color-neon-green);
  width: 40px;
  height: 40px;
}

/* 각진 프레임 */
.cyber-frame {
  border: 1px solid var(--color-border-accent);
  clip-path: polygon(
    0 8px, 8px 0, 100% 0,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    0 100%
  );
}

/* 사이버 버튼 */
.cyber-button {
  clip-path: polygon(
    0 4px, 4px 0, 100% 0,
    100% calc(100% - 4px),
    calc(100% - 4px) 100%,
    0 100%
  );
}
```

---

## 5. 지도 스타일

### Mapbox 스타일
- **스타일 ID**: `mapbox://styles/integralv0/cml9csjxt002l01sz7enl8s0n`
- **특징**:
  - 바다/배경: 화이트 베이스
  - 육지: 매우 연한 중립 그레이
  - 해안선: 네온 그린 계열 강조 라인
  - 전체적으로 밝은 HUD 배경 역할

### 지도 요소 유지
- 기존 마커/레이어/라인은 그대로 유지
- 프리뷰/하이라이트 마커 동작 동일
- 물방울 마커 (가능 상품 표시) 유지

---

## 6. UI 컴포넌트 스타일

### 6.1 로고 영역 (CommandLayout)
- **텍스트**: "CUBE"
- **폰트**: Orbitron, 900 weight
- **컬러**: 네온 그린 (#10b981)
- **효과**: text-shadow 네온 글로우
- **크기**: 3xl (1.875rem)

### 6.2 서비스 콘솔 타이틀
- **보더**: 하단 2px 네온 그린
- **텍스트**: cyber-text (slate-900)
- **배경**: 투명

### 6.3 탭 버튼
- **활성**: 네온 그린 텍스트 + 하단 2px 네온 그린 보더
- **비활성**: cyber-textAlt (slate-500)
- **호버**: cyber-text (slate-900)

### 6.4 검색 버튼
- **배경**: 네온 그린 그라데이션
- **텍스트**: 화이트
- **프레임**: cyber-button (각진 코너)
- **효과**: 네온 그린 글로우
- **호버**: 그라데이션 반전

### 6.5 헤더 위젯
- **구조**: 모니터링 문구 | 시각 | 범례
- **시각 표시**: 네온 그린, 볼드, JetBrains Mono
- **구분선**: 네온 그린
- **프레임**: cyber-frame

---

## 7. 기술 구현

### 변경된 파일 목록

#### 스타일 관련
1. `tailwind.config.js` - 컬러 팔레트 추가
2. `src/index.css` - CSS 변수 + 사이버 프레임 스타일
3. `src/styles/fonts.css` - Orbitron 폰트 추가

#### 컴포넌트
4. `src/components/Map/MapboxContainer/hooks/useMapbox.ts` - Mapbox 스타일 URL
5. `src/components/Layout/ServiceConsole/ServiceConsole.tsx` - 메인 패널 스타일
6. `src/components/Layout/CommandLayout.tsx` - 로고 폰트/컬러
7. `src/components/Map/MapboxContainer/ui/HeaderWidget.tsx` - 헤더 위젯 프레임
8. `src/components/Map/MapboxContainer/MapboxContainer.tsx` - 미니맵 프레임

### 미변경 영역
- **레이아웃 구조**: Grid 45%/55% 유지
- **DOM 구조**: 컴포넌트 트리 동일
- **기능 로직**: 검색/매칭/하이라이트 동작 동일
- **UX 흐름**: 사용자 인터랙션 동일

---

## 8. 디자인 원칙

### 가독성 우선
- 화이트 배경으로 텍스트 가독성 극대화
- 충분한 대비율 (WCAG 기준 준수)
- 과도한 장식 금지

### 일관성 유지
- 모든 패널/위젯에 동일한 네온 그린 보더
- 통일된 프레임 스타일 (cyber-frame)
- 일관된 글로우 효과

### 기능성 보존
- 디자인은 시각적 요소만 변경
- 모든 기능은 기존과 동일하게 작동
- 사용자 경험 흐름 유지

---

## 9. 사용 사례

### 적용 시나리오
- **투자자 시연**: 전문적이고 미래지향적인 이미지
- **밝은 환경**: 화이트 배경으로 가시성 우수
- **다양한 연령층**: 가독성 높아 접근성 향상

### 차별화 포인트
- 일반적인 다크모드 물류 플랫폼과 차별화
- 사이버펑크 감성 + 깨끗한 화이트 UI 조화
- 네온 그린 포인트로 브랜드 정체성 강화

---

## 10. 향후 확장 가능성

### 추가 고려사항
- 다크모드 토글 (필요 시)
- 네온 그린 강도 조절 옵션
- 프레임 스타일 변형 (다양한 각진 형태)
- 애니메이션 효과 추가 (글로우 펄스 등)

### 반응형 디자인
- 현재 데스크톱 기준 최적화
- 모바일/태블릿 대응 시 프레임 단순화 고려

---

## 11. 참고 이미지

첨부된 두 장의 이미지:
1. **황금/골드 사이버 프레임** - 각진 형태, 코너 장식 참고
2. **다양한 HUD 프레임** - 절개 패턴, 라인 스타일 참고

이미지의 골드/황금색을 네온 그린으로 치환하여 적용

---

## 12. 체크리스트

### 구현 완료 항목
- [x] Mapbox 스타일 변경
- [x] Tailwind 컬러 팔레트 추가
- [x] CSS 변수 정의
- [x] 사이버 프레임 CSS 클래스 추가
- [x] ServiceConsole 메인 패널 스타일
- [x] 로고 영역 Orbitron 폰트 적용
- [x] 탭 버튼 네온 그린 컬러
- [x] 검색 버튼 사이버 프레임
- [x] 헤더 위젯 프레임 스타일
- [x] 미니맵 프레임 스타일

### 테스트 항목
- [ ] 화면 렌더링 확인
- [ ] 탭 전환 동작 확인
- [ ] 검색 버튼 동작 확인
- [ ] 지도 하이라이트 동작 확인
- [ ] 반응형 레이아웃 확인

---

**문서 버전**: 1.0
**최종 수정**: 2026-02-05
