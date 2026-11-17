/**
 * JA Pinturas - Script Principal
 * Funcionalidades:
 * 1. Menu mobile em tela cheia com bloqueio de scroll
 * 2. Acordeao de servicos no celular e preview dinâmico no desktop
 * 3. Comparador interativo de antes e depois com suporte a touch e drag
 * 4. Animacoes de scroll discretas com IntersectionObserver
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. MENU MOBILE (Tela cheia com fundo azul profundo)
     ========================================================================== */
  const menuBtn = document.getElementById('btn-menu');
  const navMenu = document.getElementById('menu-navegacao');
  const navLinks = document.querySelectorAll('.nav-item, .nav-mobile-footer a');

  function toggleMenu(isOpen) {
    const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !navMenu.classList.contains('is-open');
    if (shouldOpen) {
      navMenu.classList.add('is-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      navMenu.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => toggleMenu());

    // Fecha o menu ao clicar em qualquer link interno
    navLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    // Fecha o menu com a tecla Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  }

  /* ==========================================================================
     2. SERVICOS: ACORDEAO NO CELULAR E PREVIEW NO DESKTOP
     ========================================================================== */
  const serviceRows = document.querySelectorAll('.service-row');
  const previewFigure = document.getElementById('preview-figure');
  const previewImg = document.getElementById('preview-img');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewCode = document.getElementById('preview-code');
  const placeholderCode = document.getElementById('placeholder-code');
  const previewCaption = document.getElementById('preview-caption');
  const previewEditorialCaption = document.getElementById('preview-editorial-caption');
  const previewNote = document.getElementById('preview-note');

  function updateDesktopPreview(row) {
    if (!row) return;
    const num = row.getAttribute('data-service') || '01';
    const photo = row.getAttribute('data-photo') || '';
    const detail = row.getAttribute('data-detail') || '';
    const imgSrc = row.getAttribute('data-img') || '';

    if (previewNote) previewNote.textContent = detail;
    if (previewEditorialCaption) previewEditorialCaption.textContent = photo;

    if (imgSrc) {
      if (previewImg) {
        previewImg.src = imgSrc;
        previewImg.alt = photo;
      }
      if (previewCode) previewCode.textContent = num.padStart(2, '0');
      if (previewFigure) previewFigure.style.display = 'block';
      if (previewPlaceholder) previewPlaceholder.style.display = 'none';
    } else {
      if (previewFigure) previewFigure.style.display = 'none';
      if (previewPlaceholder) {
        previewPlaceholder.style.display = 'flex';
        if (placeholderCode) placeholderCode.textContent = num.padStart(2, '0');
        if (previewCaption) previewCaption.textContent = photo;
      }
    }

    serviceRows.forEach(r => r.classList.remove('is-active'));
    row.classList.add('is-active');
  }

  serviceRows.forEach(row => {
    const summary = row.querySelector('.service-row-summary');

    if (summary) {
      summary.addEventListener('click', () => {
        const isMobile = window.innerWidth < 1024;
        if (isMobile) {
          const wasOpen = row.classList.contains('is-open');
          // Fecha os outros para manter foco editorial
          serviceRows.forEach(r => {
            r.classList.remove('is-open');
            const btn = r.querySelector('.service-row-summary');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });

          if (!wasOpen) {
            row.classList.add('is-open');
            summary.setAttribute('aria-expanded', 'true');
          }
        } else {
          updateDesktopPreview(row);
        }
      });

      // Suporte a teclado no summary
      summary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          summary.click();
        }
      });
    }

    // Hover no desktop atualiza o preview lateral
    row.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1024) {
        updateDesktopPreview(row);
      }
    });
  });

  // Inicializa o primeiro servico como ativo
  if (serviceRows.length > 0 && window.innerWidth < 1024) {
    serviceRows[0].classList.add('is-open');
  }

  /* ==========================================================================
     3. COMPARADOR INTERATIVO ANTES E DEPOIS
     ========================================================================== */
  const comparisonStage = document.getElementById('comparison-stage');
  const beforeLayer = document.getElementById('before-layer');
  const sliderHandle = document.getElementById('slider-handle');
  const sliderRange = document.getElementById('slider-range-input');
  let isDragging = false;

  function setSliderPosition(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    if (beforeLayer) beforeLayer.style.width = clamped + '%';
    if (sliderHandle) sliderHandle.style.left = clamped + '%';
    if (sliderRange) sliderRange.value = clamped;
  }

  function handlePointerMove(e) {
    if (!isDragging || !comparisonStage) return;
    const rect = comparisonStage.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }

  if (comparisonStage) {
    comparisonStage.addEventListener('pointerdown', (e) => {
      isDragging = true;
      comparisonStage.setPointerCapture(e.pointerId);
      handlePointerMove(e);
    });

    comparisonStage.addEventListener('pointermove', handlePointerMove);

    function stopDragging(e) {
      if (isDragging) {
        isDragging = false;
        try {
          comparisonStage.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    }

    comparisonStage.addEventListener('pointerup', stopDragging);
    comparisonStage.addEventListener('pointercancel', stopDragging);

    // Suporte ao input acessivel por teclado
    if (sliderRange) {
      sliderRange.addEventListener('input', (e) => {
        setSliderPosition(parseFloat(e.target.value));
      });
    }
  }

  /* Abas do Comparador de Obras */
  const tabButtons = document.querySelectorAll('.works-tab-nav .tab-btn');
  const afterCaption = document.getElementById('after-caption');
  const beforeCaption = document.getElementById('before-caption');
  const compLocation = document.getElementById('comp-location');
  const compWorktype = document.getElementById('comp-worktype');

  const worksData = {
    'work-1': {
      before: 'Foto: fachada com descascamento, fungos e trincas de dilatação',
      after: 'Foto: fachada totalmente restaurada, impermeabilizada e pintada',
      location: 'Obra 01: Edifício residencial no litoral de SC',
      worktype: 'Tratamento de trincas, selador acrílico e pintura airless'
    },
    'work-2': {
      before: 'Foto: living residencial com paredes descoloridas e manchas',
      after: 'Foto: acabamento liso e aveludado com massa corrida e tinta fosca',
      location: 'Obra 02: Residência de alto padrão em Itapema',
      worktype: 'Lixamento Mirka sem pó, isolamento total e pintura de interiores'
    },
    'work-3': {
      before: 'Foto: parede em alvenaria crua com imperfeições visíveis',
      after: 'Foto: parede decorativa com cimento queimado fosco e hidrorrepelente',
      location: 'Obra 03: Espaço corporativo em Itajaí',
      worktype: 'Aplicação técnica de cimento queimado e selador de proteção'
    }
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (!target || !worksData[target]) return;

      tabButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const data = worksData[target];
      if (beforeCaption) beforeCaption.textContent = data.before;
      if (afterCaption) afterCaption.textContent = data.after;
      if (compLocation) compLocation.textContent = data.location;
      if (compWorktype) compWorktype.textContent = data.worktype;

      // Reseta para 50% para permitir comparacao imediata
      setSliderPosition(50);
    });
  });

  /* ==========================================================================
     4. ANIMACOES DISCRETAS DE SCROLL (Fade com 8px de deslocamento)
     ========================================================================== */
  const revealElements = document.querySelectorAll(
    '.section-heading-block, .service-row, .tech-card, .audience-col, .process-step, .testimonial-card, .gallery-item'
  );

  revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
});
