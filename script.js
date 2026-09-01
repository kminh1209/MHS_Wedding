/* =========================================================
   Wedding Invitation — script.js
   강민혁 ♡ 김혜수 (2027.02.20)
   Vanilla JS only. Implements motion-spec.md Must/Should items.
   ========================================================= */
(function () {
  'use strict';

  // ---------------------------------------------------------
  // PLACEHOLDERS — 실제 운영 시 아래 값을 채워주세요.
  // ---------------------------------------------------------
  const KAKAO_JS_KEY     = '3a2cd201a0c4a64bdcd53e3839fe8c94';
  // placeholder: Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱 에서 발급받은 구성값을 채워주세요.
  // 자세한 절차는 README.md의 "방명록(Firebase) 설정" 항목을 참고하세요.
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAYYT4HCNsS75UoCfArUxl8KQag01ZE54A",
    authDomain: "mhs-wedding.firebaseapp.com",
    projectId: "mhs-wedding",
    storageBucket: "mhs-wedding.firebasestorage.app",
    messagingSenderId: "855666657852",
    appId: "1:855666657852:web:055c5e0cd8e4c3e2789139",
    measurementId: "G-LLMDL2WZDV"
  };
  const SHARE_TITLE      = '강민혁 ♡ 김혜수 결혼합니다';
  const SHARE_DESC       = '2027년 2월 20일 토요일 오후 12시 30분\n용인 페이지웨딩 클래식홀 6F';
  const SHARE_IMAGE      = location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'images/og-thumbnail.png';
  const TARGET_DATE_STR  = '2027-02-20';
  const TARGET_HOUR      = 12;
  const TARGET_MINUTE    = 30;
  const VENUE_NAME       = '용인 페이지웨딩';
  const VENUE_ADDRESS    = '용인시 처인구 백옥대로 1238';

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReduced     = () => reducedMotion.matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const haptic = (n) => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };

  function loadScriptOnce(id, src) {
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(id);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${id}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${id}`));
      document.head.appendChild(script);
    });
  }

  // ---------------------------------------------------------
  // 1. HERO entrance step-in
  // ---------------------------------------------------------
  function setupHero() {
    const hero = $('.hero');
    if (!hero) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('is-loaded'));
    });
  }

  // ---------------------------------------------------------
  // 2. IntersectionObserver fade reveal
  // ---------------------------------------------------------
  function setupReveal() {
    const targets = $$('.reveal');
    if (!targets.length) return;
    if (isReduced()) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));

    // 갤러리 첫 슬라이드 blur reveal
    const firstSlide = $('.gallery-slide:first-child');
    if (firstSlide) firstSlide.classList.add('first-reveal');
  }

  // ---------------------------------------------------------
  // 3. Petals background canvas (motion §1-A)
  // ---------------------------------------------------------
  function setupPetals() {
    // intentionally disabled for the monochrome poster-style redesign
  }

  // ---------------------------------------------------------
  // 4. Calendar render + D-day count-up (motion §3-1)
  // ---------------------------------------------------------
  function setupCalendar() {
    const tbl = $('.cal');
    if (!tbl) return;
    const hh = String(TARGET_HOUR).padStart(2, '0');
    const mm = String(TARGET_MINUTE).padStart(2, '0');
    const target = new Date(`${TARGET_DATE_STR}T${hh}:${mm}:00`);
    const y = target.getFullYear();
    const m = target.getMonth();
    const first = new Date(y, m, 1).getDay();
    const last  = new Date(y, m + 1, 0).getDate();
    const tbody = tbl.querySelector('tbody');

    let html = '<tr>';
    for (let i = 0; i < first; i++) html += '<td></td>';
    for (let d = 1; d <= last; d++) {
      const dow = (first + d - 1) % 7;
      const cls = [];
      if (d === target.getDate()) cls.push('today');
      if (dow === 0) cls.push('sun');
      if (dow === 6) cls.push('sat');
      html += `<td${cls.length ? ` class="${cls.join(' ')}"` : ''}><span>${d}</span></td>`;
      if ((first + d) % 7 === 0 && d !== last) html += '</tr><tr>';
    }
    html += '</tr>';
    tbody.innerHTML = html;

    // D-day 계산: 자정 → 자정 기준으로 정수 일수만 비교 (시각 무관)
    const ddayNum = $('#dday-num');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(y, m, target.getDate(), 0, 0, 0);
    const diff = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    const ddayLabel = $('.dday-label');
    const ddayBlock = $('.dday');

    if (diff > 0) {
      ddayNum.dataset.target = String(diff);
      ddayNum.textContent = isReduced() ? String(diff) : '0';
    } else if (diff === 0) {
      ddayBlock.innerHTML = '<span class="script" style="font-size:24px;color:var(--color-primary)">오늘</span><br><span style="font-size:14px;color:var(--color-muted)">저희 두 사람의 약속이 시작됩니다</span>';
      if (ddayLabel) ddayLabel.style.display = 'none';
    } else {
      ddayNum.dataset.target = String(-diff);
      ddayNum.textContent = isReduced() ? String(-diff) : '0';
      if (ddayLabel) ddayLabel.textContent = `함께 걸어가는 날 +`;
      ddayBlock.firstChild.textContent = 'D + ';
    }

    // count-up 애니메이션
    if (!isReduced() && diff !== 0) {
      const onIntersect = (entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          countUp(ddayNum, parseInt(ddayNum.dataset.target, 10), 1400);
          obs.disconnect();
        });
      };
      new IntersectionObserver(onIntersect, { threshold: 0.4 })
        .observe($('#calendar'));
    }
  }

  function countUp(el, target, dur) {
    const start = performance.now();
    function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------
  // 5. Venue map: Kakao Maps SDK
  // ---------------------------------------------------------
  const VENUE_LAT = 37.2399;   // 용인 페이지웨딩 위도
  const VENUE_LNG = 127.1967;  // 용인 페이지웨딩 경도

  async function setupVenueMap() {
    const container = document.getElementById('kakao-map');
    if (!container) return;

    if (!KAKAO_JS_KEY) {
      container.innerHTML =
        '<p style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-size:0.85rem;">카카오맵 키를 입력하면 지도가 표시됩니다.</p>';
      return;
    }

    try {
      await loadScriptOnce(
        'kakao-maps-sdk',
        'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + encodeURIComponent(KAKAO_JS_KEY) + '&autoload=false'
      );
    } catch (error) {
      console.error('카카오 지도 SDK를 불러오지 못했습니다.', error);
      container.innerHTML =
        '<p style="display:flex;align-items:center;justify-content:center;height:100%;color:#777;font-size:0.85rem;">지도를 불러오지 못했습니다. 아래 길찾기 버튼을 이용해 주세요.</p>';
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오 지도 SDK가 로드되었지만 maps API를 찾을 수 없습니다.');
      container.innerHTML =
        '<p style="display:flex;align-items:center;justify-content:center;height:100%;color:#777;font-size:0.85rem;">지도를 불러오지 못했습니다. 아래 길찾기 버튼을 이용해 주세요.</p>';
      return;
    }

    window.kakao.maps.load(function () {
      const options = {
        center: new window.kakao.maps.LatLng(VENUE_LAT, VENUE_LNG),
        level: 4,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 마커 표시
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(VENUE_LAT, VENUE_LNG),
      });
      marker.setMap(map);

      // 인포윈도우 (장소명)
      const infowindow = new window.kakao.maps.InfoWindow({
        content: '<div style="padding:4px 8px;font-size:0.8rem;white-space:nowrap;">' + VENUE_NAME + '</div>',
      });
      infowindow.open(map, marker);
    });
  }

  // ---------------------------------------------------------
  // 6. Gallery: swipe + nav + dots + auto-play (motion §3-2)
  // ---------------------------------------------------------
  let galleryAPI = null;
  function setupGallery() {
    const stage = $('.gallery-stage');
    const track = $('#gallery-track');
    if (!stage || !track) return;
    const slides = $$('.gallery-slide', track);
    const dots   = $$('#gallery-dots li');
    const prev   = $('.gallery-prev');
    const next   = $('.gallery-next');
    const N = slides.length;
    let idx = 0;
    let dragX = 0;
    let dragStartX = 0;
    let dragging = false;

    function show(i, withTransition = true) {
      idx = ((i % N) + N) % N;
      track.style.transition = withTransition ? '' : 'none';
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === idx));
      slides.forEach((s, k) => {
        s.setAttribute('aria-hidden', k === idx ? 'false' : 'true');
      });
    }
    // Touch events
    track.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      dragging = true;
      dragStartX = e.touches[0].clientX;
      dragX = 0;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      dragX = e.touches[0].clientX - dragStartX;
      const w = stage.clientWidth || 1;
      track.style.transform = `translateX(calc(-${idx * 100}% + ${dragX}px))`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = '';
      const threshold = 50;
      if (dragX > threshold) { show(idx - 1); haptic(8); }
      else if (dragX < -threshold) { show(idx + 1); haptic(8); }
      else { show(idx); }
    });

    // Click navigation
    prev?.addEventListener('click', () => { show(idx - 1); haptic(8); });
    next?.addEventListener('click', () => { show(idx + 1); haptic(8); });

    // Click slide → lightbox
    slides.forEach((slide, i) => {
      const img = $('img', slide);
      img?.addEventListener('click', () => {
        if (Math.abs(dragX) > 5) return; // 스와이프 후 클릭 무시
        openLightbox(i);
      });
    });

    // Keyboard
    stage.tabIndex = 0;
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { show(idx - 1); haptic(8); }
      if (e.key === 'ArrowRight') { show(idx + 1); haptic(8); }
    });

    show(0);
    galleryAPI = { show, count: N };
  }

  // ---------------------------------------------------------
  // 6. Lightbox + pinch zoom + double-tap (motion §3-5)
  // ---------------------------------------------------------
  let lightboxAPI = null;
  function setupLightbox() {
    const lb = $('#lightbox');
    const img = $('#lightbox-img');
    const close = $('#lightbox-close');
    if (!lb || !img || !close) return;

    const slides = $$('.gallery-slide img');
    let scale = 1;
    let originX = 0, originY = 0;
    let lastDist = 0;
    let lastTap = 0;
    let panStart = null;
    let prevFocus = null;
    let currentIdx = 0;

    function setTransform() {
      img.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    }
    function reset() {
      scale = 1; originX = 0; originY = 0;
      img.style.transform = '';
    }

    function open(i) {
      currentIdx = i;
      img.src = slides[i].src;
      img.alt = slides[i].alt || '';
      lb.hidden = false;
      requestAnimationFrame(() => lb.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      prevFocus = document.activeElement;
      close.focus();
      haptic(15);
    }
    function closeFn() {
      lb.classList.remove('is-open');
      setTimeout(() => {
        lb.hidden = true;
        reset();
        document.body.style.overflow = '';
        if (prevFocus && prevFocus.focus) prevFocus.focus();
      }, isReduced() ? 0 : 220);
    }

    close.addEventListener('click', closeFn);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeFn(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeFn();
      if (e.key === 'ArrowLeft' && galleryAPI) {
        currentIdx = (currentIdx - 1 + galleryAPI.count) % galleryAPI.count;
        img.src = slides[currentIdx].src; reset();
        galleryAPI.show(currentIdx);
      }
      if (e.key === 'ArrowRight' && galleryAPI) {
        currentIdx = (currentIdx + 1) % galleryAPI.count;
        img.src = slides[currentIdx].src; reset();
        galleryAPI.show(currentIdx);
      }
    });

    // Pinch / double-tap zoom
    img.addEventListener('touchstart', (e) => {
      lb.classList.add('is-zooming');
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      } else if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) {
          scale = scale > 1.05 ? 1 : 2.4;
          originX = 0; originY = 0;
          lb.classList.remove('is-zooming'); // smooth transition
          setTransform();
          haptic(10);
        } else {
          if (scale > 1) {
            panStart = { x: e.touches[0].clientX - originX, y: e.touches[0].clientY - originY };
          }
        }
        lastTap = now;
      }
    }, { passive: true });

    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        if (lastDist > 0) {
          scale = clamp(scale * (d / lastDist), 1, 3);
          setTransform();
        }
        lastDist = d;
      } else if (e.touches.length === 1 && panStart && scale > 1) {
        originX = e.touches[0].clientX - panStart.x;
        originY = e.touches[0].clientY - panStart.y;
        setTransform();
      }
    }, { passive: true });

    img.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        lastDist = 0;
        panStart = null;
        if (scale < 1.05) reset();
        lb.classList.remove('is-zooming');
      }
    });

    lightboxAPI = { open };
    window.openLightbox = open; // 갤러리에서 호출
  }

  // local helper bridge
  function openLightbox(i) {
    if (lightboxAPI) lightboxAPI.open(i);
  }

  // ---------------------------------------------------------
  // 7. Copy account number + toast (motion §3-3)
  // ---------------------------------------------------------
  function setupCopy() {
    $$('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const txt = btn.dataset.copy || '';
        let ok = false;
        try {
          await navigator.clipboard.writeText(txt);
          ok = true;
        } catch (e) {
          try {
            const ta = document.createElement('textarea');
            ta.value = txt;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
          } catch (e2) { ok = false; }
        }
        if (ok) {
          btn.classList.add('is-copied');
          haptic(15);
          showToast('계좌번호가 복사되었습니다');
          setTimeout(() => btn.classList.remove('is-copied'), 1400);
        } else {
          showToast('복사에 실패했습니다. 직접 선택해주세요');
        }
      });
    });
  }

  // ---------------------------------------------------------
  // 8. Toast
  // ---------------------------------------------------------
  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('is-visible');
      setTimeout(() => { t.hidden = true; }, 320);
    }, 1700);
  }

  // ---------------------------------------------------------
  // 9. Music toggle (motion §3-6)
  // ---------------------------------------------------------
  function setupMusic() {
    const btn = $('#music-toggle');
    const audio = $('#bgm');
    if (!btn || !audio) return;
    audio.volume = 0;

    function fadeVolume(target, dur) {
      const start = audio.volume;
      const t0 = performance.now();
      function tick(now) {
        const t = clamp((now - t0) / dur, 0, 1);
        audio.volume = start + (target - start) * t;
        if (t < 1) requestAnimationFrame(tick);
        else if (target === 0) audio.pause();
      }
      requestAnimationFrame(tick);
    }

    btn.addEventListener('click', async () => {
      btn.classList.remove('is-rippling');
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
      haptic(10);
      try {
        if (audio.paused) {
          await audio.play();
          btn.setAttribute('aria-pressed', 'true');
          fadeVolume(0.4, 1500);
        } else {
          fadeVolume(0, 600);
          btn.setAttribute('aria-pressed', 'false');
        }
      } catch (e) {
        showToast('음원 파일을 찾을 수 없어요. (audio/bgm.mp3)');
      }
    });
  }

  // ---------------------------------------------------------
  // 10. Share (Kakao / link copy) (motion §3-7)
  // ---------------------------------------------------------
  function setupShare() {
    const btnLink  = $('#share-link');
    const btnKakao = $('#share-kakao');

    btnLink?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        haptic(15);
        showToast('청첩장 링크가 복사되었습니다');
      } catch (e) {
        showToast('복사에 실패했습니다');
      }
    });

    btnKakao?.addEventListener('click', () => {
      haptic(15);
      // Kakao SDK 사용 가능 시
      if (window.Kakao && KAKAO_JS_KEY) {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: SHARE_TITLE,
              description: SHARE_DESC,
              imageUrl: SHARE_IMAGE,
              link: { mobileWebUrl: location.href, webUrl: location.href }
            },
            buttons: [
              { title: '청첩장 보기', link: { mobileWebUrl: location.href, webUrl: location.href } }
            ]
          });
          return;
        } catch (e) { /* fallthrough */ }
      }
      // Web Share API 폴백
      if (navigator.share) {
        navigator.share({ title: SHARE_TITLE, text: SHARE_DESC, url: location.href }).catch(() => {});
        return;
      }
      // 최종 폴백: 링크 복사
      navigator.clipboard?.writeText(location.href);
      showToast('청첩장 링크가 복사되었습니다');
    });
  }

  // ---------------------------------------------------------
  // 12. Guestbook (Firebase Firestore)
  // ---------------------------------------------------------
  // 저장 필드: name(20자), message(200자), passwordHash(SHA-256 hex), createdAt(서버 타임스탬프)
  // 삭제 비밀번호는 평문 저장하지 않고 SHA-256 해시로 비교합니다.
  // 단, 클라이언트 단 해시 비교는 완전한 보안 수단이 아니므로(콘솔 접근자는 원문 없이도 삭제 가능)
  // 참고용 잠금 장치로만 사용하세요. 자세한 내용은 README.md 참고.
  const FIREBASE_SDK_VERSION = '10.14.1';

  async function sha256Hex(text) {
    const buf = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function formatGuestbookDate(date) {
    if (!date) return '';
    const pad = (n) => String(n).padStart(2, '0');
    let hours = date.getHours();
    const ampm = hours < 12 ? 'am' : 'pm';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const minutes = pad(date.getMinutes());
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${hours}:${minutes}${ampm}`;
  }

  function renderGuestbookEntries(list, entries, onDeleteSubmit) {
    const empty = $('#guestbook-empty');
    list.querySelectorAll('.guestbook-item').forEach((el) => el.remove());
    if (!entries.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    entries.forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'guestbook-item';
      li.dataset.id = entry.id;

      const header = document.createElement('div');
      header.className = 'guestbook-item-header';
      const name = document.createElement('span');
      name.className = 'guestbook-item-name';
      name.textContent = entry.name;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'guestbook-item-delete';
      delBtn.textContent = '삭제';

      header.append(name, delBtn);

      const msg = document.createElement('p');
      msg.className = 'guestbook-item-message';
      msg.textContent = entry.message;

      const date = document.createElement('p');
      date.className = 'guestbook-item-date';
      date.textContent = formatGuestbookDate(entry.createdAt);

      const delForm = document.createElement('form');
      delForm.className = 'guestbook-delete-form';
      delForm.hidden = true;
      const delInput = document.createElement('input');
      delInput.type = 'password';
      delInput.placeholder = '삭제 비밀번호';
      delInput.className = 'guestbook-input guestbook-delete-input';
      delInput.maxLength = 20;
      delInput.autocomplete = 'off';
      const delSubmit = document.createElement('button');
      delSubmit.type = 'submit';
      delSubmit.className = 'guestbook-delete-confirm';
      delSubmit.textContent = '확인';
      delForm.append(delInput, delSubmit);

      delBtn.addEventListener('click', () => {
        delForm.hidden = !delForm.hidden;
        if (!delForm.hidden) delInput.focus();
      });
      delForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        delSubmit.disabled = true;
        await onDeleteSubmit(entry, delInput.value);
        delSubmit.disabled = false;
      });

      li.append(header, msg, date, delForm);
      list.appendChild(li);
    });
  }

  async function setupGuestbook() {
    const form      = $('#guestbook-form');
    const list      = $('#guestbook-list');
    const nameEl    = $('#guestbook-name');
    const pwEl      = $('#guestbook-password');
    const msgEl     = $('#guestbook-message');
    const counterEl = $('#guestbook-counter');
    const submitBtn = $('#guestbook-submit');
    if (!form || !list) return;

    msgEl?.addEventListener('input', () => {
      if (counterEl) counterEl.textContent = `${msgEl.value.length}/200`;
    });

    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
      list.innerHTML = '<li class="guestbook-empty">방명록 서비스 설정 중입니다. 잠시 후 다시 확인해 주세요.</li>';
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    let db, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, limit, getFirestore;
    try {
      const [{ initializeApp }, firestoreMod] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`),
      ]);
      ({ collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, limit, getFirestore } = firestoreMod);
      const app = initializeApp(FIREBASE_CONFIG);
      db = getFirestore(app);
    } catch (error) {
      console.error('방명록 서비스를 불러오지 못했습니다.', error);
      list.innerHTML = '<li class="guestbook-empty">방명록을 불러오지 못했습니다. 잠시 후 새로고침 해주세요.</li>';
      return;
    }

    const guestbookQuery = query(collection(db, 'guestbook'), orderBy('createdAt', 'desc'), limit(100));

    onSnapshot(guestbookQuery, (snapshot) => {
      const entries = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          message: data.message || '',
          passwordHash: data.passwordHash || '',
          createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null,
        };
      });
      renderGuestbookEntries(list, entries, async (entry, pw) => {
        if (!pw) {
          showToast('삭제 비밀번호를 입력해 주세요');
          return;
        }
        try {
          const hash = await sha256Hex(pw);
          if (hash !== entry.passwordHash) {
            showToast('비밀번호가 일치하지 않습니다');
            return;
          }
          await deleteDoc(doc(db, 'guestbook', entry.id));
          haptic(15);
          showToast('메시지가 삭제되었습니다');
        } catch (error) {
          console.error(error);
          showToast('삭제에 실패했습니다');
        }
      });
    }, (error) => {
      console.error('방명록을 불러오지 못했습니다.', error);
      list.innerHTML = '<li class="guestbook-empty">방명록을 불러오지 못했습니다. 잠시 후 새로고침 해주세요.</li>';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = nameEl?.value.trim() || '';
      const password = pwEl?.value || '';
      const message = msgEl?.value.trim() || '';
      if (!name || !password || !message) {
        showToast('이름, 메시지, 삭제 비밀번호를 모두 입력해 주세요');
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      try {
        const passwordHash = await sha256Hex(password);
        await addDoc(collection(db, 'guestbook'), {
          name: name.slice(0, 20),
          message: message.slice(0, 200),
          passwordHash,
          createdAt: serverTimestamp(),
        });
        form.reset();
        if (counterEl) counterEl.textContent = '0/200';
        haptic(15);
        showToast('방명록에 메시지가 등록되었습니다');
      } catch (error) {
        console.error(error);
        showToast('등록에 실패했습니다. 다시 시도해 주세요');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------
  function init() {
    setupHero();
    setupReveal();
    setupPetals();
    setupCalendar();
    setupVenueMap();
    setupGallery();
    setupLightbox();
    setupCopy();
    setupMusic();
    setupShare();
    setupGuestbook();

    // reduced-motion 변경 시 단순 reload (모션 일관성 보장)
    if (reducedMotion.addEventListener) {
      reducedMotion.addEventListener('change', () => location.reload());
    } else if (reducedMotion.addListener) {
      reducedMotion.addListener(() => location.reload());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
