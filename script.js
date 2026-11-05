/* =====================================================================
   Ravender Pratap Singh — portfolio script (home page + /work case studies)

   Features (each one only runs if its markup is on the page):
     1. View switch  — Product / Engineering / Operations (?view=, remembered)
     2. Mobile menu
     3. Reveal-on-scroll
     4. Skill → proof explorer
     5. Live GitHub repos
     6. Copy-to-clipboard + toast
     7. Terminal easter egg — press ~ (or the >_ button in the footer)
===================================================================== */
(() => {
  'use strict';

  const html = document.documentElement;
  const ROOT = document.body.dataset.root || '';          // '' on home, '../' in /work
  const VIEWS = ['product', 'eng', 'ops'];
  const VIEW_NAMES = { product: 'Product', eng: 'Engineering', ops: 'Operations' };
  const CV = {
    dev: ROOT + 'resume/Ravender_Pratap_Singh_Resume.pdf',
    ops: ROOT + 'operation-resume/Ravender_Pratap_Singh_Operations_Resume.pdf',
  };
  const cvFor = (v) => (v === 'ops' ? CV.ops : CV.dev);
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* ── toast + live region ─────────────────────────────── */
  const live = document.createElement('div');
  live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
  const toastEl = document.createElement('div');
  toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
  document.body.append(live, toastEl);
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ── 1. view switch ──────────────────────────────────── */
  $$('[data-keep-view]').forEach((a) => { a.dataset.base = a.getAttribute('href').split('?')[0]; });

  function applyView(v, announce) {
    html.dataset.view = v;
    $$('[data-set-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setView === v)));
    $$('[data-cv]').forEach((a) => { a.href = cvFor(v); });
    $$('.cv-item').forEach((el) => el.classList.toggle('is-current', el.dataset.cvKind === (v === 'ops' ? 'ops' : 'dev')));
    $$('[data-keep-view]').forEach((a) => {
      const [path, hash] = a.dataset.base.split('#');
      a.href = path + '?view=' + v + (hash ? '#' + hash : '');
    });
    if (announce) live.textContent = 'Showing the ' + VIEW_NAMES[v] + ' view';
  }
  function setView(v) {
    if (!VIEWS.includes(v)) return;
    store.set('rps-view', v);
    const url = new URL(location.href);
    url.searchParams.set('view', v);
    history.replaceState(null, '', url);
    applyView(v, true);
  }
  applyView(VIEWS.includes(html.dataset.view) ? html.dataset.view : 'product', false);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-view]');
    if (b) setView(b.dataset.setView);
  });

  /* ── 2. mobile menu ──────────────────────────────────── */
  const menuBtn = $('.menu-btn'), menu = $('.mobile-menu');
  if (menuBtn && menu) {
    const close = () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); };
    menuBtn.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ── 3. reveal on scroll ─────────────────────────────── */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ── 4. skill → proof explorer ───────────────────────── */
  const proof = $('#proof');
  if (proof) {
    const targets = $$('[data-skills]');
    const emptyHTML = proof.innerHTML;
    let active = null;

    const clear = () => {
      active = null;
      $$('.skill').forEach((s) => s.setAttribute('aria-pressed', 'false'));
      targets.forEach((t) => t.classList.remove('is-match', 'is-dim'));
      proof.innerHTML = emptyHTML;
    };

    const show = (btn) => {
      const key = btn.dataset.skill;
      active = key;
      $$('.skill').forEach((s) => s.setAttribute('aria-pressed', String(s === btn)));
      const hits = targets.filter((t) => t.dataset.skills.split(/\s+/).includes(key));
      targets.forEach((t) => {
        t.classList.toggle('is-match', hits.includes(t));
        t.classList.toggle('is-dim', !hits.includes(t));
      });
      const items = hits.map((t) =>
        `<li><a href="#${t.id}"><b>${t.dataset.title}</b><span>${t.dataset.context}</span></a></li>`).join('');
      proof.innerHTML =
        `<h3>Where I used <span>${btn.textContent.trim()}</span></h3>` +
        `<ul>${items}</ul>` +
        `<button type="button" class="btn btn-ghost btn-sm" data-clear-skill>Clear filter</button>`;
      live.textContent = `${btn.textContent.trim()}: used in ${hits.length} place${hits.length === 1 ? '' : 's'}`;
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.skill');
      if (btn) { if (active === btn.dataset.skill) clear(); else show(btn); return; }
      if (e.target.closest('[data-clear-skill]')) clear();
    });
  }

  /* ── 5. live GitHub repos ────────────────────────────── */
  const gh = $('#gh-grid');
  if (gh) {
    const USER = 'ravsain';
    const HIDE = ['portfolio', 'husbandmart'];             // repos to keep off the page
    const DESCRIPTIONS = {                                 // used when a repo has no GitHub description
      'Analysis-on-Emerging-Technology-Skills-and-Trends': 'SkillRadar: tech-skill demand, salary and 2028 forecasts from 9 live APIs.',
      'Market-Intel-Career-Analytics-Dashboard': 'Streamlit dashboard for job-market trends and skills-gap analysis.',
    };
    const LANG = { Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Go: '#00ADD8', 'Jupyter Notebook': '#DA5B0B', CSS: '#563d7c', HTML: '#e34c26', Java: '#b07219' };
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ago = (iso) => {
      const d = (Date.now() - new Date(iso)) / 864e5;
      if (d < 1) return 'today';
      if (d < 30) return Math.round(d) + 'd ago';
      if (d < 365) return Math.round(d / 30) + 'mo ago';
      return Math.round(d / 365) + 'y ago';
    };
    const render = (repos) => {
      const list = repos.filter((r) => !r.fork && !HIDE.includes(r.name.toLowerCase()))
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 6);
      if (!list.length) throw new Error('no repos');
      gh.innerHTML = list.map((r) => `
        <a class="gh-card" href="${esc(r.html_url)}" target="_blank" rel="noopener">
          <h3>${esc(r.name.replace(/[-_]/g, ' '))}</h3>
          <p>${esc(r.description || DESCRIPTIONS[r.name] || 'Public repository on GitHub.')}</p>
          <div class="gh-meta">
            ${r.language ? `<span><i class="dot" style="--lang:${LANG[r.language] || '#888'}"></i>${esc(r.language)}</span>` : ''}
            <span>updated ${ago(r.pushed_at)}</span>
            ${r.stargazers_count ? `<span>★ ${r.stargazers_count}</span>` : ''}
          </div>
        </a>`).join('');
      const status = $('#gh-status');
      if (status) status.textContent = `Live from api.github.com · ${list.length} most recently updated public repos`;
    };
    const fail = () => {
      gh.innerHTML = `<a class="gh-card" href="https://github.com/${USER}" target="_blank" rel="noopener">
        <h3>github.com/${USER}</h3><p>Couldn't load live repos right now. Open my GitHub profile to see everything I've published.</p>
        <div class="gh-meta"><span>open profile →</span></div></a>`;
    };
    const KEY = 'rps-gh-v1';
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { /* ignore */ }
    if (cached && Date.now() - cached.t < 30 * 60 * 1000) {
      try { render(cached.d); } catch { fail(); }
    } else {
      fetch(`https://api.github.com/users/${USER}/repos?per_page=50&sort=pushed`, { headers: { Accept: 'application/vnd.github+json' } })
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((d) => {
          render(d);
          try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d })); } catch { /* ignore */ }
        })
        .catch(fail);
    }
  }

  /* ── 6. copy to clipboard ────────────────────────────── */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    e.preventDefault();
    const text = b.dataset.copy;
    const done = () => toast('Copied: ' + text);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => toast(text));
    else {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); done(); } catch { toast(text); } t.remove();
    }
  });

  /* ── 7. terminal easter egg ──────────────────────────── */
  const PROJECTS = {
    pos:       { file: 'vervebot-pos.html',    title: 'Vervebot POS: rebuild, payments and AI agent' },
    kanbanhub: { file: 'kanbanhub.html',       title: 'KanbanHub: full-stack project management platform' },
    pennywise: { file: 'pennywise.html',       title: 'PennyWise: shared budgeting app (live)' },
    skillradar:{ file: 'skillradar.html',      title: 'SkillRadar: tech-skills market intelligence' },
    sauce:     { file: 'sauce-and-spoons.html',title: 'Sauce and Spoons: restaurant operations pilot' },
  };
  const WHOAMI = {
    product: 'Ravender Pratap Singh: Product Analyst who writes the PRD, owns the backlog and stays until it ships.',
    eng:     'Ravender Pratap Singh: developer working in Go, Python and React. POS backend, LLM agent, test automation.',
    ops:     'Ravender Pratap Singh: operations and program lead. Scrumban, process automation, cross-team delivery.',
  };
  const COMMANDS = ['help', 'whoami', 'view', 'ls', 'open', 'cv', 'skills', 'experience', 'contact', 'email', 'github', 'linkedin', 'clear', 'exit', 'sudo'];

  let term, body, input, hist = [], hIdx = 0;
  function buildTerm() {
    term = document.createElement('dialog');
    term.className = 'term';
    term.setAttribute('aria-label', 'Portfolio terminal');
    term.innerHTML = `
      <div class="term-bar"><div class="dots" aria-hidden="true"><i></i><i></i><i></i></div>
        <span>ravender@portfolio: ~</span><button type="button" data-term-close>esc</button></div>
      <div class="term-body" role="log" aria-live="polite"></div>
      <form class="term-form" autocomplete="off">
        <label for="term-in">ravender@portfolio:~$</label>
        <input id="term-in" type="text" spellcheck="false" autocapitalize="off" aria-label="Type a command">
      </form>`;
    document.body.appendChild(term);
    body = $('.term-body', term);
    input = $('input', term);
    $('[data-term-close]', term).addEventListener('click', () => term.close());
    term.addEventListener('click', (e) => { if (e.target === term) term.close(); else if (!e.target.closest('a,button')) input.focus(); });
    $('form', term).addEventListener('submit', (e) => {
      e.preventDefault();
      const cmd = input.value.trim();
      input.value = '';
      if (cmd) { hist.push(cmd); hIdx = hist.length; }
      line(cmd, 'cmd');
      run(cmd);
      body.scrollTop = body.scrollHeight;
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = hist[hIdx]; }
      else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hIdx = Math.min(hist.length, hIdx + 1); input.value = hist[hIdx] || ''; }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const [c, a = ''] = input.value.split(/\s+/);
        if (input.value.includes(' ') && c === 'open') { const m = Object.keys(PROJECTS).find((k) => k.startsWith(a)); if (m) input.value = 'open ' + m; }
        else if (input.value.includes(' ') && c === 'view') { const m = VIEWS.find((k) => k.startsWith(a)); if (m) input.value = 'view ' + m; }
        else { const m = COMMANDS.find((k) => k.startsWith(c)); if (m) input.value = m + ' '; }
      }
    });
    line('Welcome! Type "help" to see what you can do. Press Tab to autocomplete, Esc to close.', 'ok');
  }
  function line(text, cls = '', asHTML = false) {
    const d = document.createElement('div');
    d.className = 'term-line ' + cls;
    if (asHTML) d.innerHTML = text; else d.textContent = text;
    body.appendChild(d);
  }
  const go = (url, newTab) => setTimeout(() => (newTab ? window.open(url, '_blank', 'noopener') : (location.href = url)), 450);

  function run(raw) {
    const [cmd, ...args] = raw.split(/\s+/);
    const arg = (args[0] || '').toLowerCase();
    const v = html.dataset.view;
    switch ((cmd || '').toLowerCase()) {
      case '': return;
      case 'help':
        line([
          'whoami              who is this?',
          'view [product|eng|ops]   switch how the site presents me',
          'ls                  list case studies',
          'open <name>         open a case study (e.g. open pos)',
          'experience          roles and dates',
          'skills              core skills for the current view',
          'cv [dev|ops]        download a resume',
          'contact | email | github | linkedin',
          'clear | exit',
        ].join('\n'));
        return;
      case 'whoami': line(WHOAMI[v]); return;
      case 'view':
        if (!arg) { line(`Current view: ${v}. Options: product, eng, ops`); return; }
        if (!VIEWS.includes(arg)) { line(`Unknown view "${arg}". Try: product, eng, ops`, 'warn'); return; }
        setView(arg); line(`Switched to the ${VIEW_NAMES[arg]} view.`, 'ok'); return;
      case 'ls':
        line(Object.entries(PROJECTS).map(([k, p]) => `${k.padEnd(11)} ${p.title}`).join('\n')); return;
      case 'open': {
        const p = PROJECTS[arg];
        if (!p) { line('Usage: open <name>. Run "ls" for names.', 'warn'); return; }
        line(`Opening ${p.title}…`, 'ok'); go(`${ROOT}work/${p.file}?view=${v}`); return;
      }
      case 'experience':
        line([
          'Apr 2025 – now   Product & Quality Analyst (Automation) · Vervebot, Gurugram',
          'Dec 2024 – Apr 2025   Data Analyst · GlobalLogic (client: Google), Gurugram',
          'Jun 2022 – Jul 2023   Quality Analyst · Filo Edtech, Gurugram',
          'Education: MBA Business Analytics (GLA University, 2024) · BBA (Sanskriti University, 2020)',
        ].join('\n')); return;
      case 'skills':
        line({
          product: 'Product ownership · requirements & PRDs · backlog grooming · stakeholder management · dashboards',
          eng: 'Go · Python · React/TypeScript · PostgreSQL · REST & WebSockets · LLM agents · Playwright · Selenium',
          ops: 'Scrumban/Agile · process improvement · workflow automation · risk & quality management · mentoring',
        }[v]); return;
      case 'cv': {
        const kind = arg === 'ops' ? 'ops' : arg === 'dev' ? 'dev' : (v === 'ops' ? 'ops' : 'dev');
        line(`Downloading the ${kind === 'ops' ? 'Operations / Program / Product Owner' : 'Product Analyst & Developer'} resume…`, 'ok');
        const a = document.createElement('a'); a.href = CV[kind]; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
        return;
      }
      case 'contact':
        line('email     <a href="mailto:ravsainz@gmail.com">ravsainz@gmail.com</a>\nphone     <a href="tel:+917023577505">+91 70235 77505</a>\nlinkedin  <a href="https://www.linkedin.com/in/r-p-s" target="_blank" rel="noopener">linkedin.com/in/r-p-s</a>\ngithub    <a href="https://github.com/ravsain" target="_blank" rel="noopener">github.com/ravsain</a>', '', true);
        return;
      case 'email': line('Opening your mail app…', 'ok'); go('mailto:ravsainz@gmail.com'); return;
      case 'github': line('Opening GitHub…', 'ok'); go('https://github.com/ravsain', true); return;
      case 'linkedin': line('Opening LinkedIn…', 'ok'); go('https://www.linkedin.com/in/r-p-s', true); return;
      case 'clear': body.innerHTML = ''; return;
      case 'exit': term.close(); return;
      case 'sudo':
        if (raw.toLowerCase().includes('hire')) {
          line('[sudo] permission granted. Opening an email to Ravender…', 'ok');
          go('mailto:ravsainz@gmail.com?subject=' + encodeURIComponent("Let's talk about a role"));
        } else line('Nice try. Maybe "sudo hire-me"?', 'warn');
        return;
      default: line(`command not found: ${cmd}. Type "help".`, 'warn');
    }
  }
  function openTerm() {
    if (!term) buildTerm();
    if (!term.open) { term.showModal(); input.focus(); }
  }
  document.addEventListener('keydown', (e) => {
    if ((e.key === '`' || e.key === '~') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target;
      if (t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault(); openTerm();
    }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-terminal]')) openTerm(); });

  /* ── misc ────────────────────────────────────────────── */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
