/* ═══════════════════════════════════════════════════════════
 * Quiz UI Module
 * Manages state, builds DOM items, wires events.
 * Delegates all animation to QuizAnimations.
 * ═══════════════════════════════════════════════════════════ */
const QuizUI = (() => {

  /* ── State ────────────────────────────────────────────── */
  let questions   = [];
  let answers     = [];
  let activeIndex = 0;    // index of the current unanswered question
  let locked      = false; // prevents double-clicks during animation

  /* ── DOM refs ─────────────────────────────────────────── */
  let feed, progressFill, currentQEl, totalQEl, resultsEl, summaryEl, prevBtn, tierEl, footerEl;

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    questions   = window.QUIZ_QUESTIONS || [];
    answers     = new Array(questions.length).fill(null);
    feed        = document.getElementById('quizFeed');
    progressFill = document.getElementById('progressFill');
    currentQEl  = document.getElementById('currentQ');
    totalQEl    = document.getElementById('totalQ');
    resultsEl   = document.getElementById('results');
    summaryEl   = document.getElementById('resultsSummary');
    tierEl      = document.getElementById('resultsTier');
    footerEl    = document.getElementById('resultsFooter');
    prevBtn     = document.getElementById('prevBtn');

    if (!feed || !questions.length) return;

    gsap.set(resultsEl, { display: 'none', autoAlpha: 0 });
    totalQEl.textContent = questions.length;

    // Show first question
    appendQuestion(0, 'right');
    updateMeta();

    prevBtn.addEventListener('click', onPrev);
    document.getElementById('restartBtn')?.addEventListener('click', restart);
  }

  /* ── Build a question item element ───────────────────── */
  function buildItem(index) {
    const q   = questions[index];
    const num = String(index + 1).padStart(2, '0');

    const item = document.createElement('div');
    item.className  = 'qi';
    item.dataset.index = index;

    item.innerHTML = `
      <div class="qi-num">${num}</div>
      <div class="qi-body">
        <h2 class="qi-text">${q.q}</h2>
        <div class="qi-options"></div>
      </div>
    `;

    const optWrap = item.querySelector('.qi-options');
    q.options.forEach((text, optIdx) => {
      const opt = document.createElement('div');
      opt.className = 'option' + (answers[index] === optIdx ? ' is-selected' : '');
      opt.innerHTML = `<span class="dot"></span><span>${text}</span>`;
      opt.addEventListener('click', () => onOptionClick(index, optIdx, item, opt));
      optWrap.appendChild(opt);
    });

    return item;
  }

  /* ── Append a new question to the feed ───────────────── */
  function appendQuestion(index, direction) {
    locked = true;
    const item = buildItem(index);
    feed.appendChild(item);
    // Refresh ScrollTrigger so it knows about the new element's position
    ScrollTrigger.refresh();
    updateMeta();

    QuizAnimations.enterQuestion(item, direction);
    // Unlock after enter animation completes (~720ms)
    setTimeout(() => { locked = false; }, 820);

    // Scroll to the new question after a short delay (skip first — page load)
    if (index > 0) setTimeout(() => QuizAnimations.scrollToQuestion(item), 80);
  }

  /* ── Option click handler ─────────────────────────────── */
  function onOptionClick(qIndex, optIdx, itemEl, optEl) {
    if (locked || itemEl.classList.contains('qi--answered')) return;

    // Save answer
    answers[qIndex] = optIdx;

    // Update option selection visuals
    itemEl.querySelectorAll('.option').forEach((o, i) => {
      o.classList.toggle('is-selected', i === optIdx);
    });

    QuizAnimations.pulseOption(optEl);

    locked = true;

    setTimeout(() => {
      // Dim answered question
      QuizAnimations.dimQuestion(itemEl);
      itemEl.classList.add('qi--answered');
      itemEl.style.pointerEvents = 'none';

      if (qIndex >= questions.length - 1) {
        // Last question
        setTimeout(finish, 500);
      } else {
        activeIndex = qIndex + 1;
        updateMeta();
        // Append next question after dim starts
        setTimeout(() => appendQuestion(activeIndex, 'right'), 300);
      }
    }, 380);
  }

  /* ── Prev button ──────────────────────────────────────── */
  function onPrev() {
    if (locked || activeIndex === 0) return;

    // Remove the current (unanswered) question from DOM
    const current = feed.querySelector(`.qi[data-index="${activeIndex}"]`);
    if (current) {
      gsap.to(current, {
        x: 80, opacity: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => current.remove(),
      });
    }

    // Restore previous answered question
    activeIndex--;
    const prev = feed.querySelector(`.qi[data-index="${activeIndex}"]`);
    if (prev) {
      prev.classList.remove('qi--answered');
      prev.style.pointerEvents = '';
      answers[activeIndex] = null;
      // Re-deselect options
      prev.querySelectorAll('.option').forEach(o => o.classList.remove('is-selected'));
      QuizAnimations.restoreQuestion(prev);
      QuizAnimations.scrollToQuestionUp(prev);
    }

    updateMeta();
  }

  /* ── Update progress + counter + prev button state ─────── */
  function updateMeta() {
    currentQEl.textContent = activeIndex + 1;
    prevBtn.disabled = activeIndex === 0;

    const pct = ((activeIndex + 1) / questions.length) * 100;
    gsap.to(progressFill, { width: pct + '%', duration: 0.55, ease: 'power2.out' });
  }

  /* ── Finish — show results ────────────────────────────── */
  function finish() {
    buildSummary();
    QuizAnimations.revealResults(resultsEl);
    setTimeout(() => {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      locked = false;
    }, 200);
    setTimeout(() => {
      gsap.fromTo('.r-tier > *',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out' }
      );
      const bar = document.querySelector('.r-tier__bar');
      if (bar) gsap.to(bar, { width: bar.dataset.pct + '%', duration: 1.4, ease: 'power2.out', delay: 0.25 });
      gsap.fromTo('.r-foot',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.6 }
      );
    }, 650);
  }

  /* ── Score & tier helpers ─────────────────────────────── */
  function calcScore() {
    return answers.reduce((sum, ans) => sum + (ans != null ? (4 - ans) : 0), 0);
  }

  function getTier(score) {
    if (score >= 46) return {
      badge: '04 / 04', color: 'gold',
      title: 'Ти вже лідер — потрібен лише інструмент',
      text:  'Мотивація, дисципліна, готовність вчитись — все є. Ти з тих, хто не просто мріє, а діє. Таргет — це твій інструмент, який підсилить те, що вже є всередині. Питання не в тому, чи зможеш. Питання — коли починаємо.',
    };
    if (score >= 31) return {
      badge: '03 / 04', color: 'silver',
      title: 'Ти готовий більше, ніж думаєш',
      text:  'Мотивація є. Бажання є. Є і базові навички для старту. Більшість людей застрягає саме тут — бачать можливість, але ніяк не починають. Ти вже зробив крок, відповівши на ці питання. Далі — простіше.',
    };
    if (score >= 16) return {
      badge: '02 / 04', color: 'bronze',
      title: 'Ти на порозі змін',
      text:  'Ти вже бачиш, що хочеш чогось іншого. Ця внутрішня незадоволеність — не слабкість. Це сигнал, що ти готовий рухатись. Небагато потрібно, щоб переступити цю межу і почати будувати нову реальність.',
    };
    return {
      badge: '01 / 04', color: 'dim',
      title: 'Старт починається тут',
      text:  'Зараз ти в точці, де все попереду. Немає досвіду — немає страху зробити щось неправильно. Саме з такої точки виходять ті, хто потім дивується, як далеко зайшов. Головне зараз — зробити перший крок і не зупинятись.',
    };
  }

  /* ── Build results summary ────────────────────────────── */
  function buildSummary() {
    const score = calcScore();
    const tier  = getTier(score);
    const pct   = Math.round((score / 60) * 100);

    tierEl.innerHTML = `
      <div class="r-tier r-tier--${tier.color}">
        <span class="r-tier__badge">${tier.badge}</span>
        <h3 class="r-tier__title">${tier.title}</h3>
        <div class="r-tier__bar-wrap">
          <div class="r-tier__bar" style="width:0%" data-pct="${pct}"></div>
        </div>
        <p class="r-tier__score">${score} / 60 балів</p>
        <p class="r-tier__text">${tier.text}</p>
      </div>
    `;

    summaryEl.innerHTML = '';
    questions.forEach((q, i) => {
      const answer = answers[i] != null ? q.options[answers[i]] : '—';
      const row = document.createElement('div');
      row.className = 'r-item';
      row.innerHTML = `<div class="r-q">${i + 1}. ${q.q}</div><div class="r-a">${answer}</div>`;
      summaryEl.appendChild(row);
    });

    footerEl.innerHTML = `
      <div class="r-foot">
        <div class="r-foot__img-wrap">
          <img class="r-foot__img" src="images/up-mount.png" alt="">
        </div>
        <p class="r-foot__text">ти зможеш вийти нагору завдяки маленьким крокам</p>
      </div>
    `;
  }

  /* ── Restart ──────────────────────────────────────────── */
  function restart() {
    QuizAnimations.hideResults(resultsEl, () => {
      answers.fill(null);
      activeIndex = 0;
      locked = false;
      feed.innerHTML = '';
      tierEl.innerHTML  = '';
      footerEl.innerHTML = '';
      appendQuestion(0, 'right');
      updateMeta();
      document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return { init };
})();
