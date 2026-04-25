/* ═══════════════════════════════════════════════════════════
 * Main — door scrub + alternating text block animations.
 * ═══════════════════════════════════════════════════════════ */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initDoorScene();
    initAboutItems();
  });

  /* ── Door / hero scrub ────────────────────────────────── */
  function initDoorScene() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const isTouch = ScrollTrigger.isTouch === 1;

    gsap.set('.line-inner', { yPercent: 110 });
    gsap.to('.line-inner', {
      yPercent: 0,
      duration: isTouch ? 1.2 : 1.6,
      ease: 'expo.out',
      stagger: 0.18,
      delay: 0.3,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=120%',
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: 'none' },
    });

    tl.to('.hero-bg-img', { opacity: 1, scale: 1 }, 0);
    tl.to('.door-left',   { xPercent: -100 }, 0);
    tl.to('.door-right',  { xPercent:  100 }, 0);
    const titleFadeStart = isTouch ? 0 : 0.05;
    tl.to('.hero-title',  { opacity: 0, ease: 'power1.inOut' }, titleFadeStart);
    tl.to('.scroll-hint', { opacity: 0 }, 0);
    tl.to('.hero-nav',    { opacity: 0 }, 0.1);
  }

  /* ── Alternating text blocks ──────────────────────────── */
  function initAboutItems() {
    // Smaller offset on touch/mobile to avoid overflow issues
    const isTouch = ScrollTrigger.isTouch === 1;
    const xRight  =  isTouch ?  50 :  200;
    const xLeft   =  isTouch ? -50 : -100;

    gsap.utils.toArray('.from-right').forEach(item => {
      gsap.fromTo(item,
        { x: xRight, opacity: 0 },
        { x: 0, opacity: 1,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end:   'top 20%',
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });

    gsap.utils.toArray('.from-left').forEach(item => {
      gsap.fromTo(item,
        { x: xLeft, opacity: 0 },
        { x: 0, opacity: 1,
          scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end:   'top 20%',
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }
})();
