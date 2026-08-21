/**
 * Rahat İzle — animasiya və mobil menyu nəzarəti.
 * Heç bir xarici kitabxana yoxdur; scroll zamanı JS işləmir (IntersectionObserver),
 * ona görə də mobil cihazlarda sürüşmə axıcı qalır.
 */
(function () {
  'use strict';

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dərhal (body qurulmamışdan əvvəl) tətbiq olunur ki, reveal elementləri
  // bir an görünüb sonra yox olmasın. JS bloklanıbsa sinif əlavə olunmur və
  // bütün məzmun normal görünür.
  document.documentElement.classList.add('js-reveal');

  /* --- 1. Scroll-reveal ------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    // IntersectionObserver dəstəklənmirsə və ya hərəkət söndürülübsə,
    // hər şeyi dərhal görünən edirik.
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-revealed');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // bir dəfə açılır, sonra izlənmir
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- 2. Mobil menyu --------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById('mobileMenuToggle');
    var menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Menyudan kənara toxunanda bağlanır
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('is-open') && !menu.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    // Menyudakı linkə basdıqda bağlanır
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) setOpen(false);
    });

    // Ekran masaüstü ölçüsünə keçəndə menyu açıq qalmasın
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setOpen(false);
    });
  }

  /* --- 3. Sayğac animasiyası ("Rəqəmlərlə Rahat İzlə") ------------------- */
  function initCounters() {
    var targets = document.querySelectorAll('[data-count-to]');
    if (!targets.length) return;

    function renderFinal(el) {
      el.textContent = el.getAttribute('data-count-to') + (el.getAttribute('data-count-suffix') || '');
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < targets.length; i++) renderFinal(targets[i]);
      return;
    }

    var duration = 1200;

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10);
      var suffix = el.getAttribute('data-count-suffix') || '';
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          renderFinal(el);
        }
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- 4. FAQ akkordeon --------------------------------------------------- */
  function initFaq() {
    var triggers = document.querySelectorAll('.faq-trigger');
    if (!triggers.length) return;

    triggers.forEach(function (btn) {
      var panel = btn.nextElementSibling;
      if (!panel) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          panel.style.maxHeight = '0px';
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* --- 5. Inline atribut əvəzediciləri (CSP üçün) ----------------------- */
  function initInlineReplacements() {
    // Əvvəllər `onsubmit="event.preventDefault()"` idi
    document.querySelectorAll('form[data-no-submit]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
      });
    });

    // Əvvəllər `onclick="document.getElementById(...).click()"` idi
    document.querySelectorAll('[data-trigger-file]').forEach(function (el) {
      el.addEventListener('click', function () {
        var target = document.getElementById(el.getAttribute('data-trigger-file'));
        if (target) target.click();
      });
    });
  }

  function init() {
    initReveal();
    initMobileMenu();
    initCounters();
    initFaq();
    initInlineReplacements();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
