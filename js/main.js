import { initConsent } from './modules/consent.js';
import { initHeader } from './modules/header.js';
import { initHeroMap } from './modules/hero-map.js';
import { initHeroVideo } from './modules/hero-video.js';
import { initTestimonials } from './modules/testimonials.js';

function drawIcons() {
  if (window.lucide && window.lucide.createIcons) {
    try { window.lucide.createIcons(); } catch (err) { /* icon font not ready yet */ }
  }
}

// Header/footer are composed at build time by Astro now, no runtime fetch
// step needed before these can safely query the DOM.
initConsent();
initHeader();
initHeroMap();
initHeroVideo();
initTestimonials();
drawIcons();
