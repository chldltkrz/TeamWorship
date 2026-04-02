// ============================================
// TeamWorship Landing Page — Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Navbar scroll effect ----------
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // ---------- Mobile hamburger ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navActions = document.querySelector('.nav__actions');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navActions.classList.toggle('open', isOpen);
    // Animate hamburger
    hamburger.classList.toggle('active', isOpen);
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navActions.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // ---------- Scroll animations ----------
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add animate-in class to elements
  const animateSelectors = [
    '.feature-card',
    '.step',
    '.testimonial-card',
    '.pricing-card',
    '.faq-item',
    '.hero__mockup'
  ];

  animateSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('animate-in');
      el.style.transitionDelay = `${i * 0.08}s`;
      observer.observe(el);
    });
  });

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ---------- CTA Form ----------
  const ctaForm = document.getElementById('ctaForm');
  ctaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = ctaForm.querySelector('input');
    const email = input.value.trim();
    if (email) {
      // Replace form with success message
      ctaForm.innerHTML = `
        <p style="color: var(--accent); font-weight: 600; font-size: 1.1rem;">
          🎉 ${email} 으로 초대 링크를 보내드렸습니다!
        </p>
      `;
    }
  });

  // ---------- Active nav highlight ----------
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav__links a[href="#${id}"]`);

      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.style.color = 'var(--text)';
        } else {
          link.style.color = '';
        }
      }
    });
  });
});
