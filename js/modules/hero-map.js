// Decorative animated world map for the hero: dotted landmasses, dashed
// flight-route arcs between named hub cities, pulsing hub nodes, and glow
// dots that travel each route. Built once on load and appended as inline SVG.
const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 1200;
const H = 700;

const HUBS = {
  London: [-0.13, 51.5], Amsterdam: [4.9, 52.37], Frankfurt: [8.68, 50.11], Dublin: [-6.26, 53.35],
  Madrid: [-3.7, 40.42], Stockholm: [18.07, 59.33], Dubai: [55.27, 25.2], Mumbai: [72.88, 19.08],
  Singapore: [103.82, 1.35], HongKong: [114.17, 22.32], Tokyo: [139.69, 35.69], Sydney: [151.21, -33.87],
  NewYork: [-74.0, 40.71], LosAngeles: [-118.24, 34.05], Chicago: [-87.63, 41.88], SaoPaulo: [-46.63, -23.55],
  Johannesburg: [28.05, -26.2], Toronto: [-79.38, 43.65]
};

const ROUTES = [
  ['London', 'NewYork', 5.4], ['London', 'Frankfurt', 3.1], ['London', 'Amsterdam', 2.6], ['London', 'Dublin', 2.4],
  ['London', 'Dubai', 6.2], ['Dubai', 'Singapore', 5.6], ['Singapore', 'HongKong', 3.4], ['HongKong', 'Tokyo', 3.2],
  ['NewYork', 'LosAngeles', 5.0], ['LosAngeles', 'Tokyo', 7.4], ['London', 'Johannesburg', 7.0],
  ['NewYork', 'SaoPaulo', 6.4], ['Singapore', 'Sydney', 6.6], ['Frankfurt', 'Mumbai', 6.0],
  ['London', 'Stockholm', 3.0], ['Toronto', 'London', 5.6], ['Chicago', 'Amsterdam', 5.2], ['Madrid', 'London', 2.8]
];

const LAND = [
  [-168, -141, 54, 72], [-141, -60, 50, 71], [-127, -70, 42, 51], [-124, -70, 30, 49], [-114, -97, 20, 31],
  [-105, -88, 15, 22], [-92, -77, 7, 16], [-55, -20, 60, 83], [-80, -35, -5, 12], [-79, -35, -20, -5],
  [-73, -44, -35, -20], [-74, -64, -55, -35], [-10, 30, 36, 60], [4, 32, 55, 70], [-9, 2, 50, 59],
  [-17, 38, 14, 33], [-17, 15, 5, 15], [8, 42, -6, 6], [11, 41, -25, -6], [15, 33, -35, -25],
  [34, 60, 14, 40], [40, 180, 50, 72], [58, 142, 35, 51], [68, 90, 7, 31], [95, 110, 4, 23],
  [100, 122, 20, 41], [129, 146, 31, 46], [95, 141, -10, 5], [113, 153, -39, -11], [166, 179, -47, -34]
];

function isLand(lon, lat) {
  for (let i = 0; i < LAND.length; i++) {
    const r = LAND[i];
    if (lon >= r[0] && lon <= r[1] && lat >= r[2] && lat <= r[3]) return true;
  }
  return false;
}

function proj(lon, lat) {
  return [((lon + 180) / 360) * W, ((80 - lat) / 142) * H];
}

function el(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value);
    } else {
      node.setAttribute(key, value);
    }
  });
  return node;
}

function buildMap() {
  const svg = el('svg', {
    viewBox: `0 0 ${W} ${H}`,
    preserveAspectRatio: 'xMidYMid slice'
  });

  const defs = el('defs');
  const filter = el('filter', { id: 'dfGlow', x: '-300%', y: '-300%', width: '700%', height: '700%' });
  filter.appendChild(el('feGaussianBlur', { stdDeviation: '3', result: 'b' }));
  const merge = el('feMerge');
  merge.appendChild(el('feMergeNode', { in: 'b' }));
  merge.appendChild(el('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const dotsGroup = el('g');
  for (let lon = -180; lon <= 180; lon += 3.2) {
    for (let lat = 78; lat >= -58; lat -= 3.0) {
      if (!isLand(lon, lat)) continue;
      const [x, y] = proj(lon, lat);
      const dense = lon > -15 && lon < 45 && lat > 30 && lat < 62;
      dotsGroup.appendChild(el('circle', {
        cx: x, cy: y, r: dense ? 2.1 : 1.8,
        fill: dense ? 'rgba(255,125,191,0.46)' : 'rgba(168,85,247,0.34)'
      }));
    }
  }
  svg.appendChild(dotsGroup);

  const arcsGroup = el('g');
  const flyersGroup = el('g');
  ROUTES.forEach((route, i) => {
    const [fromKey, toKey, speed] = route;
    const a = proj(...HUBS[fromKey]);
    const b = proj(...HUBS[toKey]);
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const lift = Math.min(len * 0.26, 160);
    const cx = mx - (dy / len) * lift;
    const cy = my + (dx / len) * lift;
    const d = `M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`;
    const pathId = `dfr${i}`;

    const arc = el('path', {
      id: pathId, d, fill: 'none',
      stroke: i % 3 === 0 ? 'rgba(255,61,154,0.6)' : 'rgba(168,85,247,0.5)',
      'stroke-width': 1.3, 'stroke-linecap': 'round', 'stroke-dasharray': '150 190'
    });
    arc.style.animation = `df-dash ${speed * 1.5}s linear infinite`;
    arcsGroup.appendChild(arc);

    const flyer = el('circle', { r: 3, fill: '#FFD9EC', filter: 'url(#dfGlow)' });
    const motion = el('animateMotion', {
      dur: `${speed * 1.5}s`, repeatCount: 'indefinite', begin: `${i * 0.4}s`
    });
    motion.appendChild(el('mpath', { href: `#${pathId}` }));
    flyer.appendChild(motion);
    flyersGroup.appendChild(flyer);
  });
  svg.appendChild(arcsGroup);

  const nodesGroup = el('g');
  Object.keys(HUBS).forEach((key, i) => {
    const [x, y] = proj(...HUBS[key]);
    const group = el('g');
    const pulse = el('circle', {
      cx: x, cy: y, r: 3, fill: 'none', stroke: 'rgba(255,61,154,0.7)', 'stroke-width': 1.4
    });
    pulse.style.animation = `df-pulse ${3 + (i % 4) * 0.6}s ease-out infinite`;
    group.appendChild(pulse);
    group.appendChild(el('circle', { cx: x, cy: y, r: 2.5, fill: '#FF7DBF' }));
    nodesGroup.appendChild(group);
  });
  svg.appendChild(nodesGroup);
  svg.appendChild(flyersGroup);

  return svg;
}

export function initHeroMap() {
  const container = document.querySelector('[data-hero-map]');
  if (!container) return;
  container.appendChild(buildMap());
}
