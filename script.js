const containers = ['gear-grid', 'case-card', 'pc-list', 'connections-list', 'upgrade-list']
  .map(id => document.getElementById(id));
const notice = document.getElementById('load-notice');
const message = document.getElementById('load-message');
const retry = document.getElementById('retry');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(className, url, name) {
  const link = element('a', className);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${name}, product page (opens in a new tab)`);
  return link;
}

function productLabel() {
  const label = element('span', 'product-link', 'Product page');
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  label.append(arrow);
  return label;
}

function productImage(item, className) {
  const media = element('div', className);
  const image = element('img');
  image.alt = item.name;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 600;
  image.height = 500;
  image.addEventListener('error', () => {
    media.replaceChildren(element('span', 'image-fallback', 'Product image unavailable'));
  }, { once: true });
  image.src = item.image;
  media.append(image);
  return media;
}

function gearCard(item) {
  const card = externalLink('gear-card', item.url, item.name);
  const body = element('div', 'gear-body');
  body.append(
    element('span', 'gear-kind', item.category.toUpperCase()),
    element('h3', '', item.name),
    element('p', '', item.meta),
    productLabel()
  );
  card.append(productImage(item, 'gear-media'), body);
  return card;
}

function caseCard(item) {
  const card = externalLink('case-link', item.url, item.name);
  const heading = element('div', 'case-heading');
  heading.append(element('span', 'gear-kind', 'THE CASE'));
  const body = element('div', 'case-body');
  body.append(element('h3', '', item.name), productLabel());
  card.append(heading, productImage(item, 'case-media'), body);
  return card;
}

function specRow(item) {
  const row = element('div', 'spec-row');
  const value = element('dd', 'spec-value');
  const description = element('div');
  description.append(element('span', 'spec-name', item.name), element('span', 'spec-meta', item.meta));
  value.append(description);
  row.append(element('dt', 'spec-kind', item.category), value);
  return row;
}

function connectionRow(item) {
  const row = element('div', 'connection');
  const device = element('div');
  device.append(element('strong', '', item.device), element('small', '', item.detail));
  const target = element('div');
  target.append(element('strong', '', item.target), element('small', '', item.port));
  const arrow = element('span', 'connection-arrow', '→');
  arrow.setAttribute('aria-label', 'connects to');
  row.append(device, arrow, target);
  return row;
}

function upgradeCard(item) {
  const card = element('div', 'upgrade');
  card.append(element('h3', '', item.name), element('p', '', item.why));
  return card;
}

function validateData(data) {
  function requireFields(item, fields) {
    if (!item || fields.some(key => typeof item[key] !== 'string' || !item[key].trim())) {
      throw new Error('Missing setup fields');
    }
  }

  function validateProduct(item) {
    requireFields(item, ['name', 'url', 'image']);
    if (new URL(item.url).protocol !== 'https:') throw new Error('Invalid product link');
    const imageURL = new URL(item.image, document.baseURI);
    const assetBase = new URL('./assets/', document.baseURI);
    if (imageURL.origin !== assetBase.origin || !imageURL.pathname.startsWith(assetBase.pathname)) {
      throw new Error('Product images must be local assets');
    }
  }

  requireFields(data, ['updated']);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.updated)) throw new Error('Invalid update date');
  const date = new Date(`${data.updated}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.updated) {
    throw new Error('Invalid update date');
  }

  for (const [key, fields] of Object.entries({
    gear: ['category', 'name', 'meta', 'image', 'url'],
    pc: ['category', 'name', 'meta'],
    connections: ['device', 'detail', 'target', 'port'],
    upgrades: ['name', 'why']
  })) {
    if (!Array.isArray(data[key]) || !data[key].length) throw new Error(`Missing ${key}`);
    data[key].forEach(item => requireFields(item, fields));
  }

  data.gear.forEach(validateProduct);
  validateProduct(data.case);
  return date;
}

function showPlaceholder(container, text) {
  if (container.tagName === 'DL') {
    const row = element('div', 'loading');
    row.append(element('dt', '', 'PC components'), element('dd', '', text));
    container.replaceChildren(row);
  } else {
    container.replaceChildren(element('p', 'loading', text));
  }
}

async function loadSetup() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  retry.disabled = true;

  containers.forEach(container => {
    container.setAttribute('aria-busy', 'true');
    showPlaceholder(container, 'Loading setup...');
  });

  if (!notice.hidden) message.textContent = 'Loading the setup again...';

  try {
    const response = await fetch('./data/setup.json', { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const date = validateData(data);

    const content = [
      data.gear.map(gearCard),
      [caseCard(data.case)],
      data.pc.map(specRow),
      data.connections.map(connectionRow),
      data.upgrades.map(upgradeCard)
    ];

    containers.forEach((container, index) => container.replaceChildren(...content[index]));

    const time = element('time', '', new Intl.DateTimeFormat('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(date));
    time.dateTime = data.updated;
    document.getElementById('updated').replaceChildren('Last updated ', time);

    const wasRetrying = !notice.hidden;
    notice.hidden = true;
    if (wasRetrying) document.querySelector('.gear-card').focus({ preventScroll: true });
  } catch {
    notice.hidden = false;
    message.textContent = "The setup couldn't be loaded. Please try again.";
    containers.forEach(container => showPlaceholder(container, 'Unavailable for now. Use Try again above to reload.'));
  } finally {
    clearTimeout(timeout);
    retry.disabled = false;
    containers.forEach(container => container.setAttribute('aria-busy', 'false'));
  }
}

retry.addEventListener('click', loadSetup);
loadSetup();
