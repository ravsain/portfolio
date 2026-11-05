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

  const ROOT = document.body.dataset.root || '';          // '' on home, '../' in /work
  const CV = ROOT + 'resume/Ravender_Pratap_Singh_Resume.pdf';
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
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

  /* ── 1. mobile menu ──────────────────────────────────── */
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

  /* ── 2. reveal on scroll ─────────────────────────────── */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ── 3. skill → proof explorer ───────────────────────── */
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

  /* ── project quick views ────────────────────────────── */
  const projectDialog = $('#project-dialog');
  if (projectDialog) {
    const closeProject = $('[data-project-close]', projectDialog);
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-project-open]');
      if (trigger) {
        const card = trigger.closest('.work-card');
        const title = $('h3', card);
        const summary = $$('p', card).find((p) => getComputedStyle(p).display !== 'none');
        const caseLink = $('.work-link', card);
        $('#project-dialog-title').textContent = title.textContent.trim();
        $('#project-dialog-context').textContent = card.dataset.context || 'Project';
        $('#project-dialog-subtitle').textContent = $('.what', card)?.textContent.trim() || '';
        $('#project-dialog-description').textContent = summary?.textContent.trim() || '';
        $('#project-dialog-tags').replaceChildren(...$$('.tag', card).map((tag) => tag.cloneNode(true)));
        const fullLink = $('#project-dialog-link');
        fullLink.href = caseLink?.href || '#work';
        projectDialog.showModal();
        closeProject.focus();
        return;
      }
      if (e.target.closest('[data-project-close]')) projectDialog.close();
    });
    projectDialog.addEventListener('click', (e) => {
      if (e.target === projectDialog) projectDialog.close();
    });
  }

  /* ── local latency playground ───────────────────────── */
  const runSimulation = $('#run-simulation');
  if (runSimulation) {
    const route = $('#latency-route');
    const chart = $('#latency-chart');
    const routeConfig = {
      orders: { label: 'GET /api/orders', baseline: 72 },
      health: { label: 'GET /api/health', baseline: 24 },
      payments: { label: 'POST /api/payments', baseline: 118 },
    };
    runSimulation.addEventListener('click', () => {
      const config = routeConfig[route.value] || routeConfig.orders;
      const samples = Array.from({ length: 12 }, () => Math.round(config.baseline * (.65 + Math.random() * .85)));
      const sorted = [...samples].sort((a, b) => a - b);
      const median = Math.round((sorted[5] + sorted[6]) / 2);
      const p95 = sorted[Math.ceil(sorted.length * .95) - 1];
      $('[data-latency-median]').textContent = `${median} ms`;
      $('[data-latency-p95]').textContent = `${p95} ms`;
      $('[data-latency-count]').textContent = String(samples.length);
      $('[data-latency-status]').textContent = `${samples.length} simulated requests for ${config.label} · no network calls`;
      chart.replaceChildren();
      const max = Math.max(...samples);
      samples.forEach((value, index) => {
        const bar = document.createElement('span');
        const fill = document.createElement('i');
        bar.className = 'latency-bar';
        bar.setAttribute('aria-hidden', 'true');
        fill.style.setProperty('--sample-height', `${Math.max(14, value / max * 100)}%`);
        bar.append(fill, document.createTextNode(String(index + 1).padStart(2, '0')));
        chart.append(bar);
      });
      chart.setAttribute('aria-label', `12 simulated request durations for ${config.label}: ${samples.join(', ')} milliseconds`);
    });
  }

  /* ── 4. gatehouse operations game ────────────────────── */
  const opsGame = $('#ops-game');
  if (opsGame) {
    const incidents = [
      {
        time: '08:40 · ARRIVAL',
        title: 'Visitor wave at the main gate',
        prompt: 'Three visitor cars arrive together. The queue is growing and two passes still need confirmation. What do you do first?',
        choices: [
          { label: 'Pre-check the visitor passes', points: 250, impact: [8, 8, -2], result: 'Good call. Validate the passes in parallel, then release the confirmed visitors without skipping the entry record.' },
          { label: 'Wave every car through', points: 0, impact: [14, -18, -7], result: 'The queue clears quickly, but unverified visitors and unrecorded vehicles create a safety and capacity problem.' },
          { label: 'Pause all entry until clear', points: 100, impact: [-8, 5, 0], result: 'The gate stays controlled, but a full stop slows confirmed visitors too. A targeted check would keep more flow.' },
        ],
      },
      {
        time: '09:05 · OCR REVIEW',
        title: 'A plate match looks wrong',
        prompt: 'The camera OCR result differs by one character from the visitor pass. The resident is not answering immediately. What is the safest next step?',
        choices: [
          { label: 'Ask the guard to verify the plate', points: 250, impact: [1, 10, 0], result: 'A quick manual review resolves the mismatch while keeping the access record trustworthy.' },
          { label: 'Override the mismatch and open the gate', points: 0, impact: [10, -18, -1], result: 'The car moves, but overriding a plate mismatch without review weakens the gate record.' },
          { label: 'Reject every OCR mismatch', points: 100, impact: [-8, 5, 0], result: 'This protects the gate, but a review path avoids unnecessary rejections when OCR is uncertain.' },
        ],
      },
      {
        time: '12:20 · CAPACITY',
        title: 'Only a few spaces remain',
        prompt: 'The live count shows very low availability. New visitors are still arriving. How do you protect the remaining spaces?',
        choices: [
          { label: 'Check the count and route overflow arrivals', points: 250, impact: [4, 5, 12], result: 'Using the live count and a clear overflow plan keeps the entry lane moving without overfilling the lot.' },
          { label: 'Allow double parking for now', points: 0, impact: [10, -20, -18], result: 'This makes the queue look shorter but blocks circulation and makes occupancy less reliable.' },
          { label: 'Close visitor entry completely', points: 100, impact: [-10, 4, 5], result: 'Capacity is protected, but a controlled overflow route would preserve access for approved visitors.' },
        ],
      },
      {
        time: '18:00 · HANDOFF',
        title: 'The next guard is taking over',
        prompt: 'Two visitor passes are unresolved and the lot is nearly full. What should the outgoing shift leave behind?',
        choices: [
          { label: 'Share pending passes and the latest space count', points: 250, impact: [5, 8, 0], result: 'A concise handoff preserves context, keeps checks consistent and avoids repeating work.' },
          { label: 'Stay late and clear every item alone', points: 100, impact: [-5, 3, 0], result: 'You made progress, but a clear handoff is more sustainable than relying on one person to finish the queue.' },
          { label: 'Start the next shift with a blank queue', points: 0, impact: [8, -17, 0], result: 'The dashboard looks clean, but unresolved passes are lost and the next shift has no context.' },
        ],
      },
    ];
    const metrics = {
      flow: { value: $('[data-op-flow]', opsGame), bar: $('[data-op-flowbar]', opsGame) },
      safety: { value: $('[data-op-safety]', opsGame), bar: $('[data-op-safetybar]', opsGame) },
      spaces: { value: $('[data-op-spaces]', opsGame), bar: $('[data-op-spacesbar]', opsGame) },
    };
    const choices = $$('[data-op-choice]', opsGame);
    const feedback = $('[data-op-feedback]', opsGame);
    const next = $('[data-op-next]', opsGame);
    const status = $('[data-op-status]', opsGame);
    const progress = $('.ops-progress', opsGame);
    const progressBar = $('[data-op-progress]', opsGame);
    let values = { flow: 68, safety: 80, spaces: 54 };
    let round = 0;
    let score = 0;

    const drawMetrics = () => {
      Object.entries(metrics).forEach(([key, metric]) => {
        const value = values[key];
        metric.value.textContent = `${value}%`;
        metric.bar.style.setProperty('--level', `${value}%`);
      });
      $('[data-op-score]', opsGame).textContent = String(score).padStart(4, '0');
    };
    const drawIncident = () => {
      const incident = incidents[round];
      $('[data-op-round]', opsGame).textContent = `INCIDENT ${String(round + 1).padStart(2, '0')} / ${String(incidents.length).padStart(2, '0')}`;
      $('[data-op-time]', opsGame).textContent = incident.time;
      $('[data-op-title]', opsGame).textContent = incident.title;
      $('[data-op-prompt]', opsGame).textContent = incident.prompt;
      choices.forEach((button, index) => {
        button.disabled = false;
        button.classList.remove('is-selected');
        $('[data-op-choice-label]', button).textContent = incident.choices[index].label;
      });
      $('[data-op-actions]', opsGame).hidden = false;
      feedback.hidden = true;
      feedback.classList.remove('is-poor');
      next.hidden = true;
      next.innerHTML = 'Next incident <i class="fas fa-arrow-right" aria-hidden="true"></i>';
      status.textContent = `Incident ${round + 1} of ${incidents.length} · choose a response.`;
      progress.setAttribute('aria-valuenow', String(round));
      progressBar.style.width = `${round / incidents.length * 100}%`;
    };
    const finishShift = () => {
      const rating = score >= 900 ? 'Green shift' : score >= 600 ? 'Steady shift' : 'Debrief required';
      $('[data-op-round]', opsGame).textContent = 'SHIFT REPORT';
      $('[data-op-time]', opsGame).textContent = `${score} / 1000 POINTS`;
      $('[data-op-title]', opsGame).textContent = rating;
      $('[data-op-prompt]', opsGame).textContent = score >= 900
        ? 'Strong operations: you balanced throughput, verification, parking capacity and a clear handoff.'
        : 'Review the decisions that traded safe access or clear handoffs for short-term speed, then run the shift again.';
      $('[data-op-actions]', opsGame).hidden = true;
      feedback.textContent = `Final shift metrics: flow ${values.flow}%, safety ${values.safety}%, spaces ${values.spaces}%.`;
      feedback.hidden = false;
      next.hidden = false;
      next.innerHTML = 'Run the shift again <i class="fas fa-rotate-right" aria-hidden="true"></i>';
      status.textContent = 'Shift complete · local simulation, no live systems.';
      progress.setAttribute('aria-valuenow', String(incidents.length));
      progressBar.style.width = '100%';
    };
    const resetShift = () => {
      values = { flow: 68, safety: 80, spaces: 54 };
      round = 0;
      score = 0;
      drawMetrics();
      drawIncident();
    };

    drawMetrics();
    opsGame.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-op-choice]');
      if (choice && !choice.disabled) {
        const index = Number(choice.dataset.opChoice);
        const decision = incidents[round].choices[index];
        score += decision.points;
        Object.keys(metrics).forEach((key, metricIndex) => {
          values[key] = Math.max(0, Math.min(100, values[key] + decision.impact[metricIndex]));
        });
        drawMetrics();
        choices.forEach((button) => { button.disabled = true; });
        choice.classList.add('is-selected');
        feedback.textContent = decision.result;
        feedback.classList.toggle('is-poor', decision.points === 0);
        feedback.hidden = false;
        next.hidden = false;
        status.textContent = `${decision.points} points · decision recorded.`;
        progress.setAttribute('aria-valuenow', String(round + 1));
        progressBar.style.width = `${(round + 1) / incidents.length * 100}%`;
        return;
      }
      if (event.target.closest('[data-op-next]')) {
        if (round >= incidents.length) {
          resetShift();
          return;
        }
        round += 1;
        if (round === incidents.length) finishShift();
        else drawIncident();
        return;
      }
      if (event.target.closest('[data-ops-reset]')) resetShift();
    });
  }

  /* ── 5. copy to clipboard ────────────────────────────── */
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
    parking:   { file: 'parking-os.html',      title: 'Society Vehicle & Parking OS' },
    kanbanhub: { file: 'kanbanhub.html',       title: 'KanbanHub: full-stack project management platform' },
    pennywise: { file: 'pennywise.html',       title: 'PennyWise: shared budgeting app (live)' },
    skillradar:{ file: 'skillradar.html',      title: 'SkillRadar: tech-skills market intelligence' },
    sauce:     { file: 'sauce-and-spoons.html',title: 'Sauce and Spoons: restaurant operations pilot' },
  };
  const WHOAMI = 'Ravender Pratap Singh: product and quality analyst who connects requirements, Go and Python development, test automation, data, and delivery.';
  const COMMANDS = ['help', 'whoami', 'ls', 'open', 'cv', 'skills', 'experience', 'contact', 'email', 'github', 'linkedin', 'clear', 'exit', 'sudo'];

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
    switch ((cmd || '').toLowerCase()) {
      case '': return;
      case 'help':
        line([
          'whoami              who is this?',
          'ls                  list case studies',
          'open <name>         open a case study (e.g. open pos)',
          'experience          roles and dates',
          'skills              core skills across my work',
          'cv                  download my resume',
          'contact | email | github | linkedin',
          'clear | exit',
        ].join('\n'));
        return;
      case 'whoami': line(WHOAMI); return;
      case 'ls':
        line(Object.entries(PROJECTS).map(([k, p]) => `${k.padEnd(11)} ${p.title}`).join('\n')); return;
      case 'open': {
        const p = PROJECTS[arg];
        if (!p) { line('Usage: open <name>. Run "ls" for names.', 'warn'); return; }
        line(`Opening ${p.title}…`, 'ok'); go(`${ROOT}work/${p.file}`); return;
      }
      case 'experience':
        line([
          'Apr 2025 – now   Product & Quality Analyst (Automation) · Vervebot, Gurugram',
          'Dec 2024 – Apr 2025   Data Analyst · GlobalLogic (client: Google), Gurugram',
          'Jun 2022 – Jul 2023   Quality Analyst · Filo Edtech, Gurugram',
          'Education: MBA Business Analytics (GLA University, 2024) · BBA (Sanskriti University, 2020)',
        ].join('\n')); return;
      case 'skills':
        line('Requirements & PRDs · Go · Python · React/TypeScript · PostgreSQL · REST & WebSockets · Playwright · Selenium · SQL · Scrumban · Jira'); return;
      case 'cv': {
        line('Downloading Ravender Pratap Singh’s resume…', 'ok');
        const a = document.createElement('a'); a.href = CV; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
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
