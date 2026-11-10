/* Monsoon Whispers - homepage behaviour */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* 1. Sticky header shadow + mobile menu */
  var header = $('#header'), burger = $('#burger'), nav = $('#nav');
  header.classList.toggle('is-stuck', window.scrollY > 40);
  window.addEventListener('scroll', function () {
    header.classList.toggle('is-stuck', window.scrollY > 40);
  }, { passive: true });
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* 2. Highlight current section in nav */
  var navLinks = $$('a', nav);
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['destinations', 'adventures', 'levels', 'kerala', 'journal', 'about'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* 3. Hero slideshow */
  var slides = $$('.hero__slide'), dotsWrap = $('#heroDots'), idx = 0, timer;
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show image ' + (i + 1));
    b.addEventListener('click', function () { show(i); restart(); });
    dotsWrap.appendChild(b);
  });
  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === idx); });
    $$('button', dotsWrap).forEach(function (d, n) { d.classList.toggle('is-active', n === idx); });
  }
  function restart() {
    clearInterval(timer);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timer = setInterval(function () { show(idx + 1); }, 6000);
    }
  }
  show(0); restart();

  /* 4. Trip filters */
  var trips = $$('.trip'), tripsEmpty = $('#tripsEmpty');
  var state = { tab: 'popular', text: '', activity: '', level: '' };
  var LIMIT = 5, expanded = false, moreBtn = $('#moreTrips');
  moreBtn.addEventListener('click', function () { expanded = !expanded; applyFilters(); });

  function applyFilters() {
    var shown = 0;
    trips.forEach(function (t) {
      var hay = (t.textContent + ' ' + t.dataset.tags).toLowerCase();
      var ok = t.dataset.tabs.split(' ').indexOf(state.tab) > -1 &&
        (!state.text || hay.indexOf(state.text) > -1) &&
        (!state.activity || t.dataset.tags.indexOf(state.activity) > -1) &&
        (!state.level || t.dataset.level === state.level);
      t.hidden = !ok;
      if (ok) shown++;
    });
    var idx = 0;
    trips.forEach(function (t) {
      if (t.hidden) { t.classList.remove('is-extra', 'is-feature'); return; }
      t.classList.toggle('is-feature', idx === 0);
      t.classList.toggle('is-extra', !expanded && idx >= LIMIT);
      idx++;
    });
    tripsEmpty.hidden = shown !== 0;
    moreBtn.hidden = shown <= LIMIT;
    moreBtn.textContent = expanded ? 'Show fewer' : 'Show all ' + shown + ' adventures';
    moreBtn.setAttribute('aria-expanded', String(expanded));
    return shown;
  }

  applyFilters();

  /* Tabs */
  var tabs = $$('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      state.tab = tab.dataset.tab;
      applyFilters();
    });
  });

  /* Activity tiles and level cards set filters */
  function setFilter(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    state.tab = 'all';
    trips.forEach(function (t) { if (t.dataset.tabs.indexOf('all') === -1) t.dataset.tabs += ' all'; });
    tabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
    applyFilters();
  }
  $$('.act').forEach(function (a) {
    a.addEventListener('click', function () { setFilter({ activity: a.dataset.filter, level: '', text: '' }); });
  });
  $$('.lvl').forEach(function (l) {
    l.addEventListener('click', function () { setFilter({ level: l.dataset.level, activity: '', text: '' }); });
  });

  /* 5. Save trip hearts (remembered in localStorage) */
  var saved = [];
  try { saved = JSON.parse(localStorage.getItem('mw-saved') || '[]'); } catch (e) { saved = []; }
  $$('.heart').forEach(function (h, i) {
    var title = h.closest('.trip').querySelector('h3').textContent;
    if (saved.indexOf(title) > -1) h.setAttribute('aria-pressed', 'true');
    h.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var on = h.getAttribute('aria-pressed') !== 'true';
      h.setAttribute('aria-pressed', String(on));
      saved = saved.filter(function (s) { return s !== title; });
      if (on) saved.push(title);
      try { localStorage.setItem('mw-saved', JSON.stringify(saved)); } catch (err) { /* storage blocked */ }
    });
  });

  /* 6. Mood chips */
  var moods = $$('.mood');
  moods.forEach(function (m) {
    m.addEventListener('click', function () {
      moods.forEach(function (x) {
        var on = x === m;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', String(on));
      });
    });
  });

  /* 7. Forms (front-end validation; wire the fetch() to your backend or WhatsApp API) */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validContact(v) { return validEmail(v) || /^\+?[0-9\s-]{8,15}$/.test(v); }

  $('#planForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#planMsg'), ok = true;
    [f.name, f.contact].forEach(function (i) { i.classList.remove('is-error'); });
    if (!f.name.value.trim()) { f.name.classList.add('is-error'); ok = false; }
    if (!validContact(f.contact.value.trim())) { f.contact.classList.add('is-error'); ok = false; }
    msg.className = 'form__msg ' + (ok ? 'is-ok' : 'is-bad');
    if (!ok) { msg.textContent = 'Please add your name and a valid WhatsApp number or email.'; return; }
    var mood = ($('.mood.is-active') || {}).textContent || '';
    var payload = {
      name: f.name.value.trim(), contact: f.contact.value.trim(),
      interest: f.interest.value.trim(), month: f.month.value.trim(), mood: mood
    };
    /* fetch('/api/enquiry', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }) */
    console.log('Enquiry', payload);
    msg.textContent = 'Thank you, ' + payload.name.split(' ')[0] + '. An expert will reach out soon.';
    f.reset();
  });

  $('#newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#newsMsg');
    var ok = validEmail(f.email.value.trim());
    f.email.classList.toggle('is-error', !ok);
    msg.className = 'form__msg form__msg--light ' + (ok ? 'is-ok' : 'is-bad');
    msg.textContent = ok ? 'You are in. Watch your inbox.' : 'Please enter a valid email address.';
    if (ok) f.reset();
  });

  /* 8. Count-up for the trust number */
  var counter = $('[data-count]');
  if (counter && 'IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      cObs.disconnect();
      var target = +counter.dataset.count, suffix = counter.dataset.suffix || '', start = null;
      function step(ts) {
        start = start || ts;
        var p = Math.min((ts - start) / 1200, 1);
        counter.textContent = Math.round(target * p).toLocaleString('en-IN') + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    cObs.observe(counter);
  }

  /* 9. Reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rObs.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (r) { rObs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  }

  /* 10. Image fallback: if an Unsplash link ever fails, show a neutral block */
  $$('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.visibility = 'hidden';
      if (img.parentElement) img.parentElement.style.background = '#26302d';
    }, { once: true });
  });
})();


/* Creative scroll effects */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var vh = window.innerHeight, vw = window.innerWidth;

  /* Hero parallax */
  var hero = $('.hero__frame'), slides = $('#heroSlides'), heroContent = $('.hero__content');
  function heroFx(y) {
    if (reduced || !hero) return;
    var h = hero.offsetHeight;
    if (y > h) return;
    slides.style.transform = 'translate3d(0,' + Math.min(y * 0.2, h * 0.12) + 'px,0)';
    heroContent.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
    heroContent.style.opacity = String(clamp(1 - y / (h * 0.7), 0, 1));
  }

  /* Rain over the hero */
  (function () {
    var cv = $('#rain');
    if (!cv || reduced) return;
    var ctx = cv.getContext('2d'), w = 0, h = 0, d = 1, drops = [], running = false;
    function size() {
      var r = cv.getBoundingClientRect();
      d = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.width = Math.round(r.width * d); h = cv.height = Math.round(r.height * d);
      var n = clamp(Math.round((r.width * r.height) / 11000), 40, 140);
      drops = [];
      for (var i = 0; i < n; i++) drops.push(make(true));
    }
    function make(any) {
      return { x: Math.random() * w, y: any ? Math.random() * h : -20, l: (10 + Math.random() * 18) * d, s: (9 + Math.random() * 10) * d, a: 0.12 + Math.random() * 0.2 };
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = d;
      drops.forEach(function (p) {
        ctx.strokeStyle = 'rgba(255,255,255,' + p.a + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.l * 0.18, p.y + p.l); ctx.stroke();
        p.y += p.s; p.x -= p.s * 0.18;
        if (p.y > h || p.x < -20) { p.x = Math.random() * (w + 80); p.y = -p.l; }
      });
      requestAnimationFrame(frame);
    }
    size();
    window.addEventListener('resize', size);
    new IntersectionObserver(function (e) {
      running = e[0].isIntersecting;
      if (running) requestAnimationFrame(frame);
    }).observe(cv);
  })();

  /* Statement: words light up with scroll */
  var st = $('#statementText'), words = [];
  if (st) {
    var keys = (st.dataset.key || '').split(',');
    var parts = st.textContent.trim().split(/\s+/);
    st.textContent = '';
    parts.forEach(function (w) {
      var s = document.createElement('span');
      s.className = 'w' + (keys.indexOf(w.toLowerCase().replace(/[^a-z]/g, '')) > -1 ? ' key' : '');
      s.textContent = w + ' ';
      st.appendChild(s); words.push(s);
    });
  }
  function statementFx() {
    if (!st) return;
    var r = st.getBoundingClientRect();
    var p = reduced ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    var n = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
  }

  /* Marquee rows move with scroll */
  var rows = $$('.marquee__row'), halves = [];
  function setupMarquee() {
    rows.forEach(function (row, i) {
      if (!row.dataset.cloned) {
        row.innerHTML += row.innerHTML; row.dataset.cloned = '1';
      }
      halves[i] = row.scrollWidth / 2;
    });
  }
  function marqueeFx(y) {
    if (reduced) return;
    rows.forEach(function (row, i) {
      if (!halves[i]) return;
      var off = (y * 0.5) % halves[i];
      var dir = +row.dataset.dir;
      row.style.transform = 'translate3d(' + (dir < 0 ? -off : off - halves[i]) + 'px,0,0)';
    });
  }

  /* Destinations: pinned story */
  var story = $('#destinations'), simgs = $$('.story__imgs img'), sitems = $$('#storyList li'),
      snum = $('#storyNum'), sbar = $('#storyBar'), sIdx = -1;
  function storyFx() {
    if (!story) return;
    var r = story.getBoundingClientRect(), total = story.offsetHeight - vh;
    var p = clamp(-r.top / total, 0, 1);
    var i = Math.min(sitems.length - 1, Math.floor(p * sitems.length));
    sbar.style.width = (p * 100) + '%';
    if (i === sIdx) return;
    sIdx = i;
    simgs.forEach(function (im, n) { im.classList.toggle('is-active', n === i); });
    sitems.forEach(function (li, n) { li.classList.toggle('is-active', n === i); });
    snum.textContent = '0' + (i + 1);
  }
  sitems.forEach(function (li, i) {
    $('button', li).addEventListener('click', function () {
      var r = story.getBoundingClientRect(), total = story.offsetHeight - vh;
      window.scrollTo({ top: window.scrollY + r.top + ((i + 0.5) / sitems.length) * total, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* Signature banner grows to full width */
  var sig = $('.sigx');
  function sigFx() {
    if (!sig) return;
    var r = sig.getBoundingClientRect();
    sig.style.setProperty('--p', reduced ? 1 : clamp((vh - r.top) / (vh * 0.9), 0, 1).toFixed(3));
  }

  /* Gallery: vertical scroll becomes sideways scroll */
  var hg = $('#gallery'), track = $('#hgalTrack');
  function hgalSetup() {
    if (!hg) return;
    if (vw > 960) hg.style.height = (track.scrollWidth - vw + vh) + 'px';
    else { hg.style.height = ''; track.style.transform = ''; }
  }
  function hgalFx() {
    if (!hg || vw <= 960) return;
    var r = hg.getBoundingClientRect(), total = hg.offsetHeight - vh;
    var p = clamp(-r.top / total, 0, 1);
    track.style.transform = 'translate3d(' + (-p * (track.scrollWidth - vw)) + 'px,0,0)';
  }

  /* Altitude meter: 0 m to Kilimanjaro's summit */
  var alt = $('#alt'), altVal = $('#altVal'), altFill = $('#altFill');
  function altFx(y) {
    if (!alt) return;
    var max = document.documentElement.scrollHeight - vh;
    var p = max > 0 ? clamp(y / max, 0, 1) : 0;
    alt.classList.toggle('is-on', y > 300);
    altVal.textContent = Math.round(p * 5895).toLocaleString('en-US') + ' m';
    altFill.style.height = (p * 100) + '%';
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    heroFx(y); statementFx(); marqueeFx(y); storyFx(); sigFx(); hgalFx(); altFx(y);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function layout() {
    vh = window.innerHeight; vw = window.innerWidth;
    setupMarquee(); hgalSetup(); update();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();


/* Signature count-up and reviews slider */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var num = $('#sigNum');
  if (num && !reduced && 'IntersectionObserver' in window) {
    var target = 5895, started = false;
    num.textContent = '0';
    new IntersectionObserver(function (en, obs) {
      if (!en[0].isIntersecting || started) return;
      started = true; obs.disconnect();
      var t0 = null;
      (function step(ts) {
        t0 = t0 || ts;
        var p = Math.min((ts - t0) / 2200, 1), e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(target * e).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.35 }).observe(num);
  }

  var items = $$('.rev__item'), dots = $('#revDots'), i = 0, timer;
  if (!items.length) return;
  items.forEach(function (_, n) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Show review ' + (n + 1));
    b.addEventListener('click', function () { go(n); restart(); });
    dots.appendChild(b);
  });
  function go(n) {
    i = (n + items.length) % items.length;
    items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); it.setAttribute('aria-hidden', String(k !== i)); });
    $$('button', dots).forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
  }
  function restart() {
    clearInterval(timer);
    if (!reduced) timer = setInterval(function () { go(i + 1); }, 7000);
  }
  $('#revPrev').addEventListener('click', function () { go(i - 1); restart(); });
  $('#revNext').addEventListener('click', function () { go(i + 1); restart(); });
  var stage = $('#revStage');
  stage.addEventListener('mouseenter', function () { clearInterval(timer); });
  stage.addEventListener('mouseleave', restart);
  go(0); restart();
})();

/* Section dividers: a different landscape for each transition */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AMBER = '#e8a23a', W = 1440, H = 170;
  var seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function P(d, fill, cls, extra) { return '<path' + (cls ? ' class="' + cls + '"' : '') + ' fill="' + fill + '" d="' + d + '"' + (extra || '') + '/>'; }

  var make = {
    /* Himalaya: layered peaks + trail to a summit flag */
    peaks: function (c) {
      return P('M0 170V95L110 62L210 88L340 30L460 74L590 46L710 84L850 34L975 66L1100 40L1215 78L1335 34L1440 62V170Z', c, 'l-back', ' opacity=".28"') +
        P('M0 170V116L95 98L205 124L330 82L440 108L565 72L690 114L805 88L935 120L1055 78L1185 108L1305 92L1440 118V170Z', c, 'l-mid', ' opacity=".55"') +
        '<path class="trail" d="M140 160Q300 140 420 116T640 92T790 62L850 36"/><line class="pole" x1="850" y1="36" x2="850" y2="10"/>' + P('M850 10L874 17L850 24Z', AMBER) +
        P('M0 170V140C150 124 265 150 400 132S655 116 785 136S1055 150 1205 128S1385 134 1440 142V170Z', c);
    },
    /* Kerala: drifting backwater waves */
    waves: function (c) {
      var out = '';
      [[240, 9, 88, .3, 22], [180, 7, 112, .55, 15], [160, 6, 136, 1, 10]].forEach(function (L, k) {
        var d = 'M0 ' + H;
        for (var x = 0; x <= W * 2; x += 10) d += 'L' + x + ' ' + (L[2] + Math.sin(x / L[0] * Math.PI * 2) * L[1]).toFixed(1);
        d += 'L' + (W * 2) + ' ' + H + 'Z';
        out += '<g class="wv" style="animation-duration:' + L[4] + 's' + (k === 1 ? ';animation-direction:reverse' : '') + '">' + P(d, c, '', ' opacity="' + L[3] + '"') + '</g>';
      });
      return out;
    },
    /* Africa: sun, acacia trees, savanna horizon */
    savanna: function (c) {
      function acacia(x, b, s) {
        return P('M' + (x - 3 * s) + ' ' + b + 'L' + (x - 2 * s) + ' ' + (b - 34 * s) + 'L' + (x - 18 * s) + ' ' + (b - 50 * s) + 'L' + (x - 15 * s) + ' ' + (b - 52 * s) + 'L' + x + ' ' + (b - 40 * s) + 'L' + (x + 16 * s) + ' ' + (b - 54 * s) + 'L' + (x + 19 * s) + ' ' + (b - 51 * s) + 'L' + (x + 3 * s) + ' ' + (b - 34 * s) + 'L' + (x + 3 * s) + ' ' + b + 'Z', c) +
          '<ellipse cx="' + x + '" cy="' + (b - 56 * s) + '" rx="' + (62 * s) + '" ry="' + (11 * s) + '" fill="' + c + '"/>' +
          '<ellipse cx="' + (x + 14 * s) + '" cy="' + (b - 64 * s) + '" rx="' + (34 * s) + '" ry="' + (8 * s) + '" fill="' + c + '"/>';
      }
      return '<circle class="l-back" cx="1060" cy="92" r="52" fill="' + AMBER + '" opacity=".9"/>' +
        P('M0 170V128Q240 104 520 122T1040 112T1440 120V170Z', c, 'l-mid', ' opacity=".3"') +
        P('M0 170V142Q360 124 720 138T1440 132V170Z', c) +
        acacia(250, 142, 1.1) + acacia(470, 138, .6) + acacia(1240, 136, 1.3) + acacia(1380, 134, .5);
    },
    /* Hot-air balloons drifting over hills */
    balloons: function (c) {
      function balloon(x, y, s, col, dur) {
        return '<g class="bob" style="animation-duration:' + dur + 's">' +
          P('M' + (x - 20 * s) + ' ' + y + 'Q' + (x - 24 * s) + ' ' + (y - 38 * s) + ' ' + x + ' ' + (y - 40 * s) + 'Q' + (x + 24 * s) + ' ' + (y - 38 * s) + ' ' + (x + 20 * s) + ' ' + y + 'Q' + (x + 12 * s) + ' ' + (y + 14 * s) + ' ' + (x + 5 * s) + ' ' + (y + 20 * s) + 'L' + (x - 5 * s) + ' ' + (y + 20 * s) + 'Q' + (x - 12 * s) + ' ' + (y + 14 * s) + ' ' + (x - 20 * s) + ' ' + y + 'Z', col) +
          P('M' + x + ' ' + (y - 40 * s) + 'Q' + (x - 8 * s) + ' ' + (y - 10 * s) + ' ' + (x - 3 * s) + ' ' + (y + 20 * s) + 'L' + (x + 3 * s) + ' ' + (y + 20 * s) + 'Q' + (x + 8 * s) + ' ' + (y - 10 * s) + ' ' + x + ' ' + (y - 40 * s) + 'Z', '#ffffff', '', ' opacity=".35"') +
          '<path d="M' + (x - 5 * s) + ' ' + (y + 20 * s) + 'L' + (x - 4 * s) + ' ' + (y + 26 * s) + 'M' + (x + 5 * s) + ' ' + (y + 20 * s) + 'L' + (x + 4 * s) + ' ' + (y + 26 * s) + '" stroke="' + col + '" stroke-width="1.2"/>' +
          '<rect x="' + (x - 4 * s) + '" y="' + (y + 26 * s) + '" width="' + (8 * s) + '" height="' + (6 * s) + '" rx="1" fill="' + col + '"/></g>';
      }
      return balloon(240, 70, 1.1, AMBER, 6) + balloon(520, 46, .6, '#c4553a', 8) + balloon(1150, 60, 1.3, AMBER, 7) + balloon(1330, 34, .55, '#e9e4d8', 9) +
        P('M0 170V120Q200 92 420 116T860 104T1440 112V170Z', c, 'l-mid', ' opacity=".3"') +
        P('M0 170V142Q300 120 640 138T1440 128V170Z', c);
    },
    /* Indian Ocean: palm island on rolling sea */
    island: function (c) {
      function palm(x, b, s, lean) {
        var tx = x + lean * s, ty = b - 70 * s, out = '<path d="M' + x + ' ' + b + 'Q' + (x + lean * .2 * s) + ' ' + (b - 40 * s) + ' ' + tx + ' ' + ty + '" stroke="' + c + '" stroke-width="' + (5 * s) + '" fill="none" stroke-linecap="round"/>';
        [[-46, 8], [-30, -14], [0, -22], [30, -14], [48, 10]].forEach(function (f) {
          out += P('M' + tx + ' ' + ty + 'Q' + (tx + f[0] * .5 * s) + ' ' + (ty + f[1] * s - 14 * s) + ' ' + (tx + f[0] * s) + ' ' + (ty + f[1] * s + 6 * s) + 'Q' + (tx + f[0] * .5 * s) + ' ' + (ty + f[1] * s - 6 * s) + ' ' + tx + ' ' + ty + 'Z', c);
        });
        return '<g class="sway">' + out + '</g>';
      }
      var sea = '';
      [[200, 6, 140, .45, 18], [160, 5, 150, 1, 11]].forEach(function (L, k) {
        var d = 'M0 ' + H;
        for (var x = 0; x <= W * 2; x += 10) d += 'L' + x + ' ' + (L[2] + Math.sin(x / L[0] * Math.PI * 2) * L[1]).toFixed(1);
        sea += '<g class="wv" style="animation-duration:' + L[4] + 's' + (k ? '' : ';animation-direction:reverse') + '">' + P(d + 'L' + W * 2 + ' ' + H + 'Z', c, '', ' opacity="' + L[3] + '"') + '</g>';
      });
      return '<circle class="l-back" cx="300" cy="78" r="40" fill="' + AMBER + '" opacity=".85"/>' +
        P('M960 146Q1060 110 1200 112T1400 146Z', c) + palm(1080, 120, 1.15, 26) + palm(1190, 114, .9, -18) + palm(1290, 124, .7, 14) + sea;
    },
    /* Bhutan: prayer flags fluttering over hills */
    flags: function (c) {
      var cols = ['#2f6fb5', '#f4f1ea', '#c4413a', '#3f8f5a', '#e8b53a'], out = '<path d="M60 50Q720 150 1380 40" stroke="#f4f1ea" stroke-width="1.5" fill="none" opacity=".8"/>';
      for (var i = 1; i < 28; i++) {
        var t = i / 28, x = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 720 + t * t * 1380, y = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 150 + t * t * 40;
        out += '<path class="flutter" style="animation-delay:-' + (i * .23).toFixed(2) + 's" d="M' + (x - 11).toFixed(1) + ' ' + y.toFixed(1) + 'H' + (x + 11).toFixed(1) + 'L' + (x + 9).toFixed(1) + ' ' + (y + 26).toFixed(1) + 'L' + (x - 9).toFixed(1) + ' ' + (y + 26).toFixed(1) + 'Z" fill="' + cols[i % 5] + '"/>';
      }
      return P('M0 170V112L180 84L330 116L520 70L700 112L900 78L1080 118L1260 82L1440 108V170Z', c, 'l-back', ' opacity=".25"') +
        out + '<line x1="60" y1="50" x2="60" y2="150" stroke="#f4f1ea" stroke-width="3"/><line x1="1380" y1="40" x2="1380" y2="150" stroke="#f4f1ea" stroke-width="3"/>' +
        P('M0 170V146Q360 128 720 142T1440 138V170Z', c);
    },
    /* Footer: campsite with tent and a crackling fire */
    camp: function (c) {
      var pines = '';
      for (var x = 10; x < W + 40; x += 34 + rnd() * 30) {
        var h = 40 + rnd() * 50, w = h * .3;
        if (x > 820 && x < 1180) continue;
        pines += 'M' + (x - w).toFixed(0) + ' 150L' + x.toFixed(0) + ' ' + (150 - h).toFixed(0) + 'L' + (x + w).toFixed(0) + ' 150Z';
      }
      return '<g class="l-back" opacity=".3">' + P(pines, c) + '</g>' +
        P('M0 170V146Q360 132 720 144T1440 140V170Z', c) +
        P('M856 152L940 66L1024 152Z', c) + P('M940 66L925 152H955Z', '#ffffff', '', ' opacity=".12"') + P('M940 100L923 152H957Z', AMBER, 'glow', ' opacity=".55"') +
        '<path d="M1080 146L1120 132M1084 132L1124 146" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' +
        '<g class="flame">' + P('M1102 136Q1086 116 1100 92Q1104 110 1112 104Q1122 120 1102 136Z', AMBER) + P('M1102 136Q1094 124 1102 110Q1108 122 1110 120Q1112 130 1102 136Z', '#f6d27a') + '</g>';
    }
  };

  var list = Array.prototype.slice.call(document.querySelectorAll('.peaks'));
  list.forEach(function (el) {
    var st = el.dataset.style || 'peaks', fn = make[st] || make.peaks;
    var keep = (st === 'savanna' || st === 'balloons' || st === 'island' || st === 'camp') ? 'xMidYMax slice' : 'none';
    el.style.background = el.dataset.from;
    el.classList.add('peaks--' + st);
    el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="' + keep + '">' + fn(el.dataset.to) + '</svg>';
  });
  if (reduced || !list.length) return;
  var ticking = false;
  function fx() {
    ticking = false;
    var vh = window.innerHeight;
    list.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top - vh / 2) / vh;
      Array.prototype.forEach.call(el.querySelectorAll('.l-back'), function (n) { n.style.transform = 'translate3d(' + (p * 40) + 'px,' + (p * 14) + 'px,0)'; });
      Array.prototype.forEach.call(el.querySelectorAll('.l-mid'), function (n) { n.style.transform = 'translate3d(' + (p * -24) + 'px,' + (p * 7) + 'px,0)'; });
      Array.prototype.forEach.call(el.querySelectorAll('.trail'), function (n) { n.style.setProperty('--dash', String(p * 120)); });
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(fx); } }, { passive: true });
  fx();
})();


/* Side climber: scales the cliff with scroll progress (smoothed) */
(function () {
  'use strict';
  var wrap = document.getElementById('climb');
  if (!wrap) return;
  var man = document.getElementById('climbMan'), alt = document.getElementById('climbAlt'), rope = document.getElementById('climbRope');
  var camps = Array.prototype.slice.call(wrap.querySelectorAll('.climb__camps li'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, target = 0, lastStep = -1, raf = null;
  function measure() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    wrap.classList.toggle('is-on', window.scrollY > 200);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    raf = null;
    cur += (target - cur) * (reduced ? 1 : 0.12);
    if (Math.abs(target - cur) < 0.0005) cur = target;
    var H = wrap.clientHeight, room = H - man.offsetHeight, y = cur * room;
    man.style.transform = 'translate3d(0,' + (-y) + 'px,0)';
    rope.style.height = Math.max(H - y - 30, 0) + 'px';
    alt.textContent = Math.round(cur * 5895).toLocaleString('en-US') + ' m';
    var step = Math.floor(cur * 160);
    if (step !== lastStep) { wrap.classList.toggle('step', step % 2 === 1); lastStep = step; }
    camps.forEach(function (li) {
      var at = parseFloat(li.style.getPropertyValue('--y')) / 100;
      li.classList.toggle('is-reached', cur >= at - 0.002);
      li.classList.toggle('is-near', Math.abs(cur - at) < 0.06 && at > 0 && at < 1);
    });
    if (cur !== target) raf = requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', measure);
  measure();
})();