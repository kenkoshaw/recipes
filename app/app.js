(() => {
  const view = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');

  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M9 15.5c1.6 1.3 4.4 1.3 6 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2.5h6"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21c-3.9 0-7-2.8-7-6.6 0-4.4 4.2-6.6 4.6-11.4 2.6 1.6 4.7 4.4 5 7.4.8-.6 1.4-1.6 1.6-2.7 1.8 1.6 2.8 3.8 2.8 6.7 0 3.8-3.1 6.6-7 6.6z"/><path d="M12 21c-1.6 0-3-1.2-3-3 0-2 2-3 2.3-5 1.6 1 3.7 2.7 3.7 5 0 1.8-1.4 3-3 3z"/></svg>',
    bowl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 7c0-1.2 1-1.4 1-2.6M14 7c0-1.2 1-1.4 1-2.6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const EMOJI = { breakfast: '🥞', dinner: '🍲', dessert: '🍰', bread: '🍞' };
  const LABEL = { breakfast: 'Breakfast', dinner: 'Dinner', dessert: 'Dessert', bread: 'Bread' };

  tabbar.querySelector('[data-tab="home"]').innerHTML = `${ICONS.home}<span>Home</span>`;
  tabbar.querySelector('[data-tab="search"]').innerHTML = `${ICONS.search}<span>Search</span>`;
  tabbar.querySelector('[data-tab="favourites"]').innerHTML = `${ICONS.heart}<span>Favourites</span>`;

  // ---------- Persistent per-device state ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    },
  };
  let favourites = new Set(store.get('favourites', []));
  const toggleFav = (slug) => {
    favourites.has(slug) ? favourites.delete(slug) : favourites.add(slug);
    store.set('favourites', [...favourites]);
    return favourites.has(slug);
  };

  // ---------- Theme ----------
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => document.documentElement.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]').content = t === 'dark' ? '#0f0f11' : '#ffffff';
    store.set('theme', t);
  }
  const themeButton = () => {
    const dark = currentTheme() === 'dark';
    return `<button class="icon-btn" id="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${dark ? ICONS.sun : ICONS.moon}</button>`;
  };

  // ---------- Data ----------
  let data = null;
  const state = { query: '', category: 'all', homeScroll: 0 };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stripTags = (s) => s.replace(/<[^>]+>/g, ' ');

  function thumb(r, cls = '') {
    const inner = r.image
      ? `<img src="${esc(r.image)}" alt="" loading="lazy">`
      : `<div class="placeholder ${esc(r.category)}"><span>${EMOJI[r.category] || '🍽️'}</span></div>`;
    return `<div class="thumb ${cls}">${inner}</div>`;
  }

  function favButton(r) {
    const on = favourites.has(r.slug);
    return `<button class="fav ${on ? 'on' : ''}" data-fav="${esc(r.slug)}" aria-label="${on ? 'Remove from' : 'Add to'} favourites" aria-pressed="${on}">${ICONS.heart}</button>`;
  }

  const card = (r) => `
    <a class="card" href="#/r/${esc(r.slug)}">
      ${thumb(r)}
      ${favButton(r)}
      <h3>${esc(r.title)}</h3>
      <p>${esc(r.blurb)}</p>
    </a>`;

  function matches(r, q) {
    if (!q) return true;
    if (!r._search) {
      const items = [...r.ingredients, ...r.bowls.flatMap((b) => b.items)];
      r._search = [r.title, r.blurb, r.category, r.tags.join(' '), items.map((i) => stripTags(i.name)).join(' ')]
        .join(' ').toLowerCase();
    }
    return q.toLowerCase().split(/\s+/).every((w) => r._search.includes(w));
  }

  function filtered() {
    return data.recipes
      .filter((r) => state.category === 'all' || r.category === state.category)
      .filter((r) => matches(r, state.query))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  // ---------- Views ----------
  function greeting() {
    const h = new Date().getHours();
    if (h < 11) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function renderHome({ focusSearch = false } = {}) {
    const chips = ['all', ...data.categories].map((c) =>
      `<button class="chip ${state.category === c ? 'active' : ''}" data-cat="${c}">${c === 'all' ? 'All' : LABEL[c] || c}</button>`).join('');

    view.innerHTML = `
      <div class="page">
        <div class="greeting">
          <div class="badge"><img src="icon.svg" alt="" style="width:52px;height:52px;border-radius:50%"></div>
          <div><h1>${greeting()}</h1><p>What are we cooking today?</p></div>
          ${themeButton()}
        </div>
        <label class="search">
          ${ICONS.search}
          <input id="q" type="search" placeholder="Find recipes or ingredients" value="${esc(state.query)}" autocomplete="off" enterkeyhint="search">
          <button class="clear" id="clear" aria-label="Clear search" ${state.query ? '' : 'hidden'}>${ICONS.close}</button>
        </label>
        <div class="chips">${chips}</div>
        <div id="results"></div>
      </div>`;

    const resultsEl = view.querySelector('#results');
    const input = view.querySelector('#q');
    const clear = view.querySelector('#clear');

    const paint = () => {
      const list = filtered();
      const heading = state.query ? 'Results' : state.category === 'all' ? 'All recipes' : LABEL[state.category];
      resultsEl.innerHTML = `<h2 class="section-title">${esc(heading)} <small>${list.length}</small></h2>` +
        (list.length
          ? `<div class="grid">${list.map(card).join('')}</div>`
          : `<div class="empty">${ICONS.search}<p>No recipes match “${esc(state.query)}”.</p></div>`);
    };
    paint();

    input.addEventListener('input', () => {
      state.query = input.value.trim();
      clear.hidden = !state.query;
      paint();
    });
    clear.addEventListener('click', (e) => {
      e.preventDefault();
      input.value = '';
      state.query = '';
      clear.hidden = true;
      paint();
      input.focus();
    });
    view.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => {
      state.category = b.dataset.cat;
      view.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === b));
      paint();
    }));

    view.querySelector('#theme').addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      renderHome();
    });

    if (focusSearch) {
      input.focus();
      input.scrollIntoView({ block: 'center' });
    }
  }

  function renderFavourites() {
    const list = data.recipes.filter((r) => favourites.has(r.slug)).sort((a, b) => a.title.localeCompare(b.title));
    view.innerHTML = `
      <div class="page">
        <h1 class="page-title">Favourite Recipes</h1>
        ${list.length
          ? `<div class="grid">${list.map(card).join('')}</div>`
          : `<div class="empty">${ICONS.heart}<p>No favourites yet.</p><p>Tap the heart on a recipe to save it here.</p></div>`}
      </div>`;
  }

  let wakeLock = null;
  async function setWake(on, btn) {
    try {
      if (on) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; btn && btn.setAttribute('aria-checked', 'false'); });
      } else if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
      btn && btn.setAttribute('aria-checked', String(!!wakeLock));
    } catch {
      toast('Screen lock not available on this device');
    }
  }

  function renderRecipe(slug) {
    const r = data.recipes.find((x) => x.slug === slug);
    if (!r) { location.hash = '#/'; return; }

    const progressKey = `progress:${slug}`;
    const progress = store.get(progressKey, { ing: [], steps: [] });
    progress.bowls = progress.bowls || [];
    const meta = [
      r.total && `<span>${ICONS.clock}${esc(r.total)}</span>`,
      r.active && `<span>${ICONS.flame}${esc(r.active)} active</span>`,
      r.makes && `<span>${ICONS.bowl}${esc(r.makes)}</span>`,
    ].filter(Boolean).join('');
    const fav = favourites.has(slug);
    const anyProgress = progress.ing.length || progress.steps.length || progress.bowls.length;
    const gramsText = (g) => (/^[\d.~+\s–-]+$/.test(g) ? `${g} g` : g);

    view.innerHTML = `
      <div class="recipe">
      <div class="hero">
        ${thumb(r)}
        <div class="hero-bar">
          <button class="glass" id="back" aria-label="Back">${ICONS.back}</button>
          <span class="spacer"></span>
          <button class="glass ${fav ? 'on' : ''}" id="fav" aria-label="Favourite" aria-pressed="${fav}">${ICONS.heart}</button>
          <button class="glass" id="share" aria-label="Share">${ICONS.share}</button>
        </div>
      </div>
      <article class="sheet">
        <div class="recipe-aside">
        <div class="title-row">
          <h1>${esc(r.title)}</h1>
          <span class="cat-tag">${esc(LABEL[r.category] || r.category)}</span>
        </div>
        ${meta ? `<div class="meta">${meta}</div>` : ''}
        ${r.intro ? `
          <section class="desc">
            <h2>Description</h2>
            <div class="text clamped" id="intro">${r.intro}</div>
            <button class="more" id="more" hidden>Show more</button>
          </section>` : ''}

        ${'wakeLock' in navigator ? `
          <div class="wake">
            <div>Keep screen on<small>Stops your phone locking while you cook</small></div>
            <button class="switch" role="switch" aria-checked="${!!wakeLock}" id="wake" aria-label="Keep screen on"></button>
          </div>` : ''}

        <div class="recipe-tools">
          <button class="reset-btn" id="reset" ${anyProgress ? '' : 'disabled'}>${ICONS.reset}Untick everything</button>
        </div>

        <details class="block" open>
          <summary>Ingredients ${ICONS.chevron}</summary>
          <div class="block-body">
            <ul class="ingredients" ${r.ingredients.length ? '' : 'hidden'}>
              ${r.ingredients.map((i, n) => `
                <li data-ing="${n}" class="${progress.ing.includes(n) ? 'done' : ''}">
                  <span class="tick">${ICONS.check}</span>
                  <span class="name">${i.name}</span>
                  <span class="grams">${esc(gramsText(i.grams))}</span>
                </li>`).join('')}
            </ul>
            ${r.bowls.length ? `
              <h3 class="bowls-title">Prepare bowls</h3>
              ${r.bowls.map((b, n) => `
                <div class="bowl ${progress.bowls.includes(n) ? 'done' : ''}" data-bowl="${n}">
                  <div class="bowl-head">
                    <span class="tick">${ICONS.check}</span>
                    <span class="bowl-title">${b.title}</span>
                    ${b.step ? `<em>step ${esc(b.step)}</em>` : ''}
                  </div>
                  <ul class="bowl-items">
                    ${b.items.map((i) => `<li><span class="name">${i.name}</span><span class="grams">${esc(gramsText(i.grams))}</span></li>`).join('')}
                  </ul>
                </div>`).join('')}` : ''}
          </div>
        </details>
        </div>

        <div class="recipe-main">
        <details class="block" open>
          <summary>How to make it ${ICONS.chevron}</summary>
          <div class="block-body">
            <ol class="steps">
              ${r.steps.map((s, n) => `
                <li class="step ${progress.steps.includes(n) ? 'done' : ''}" data-step="${n}">
                  <span class="num">${n + 1}</span>
                  <div class="content">
                    <h3><span>${s.title}</span>${s.time ? `<em>${esc(s.time)}</em>` : ''}</h3>
                    <div class="body">${withTimers(s.html, n)}</div>
                  </div>
                </li>`).join('')}
            </ol>
          </div>
        </details>

        ${r.tips ? `<details class="block"><summary>Tips ${ICONS.chevron}</summary><div class="block-body prose">${r.tips}</div></details>` : ''}
        ${r.extra.map((x) => `<details class="block"><summary style="text-transform:capitalize">${esc(x.title)} ${ICONS.chevron}</summary><div class="block-body prose">${x.html}</div></details>`).join('')}
        ${r.log ? `<details class="block"><summary>Adjustment log ${ICONS.chevron}</summary><div class="block-body prose">${r.log}</div></details>` : ''}

        <div class="block footer-links">
          ${r.tags.length ? `<div class="tags" style="margin-top:18px">${r.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
          ${r.lastMade ? `Last made ${esc(formatDate(r.lastMade))}<br>` : ''}
          ${/^https?:\/\//.test(r.source) ? `Source: <a href="${esc(r.source)}" target="_blank" rel="noopener">${esc(r.source.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : r.source ? `Source: ${esc(r.source)}` : ''}
        </div>
        </div>
      </article>
      </div>`;

    window.scrollTo(0, 0);

    const intro = view.querySelector('#intro');
    const more = view.querySelector('#more');
    if (intro && more) {
      requestAnimationFrame(() => {
        if (intro.scrollHeight > intro.clientHeight + 2) more.hidden = false;
      });
      more.addEventListener('click', () => {
        const clamped = intro.classList.toggle('clamped');
        more.textContent = clamped ? 'Show more' : 'Show less';
      });
    }

    view.querySelector('#back').addEventListener('click', () => {
      if (sessionStorageSafe('navigated')) history.back();
      else location.hash = '#/';
    });
    view.querySelector('#fav').addEventListener('click', (e) => {
      const on = toggleFav(slug);
      e.currentTarget.classList.toggle('on', on);
      e.currentTarget.setAttribute('aria-pressed', on);
      toast(on ? 'Added to favourites' : 'Removed from favourites');
    });
    view.querySelector('#share').addEventListener('click', async () => {
      const url = location.href;
      if (navigator.share) {
        try { await navigator.share({ title: r.title, url }); } catch { /* cancelled */ }
      } else {
        try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { toast(url); }
      }
    });
    const wake = view.querySelector('#wake');
    if (wake) wake.addEventListener('click', () => setWake(!wakeLock, wake));

    const resetBtn = view.querySelector('#reset');
    const save = () => {
      store.set(progressKey, progress);
      resetBtn.disabled = !(progress.ing.length || progress.steps.length || progress.bowls.length);
    };
    view.querySelectorAll('[data-ing]').forEach((li) => li.addEventListener('click', () => {
      const n = Number(li.dataset.ing);
      const done = li.classList.toggle('done');
      progress.ing = done ? [...progress.ing, n] : progress.ing.filter((x) => x !== n);
      save();
    }));
    view.querySelectorAll('[data-bowl]').forEach((el) => el.addEventListener('click', () => {
      const n = Number(el.dataset.bowl);
      const done = el.classList.toggle('done');
      progress.bowls = done ? [...progress.bowls, n] : progress.bowls.filter((x) => x !== n);
      save();
    }));
    view.querySelectorAll('[data-timer]').forEach((btn) => btn.addEventListener('click', () => {
      const n = Number(btn.dataset.timer.split(':')[0]);
      const label = `Step ${n + 1} · ${r.steps[n].title.replace(/<[^>]+>/g, '')}`;
      toggleTimer(`${slug}:${btn.dataset.timer}`, Number(btn.dataset.secs), label, btn.dataset.idle || btn.textContent);
    }));
    paintTimers();
    view.querySelectorAll('[data-step]').forEach((li) => li.addEventListener('click', (e) => {
      if (e.target.closest('a, .timer')) return;
      const n = Number(li.dataset.step);
      const done = li.classList.toggle('done');
      progress.steps = done ? [...progress.steps, n] : progress.steps.filter((x) => x !== n);
      save();
    }));
    resetBtn.addEventListener('click', () => {
      try { localStorage.removeItem(progressKey); } catch { /* ignore */ }
      const y = window.scrollY;
      renderRecipe(slug);
      window.scrollTo(0, y);
      toast('Everything unticked');
    });
  }

  function formatDate(iso) {
    const d = new Date(`${iso}T00:00:00`);
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function sessionStorageSafe(key) {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }

  let toastTimer;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 1800);
  }

  // ---------- Step timers ----------
  // Waits written in a step ("rest for 20 min", "bake 25–30 min", "cook for 1 hr 45") become timer
  // buttons set to the top of the range. Cues and asides ("every 30 seconds", "20 minutes before
  // cooking", "no more than 24 hours") and anything over 6 hours stay plain text.
  const DURATION = /(\d+(?:\.\d+)?)(?:\s*(?:[–-]|to)\s*(\d+(?:\.\d+)?))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b(?:\s+(\d+)\b(?!\s*(?:hours?|hrs?|minutes?|mins?|seconds?|secs?|[–-])))?/gi;
  const NOT_A_WAIT_BEFORE = /\b(every|in about|in|more than|towards)\s+$/i;
  const NOT_A_WAIT_AFTER = /^\s*(before|from|under|short|less)\b/i;
  function withTimers(html, n) {
    let i = 0;
    return html.replace(/(<[^>]+>)|([^<]+)/g, (all, tag, text) => tag || text.replace(DURATION, (m, a, b, unit, extra, at, str) => {
      if (NOT_A_WAIT_BEFORE.test(str.slice(0, at)) || NOT_A_WAIT_AFTER.test(str.slice(at + m.length))) return m;
      const per = /^h/i.test(unit) ? 3600 : /^m/i.test(unit) ? 60 : 1;
      const secs = Math.round(Number(b || a) * per + (per === 3600 ? Number(extra || 0) * 60 : 0));
      if (!secs || secs > 6 * 3600) return m;
      return `<button class="timer" data-timer="${n}:${i++}" data-secs="${secs}" aria-label="Start ${m} timer">${ICONS.clock}<span>${m}</span></button>`;
    }));
  }

  // key "slug:step" -> { end (ms epoch), label }; kept in storage so a reload doesn't lose a running timer.
  const timers = store.get('timers', {});
  const saveTimers = () => store.set('timers', timers);
  let audio = null;
  let ringTimer = null;

  function toggleTimer(key, secs, label, time) {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch { /* no audio */ }
    if (timers[key]) {
      if (timers[key].end > Date.now() && !confirm(`Cancel the ${time} timer?`)) return;
      delete timers[key];
      toast('Timer cancelled');
    } else {
      timers[key] = { end: Date.now() + secs * 1000, label };
      toast(`Timer set for ${clockText(secs)}`);
    }
    saveTimers();
    tickTimers();
  }

  function clockText(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = String(secs % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  }

  function paintTimers() {
    const r = currentRoute();
    if (r.name !== 'recipe') return;
    view.querySelectorAll('[data-timer]').forEach((btn) => {
      const t = timers[`${r.slug}:${btn.dataset.timer}`];
      const left = t ? Math.max(0, Math.ceil((t.end - Date.now()) / 1000)) : 0;
      btn.classList.toggle('running', !!t && left > 0);
      btn.classList.toggle('finished', !!t && left === 0);
      if (!btn.dataset.idle) btn.dataset.idle = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = !t ? btn.dataset.idle : left ? clockText(left) : 'Done';
    });
  }

  function tickTimers() {
    paintTimers();
    const due = Object.entries(timers).filter(([, t]) => t.end <= Date.now());
    if (due.length) ring(due); else stopRing();
  }

  function beep() {
    if (!audio) return;
    [0, 0.25, 0.5].forEach((at) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, audio.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + at + 0.2);
      o.connect(g).connect(audio.destination);
      o.start(audio.currentTime + at);
      o.stop(audio.currentTime + at + 0.2);
    });
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  }

  function ring(due) {
    let bar = document.querySelector('.timer-alert');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'timer-alert';
      bar.setAttribute('role', 'alert');
      document.body.appendChild(bar);
      bar.addEventListener('click', () => {
        Object.keys(timers).forEach((k) => { if (timers[k].end <= Date.now()) delete timers[k]; });
        saveTimers();
        tickTimers();
      });
    }
    const html = `${ICONS.clock}<div><strong>Time’s up</strong>${due.map(([, t]) => `<small>${esc(t.label)}</small>`).join('')}</div><button>Dismiss</button>`;
    if (bar.dataset.html !== html) { bar.dataset.html = html; bar.innerHTML = html; }
    if (!ringTimer) { beep(); ringTimer = setInterval(beep, 3000); }
  }

  function stopRing() {
    document.querySelectorAll('.timer-alert').forEach((b) => b.remove());
    clearInterval(ringTimer);
    ringTimer = null;
  }

  setInterval(tickTimers, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tickTimers(); });

  // Favourite hearts on cards live inside links: handle them before navigation.
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const on = toggleFav(btn.dataset.fav);
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on);
    if (currentRoute().name === 'favourites' && !on) renderFavourites();
  });

  // ---------- Router ----------
  function currentRoute() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h.startsWith('r/')) return { name: 'recipe', slug: decodeURIComponent(h.slice(2)) };
    if (h === 'search') return { name: 'search' };
    if (h === 'favourites') return { name: 'favourites' };
    return { name: 'home' };
  }

  let lastRoute = null;
  function route() {
    const r = currentRoute();
    if (lastRoute && lastRoute.name === 'home') state.homeScroll = window.scrollY;
    if (lastRoute) { try { sessionStorage.setItem('navigated', '1'); } catch { /* ignore */ } }

    document.body.classList.toggle('recipe-open', r.name === 'recipe');
    tabbar.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.tab === r.name));

    if (r.name === 'recipe') renderRecipe(r.slug);
    else if (r.name === 'favourites') { renderFavourites(); window.scrollTo(0, 0); }
    else if (r.name === 'search') renderHome({ focusSearch: true });
    else {
      renderHome();
      window.scrollTo(0, lastRoute && lastRoute.name === 'recipe' ? state.homeScroll : 0);
    }
    lastRoute = r;
  }

  async function load() {
    try {
      const res = await fetch('recipes.json', { cache: 'no-cache' });
      data = await res.json();
    } catch {
      const cached = await (window.caches ? caches.match('recipes.json', { ignoreSearch: true }) : null);
      if (!cached) {
        view.innerHTML = '<div class="empty"><p>Couldn’t load recipes.</p><p>Open once while online to save them for offline use.</p></div>';
        return;
      }
      data = await cached.json();
    }
    window.addEventListener('hashchange', route);
    route();
  }

  if ('serviceWorker' in navigator) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.update();
    });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded || !hadController) return;
      reloaded = true;
      // Only reload silently if not mid-recipe; otherwise the new version shows next launch.
      if (currentRoute().name !== 'recipe') location.reload();
    });
  }

  load();
})();
