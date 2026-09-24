const AUTO_ADVANCE_MS = 7000;
const VISIBLE = 3;
const STAGGER_MS = 90;

export function initTestimonials() {
  const root = document.querySelector('[data-testimonials]');
  if (!root) return;

  const grid = root.querySelector('[data-testimonials-grid]');
  const dotsEl = root.querySelector('[data-testimonials-dots]');
  const prevBtn = root.querySelector('[data-testimonials-prev]');
  const nextBtn = root.querySelector('[data-testimonials-next]');
  const dataEl = document.getElementById('testimonials-data');
  if (!grid || !dotsEl || !dataEl) return;

  // Data is rendered server-side from the `testimonials` content collection
  // (see src/pages/index.astro), so Sveltia edits show up here with no
  // changes needed on the JS side.
  const TESTIMONIALS = JSON.parse(dataEl.textContent);
  if (!TESTIMONIALS.length) return;

  let index = 0;
  let timer = null;

  const renderCards = () => {
    grid.textContent = '';
    for (let k = 0; k < VISIBLE; k++) {
      const item = TESTIMONIALS[(index + k) % TESTIMONIALS.length];
      const num = ((index + k) % TESTIMONIALS.length) + 1;

      const card = document.createElement('article');
      card.className = 'testimonial-card';
      card.style.animationDelay = `${k * STAGGER_MS}ms`;

      const label = document.createElement('p');
      label.className = 'testimonial-card__label';
      label.textContent = `CUSTOMER ${String(num).padStart(2, '0')}`;

      const quote = document.createElement('p');
      quote.className = 'testimonial-card__quote';
      quote.textContent = item.quote;

      const name = document.createElement('p');
      name.className = 'testimonial-card__name';
      name.textContent = item.name;

      const role = document.createElement('p');
      role.className = 'testimonial-card__role';
      role.textContent = item.role;

      card.append(label, quote, name, role);
      grid.appendChild(card);
    }
  };

  const renderDots = () => {
    dotsEl.textContent = '';
    TESTIMONIALS.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      dot.setAttribute('aria-current', String(i === index));
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  };

  const render = () => {
    renderCards();
    renderDots();
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    timer = setInterval(() => {
      index = (index + 1) % TESTIMONIALS.length;
      render();
    }, AUTO_ADVANCE_MS);
  };

  const goTo = (i) => {
    index = ((i % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length;
    render();
    start(); // resume autoplay after manual navigation
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  render();
  start();
}
