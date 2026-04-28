/* ═══════════════════════════════════════════════════════════
 * About page — animations
 * ═══════════════════════════════════════════════════════════ */
const AboutPage = (() => {

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    initHero();
    initSplitBlocks();
    initStats();
    initCourse();
    initQuote();
    initConnect();
  }

  /* ── Hero: title slide-up + text/photo from opposite sides ─ */
  function initHero() {
    const isTouch = ScrollTrigger.isTouch === 1;

    /* Title lines rise up */
    gsap.set('.ah-line-inner', { yPercent: 110 });
    gsap.to('.ah-line-inner', {
      yPercent: 0,
      duration: isTouch ? 1.2 : 1.6,
      ease: 'expo.out',
      stagger: 0.18,
      delay: 0.3,
    });

    /* Meta text fades in */
    gsap.fromTo('.ah-meta',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.9 }
    );

    /* Text column slides from left */
    gsap.fromTo('.ah-text-col',
      { x: isTouch ? -40 : -80, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.2 }
    );

    /* Photo column slides from right */
    gsap.fromTo('.ah-photo-col',
      { x: isTouch ? 40 : 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.4, ease: 'expo.out', delay: 0.2 }
    );

    /* Subtle photo parallax while scrolling hero */
    gsap.to('.ah-photo-col img', {
      y: isTouch ? -20 : -50,
      ease: 'none',
      scrollTrigger: {
        trigger: '#about-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      }
    });
  }

  /* ── Split blocks: photo and text slide from opposite sides ─ */
  function initSplitBlocks() {
    const isTouch = ScrollTrigger.isTouch === 1;
    const off = isTouch ? 60 : 132;

    document.querySelectorAll('.split-block').forEach(block => {
      const photo = block.querySelector('.split-photo');
      const text  = block.querySelector('.split-text');
      const isRev = block.classList.contains('rev');

      const xPhoto = isRev ? off : -off;
      const xText  = isRev ? -off : off;

      gsap.fromTo(photo,
        { x: xPhoto, opacity: 0 },
        { x: 0, opacity: 1,
          scrollTrigger: {
            trigger: block,
            start: 'top 85%',
            end:   'top 25%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        }
      );

      gsap.fromTo(text,
        { x: xText, opacity: 0 },
        { x: 0, opacity: 1,
          scrollTrigger: {
            trigger: block,
            start: 'top 85%',
            end:   'top 25%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }

  /* ── Stats: y-stagger ───────────────────────────────────── */
  function initStats() {
    const statsEl = document.querySelector('.pm-stats');
    if (!statsEl) return;

    gsap.utils.toArray('.pm-stat').forEach(stat => {
      gsap.fromTo(stat,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1,
          scrollTrigger: {
            trigger: statsEl,
            start: 'top 88%',
            end:   'top 45%',
            scrub: 0.8,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }

  /* ── Course: header + lessons stagger from left ─────────── */
  function initCourse() {
    gsap.fromTo('.aс-header',
      { x: -60, opacity: 0 },
      { x: 0, opacity: 1,
        scrollTrigger: {
          trigger: '#about-course',
          start: 'top 85%',
          end:   'top 40%',
          scrub: true,
          invalidateOnRefresh: true,
        }
      }
    );

    gsap.utils.toArray('.aс-lesson').forEach((lesson, i) => {
      gsap.fromTo(lesson,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1,
          scrollTrigger: {
            trigger: '.aс-lessons',
            start: `top ${90 - i * 4}%`,
            end:   `top ${55 - i * 4}%`,
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }

  /* ── Quote: fade up ─────────────────────────────────────── */
  function initQuote() {
    gsap.fromTo('.aq-text',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1,
        scrollTrigger: {
          trigger: '#about-quote',
          start: 'top 80%',
          end:   'top 30%',
          scrub: true,
          invalidateOnRefresh: true,
        }
      }
    );
    gsap.fromTo('.aq-author',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1,
        scrollTrigger: {
          trigger: '#about-quote',
          start: 'top 65%',
          end:   'top 25%',
          scrub: true,
          invalidateOnRefresh: true,
        }
      }
    );
  }

  /* ── Connect: title + social icons stagger ──────────────── */
  function initConnect() {
    gsap.fromTo('.acn-title',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1,
        scrollTrigger: {
          trigger: '#about-connect',
          start: 'top 85%',
          end:   'top 50%',
          scrub: true,
          invalidateOnRefresh: true,
        }
      }
    );

    gsap.utils.toArray('.acn-social').forEach((el, i) => {
      gsap.fromTo(el,
        { y: 40, scale: 0.82, opacity: 0 },
        { y: 0, scale: 1, opacity: 1,
          scrollTrigger: {
            trigger: '.acn-socials',
            start: `top ${92 - i * 5}%`,
            end:   `top ${58 - i * 5}%`,
            scrub: true,
            invalidateOnRefresh: true,
          }
        }
      );
    });
  }

  return { init };
})();
