/* ═══════════════════════════════════════════════════════════
 * Main — door scrub + alternating text block animations.
 * ═══════════════════════════════════════════════════════════ */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    initDoorScene();
    initAboutItems();
    initExperiment();
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

  /* ── Experiment block ────────────────────────────────── */
  function initExperiment() {
    const section = document.getElementById('experiment');
    if (!section) return;

    gsap.fromTo('.exp-inner > *',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, stagger: 0.13, ease: 'power2.out',
        scrollTrigger: { trigger: '#experiment', start: 'top 78%' } }
    );

    const btn    = document.getElementById('expCheckBtn');
    const input  = document.getElementById('expInput');
    const answer = document.getElementById('expAnswer');
    let   typing = false;

    function isCorrect(val) {
      return /149/.test(val.replace(/[\s,._]/g, ''));
    }

    btn.addEventListener('click', () => {
      if (!input.value.trim() || typing) return;
      typing = true;
      btn.disabled = true;

      document.getElementById('expUserAns').textContent = input.value.trim();

      const correct = isCorrect(input.value);

      gsap.set(answer, { display: 'block' });
      gsap.fromTo(answer,
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out',
          onComplete: () => startTypewriter(correct) }
      );

      setTimeout(() => {
        const top = answer.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 300);
    });

    function startTypewriter(correct) {
      const p1a = correct
        ? "Вау! Наша команда справді здивована — ти один з тих небагатьох, хто знав правильну відповідь. Дуже мало людей здогадуються про це. Дійсно, товщина паперу після 50 складань дорівнює відстані від Землі до Сонця — "
        : "Відповідь звучить так, що лист паперу, складений у п'ятдесят разів, матиме товщину, яка дорівнює відстані від Землі до Сонця — ";
      const p1b = "149 мільйонів кілометрів.";
      const p2  = "Сенс цього експерименту в тому, що наш мозок не бачить усю велич нашого потенціалу — він не здатний інтуїтивно оцінити масштаб експоненційного зростання.";
      const p3  = "Так само і в житті: ти не бачиш потенціалу маленьких дій у моменті. Але регулярне повторення однієї дії щодня здатне підняти тебе до результатів, які сьогодні здаються недосяжними.";

      const ap1    = document.getElementById('expAp1');
      const ap2    = document.getElementById('expAp2');
      const ap3    = document.getElementById('expAp3');
      const cursor = document.getElementById('expCursor');

      const plain1 = document.createElement('span');
      const gold1  = document.createElement('span');
      gold1.className = 'exp-accent';
      ap1.appendChild(plain1);
      ap1.appendChild(gold1);

      const SPEED = 22;
      typeInto(plain1, p1a, SPEED, () =>
        typeInto(gold1, p1b, SPEED, () =>
          typeInto(ap2, p2, SPEED, () =>
            typeInto(ap3, p3, SPEED, () => {
              cursor.classList.add('hidden');
            })
          )
        )
      );
    }

    function typeInto(el, text, speed, onDone) {
      let i = 0;
      const id = setInterval(() => {
        if (i < text.length) { el.textContent += text[i++]; }
        else { clearInterval(id); if (onDone) onDone(); }
      }, speed);
    }
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
