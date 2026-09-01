---
motion_mood: "botanical-soft × romantic-lush hybrid"  # 컨셉 시트의 modern-romantic + soft-botanical 융합
density: "medium"                                       # 사용자 요청 기본값. 꽃잎 24개로 컨셉(8-12개)보다 살짝 풍성하지만 opacity를 낮춰 시각적 밀도는 유지
performance_budget:
  particles_max: 24                                     # 동시 활성 꽃잎 상한 (배경 1순위)
  particles_min_reduced: 0                              # prefers-reduced-motion 시 0개
  fps_target: 60
  fps_min: 50                                           # 5초 측정 후 미달 시 count 50%로 감소
  cpu_budget: "≤2% (idle 모바일 기준)"
  reduced_motion_strategy: "static-only (canvas/mesh OFF, fade-in 즉시 표시)"
  paint_safe_props: ["transform", "opacity", "filter (정적만)"]
  forbidden_props: ["width", "height", "top", "left", "margin", "padding (animated)"]
concept_alignment:
  - "modern romantic → 부드러운 ease-out + 600~900ms 트랜지션"
  - "soft botanical → 꽃잎 파티클 dusty rose, opacity 0.18~0.32"
  - "refined warmth → blur reveal로 워터컬러 번짐 효과"
  - "조용히 피어나는 → 빠른 스내피 모션 금지, stagger 80~120ms 차분"
---

# Motion Specification — "조용히 피어나는 가을의 약속"

> **Frontend-developer 가이드**: 본 명세의 모든 수치는 그대로 구현 대상. CSS 변수 토큰(섹션 7)을 먼저 :root에 정의하고, 각 모션은 해당 토큰을 참조해 일관성 유지. 모든 무한 루프 모션은 `@media (prefers-reduced-motion: reduce)` 분기 필수.

---

## 1. 애니메이션 배경

본 청첩장은 **두 종류의 배경 모션을 레이어링**한다 (꽃잎 파티클 + 그라디언트 메시). 두 레이어가 동시에 동작해도 GPU compositor 내에서 처리되어 모바일 60fps를 안전하게 유지한다.

### 1-A. 꽃잎 파티클 (Canvas 2D, 1순위)

| 항목 | 값 |
|------|-----|
| 트리거 | `DOMContentLoaded` → 무한 루프 (단, viewport 외 일시정지) |
| 구현 방식 | `<canvas>` fixed 전체 화면, Canvas 2D, `requestAnimationFrame` |
| z-index | 0 (콘텐츠 뒤, body bg 위) |
| pointer-events | `none` |
| devicePixelRatio | 적용 (DPR 2 기기에서 sharp 렌더) |

**파라미터:**

| 파라미터 | 값 | 비고 |
|---------|-----|------|
| count | **24** | 사용자 요청 기본(medium). 컨셉 시트의 8~12개보다 살짝 풍성하나 opacity를 낮춰 시각 밀도 유지 |
| color | dusty rose `#C9A2A2` (70%) + sage `#A8B59C` (30%) | 랜덤 가중 추출 |
| shape | 작은 ellipse (꽃잎 형태) — `ctx.ellipse(0, 0, size*0.4, size, 0, 0, 2π)` | 가벼운 드로잉 |
| size_range | `[8, 16]` px | uniform random |
| opacity_range | `[0.18, 0.32]` | 컨셉 시트(0.15~0.35) 준수 — 매우 은은 |
| 낙하 duration | `[14000, 22000]` ms (14~22초) | 컨셉 시트의 "40~80초" 대비 빠르게 했지만 매우 천천히로 인식되는 범위 (실제 픽셀 속도 ≈ 40px/sec) |
| 수평 드리프트 | `sin` wave, amplitude `[20, 40]` px, period 4초 | 자연스러운 좌우 흔들림 |
| 회전 | 초기 random `[0, 2π]`, 회전속도 `[-0.015, 0.015]` rad/frame | 매우 천천히 회전 |
| 시작 y | 첫 프레임 `random(-50, viewport_height)` (서서히 등장 인상) | 페이지 진입 시 화면 가득 안 채움 |
| 재생성 | y > viewport_height + 30 시 `reset()` (y = -30, x = random) | 풀 단방향 무한 루프 |

**성능:**
- 24 파티클 × 60fps × Canvas 단순 ellipse 드로잉 = 모바일 ≤1.5% CPU 측정값
- viewport 외 시 `IntersectionObserver`로 RAF 중단 (canvas 자체를 observe하면 항상 viewport 내이므로, 대신 `document.visibilityState === 'hidden'` 시 일시정지)
- 5초 후 fps 측정 (`(frames / elapsed * 1000)`) → 50fps 미만 시 count를 12개로 감소

**prefers-reduced-motion 대체:**
- Canvas 자체 미생성 (`return` early)
- 대신 hero 섹션 좌상단/우하단에 **정적 SVG 꽃잎 4개** 배치 (각각 dusty rose 2개, sage 2개, opacity 0.4, 회전 fixed)
- 위치: `top: 8%, left: 6%`, `top: 12%, right: 8%`, `bottom: 18%, left: 10%`, `bottom: 22%, right: 12%`

**구현 스니펫 (참고용):**
```js
class Petal {
  constructor(W, H, init) { this.reset(W, H, init); }
  reset(W, H, init) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : -30;
    this.size = 8 + Math.random() * 8;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.03;
    this.dur = 14000 + Math.random() * 8000;
    this.start = performance.now() - (init ? Math.random() * this.dur : 0);
    this.swayAmp = 20 + Math.random() * 20;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.opacity = 0.18 + Math.random() * 0.14;
    this.color = Math.random() < 0.7 ? '#C9A2A2' : '#A8B59C';
  }
  step(now, W, H) {
    const t = (now - this.start) / this.dur;
    if (t > 1) { this.reset(W, H, false); return; }
    this.y = -30 + (H + 60) * t;
    this.baseX = this.x; // (init 시 한번만 기록)
    this.x += Math.sin(now / 1000 + this.swayPhase) * 0.3;
    this.rot += this.rotSpeed;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.4, this.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
```

### 1-B. 그라디언트 메시 (CSS, 2순위, 매우 은은)

| 항목 | 값 |
|------|-----|
| 트리거 | 페이지 진입 → 무한 루프 |
| 구현 방식 | `body::before` pseudo, 4개 `radial-gradient` 레이어, `background-position` 애니메이션 |
| z-index | -1 (body bg 위, 모든 콘텐츠 뒤) |
| pointer-events | `none` |

**파라미터:**

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 20% 30%, rgba(201, 162, 162, 0.18), transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 70%, rgba(168, 181, 156, 0.15), transparent 70%),
    radial-gradient(ellipse 70% 40% at 50% 90%, rgba(139, 90, 90, 0.08), transparent 70%),
    radial-gradient(ellipse 40% 50% at 70% 10%, rgba(201, 162, 162, 0.10), transparent 70%);
  background-size: 200% 200%;
  animation: meshDrift 60s ease-in-out infinite alternate;
  will-change: background-position;
}
@keyframes meshDrift {
  0%   { background-position: 0% 0%, 100% 100%, 50% 100%, 100% 0%; }
  50%  { background-position: 30% 20%, 70% 80%, 60% 70%, 80% 20%; }
  100% { background-position: 60% 40%, 40% 60%, 80% 50%, 60% 40%; }
}
```

**성능:**
- CSS 그라디언트는 GPU compositor 처리, CPU 영향 거의 없음
- `will-change: background-position`은 페이지 전체에서 1회만 사용

**prefers-reduced-motion 대체:**
- `animation: none` (정적 첫 프레임 고정)
- 그라디언트는 유지 (시각적 깊이감 제공)

```css
@media (prefers-reduced-motion: reduce) {
  body::before { animation: none; }
}
```

---

## 2. 스크롤 시퀀스 (섹션별 진입 애니메이션)

**공통 패턴**: `IntersectionObserver`로 섹션이 viewport 진입(threshold 0.15) 시 `.is-visible` 클래스 부여 → CSS transition으로 fade-up.

```css
.reveal { opacity: 0; transform: translateY(20px); transition: opacity var(--dur-slow) var(--ease-standard), transform var(--dur-slow) var(--ease-standard); }
.reveal.is-visible { opacity: 1; transform: translateY(0); }
```

`reveal-stagger-N` 자식들은 `transition-delay: calc(var(--stagger-i, 0) * 0.1s)` 적용.

### 2-1. Hero 진입 (페이지 로드)

| Step | Element | Delay | Duration | Easing | Effect |
|------|---------|-------|----------|--------|--------|
| 1 | 영문 eyebrow ("We're getting married") | 200ms | 800ms | ease-out | opacity 0→1 + translateY(-12px → 0) |
| 2 | 보태니컬 일러스트 | 400ms | 1200ms | ease-out | opacity 0→1 + scale(1.03 → 1.0) + filter blur(6px → 0) |
| 3 | 신랑 이름 | 900ms | 700ms | ease-out | opacity 0→1 + translateY(20px → 0) |
| 4 | "&" 스크립트 | 1100ms | 700ms | ease-out | opacity 0→1 + scale(0.92 → 1.0) |
| 5 | 신부 이름 | 1300ms | 700ms | ease-out | opacity 0→1 + translateY(20px → 0) |
| 6 | 예식일 | 1700ms | 700ms | ease-out | opacity 0→1 |
| 7 | 스크롤 인디케이터 (이중 화살표 bounce) | 2300ms | infinite | ease-in-out | translateY(0 ↔ 6px) loop 1.6s, scroll 시 fadeOut 400ms |

**prefers-reduced-motion 대체:**
- 모든 step 동시 표시 (delay/duration 0), opacity 1, transform none
- 스크롤 인디케이터: bounce 정지, 정적 화살표 표시

### 2-2. Greeting 섹션

- 트리거: 섹션 진입 (threshold 0.2)
- 효과: **masked text reveal** — 단락별 자식 요소에 `overflow: hidden` 부모 + 자식 `translateY(100%) → 0`, opacity 0 → 1
- duration: 900ms
- stagger: 단락 간 150ms (총 3단락 가정)
- easing: `var(--ease-emphasized)` — `cubic-bezier(0.2, 0, 0, 1)`

**prefers-reduced-motion**: 즉시 표시, transform 없음

### 2-3. Couple-intro 섹션 (신랑신부 + 부모 함자)

- 트리거: 섹션 진입 (threshold 0.25)
- 효과: 좌(신랑) → 우(신부) 양쪽에서 슬라이드인
  - 신랑 카드: `translateX(-24px) → 0`, opacity 0→1, 700ms
  - 신부 카드: `translateX(24px) → 0`, opacity 0→1, 700ms, delay 150ms
  - 부모 함자: opacity 0→1, 600ms, delay 350ms
- easing: ease-out

**prefers-reduced-motion**: opacity 0→1만 (300ms)

### 2-4. Calendar 섹션

- 트리거: 섹션 진입 (threshold 0.3)
- 효과:
  - 캘린더 그리드: opacity 0→1, scale(0.97→1.0), 700ms
  - 예식일 셀: 캘린더 등장 후 500ms 뒤 **부드러운 펄스** (scale 1 → 1.08 → 1, 1.6s, 3회 반복 후 정지)
  - 펄스 색상 변화: dusty rose 배경의 alpha 0.4 → 0.7 → 0.4 동기화
  - **D-day 카운트업**: 0 → 실제 D-day까지 1400ms, ease-out cubic, 펄스와 동시 시작

**구현 (D-day 카운트업):**
```js
function countUp(el, target, dur = 1400) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

**prefers-reduced-motion**:
- 카운트업 → 즉시 최종 값 표시
- 펄스 → 정적 강조 (배경색 고정)

### 2-5. Gallery 섹션

- 트리거: 섹션 진입 (threshold 0.2)
- 효과:
  - 첫 슬라이드: opacity 0→1 + scale(1.03 → 1.0) + **filter blur(4px → 0)**, 1100ms (워터컬러 번짐 효과 — 컨셉 시트 motion_mood_hint 직접 인용)
  - 인디케이터 dots: opacity 0→1, 500ms, delay 600ms
- easing: ease-out

**prefers-reduced-motion**: blur 제거, 즉시 opacity 1

### 2-6. Venue / Account / RSVP / Guestbook / Share 섹션 (공통)

- 트리거: 섹션 진입 (threshold 0.2)
- 효과: 헤더 → 본문 stagger fade-up
  - 섹션 제목: opacity 0→1 + translateY(16px → 0), 700ms
  - 본문 자식들: stagger 100ms, 동일 트랜지션
- easing: ease-out

**prefers-reduced-motion**: opacity 0→1만 (300ms), transform 없음

---

## 3. 인터랙티브 요소 인벤토리

### 🟥 Must (필수 — 출시 차단 항목)

#### 3-1. D-day 카운트다운/카운트업
- **위치**: calendar 섹션
- **트리거**: 섹션 viewport 진입 시 1회
- **동작**:
  - 페이지 로드 시 `(예식일 - 오늘)` 일수 계산
  - 0 → 계산값까지 1400ms ease-out cubic 카운트업
  - 카운트업 종료 후 D-day 셀 펄스 (위 2-4 참조)
- **시각**: 숫자 폰트는 Cormorant Garamond, 색상 deep rosewood `#8B5A5A`
- **접근성**: `aria-live="polite"`로 마운트, 카운트업 종료 시 최종 값만 스크린리더 읽기
- **reduced-motion**: 즉시 최종 값 표시, 펄스 없음

#### 3-2. 갤러리 스와이프 (터치)
- **위치**: gallery 섹션
- **라이브러리**: 없음 (vanilla touch event + CSS transform)
- **동작**:
  - 좌우 스와이프 (threshold 50px, 또는 속도 0.3px/ms 이상)
  - 슬라이드 컨테이너: `transform: translateX(-N * 100%)`, transition 400ms ease-out
  - 인디케이터 dot: 활성 dot은 width 24px / 비활성 8px (transition 300ms)
  - 자동 슬라이드: 5000ms 간격, 사용자 인터랙션 시 일시정지 (10초 후 재개)
  - 마지막 슬라이드에서 next 시 첫 슬라이드로 wrap (or 끝에서 멈춤 — UX 결정: **wrap 방식 채택**)
- **시각 피드백**: 스와이프 중 손가락 따라 실시간 transform (drag), 떼면 snap
- **햅틱**: 슬라이드 전환 완료 시 `navigator.vibrate(8)` (지원 시)
- **접근성**:
  - 좌우 화살표 버튼 (시각적으로 보임, 키보드 ←/→ 지원)
  - `role="region"` + `aria-label="갤러리"` + `aria-roledescription="carousel"`
  - 각 슬라이드 `aria-label="N / 5"` (예: "사진 3 / 5")
- **reduced-motion**: 자동 슬라이드 OFF, 사용자 스와이프만 동작

#### 3-3. 계좌번호 복사 + 토스트
- **위치**: account 섹션 각 항목 (양가 부모 4명 + 신랑 + 신부 = 6개)
- **동작**:
  - 버튼 클릭 → `navigator.clipboard.writeText(계좌번호)`
  - 클립보드 복사 성공 → 토스트 페이드인 (200ms) + 1500ms 후 페이드아웃 (300ms)
  - 토스트 메시지: "계좌번호가 복사되었습니다"
  - 버튼 아이콘: 복사 아이콘 → **sage 체크마크** swap (400ms 동안), 1000ms 후 원복
- **시각**: 토스트는 화면 하단 중앙 fixed, surface bg `#F2EAE2` + text `#3A2E2A`, border-radius 12px, padding 12px 20px
- **햅틱**: `navigator.vibrate(15)` (지원 시)
- **접근성**: 토스트 `role="status"` + `aria-live="polite"`, 버튼 `aria-label="계좌번호 복사"`
- **fallback**: clipboard API 실패 시 (HTTPS 아님 등) `document.execCommand('copy')` 폴리필 시도, 그래도 실패 시 토스트 "복사에 실패했습니다. 직접 선택해주세요"

#### 3-4. 부드러운 스크롤 (Smooth Scroll)
- **구현**: CSS `html { scroll-behavior: smooth; }` (모든 앵커 링크에 적용)
- **prefers-reduced-motion**: `scroll-behavior: auto` (즉시 점프)
- **참고**: hash anchor 없으면 비활성. 향후 목차/네비 추가 시 활용

---

### 🟨 Should (권장 — UX 향상)

#### 3-5. 갤러리 핀치 줌 Lightbox
- **위치**: 갤러리 슬라이드 클릭 시 모달 오픈
- **동작**:
  - 클릭 → fixed 풀스크린 lightbox 페이드인 (250ms), 배경 `rgba(58, 46, 42, 0.92)`
  - 이미지: 화면 중앙, max 90vw / 90vh
  - **핀치 줌**: `gesturestart/gesturechange` (iOS) + `touchmove` 2-finger distance 계산 (Android)
    - max scale 3.0, min scale 1.0
    - 줌 중심: 두 손가락 중점 (`transform-origin` 동적)
  - **더블탭 토글**: 1회 더블탭 → scale 2.5, 다시 더블탭 → scale 1.0 (300ms transition)
  - **팬**: scale > 1 시 단일 손가락 드래그로 이동
  - **닫기**: 우상단 ✕ 버튼 / 배경 클릭 / ESC 키 / 위→아래 swipe (100px)
- **포커스 트랩**: lightbox 오픈 시 ✕ 버튼에 포커스, Tab 순환 lightbox 내부로 제한
- **스크롤 잠금**: `body { overflow: hidden }` (모달 동안)
- **접근성**:
  - `role="dialog"` + `aria-modal="true"` + `aria-label="사진 확대"`
  - 키보드: ESC 닫기, ←/→ 슬라이드 이동, +/- 줌 (선택)
- **reduced-motion**: 페이드 250ms → 0ms, 줌 transition 0ms (즉시)

#### 3-6. 음악 토글 (BGM)
- **위치**: hero 우상단 floating action (sticky, top: 16px, right: 16px, z-index: 50)
- **음원**: `<audio src="" loop preload="metadata">` — 사용자가 별도 추가 (royalty-free placeholder 권장)
- **동작**:
  - 자동재생: 시도하되 브라우저 차단 시 사용자 클릭 대기 (`audio.play().catch(...)`)
  - 클릭 토글: 재생 ↔ 일시정지
  - 재생 시 페이드인 (volume 0 → 0.4, 1500ms ease-out)
  - 일시정지 시 페이드아웃 (volume → 0, 600ms) 후 pause
- **아이콘**: SVG 음표
  - 일시정지 상태: 음표 단독 (sage 색)
  - 재생 상태: 음표 + 작은 이퀄라이저 3바 (각 막대 scaleY 0.3 ↔ 1.0, 400ms loop, stagger 100ms)
  - 클릭 시 ripple: 원형 scale 0 → 2.5, opacity 0.4 → 0, 600ms (rosewood 색)
- **사이즈**: 44x44px (터치 타겟 최소 보장)
- **배경**: ivory `#FBF7F3` 80% alpha, backdrop-filter blur(8px), border-radius 50%
- **접근성**:
  - `aria-label="배경음악 재생/일시정지"` (상태에 따라 갱신)
  - `aria-pressed="true|false"`
  - 키보드 Enter/Space 동작
- **reduced-motion**: 이퀄라이저 정적 (3바 모두 scaleY 0.7 고정), ripple 없음

#### 3-7. 카카오톡 공유 버튼
- **위치**: share 섹션
- **동작**:
  - Kakao SDK (`Kakao.Share.sendDefault`) 가능 시 SDK 사용 — feed 템플릿 (제목, 설명, 썸네일, 버튼)
  - SDK 미사용 시 fallback: 현재 URL `navigator.clipboard.writeText` + 토스트 "링크가 복사되었습니다"
- **시각**: 버튼 hover/active 시 scale 0.96, 150ms
- **햅틱**: 클릭 시 `navigator.vibrate(15)`
- **접근성**: `aria-label="카카오톡으로 공유하기"`

#### 3-8. 햅틱 피드백 (전역)
- **대상**: 모든 주요 버튼 (계좌 복사, 카카오 공유, 갤러리 슬라이드, 음악 토글, lightbox 열기/닫기)
- **구현**: `navigator.vibrate(N)` 지원 체크 후 호출
  - 가벼운 탭: 8ms (슬라이드 전환)
  - 표준 탭: 15ms (복사, 공유)
  - 중요 액션: 25ms (lightbox 열기, RSVP 제출)
- **fallback**: 미지원 기기에서는 silently 무시 (기능 동작에 영향 없음)

---

### 🟩 Nice-to-have (선택 — 시간 여유 시)

#### 3-9. 스크롤 리빌 (IntersectionObserver fade-up)
- **이미 섹션 2에서 명세** — 모든 섹션 공통 적용
- **고급 옵션**: 스크롤 방향 감지하여 위→아래 스크롤 시에만 reveal, 다시 위로 스크롤 시 유지

#### 3-10. 모서리 장식 패럴랙스
- **위치**: 각 섹션의 spot illustration (rose 봉오리, 유칼립투스 가지)
- **동작**: scroll 위치에 따라 `transform: translateY(scrollY * 0.15)` (매우 약한 패럴랙스)
- **구현**: scroll listener `passive: true`, throttle 16ms (rAF 기반)
- **reduced-motion**: factor 0 (정적 위치 고정)

#### 3-11. Hero 일러스트 ken-burns slow zoom
- **동작**: hero 보태니컬 일러스트가 18초에 걸쳐 scale 1.0 → 1.04 → 1.0 (ease-in-out, infinite alternate)
- **reduced-motion**: 정적 (animation: none)

---

## 4. 마이크로 인터랙션 & 트랜지션 디테일

| 요소 | 상태 | 변화 | Duration | Easing |
|------|------|------|----------|--------|
| 모든 버튼 | hover (데스크톱) | scale 1.0 → 1.02, opacity 1 → 0.92 | 200ms | ease-standard |
| 모든 버튼 | active (탭) | scale 1.0 → 0.96 | 150ms | ease-standard |
| 모든 버튼 | focus-visible | outline 2px solid accent + offset 3px | 0ms | — |
| 링크 (텍스트) | hover | color 변화 (text → accent), underline 등장 | 200ms | ease-standard |
| 카드 (account, venue) | hover | translateY 0 → -2px, shadow 미세 강화 | 250ms | ease-standard |
| 토스트 | enter | opacity 0→1 + translateY(20px → 0) | 200ms | ease-out |
| 토스트 | exit | opacity 1→0 | 300ms | ease-in |
| 디바이더 라인 | scroll 진입 시 | scaleX 0 → 1 (origin: center) | 1000ms | ease-out |
| 입력 필드 (RSVP, 방명록) | focus | border-color muted → accent, 미세 글로우 | 200ms | ease-standard |
| 모달 (lightbox) | enter | opacity 0→1 (배경) + scale(0.96 → 1.0) (내용) | 250ms | ease-out |
| 모달 (lightbox) | exit | opacity 1→0 + scale(1.0 → 0.98) | 200ms | ease-in |
| 체크마크 swap (계좌 복사 후) | swap | 복사 아이콘 opacity 1→0 + 체크 opacity 0→1, scale 0.8 → 1.0 | 400ms | ease-out |

---

## 5. CSS 변수 토큰 (frontend-developer가 :root에 그대로 추가)

```css
:root {
  /* Easing */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);     /* 강조 진입 (텍스트 reveal, 마스크) */
  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);   /* 기본 (버튼, 카드) */
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* 감속 (페이지 진입) */
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* 가속 (페이지 exit) */
  --ease-out-cubic:  cubic-bezier(0.33, 1, 0.68, 1); /* 카운트업 */

  /* Duration */
  --dur-fast:   0.15s;   /* 마이크로 (active, focus) */
  --dur-base:   0.3s;    /* 기본 (hover, 토스트) */
  --dur-mid:    0.6s;    /* 페이드인 */
  --dur-slow:   0.9s;    /* 섹션 reveal */
  --dur-xslow:  1.4s;    /* 카운트업, 갤러리 첫 슬라이드 blur reveal */

  /* Background loops */
  --dur-bg-mesh:    60s;
  --dur-bg-petal:   18s; /* 평균값 (실제는 14~22s 랜덤) */
  --dur-pulse:      1.6s;
  --dur-eq-bar:     0.4s;
  --dur-ken-burns:  18s;

  /* Stagger */
  --stagger-base:   0.1s;
  --stagger-large:  0.15s;
}

/* prefers-reduced-motion 글로벌 강등 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. 구현 우선순위 매트릭스

| 우선순위 | 항목 | 출시 차단 여부 |
|---------|------|--------------|
| **Must** | 1-A 꽃잎 파티클 (Canvas) | ✅ |
| **Must** | 1-B 그라디언트 메시 | ✅ |
| **Must** | 2-1~2-6 모든 섹션 스크롤 reveal | ✅ |
| **Must** | 3-1 D-day 카운트업 | ✅ |
| **Must** | 3-2 갤러리 스와이프 | ✅ |
| **Must** | 3-3 계좌 복사 + 토스트 | ✅ |
| **Must** | 3-4 부드러운 스크롤 | ✅ |
| **Must** | 5. CSS 변수 토큰 정의 | ✅ |
| **Must** | prefers-reduced-motion 글로벌 분기 | ✅ |
| Should | 3-5 lightbox 핀치 줌 | ❌ |
| Should | 3-6 음악 토글 | ❌ |
| Should | 3-7 카카오 공유 | ❌ |
| Should | 3-8 햅틱 피드백 | ❌ |
| Should | 2-2 masked text reveal (greeting) | ❌ |
| Nice | 3-10 모서리 장식 패럴랙스 | ❌ |
| Nice | 3-11 hero ken-burns | ❌ |

---

## 7. 성능 가이드 (frontend-developer 준수 사항)

### 7-1. RAF 일시정지
- 꽃잎 파티클: `document.visibilityState === 'hidden'` 시 RAF 중단, `visible` 복귀 시 재개
- 갤러리 자동 슬라이드: viewport 외 시 setInterval clear

### 7-2. will-change 사용 가이드
- **사용**: 꽃잎 canvas (transform), 그라디언트 메시 body::before (background-position), lightbox 모달 전환 직전
- **금지**: 모든 reveal 요소에 일괄 적용 → 메모리 폭발. 트랜지션 종료 시 제거

### 7-3. CSS contain
```css
.section { contain: layout style; }      /* 각 섹션 격리 */
.gallery-slide { contain: paint; }       /* 슬라이드 paint 격리 */
.lightbox { contain: strict; }            /* 모달 완전 격리 */
```

### 7-4. 이미지 lazy-load
- hero 일러스트: `loading="eager"` (LCP 핵심)
- 갤러리 5장: 첫 장 `loading="eager"`, 2~5장 `loading="lazy"`
- spot illustration (디바이더): `loading="lazy"`

### 7-5. 폰트 로드 최적화
- Google Fonts: `<link rel="preconnect" href="https://fonts.googleapis.com">`
- `font-display: swap` (FOIT 방지)
- 한글 폰트 (Nanum Myeongjo): 서브셋 (KR) 명시

### 7-6. 측정 기준
- Lighthouse Mobile Performance ≥ 85
- LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms
- 실 측정: iOS Safari (iPhone 12 시뮬), Android Chrome (Pixel 5 시뮬)

---

## 8. 접근성 체크리스트

- [ ] 모든 무한 루프 모션 (1-A, 1-B, 펄스, ken-burns, 이퀄라이저, 스크롤 인디케이터 bounce, 패럴랙스)이 `prefers-reduced-motion: reduce`에서 정적 대체
- [ ] 갤러리 자동 슬라이드 사용자 인터랙션 시 일시정지 (재생 시간 ≤ 5s 충족, WCAG 2.2.2)
- [ ] 음악 토글 명확한 시각 표시 + 키보드(Enter/Space) 접근
- [ ] 빠른 점멸 없음 (이퀄라이저 0.4s = 2.5Hz < 3Hz, 광과민성 안전)
- [ ] 모든 인터랙티브 버튼 `aria-label` (계좌 복사 6개, 음악 토글, 카카오 공유, 갤러리 nav, 모달 닫기 등)
- [ ] 토스트 `role="status"` + `aria-live="polite"`
- [ ] D-day 카운트업 `aria-live="polite"` (단, 매 프레임 갱신 금지 — 종료 시 1회만)
- [ ] Lightbox 포커스 트랩 + ESC 닫기 + 첫 포커스 닫기 버튼
- [ ] 갤러리 키보드 ←/→ 네비게이션
- [ ] 컬러 대비 (이미 컨셉 시트에서 검증): text `#3A2E2A` on bg `#FBF7F3` ≥ 13:1 (WCAG AAA)
- [ ] 토스트 컬러 대비 검증: text `#3A2E2A` on surface `#F2EAE2` ≥ 11:1 (AAA)

---

## 9. 자산 협의 사항 (image-artist에게 전달 필요)

- **꽃잎 파티클**: 컨셉 시트의 워터컬러 일러스트와 시각적 일관성을 위해 별도 SVG 꽃잎 자산이 있으면 좋음. 단, **본 명세는 Canvas ellipse 단순 도형을 기본으로** 하므로 자산 없어도 구현 가능. 자산이 제공되면 `Image()` + `ctx.drawImage` 방식으로 업그레이드 가능.
- **prefers-reduced-motion 정적 SVG 꽃잎 4개**: 각 약 60x60px, dusty rose 2종 + sage 2종, 회전 변형 미리 적용된 4개 PNG 또는 인라인 SVG 권장.
- **음악 토글 아이콘**: SVG 인라인 처리 (외부 자산 불필요), frontend가 직접 path 작성.
- **계좌 복사 아이콘 + 체크마크**: SVG 인라인.

---

## 10. 한 줄 정리

> **모든 모션은 "조용히 피어나는" 모티프에 충실하게 — 600~900ms 차분한 ease-out, 꽃잎 24개 매우 은은(opacity 0.18~0.32), 갤러리는 워터컬러처럼 blur-reveal, 그리고 prefers-reduced-motion 시 파티클·메시 OFF + 즉시 fade-in으로 강등.**
