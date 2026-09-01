# Image Manifest — 이미지 아티스트 산출물

**스타일 베이스라인**: dusty rose (#C9A2A2) × sage green (#A8B59C) duotone watercolor botanical, warm ivory cream background (#FAF6F1 / #FBF7F3), deep rosewood (#8B5A5A) accents at petal cores. Hand-painted watercolor texture with paper grain, minimal thin line accents. No text, no figures, no people.

**모델**: `gpt-image-2` / **Quality**: `high` / **Format**: PNG

## 요약 표

| # | 파일명 | 용도 | 사용 섹션 | 차원 (W×H) | 비율 | 권장 alt 텍스트 | 상태 |
|---|--------|------|----------|-----------|------|----------------|------|
| 1 | hero-illustration.png | 메인 비주얼 (인물 placeholder 대체) | hero | 1024×1280 | 4:5 | "더스티 로즈 장미와 세이지 유칼립투스 가지의 워터컬러 보태니컬 일러스트 — 메인 히어로" | 성공 |
| 2 | floral-divider.png | 섹션 사이 가로 플로럴 디바이더 | greeting↔couple-intro, venue↔account 등 | 1536×512 | 16:5 (3:1) | "좌우 대칭 워터컬러 플로럴 디바이더" | 성공 |
| 3 | floral-corner.png | 좌상단 모서리 장식 | calendar / account / rsvp 카드 코너 | 1024×1024 | 1:1 | "좌상단 모서리 보태니컬 장식" | 성공 |
| 4 | gallery-placeholder-1.png | 갤러리 1번 placeholder (오프센터 부케) | gallery slot 1 | 1024×1280 | 4:5 | "더스티 로즈와 세이지 부케 워터컬러 — 갤러리 1" | 성공 |
| 5 | gallery-placeholder-2.png | 갤러리 2번 placeholder (수직 유칼립투스) | gallery slot 2 | 1024×1280 | 4:5 | "유칼립투스 줄기와 장미 봉오리 워터컬러 — 갤러리 2" | 성공 |
| 6 | gallery-placeholder-3.png | 갤러리 3번 placeholder (떠다니는 꽃잎) | gallery slot 3 | 1024×1280 | 4:5 | "흩날리는 장미 꽃잎 워터컬러 — 갤러리 3" | 성공 |
| 7 | gallery-placeholder-4.png | 갤러리 4번 placeholder (하단 군집) | gallery slot 4 | 1024×1280 | 4:5 | "하단 보태니컬 군집 워터컬러 — 갤러리 4" | 성공 |
| 8 | gallery-placeholder-5.png | 갤러리 5번 placeholder (오픈 리스) | gallery slot 5 (풍경) | 1024×1280 | 4:5 | "원형 보태니컬 리스 워터컬러 — 갤러리 5" | 성공 |
| 9 | og-thumbnail.png | 카카오톡/SNS 공유 썸네일 (og:image) | `<head>` og:image / 카카오 공유 | 1536×800 | 약 1.92:1 | "더스티 로즈 & 세이지 보태니컬 프레임 청첩장 공유 카드" | 성공 |

> 비고: gpt-image-2의 사이즈 제약(16의 배수, 한 변 종횡비 3:1 이내)에 맞추기 위해 floral-divider는 16:5 대신 3:1 (1536×512), og-thumbnail은 1.91:1 대신 1.92:1 (1536×800)으로 조정.

---

## 1. hero-illustration

- file: images/hero-illustration.png
- size: 1024×1280 (4:5 세로)
- alt: "더스티 로즈 장미와 세이지 유칼립투스 가지의 워터컬러 보태니컬 일러스트"
- usage: hero 섹션. 신랑신부 사진 placeholder를 대체하는 메인 비주얼. 상단 영문명(Cormorant) + 중앙 일러스트 + 하단 한글 이름이 위에 얹히도록 하단 절반에 충분한 여백 확보.
- prompt: |
    A vertical 4:5 hero illustration for a Korean modern romantic wedding invitation web page. Soft watercolor botanical composition on a warm ivory cream background (#FAF6F1 / #FBF7F3). At top-center, a single delicately painted dusty rose blossom (#C9A2A2) with subtle deep rosewood (#8B5A5A) accents in the petal core. Flanking the rose, gracefully arching sage green eucalyptus branches (#A8B59C) and small wildflower sprigs extending outward, leaving generous empty negative space in the lower half for typography overlay. Hand-painted watercolor texture with visible paper grain and soft bleeding edges, minimal thin line accents in muted sage. No text, no figures, no people. Mood: modern romantic, soft botanical, refined warmth, calm, elegant, gallery-quality print feel. High resolution, painterly, asymmetric balance, refined.

## 2. floral-divider

- file: images/floral-divider.png
- size: 1536×512 (3:1 가로, 의도는 16:5)
- alt: "좌우 대칭 워터컬러 플로럴 디바이더"
- usage: 섹션 간 분리. greeting ↔ couple-intro, venue ↔ account 등 주요 섹션 경계. 가운데 빈 공간이 있어 그 위에 영문 캡션("&", "Save the Date") 또는 연결 라인을 얹기 좋음.
- prompt: |
    A horizontal wide 16:5 ornamental floral divider for a Korean wedding invitation web page. Symmetric watercolor botanical composition: a small cluster of dusty rose blossoms (#C9A2A2) with tiny deep rosewood (#8B5A5A) petal cores at the far left and far right, connected by gracefully extending sage green eucalyptus leaves and tiny wildflowers (#A8B59C) along a horizontal axis. Generous empty negative space in the center for text or breathing room. Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with visible paper grain, minimal thin line accents, no text, no figures. Elegant, calm, refined, asymmetric-symmetric balance, high resolution.

## 3. floral-corner

- file: images/floral-corner.png
- size: 1024×1024 (1:1)
- alt: "좌상단 모서리 보태니컬 장식"
- usage: 카드(calendar 카운트다운, account 박스, rsvp 폼 등) 좌상단 모서리. CSS `position: absolute; top:0; left:0; mix-blend-mode: multiply` 또는 단순 마진으로 얹기.
- prompt: |
    A 1:1 square corner ornament for a Korean wedding invitation section, anchored at the TOP-LEFT corner. Watercolor floral spray flowing diagonally from the top-left toward the lower-right with generous empty negative space in the lower-right two thirds. A small cluster of dusty rose blossoms (#C9A2A2) with deep rosewood (#8B5A5A) petal cores, accompanied by sage green eucalyptus leaves and tiny wildflower buds (#A8B59C). Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, refined, calm, high resolution.

## 4. gallery-placeholder-1

- file: images/gallery-placeholder-1.png
- size: 1024×1280 (4:5)
- alt: "더스티 로즈와 세이지 부케 워터컬러 — 갤러리 1"
- usage: gallery 섹션 1번 슬롯 (커플 스냅 placeholder). 가로 스와이프 + 핀치 줌 lightbox 첫 번째 이미지.
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot. Soft watercolor still life composition #1: a delicate bouquet of mixed wildflowers — dusty rose blossoms (#C9A2A2) with deep rosewood (#8B5A5A) cores, small ivory wildflowers, and trailing sage green eucalyptus leaves (#A8B59C) — arranged off-center to the upper-left, with generous negative space in the lower-right quadrant. Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, calm, refined, asymmetric, high resolution.

## 5. gallery-placeholder-2

- file: images/gallery-placeholder-2.png
- size: 1024×1280 (4:5)
- alt: "유칼립투스 줄기와 장미 봉오리 워터컬러 — 갤러리 2"
- usage: gallery 2번 슬롯. 수직 airy 구도로 1번과 시각적 대비.
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot. Soft watercolor still life composition #2: a single tall stem of sage green eucalyptus (#A8B59C) rising from the bottom-center with two or three small dusty rose buds (#C9A2A2) attached at varying heights, the tallest bud touched with deep rosewood (#8B5A5A) at its core. Generous negative space surrounding. Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, calm, refined, vertical airy composition, high resolution.

## 6. gallery-placeholder-3

- file: images/gallery-placeholder-3.png
- size: 1024×1280 (4:5)
- alt: "흩날리는 장미 꽃잎 워터컬러 — 갤러리 3"
- usage: gallery 3번 슬롯. 떠다니는 꽃잎 추상으로 다이내믹.
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot. Soft watercolor abstract composition #3: scattered loose petals of dusty rose (#C9A2A2) and small sage green leaf clusters (#A8B59C) drifting diagonally from the upper-right toward the lower-left, as if floating gently. A few accent strokes of deep rosewood (#8B5A5A) at petal cores. Generous airy negative space throughout. Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, dreamy, calm, refined, high resolution.

## 7. gallery-placeholder-4

- file: images/gallery-placeholder-4.png
- size: 1024×1280 (4:5)
- alt: "하단 보태니컬 군집 워터컬러 — 갤러리 4"
- usage: gallery 4번 슬롯. 하단 군집 + 상단 여백으로 세 번째 변주.
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot. Soft watercolor still life composition #4: a horizontal cluster of small dusty rose buds (#C9A2A2) with deep rosewood (#8B5A5A) accents nestled among trailing sage green eucalyptus and small ferns (#A8B59C), arranged across the lower third of the frame as if resting on an unseen surface. Generous open sky-like negative space in the upper two thirds. Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, calm, refined, grounded composition, high resolution.

## 8. gallery-placeholder-5

- file: images/gallery-placeholder-5.png
- size: 1024×1280 (4:5)
- alt: "원형 보태니컬 리스 워터컬러 — 갤러리 5"
- usage: gallery 5번 슬롯 (풍경 자리). 대칭 리스 구도로 마무리감.
- prompt: |
    A 4:5 vertical placeholder illustration for a wedding photo gallery slot. Soft watercolor circular wreath composition #5: a delicate open ring of mixed botanicals encircling the center — dusty rose blossoms (#C9A2A2) with deep rosewood (#8B5A5A) cores spaced at the cardinal points, sage green eucalyptus leaves and tiny wildflowers (#A8B59C) filling the connecting curves. The very center of the wreath is empty (negative space). Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures. Elegant, symmetric, calm, refined, high resolution.

## 9. og-thumbnail

- file: images/og-thumbnail.png
- size: 1536×800 (≈1.92:1)
- alt: "더스티 로즈 & 세이지 보태니컬 프레임 청첩장 공유 카드"
- usage: `<head>` 의 `og:image`, `twitter:image`, 카카오톡 공유 미리보기. 가운데 빈 공간에 신랑신부 모노그램(예: "M & S") 또는 "WEDDING INVITATION" 텍스트를 frontend에서 SVG/HTML 오버레이로 합성하는 것을 권장.
- prompt: |
    A wide 1.91:1 social media share thumbnail (Open Graph / KakaoTalk preview) for a Korean modern romantic wedding invitation. Watercolor wedding theme: dusty rose blossoms (#C9A2A2) with deep rosewood (#8B5A5A) accents and sage green eucalyptus branches (#A8B59C) framing the four corners and edges, leaving a clean empty rounded area in the absolute center for a small monogram (the center area must remain empty negative space, no text rendered). Warm ivory cream background (#FAF6F1). Same illustration style as the hero image: soft watercolor, muted dusty rose and sage palette, hand-painted texture with paper grain, minimal thin line accents, no text, no figures, no letters. Elegant, magazine-cover composition, balanced, refined, calm, high resolution.

---

## 프론트엔드 통합 가이드

- **컬러 매칭**: 모든 이미지의 베이스가 `#FAF6F1` 톤이므로, CSS `--color-bg: #FBF7F3`와 미세한 차이가 있을 수 있다. 필요 시 이미지 컨테이너에 `background-color: #FAF6F1;` 또는 `mix-blend-mode: multiply` 적용.
- **og-thumbnail의 모노그램 합성**: 이미지 자체에 텍스트가 없으므로 (a) Canvas로 클라이언트 합성 후 og:image 동적 생성하거나, (b) 별도로 텍스트 합성된 PNG를 추가 생성하거나, (c) 그대로 사용 후 메타 description으로 보완.
- **갤러리 5장의 시각적 대비**: 1=오프센터 부케 / 2=수직 줄기 / 3=떠다니는 꽃잎 / 4=하단 군집 / 5=원형 리스 — 가로 스와이프 시 다양성이 유지되도록 의도적으로 다른 구도.
- **lazy loading 권장**: hero, gallery 1-2는 eager, gallery 3-5와 og-thumbnail은 lazy.
- **AVIF/WebP 변환**: 트래픽 절감 위해 빌드 단계에서 sharp 등으로 변환 권장 (원본 PNG는 평균 1.7MB).

## 체크리스트 (자가 검증)

- [x] 모든 이미지가 dusty rose × sage 듀오톤 + warm ivory bg로 일관
- [x] 첫 이미지(hero)의 스타일이 후속 8장 프롬프트에 명시 인용됨 ("Same illustration style as the hero image")
- [x] 컨셉 시트의 imagery_direction (워터컬러 보태니컬, 더스티 로즈 + 세이지, 종이 텍스처) 반영
- [x] 텍스트 렌더링 자리(hero 하단 50%, divider 중앙, og 중앙)에 충분한 여백
- [x] `images/` 폴더에 9장 모두 저장 확인
- [x] 실존 인물 묘사 없음 (저작권 안전)
- [x] 매니페스트에 alt 텍스트 + 사용 위치 + 프롬프트 모두 기록
