import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const data = JSON.parse(await readFile(new URL('../data/setup.json', import.meta.url), 'utf8'));

test('English setup loads complete local images and a clean component list', async ({ page }) => {
  const errors = [];
  const externalRequests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
  });

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.gear-card')).toHaveCount(4);
  await expect(page.locator('.spec-row')).toHaveCount(7);
  await expect(page.locator('#pc')).not.toContainText('Planned');
  await expect(page.locator('#pc')).not.toContainText('Owned');
  await expect(page.locator('#pc')).not.toContainText('Not confirmed');
  await expect(page.locator('#updated')).toHaveText('Last updated 18 September 2026');
  await expect(page.locator('body')).not.toContainText(/[\u0400-\u04ff]/);

  for (const img of await page.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
    expect(await img.evaluate(node => {
      const image = node.getBoundingClientRect();
      const media = node.parentElement.getBoundingClientRect();
      return image.top >= media.top && image.bottom <= media.bottom && image.left >= media.left && image.right <= media.right;
    })).toBe(true);
  }

  for (const link of await page.locator('.gear-card, .case-link').all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }

  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test('navigation works on narrow screens without horizontal overflow or hidden headings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.gear-card')).toHaveCount(4);

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('navigation')).toBeVisible();

    for (const id of ['gear', 'pc', 'details']) {
      await page.locator(`nav a[href="#${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      const top = await page.locator(`#${id} h2`).evaluate(node => node.getBoundingClientRect().top);
      const headerBottom = await page.locator('header').evaluate(node => node.getBoundingClientRect().bottom);
      expect(top).toBeGreaterThanOrEqual(headerBottom);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.back-top').click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
});

test('details work with a keyboard and expose the real connection and upgrade notes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.gear-card')).toHaveCount(4);
  const summaries = page.locator('summary');

  for (let i = 0; i < 3; i++) {
    await summaries.nth(i).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('details').nth(i)).toHaveAttribute('open', '');
  }

  await expect(page.getByText('Port to be confirmed after assembly')).toBeVisible();
  await expect(page.getByText('32 GB DDR5-6000')).toBeVisible();
  await expect(page.getByText(/100 Mbps Ethernet/)).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('details').nth(2)).not.toHaveAttribute('open', '');
});

for (const failure of ['http', 'json', 'schema', 'network', 'timeout']) {
  test(`${failure} failure has a retry and does not disable software details`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (failure === 'timeout') await page.clock.install();

    await page.route('**/data/setup.json', async route => {
      if (failure === 'network') return route.abort();
      if (failure === 'timeout') return;
      if (failure === 'http') return route.fulfill({ status: 503, body: 'Unavailable' });
      if (failure === 'json') return route.fulfill({ status: 200, body: '{ invalid json' });
      return route.fulfill({ json: { ...data, pc: [{ ...data.pc[0], name: '' }] } });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (failure === 'timeout') await page.clock.fastForward(11000);
    await expect(page.getByRole('status')).toContainText("The setup couldn't be loaded");
    await page.locator('summary').nth(1).click();
    await expect(page.getByText(/100 Mbps Ethernet/)).toBeVisible();
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('.gear-card')).toHaveCount(4);
    await expect(page.locator('.spec-row')).toHaveCount(7);
    await expect(page.locator('#load-notice')).toBeHidden();
    await expect(page.locator('.gear-card').first()).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('missing product image has a readable fallback and a working product link', async ({ page }) => {
  await page.route('**/assets/monitor.*', route => route.abort());
  await page.goto('/');
  const card = page.locator('.gear-card').first();
  await card.scrollIntoViewIfNeeded();
  await expect(card.getByText('Product image unavailable')).toBeVisible();
  await expect(card).toHaveAttribute('href', data.gear[0].url);
});

test('data text is rendered as text and unsafe links are rejected', async ({ page }) => {
  await page.route('**/data/setup.json', route => route.fulfill({
    json: { ...data, gear: [{ ...data.gear[0], name: '<img src=x onerror=alert(1)>' }, ...data.gear.slice(1)] }
  }));
  await page.goto('/');
  await expect(page.locator('.gear-card h3').first()).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.gear-card h3 img')).toHaveCount(0);

  await page.unrouteAll();
  await page.route('**/data/setup.json', route => route.fulfill({
    json: { ...data, gear: [{ ...data.gear[0], url: 'javascript:alert(1)' }] }
  }));
  await page.reload();
  await expect(page.getByRole('status')).toContainText("The setup couldn't be loaded");
  await expect(page.locator('.gear-card')).toHaveCount(0);
});

test('native software details and data link are available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.getByRole('link', { name: 'read the setup data' })).toBeVisible();
  await page.locator('summary').nth(1).click();
  await expect(page.getByText(/100 Mbps Ethernet/)).toBeVisible();
  await context.close();
});

test('expanded setup has no WCAG A or AA accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.gear-card')).toHaveCount(4);
  for (const summary of await page.locator('summary').all()) await summary.click();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});
