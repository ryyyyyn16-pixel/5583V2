(() => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navItems = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const year = document.getElementById('year');

  // Restore a saved theme when available; default to the user's system preference.
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('ryan-portfolio-theme'); } catch (_) { /* storage may be unavailable */ }
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (systemDark ? 'dark' : 'light'));

  function setTheme(theme) {
    const isDark = theme === 'dark';
    body.classList.toggle('dark', isDark);
    if (themeIcon) themeIcon.textContent = isDark ? '☀' : '☾';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  themeToggle?.addEventListener('click', () => {
    const next = body.classList.contains('dark') ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('ryan-portfolio-theme', next); } catch (_) { /* theme still works without storage */ }
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  navItems.forEach(link => link.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }));

  // Reveal elements only when motion is allowed; otherwise CSS shows them immediately.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach(element => observer.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add('visible'));
  }

  // Keep the navigation state in sync with the section visible in the viewport.
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navItems.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.1, 0.3, 0.6] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  if (year) year.textContent = String(new Date().getFullYear());
})();
