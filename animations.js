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

  /* --- 3. Inline atribut əvəzediciləri (CSP üçün) ----------------------- */
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
    initInlineReplacements();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
