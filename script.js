/* =============================================================
   2XAB FOOTWEAR — script.js

   Shared on every page:
     · header hide/reveal on scroll, mobile menu, search
     · demo cart + wishlist (front-end only — no backend)
     · toast, newsletter (demo), WhatsApp button (demo until configured)
     · scroll reveal, missing-image fallback

   Homepage-only modules (each one exits early if its markup is absent):
     · intro loader · logo marquees · shoe frame sequence
     · featured carousel · 3D preview
   ============================================================= */
(() => {
  'use strict';

  /* ---------- CONFIG: tuning knobs ---------- */
  const CONFIG = {
    // Country code + number, digits only, no "+". Empty = the WhatsApp button shows a demo message.
    whatsappNumber: '',
    // Frames are named frame_001.jpg … frame_088.jpg
    frameCount: 88,
    // 0–1. Higher = frames follow the scroll more tightly; lower = smoother but more lag.
    frameEase: 0.14,
    // Featured carousel speed in CSS pixels per second. ~40 is calm; above ~60 feels rushed.
    featuredSpeed: 42,
    // Delay between staggered siblings (ms)
    revealStagger: 90
  };

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Set by the featured-carousel module when it exists; lets the search box drive it.
  let featuredApi = null;

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  /* ---------- Header: mobile menu, search ---------- */
  const header = $('.site-header');
  const nav = $('#nav');
  const menuToggle = $('#menuToggle');
  const searchPanel = $('#searchPanel');
  const searchInput = $('#searchInput');
  const searchToggle = $('#searchToggle');
  const searchStatus = $('#searchStatus');

  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      header.classList.remove('is-hidden');      // never hide the header while the menu is open
      $('a', nav).focus({ preventScroll: true }); // move keyboard focus into the drawer
    } else if (restoreFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  }

  function setSearch(open) {
    searchPanel.classList.toggle('open', open);
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      header.classList.remove('is-hidden');
      searchInput.focus();
    } else {
      searchInput.value = '';          // closing the panel clears the filter
      applyProductSearch('');
    }
  }

  menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  searchToggle.addEventListener('click', () => setSearch(!searchPanel.classList.contains('open')));
  $('#searchClose').addEventListener('click', () => { setSearch(false); searchToggle.focus(); });

  searchInput.addEventListener('input', () => applyProductSearch(searchInput.value));
  searchInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const target = $('#featured') || $('.product-grid');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('open')) setMenu(false, true);
    if (searchPanel.classList.contains('open')) { setSearch(false); searchToggle.focus(); }
  });
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && nav.classList.contains('open')) setMenu(false);
  }, { passive: true });

  /* Product search. Homepage: rebuilds the carousel with matches. Sub-pages: hides grid cards. */
  function applyProductSearch(query) {
    const q = query.trim().toLowerCase();
    let count = 0;
    if (featuredApi) {
      count = featuredApi.setFilter(q);
    } else {
      $$('.product-grid .product-card').forEach(card => {
        const hit = !q || `${card.dataset.name} ${card.dataset.category} ${card.dataset.desc}`.toLowerCase().includes(q);
        card.hidden = !hit;
        if (hit) count++;
      });
      const empty = $('#gridEmpty');
      if (empty) empty.hidden = count > 0 || !q;
    }
    if (searchStatus) {
      searchStatus.textContent = q
        ? (count ? `${count} product${count === 1 ? '' : 's'} found` : 'No products found')
        : '';
    }
  }

  /* Direction-aware header: hide on scroll down, reveal on scroll up, always visible at the top.
     Small deltas (< 6px) are ignored so the header doesn't flicker on trackpads or touch jitter. */
  let lastY = window.scrollY;
  let headerTicking = false;
  function updateHeader() {
    headerTicking = false;
    const y = window.scrollY;
    const dy = y - lastY;
    header.classList.toggle('is-scrolled', y > 20);
    const locked = nav.classList.contains('open') || searchPanel.classList.contains('open') || header.contains(document.activeElement);
    if (y < 24 || locked || dy < -6) {
      header.classList.remove('is-hidden');
    } else if (dy > 6 && y > 120) {
      header.classList.add('is-hidden');
    }
    if (Math.abs(dy) > 6 || y < 24) lastY = y;
  }
  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      headerTicking = true;
      requestAnimationFrame(updateHeader);
    }
  }, { passive: true });

  /* ---------- Demo cart & wishlist (no backend: nothing is purchased or saved) ---------- */
  const wishlist = new Set();
  let cartCount = 0;
  const cartCountEl = $('#cartCount');
  const cartButton = $('#cartButton');

  function syncWishlist(id) {
    const on = wishlist.has(id);
    $$(`.wishlist[data-id="${id}"]`).forEach(btn => {
      const name = btn.closest('.product-card')?.dataset.name || 'product';
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', `${on ? 'Remove' : 'Add'} ${name} ${on ? 'from' : 'to'} wishlist`);
      btn.textContent = on ? '♥' : '♡';
    });
  }
  function syncAllWishlist() {
    $$('.wishlist').forEach(btn => syncWishlist(btn.dataset.id));
  }

  function addToCart(btn) {
    cartCount += 1;
    cartCountEl.textContent = cartCount;
    cartButton.setAttribute('aria-label', `Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`);
    const label = btn.querySelector('.cta-label');
    btn.classList.add('is-added');
    label.textContent = 'Added to cart';
    setTimeout(() => {
      btn.classList.remove('is-added');
      label.textContent = 'Add to Cart';
    }, 1600);
    toast(`Added to demo cart · ${cartCount} item${cartCount === 1 ? '' : 's'}`);
  }

  // One delegated listener covers the original cards AND the carousel copies made by JS.
  document.addEventListener('click', e => {
    const wish = e.target.closest('.wishlist');
    if (wish) {
      e.preventDefault();
      const id = wish.dataset.id;
      if (wishlist.has(id)) wishlist.delete(id); else wishlist.add(id);
      syncWishlist(id);
      toast(wishlist.has(id) ? 'Saved to wishlist (demo)' : 'Removed from wishlist');
      return;
    }
    const add = e.target.closest('.add-cart');
    if (add && !add.disabled) addToCart(add);
  });

  $('#wishlistButton').addEventListener('click', () => toast('Tap ♡ on any product to save it (demo).'));
  cartButton.addEventListener('click', () => {
    toast(`Demo cart: ${cartCount} item${cartCount === 1 ? '' : 's'}. Checkout is not connected yet.`);
  });

  /* ---------- Newsletter & WhatsApp (demo until a service is connected) ---------- */
  const newsletterForm = $('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!newsletterForm.checkValidity()) {
        $('#newsletterMessage').textContent = 'Please enter a valid email address.';
        newsletterForm.querySelector('input').focus();
        return;
      }
      $('#newsletterMessage').textContent = 'Demo only — nothing was subscribed. Connect an email service to activate.';
      newsletterForm.reset();
    });
  }
  $$('[data-whatsapp]').forEach(btn => btn.addEventListener('click', () => {
    if (CONFIG.whatsappNumber) {
      window.open(`https://wa.me/${CONFIG.whatsappNumber}`, '_blank', 'noopener');
    } else {
      toast('WhatsApp chat is not connected yet (demo).');
    }
  }));

  /* ---------- Editorial social gallery controls (arrows + pointer drag) ---------- */
  const socialGallery = $('#socialGallery');
  if (socialGallery) {
    const moveGallery = direction => socialGallery.scrollBy({ left: direction * Math.max(220, socialGallery.clientWidth * 0.72), behavior: 'smooth' });
    $('#socialPrev')?.addEventListener('click', () => moveGallery(-1));
    $('#socialNext')?.addEventListener('click', () => moveGallery(1));
    let dragging = false, startX = 0, startScroll = 0;
    socialGallery.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true; startX = event.clientX; startScroll = socialGallery.scrollLeft;
      socialGallery.setPointerCapture?.(event.pointerId);
    });
    socialGallery.addEventListener('pointermove', event => {
      if (!dragging) return;
      socialGallery.scrollLeft = startScroll - (event.clientX - startX);
    });
    const stopDrag = () => { dragging = false; };
    socialGallery.addEventListener('pointerup', stopDrag);
    socialGallery.addEventListener('pointercancel', stopDrag);
    socialGallery.addEventListener('lostpointercapture', stopDrag);
  }

  /* ---------- Missing images: hide the broken icon/alt text, keep the layout box ---------- */
  document.addEventListener('error', e => {
    if (e.target instanceof HTMLImageElement) e.target.classList.add('is-missing');
  }, true);

  /* ---------- Intro loader: first visit per session only ---------- */
  function initLoader() {
    const loader = $('#loader');
    if (!loader) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem('2xab-intro') === '1';
      sessionStorage.setItem('2xab-intro', '1');
    } catch (_) { /* storage blocked: just show the loader */ }
    if (seen || reducedMotion.matches) {
      loader.remove();
      document.body.classList.remove('loading');
      return;
    }
    const bar = $('#loaderBar');
    const percent = $('#loaderPercent');
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.ceil(Math.random() * 13));
      bar.style.width = progress + '%';
      percent.textContent = progress + '%';
      if (progress === 100) {
        clearInterval(timer);
        setTimeout(() => {
          loader.classList.add('done');
          document.body.classList.remove('loading');
        }, 250);
      }
    }, 70);
  }

  /* ---------- Scroll reveal (IntersectionObserver). Elements stay visible if JS or IO is unavailable. ---------- */
  function initReveal() {
    const items = [];
    // Groups stagger their children; solo targets reveal once.
    ['.category-grid', '.social-grid', '.feature-list', '.product-grid'].forEach(groupSel => {
      $$(groupSel).forEach(group => {
        [...group.children].forEach((child, i) => {
          child.classList.add('reveal');
          child.style.setProperty('--reveal-delay', `${Math.min(i, 5) * CONFIG.revealStagger}ms`);
          items.push(child);
        });
      });
    });
    const solo = ['.section-intro', '.featured-heading', '.featured-marquee', '.featured-controls',
      '.preview-copy', '.preview-stage', '.story-copy', '.brand-values-copy', '.brand-values-image', '.brand-values-list',
      '.social-title', '.page-hero', '.legal'];
    $$(solo.join(',')).forEach(el => { el.classList.add('reveal'); items.push(el); });

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  }

  /* ---------- Logo marquees: fill each row with enough copies to cover the viewport ----------
     Each row has two identical .logo-group children. CSS moves the track by -50%, which lands
     exactly on the twin, so the loop has no seam. Rebuilt on resize. */
  function initLogoMarquees() {
    $$('.logo-marquee').forEach(marquee => {
      const track = $('.logo-marquee-track', marquee);
      const original = track.querySelector('.brand-strip');
      if (!original) return;
      const build = () => {
        track.replaceChildren(original.cloneNode(true));
        const unit = track.firstElementChild.getBoundingClientRect().width || window.innerWidth;
        let copies = Math.max(2, Math.ceil(window.innerWidth / unit) + 2);
        if (copies % 2) copies++;
        for (let i = 1; i < copies; i++) track.appendChild(original.cloneNode(true));
      };
      build();
      let timer;
      window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(build, 180); }, { passive: true });
    });
  }

  /* ---------- Shoe frame sequence ----------
     Scroll position inside #shoe-animation maps linearly onto frames 1…N.
     · Frames try assets/frames/ first, then the legacy assets/frame/ folder.
     · Frame 1 is probed first. If it is missing, the sequence is marked unavailable: the
       fallback panel is shown and no other frame requests are made (no 404 storm).
     · Frames preload in small batches; frames near the current position load first.
     · The animation loop only runs while the displayed frame is still easing to its target. */
  function initShoeSequence() {
    const section = $('#shoe-animation');
    const canvas = $('#heroCanvas');
    const fallback = $('#heroFallback');
    if (!section || !canvas) return;

    const N = CONFIG.frameCount;
    const reduced = reducedMotion.matches;
    const ctx = canvas.getContext('2d', { alpha: false });
    const frames = new Array(N).fill(null);
    const state = new Uint8Array(N);          // 0 = idle, 1 = loading, 2 = ready, 3 = failed
    let available = true;
    let preloadStarted = false;
    let preloadCursor = 1;
    let target = 0, current = 0, drawn = -1;
    let cw = 1, ch = 1, rafId = 0;

    const pathsFor = i => {
      const name = `frame_${String(i + 1).padStart(3, '0')}.jpg`;
      return [`assets/frames/${name}`, `assets/frame/${name}`, name];
    };
    const showFallback = show => fallback && fallback.classList.toggle('is-visible', show);

    function loadFrame(i) {
      if (!available || i < 0 || i >= N || state[i]) return;
      state[i] = 1;
      const img = new Image();
      img.decoding = 'async';
      const paths = pathsFor(i);
      let next = 0;
      const tryNext = () => {
        if (next >= paths.length) {
          state[i] = 3;
          if (i === 0) { available = false; showFallback(true); }
          return;
        }
        img.src = paths[next++];
      };
      img.onload = () => {
        state[i] = 2;
        frames[i] = img;
        if (i === 0) {
          showFallback(false);
          if (!reduced) preloadRest();
        }
        if (Math.abs(i - Math.round(current)) <= 2) draw(true);
      };
      img.onerror = tryNext;
      tryNext();
    }

    function preloadRest() {
      if (preloadStarted) return;
      preloadStarted = true;
      const batch = () => {
        const end = Math.min(N, preloadCursor + 6);
        for (; preloadCursor < end; preloadCursor++) loadFrame(preloadCursor);
        if (preloadCursor < N && available) setTimeout(batch, 60);
      };
      batch();
    }

    function prioritize(center) {
      for (let d = -3; d <= 3; d++) loadFrame(center + d);
    }

    // Nearest loaded frame, so a slow network shows the closest frame instead of a blank canvas.
    function nearestLoaded(i) {
      if (frames[i]) return i;
      for (let d = 1; d < N; d++) {
        if (frames[i - d]) return i - d;
        if (frames[i + d]) return i + d;
      }
      return -1;
    }

    // Cover-fit the frame into the canvas, centred.
    function draw(force = false) {
      if (!canvas.width) return;
      const idx = nearestLoaded(clamp(Math.round(current), 0, N - 1));
      if (idx < 0 || (idx === drawn && !force)) return;
      const img = frames[idx];
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = idx;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);   // capped to keep mobile GPUs happy
      cw = Math.max(1, Math.round(rect.width * dpr));
      ch = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      draw(true);
    }

    // Scroll progress through the sticky section, 0 → 1, mapped to frame 0 → N-1.
    function computeTarget() {
      if (reduced) { target = 0; return; }
      const range = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = clamp(-section.getBoundingClientRect().top / range, 0, 1);
      target = progress * (N - 1);
    }

    function tick() {
      rafId = 0;
      computeTarget();
      prioritize(Math.round(target));
      const diff = target - current;
      current = Math.abs(diff) < 0.02 ? target : current + diff * CONFIG.frameEase;
      draw(false);
      if (current !== target) schedule();
    }
    function schedule() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    resize();
    loadFrame(0);
    computeTarget();
    current = target;                         // no easing on first paint (page may load mid-scroll)
    draw(true);

    if (!reduced) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { resize(); schedule(); }, { passive: true });
  }

  /* ---------- Featured carousel (homepage) ----------
     · The track moves via translate3d in JS. Loop length = one measured product set.
     · Copies of the set are generated until they cover the viewport plus one full loop.
     · Only the first copy is focusable; the others are aria-hidden and inert.
     · Pauses on mouse hover, keyboard focus, touch drag, or the Pause button, and when off-screen.
     · The card nearest the centre gets .is-center (scaled up in CSS).
     · Reduced motion: no animation; the cards become a horizontally scrollable row. */
  function initFeatured() {
    const marquee = $('#featuredMarquee');
    const track = $('#featuredTrack');
    if (!marquee || !track) return;

    const templates = Array.from(track.children, card => card.cloneNode(true));
    const toggleBtn = $('#featuredToggle');
    const emptyMsg = $('#featuredEmpty');
    const reduced = reducedMotion.matches;
    const searchKey = card => `${card.dataset.name} ${card.dataset.category} ${card.dataset.desc}`.toLowerCase();

    let phase = 0;           // px travelled along one loop, 0 … setWidth
    let setWidth = 1;        // px length of one full product set (= loop length)
    let step = 1;            // card width + gap
    let cardWidth = 1;
    let padLeft = 0;
    let centerIndex = -1;
    let visible = true;
    let hovering = false, focusInside = false, dragging = false, userPaused = false;
    let dragX = 0, lastTime = 0, rafId = 0, resizeTimer = 0;
    const pagination = $('#featuredPagination');
    const prevBtn = $('#featuredPrev'), nextBtn = $('#featuredNext');
    function buildDots(count) {
      if (!pagination) return;
      pagination.replaceChildren();
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button'); dot.type = 'button'; dot.className = 'featured-dot';
        dot.setAttribute('aria-label', `Go to featured shoe ${i + 1}`); dot.setAttribute('aria-current', 'false');
        dot.addEventListener('click', () => { phase = (i * step) % setWidth; apply(); });
        pagination.appendChild(dot);
      }
    }

    const isPaused = () => userPaused || hovering || focusInside || dragging;

    // live = true only for the copy keyboard/screen-reader users can reach; every other copy is hidden from AT.
    function appendSet(list, live) {
      list.forEach(template => {
        const card = template.cloneNode(true);
        if (!live) {
          card.setAttribute('aria-hidden', 'true');
          card.setAttribute('inert', '');
        }
        track.appendChild(card);
      });
    }

    function render(list) {
      track.replaceChildren();
      centerIndex = -1;
      if (emptyMsg) emptyMsg.hidden = list.length > 0;
      if (!list.length) return;

      // Measure with one set first (card width and gap come from CSS, unaffected by transforms).
      appendSet(list, true);
      const cs = getComputedStyle(track);
      padLeft = parseFloat(cs.paddingLeft) || 0;
      const gap = parseFloat(cs.columnGap) || 0;
      cardWidth = track.firstElementChild.offsetWidth;
      step = cardWidth + gap;
      setWidth = list.length * step;
      phase %= setWidth;
      buildDots(list.length);
      track.replaceChildren();

      // Layout: [prefix copy] [live copy] [more copies…]. The prefix covers the left edge while the
      // track is translated; the translate is -(setWidth + phase), so the visible window always sits
      // inside the generated copies. Wrapping the phase by one setWidth maps every card onto the
      // identical card one period later, which is why the loop has no seam.
      const copies = reduced ? 1 : Math.max(3, Math.ceil(window.innerWidth / setWidth) + 3);
      const liveIndex = reduced ? 0 : 1;
      for (let c = 0; c < copies; c++) appendSet(list, c === liveIndex);
      refreshWishlistUI();
      apply();
    }

    // Move the track, then mark the card nearest the viewport centre.
    // Card e sits at padLeft + e*step - (setWidth + phase) in the marquee, so solve for e.
    function apply() {
      if (reduced) return;
      track.style.transform = `translate3d(${-(setWidth + phase)}px,0,0)`;
      const n = track.children.length;
      if (!n) return;
      const centre = marquee.clientWidth / 2;
      const k = clamp(Math.round((centre - padLeft - cardWidth / 2 + setWidth + phase) / step), 0, n - 1);
      if (k !== centerIndex) {
        if (track.children[centerIndex]) track.children[centerIndex].classList.remove('is-center');
        track.children[k].classList.add('is-center');
        centerIndex = k;
      }
      if (pagination && listLengthSafe()) {
        const dots = Array.from(pagination.children);
        const active = Math.floor((phase + step / 2) / step) % dots.length;
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
      }
    }
    function listLengthSafe() { return pagination && pagination.children.length > 0; }

    function tick(time) {
      rafId = 0;
      const dt = lastTime ? Math.min(64, time - lastTime) : 16;   // cap: no jump after a tab switch
      lastTime = time;
      if (!isPaused() && visible && setWidth > 0) {
        phase = (phase + CONFIG.featuredSpeed * dt / 1000) % setWidth;
      }
      apply();
      if (visible) schedule(); else lastTime = 0;
    }
    function schedule() {
      if (!reduced && !rafId) rafId = requestAnimationFrame(tick);
    }

    // Pause sources
    marquee.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
    const nudge = direction => { phase = (((phase + direction * step) % setWidth) + setWidth) % setWidth; apply(); schedule(); };
    prevBtn?.addEventListener('click', () => nudge(-1));
    nextBtn?.addEventListener('click', () => nudge(1));
    marquee.addEventListener('wheel', e => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); nudge(e.deltaY > 0 ? 1 : -1); }
      else if (e.deltaX) { e.preventDefault(); phase = (((phase + e.deltaX) % setWidth) + setWidth) % setWidth; apply(); schedule(); }
    }, { passive: false });
    marquee.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hovering = false; });
    marquee.addEventListener('focusin', () => { focusInside = true; });
    marquee.addEventListener('focusout', e => { if (!marquee.contains(e.relatedTarget)) focusInside = false; });

    // Touch drag: move the row by hand (mouse is handled by hover-pause instead).
    marquee.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || reduced) return;
      dragging = true;
      dragX = e.clientX;
      schedule();
    });
    marquee.addEventListener('pointermove', e => {
      if (!dragging) return;
      phase = (((phase - (e.clientX - dragX)) % setWidth) + setWidth) % setWidth;
      dragX = e.clientX;
    });
    const endDrag = () => { dragging = false; };
    marquee.addEventListener('pointerup', endDrag);
    marquee.addEventListener('pointercancel', endDrag);

    if (toggleBtn) {
      if (reduced) toggleBtn.hidden = true;
      toggleBtn.addEventListener('click', () => {
        userPaused = !userPaused;
        toggleBtn.textContent = userPaused ? 'Play motion' : 'Pause motion';
        schedule();
      });
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
      }).observe(marquee);
    }

    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth) return;  // ignore mobile address-bar height changes
        lastWidth = window.innerWidth;
        render(currentList);
      }, 150);
    }, { passive: true });

    // Search API used by the header search box.
    let currentList = templates;
    featuredApi = {
      setFilter(query) {
        currentList = query ? templates.filter(t => searchKey(t).includes(query)) : templates;
        render(currentList);
        return currentList.length;
      }
    };

    render(templates);
    schedule();
  }

  /* Re-apply wishlist state to freshly built cards (carousel rebuilds clone the templates). */
  function refreshWishlistUI() { syncAllWishlist(); }

  /* ---------- 3D product preview (homepage) ---------- */
  function initPreview() {
    const stage = $('#previewStage');
    const shoe = $('#previewShoe');
    if (!stage || !shoe) return;

    // Angle presets, indexed by data-angle on the buttons.
    const ANGLES = ['', 'rotate(8deg) scaleX(.96)', 'rotate(180deg) scaleX(.9)', 'scaleY(-1)'];
    const view = { angle: 0, rotY: 0, zoom: 1 };
    const render = () => {
      const tilt = Math.sin(view.rotY / 50) * 5;
      shoe.style.transform = `perspective(600px) rotateY(${view.rotY}deg) rotateX(${tilt}deg) ${ANGLES[view.angle]} scale(${view.zoom})`;
    };

    const buttons = $$('.view-angle');
    buttons.forEach(btn => btn.addEventListener('click', () => {
      view.angle = Number(btn.dataset.angle);
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      render();
    }));

    let dragging = false, lastX = 0;
    stage.addEventListener('pointerdown', e => {
      dragging = true;
      lastX = e.clientX;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      view.rotY += (e.clientX - lastX) * 0.7;
      lastX = e.clientX;
      render();
    });
    const stopDrag = () => { dragging = false; };
    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);

    // Ctrl/⌘ + wheel zooms; plain wheel still scrolls the page (no scroll trap).
    stage.addEventListener('wheel', e => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      view.zoom = clamp(view.zoom + (e.deltaY < 0 ? 0.05 : -0.05), 0.75, 1.25);
      render();
    }, { passive: false });

    // Keyboard: arrows rotate, +/- zoom.
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') view.rotY -= 8;
      else if (e.key === 'ArrowRight') view.rotY += 8;
      else if (e.key === '+' || e.key === '=') view.zoom = clamp(view.zoom + 0.05, 0.75, 1.25);
      else if (e.key === '-') view.zoom = clamp(view.zoom - 0.05, 0.75, 1.25);
      else return;
      e.preventDefault();
      render();
    });
  }

  /* ---------- Boot ---------- */
  initLoader();
  initReveal();
  initLogoMarquees();
  initShoeSequence();
  initFeatured();
  initPreview();
  updateHeader();
})();
