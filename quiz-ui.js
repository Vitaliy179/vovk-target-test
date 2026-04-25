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
  let feed, progressFill, currentQEl, totalQEl, resultsEl, summaryEl, prevBtn;

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
  }

  /* ── Build results summary list ──────────────────────── */
  function buildSummary() {
    summaryEl.innerHTML = '';
    questions.forEach((q, i) => {
      const answer = answers[i] != null ? q.options[answers[i]] : '—';
      const row = document.createElement('div');
      row.className = 'r-item';
      row.innerHTML = `<div class="r-q">${i + 1}. ${q.q}</div><div class="r-a">${answer}</div>`;
      summaryEl.appendChild(row);
    });
  }

  /* ── Restart ──────────────────────────────────────────── */
  function restart() {
    QuizAnimations.hideResults(resultsEl, () => {
      answers.fill(null);
      activeIndex = 0;
      locked = false;
      feed.innerHTML = '';
      appendQuestion(0, 'right');
      updateMeta();
      document.getElementById('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return { init };
})();
