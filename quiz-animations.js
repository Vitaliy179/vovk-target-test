/* ═══════════════════════════════════════════════════════════
 * Quiz Animations Module
 * Pure animation functions — no state, no DOM queries.
 * ═══════════════════════════════════════════════════════════ */
const QuizAnimations = (() => {

  /* ── Config ───────────────────────────────────────────── */
  const CFG = {
    enter:      { duration: 0.72, ease: 'power3.out' },
    dim:        { duration: 0.50, ease: 'power2.inOut', opacity: 0.26 },
    optStagger: { duration: 0.40, ease: 'power2.out', stagger: 0.055 },
    optPulse:   { duration: 0.18, ease: 'power2.out' },
    scroll:     { duration: 680 },
    exit:       { duration: 0.42, ease: 'power2.in' },
  };

  /* ── Smooth scroll (fallback when ScrollSmoother not active) ── */
  function scrollTo(targetY, onDone) {
    const start = window.scrollY;
    const dist  = targetY - start;
    const dur   = CFG.scroll.duration;
    let t0 = null;

    function eio(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    function step(ts) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      window.scrollTo(0, start + dist * eio(p));
      if (p < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    }
    requestAnimationFrame(step);
  }

  /* ── Public API ───────────────────────────────────────── */
  return {

    /* Slide question in from the side via ScrollTrigger scrub
     * — mirrors the gallery slide-in from the reference project */
    enterQuestion(el, direction = 'right') {
      const xFrom = direction === 'right' ? 100 : -100;

      gsap.set(el, { x: xFrom, opacity: 0, scale: 0.985 });
      gsap.set(el.querySelectorAll('.option'), { y: 16, opacity: 0 });

      // Scrub-based slide from the side (tied to scroll position)
      gsap.to(el, {
        x: 0, opacity: 1, scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          end:   'top 28%',
          scrub: 0.6,
          onEnter: () => {
            // Options cascade in once the question starts entering view
            gsap.to(el.querySelectorAll('.option'), {
              y: 0, opacity: 1,
              duration:  CFG.optStagger.duration,
              ease:      CFG.optStagger.ease,
              stagger:   CFG.optStagger.stagger,
              delay:     0.12,
            });
          },
        },
      });
    },

    /* Dim a completed question item */
    dimQuestion(el) {
      return gsap.to(el, { opacity: CFG.dim.opacity, ...CFG.dim });
    },

    /* Restore a previously dimmed question */
    restoreQuestion(el) {
      return gsap.to(el, { opacity: 1, duration: CFG.dim.duration, ease: CFG.dim.ease });
    },

    /* Brief pulse on selected option */
    pulseOption(el) {
      return gsap.fromTo(el,
        { scale: 1 },
        { scale: 1.025, duration: CFG.optPulse.duration, ease: CFG.optPulse.ease,
          yoyo: true, repeat: 1 }
      );
    },

    /* Scroll window so el appears at ~12% from top */
    scrollToQuestion(el, offset = 0.12) {
      if (window.SMOOTHER) {
        window.SMOOTHER.scrollTo(el, true, 'top 12%');
      } else {
        const rect   = el.getBoundingClientRect();
        const target = window.scrollY + rect.top - window.innerHeight * offset;
        scrollTo(Math.max(0, target));
      }
    },

    /* Scroll up to a previous question */
    scrollToQuestionUp(el) {
      if (window.SMOOTHER) {
        window.SMOOTHER.scrollTo(el, true, 'top 30%');
      } else {
        const rect   = el.getBoundingClientRect();
        const target = window.scrollY + rect.top - window.innerHeight * 0.30;
        scrollTo(Math.max(0, target));
      }
    },

    /* Results reveal */
    revealResults(el) {
      gsap.set(el, { display: 'flex', autoAlpha: 0, y: 48 });
      return gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' });
    },

    hideResults(el, onDone) {
      return gsap.to(el, {
        autoAlpha: 0, y: 24,
        duration: 0.45, ease: 'power2.in',
        onComplete: () => {
          gsap.set(el, { display: 'none' });
          if (onDone) onDone();
        },
      });
    },

    config: CFG,
  };
})();
