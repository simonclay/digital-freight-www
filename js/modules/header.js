// Sticky header: scroll-state styling, hover mega-menus (desktop) /
// tap-to-expand accordion (mobile), and the mobile nav drawer.
const MOBILE_QUERY = '(max-width: 1080px)';

export function initHeader() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const toggle = header.querySelector('[data-nav-toggle]');
  const panel = header.querySelector('[data-nav-panel]');
  const menuItems = Array.from(header.querySelectorAll('[data-menu]'));
  const mobileMedia = window.matchMedia(MOBILE_QUERY);

  const onScroll = () => {
    const scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 60;
    header.classList.toggle('is-scrolled', scrolled);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight whichever nav item matches the page we're actually on.
  const path = window.location.pathname;
  header.querySelectorAll('[data-nav-link]').forEach((link) => {
    const linkPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
    if (linkPath !== '/' && path.startsWith(linkPath)) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });
  if (path.startsWith('/services/')) {
    const trigger = header.querySelector('[data-menu="services"] [data-menu-trigger]');
    if (trigger) trigger.classList.add('is-current');
  }
  if (path.startsWith('/sectors/')) {
    const trigger = header.querySelector('[data-menu="sectors"] [data-menu-trigger]');
    if (trigger) trigger.classList.add('is-current');
  }

  const closeAllMenus = () => {
    menuItems.forEach((item) => {
      item.classList.remove('is-open');
      const link = item.querySelector('[data-menu-trigger]');
      if (link) link.setAttribute('aria-expanded', 'false');
    });
  };

  const openMenu = (item) => {
    menuItems.forEach((other) => {
      if (other !== item) other.classList.remove('is-open');
    });
    item.classList.add('is-open');
    const link = item.querySelector('[data-menu-trigger]');
    if (link) link.setAttribute('aria-expanded', 'true');
  };

  menuItems.forEach((item) => {
    const trigger = item.querySelector('[data-menu-trigger]');
    if (!trigger) return;

    item.addEventListener('mouseenter', () => {
      if (mobileMedia.matches) return;
      openMenu(item);
    });

    trigger.addEventListener('click', (event) => {
      if (!mobileMedia.matches) return;
      // On mobile the trigger toggles an inline accordion panel instead of
      // navigating straight to the section — the panel's own links still
      // navigate normally.
      event.preventDefault();
      const isOpen = item.classList.contains('is-open');
      closeAllMenus();
      if (!isOpen) openMenu(item);
    });
  });

  header.addEventListener('mouseleave', () => {
    if (mobileMedia.matches) return;
    closeAllMenus();
  });

  const closeNav = () => {
    header.classList.remove('is-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    header.classList.add('is-nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };

  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.contains('is-nav-open');
      if (isOpen) closeNav();
      else openNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-nav-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Close the drawer once a real link is followed (menu triggers toggle
    // the accordion instead, and are handled separately above).
    panel.querySelectorAll('a').forEach((link) => {
      if (link.hasAttribute('data-menu-trigger')) return;
      link.addEventListener('click', () => {
        if (mobileMedia.matches) closeNav();
      });
    });
  }

  mobileMedia.addEventListener('change', (event) => {
    closeAllMenus();
    if (!event.matches) closeNav();
  });
}
