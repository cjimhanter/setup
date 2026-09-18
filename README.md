# cjimhanter / setup

A personal page for my gaming and work setup: peripherals, an AM5 PC build, connections, software, and future upgrades.

The public page is intentionally a **setup showcase**, not a purchase tracker. It does not label parts as owned, planned, or unconfirmed.

## Run locally

Use Node.js 24 or newer:

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Use the local server instead of opening `index.html` directly: the page loads its setup data over HTTP.

The public site uses plain HTML, CSS, and JavaScript. It has no runtime dependencies, external fonts, or third-party image requests.

## Update the setup

Edit `data/setup.json` for peripherals, the case, PC components, connections, and upgrade plans.

- `updated`: date in `YYYY-MM-DD` format.
- `gear`: category, model name, short specifications, local image path, and HTTPS product URL.
- `case`: model name, local image, and HTTPS product URL.
- `pc`: component category, model name, and short specifications.
- `connections`: device, connection notes, destination, and port.
- `upgrades`: possible future purchases and the reason for each upgrade.

Keep product images in `assets/`. The page validates the data before rendering, displays an error with a retry button if loading fails, and shows a text fallback if an image is missing.

## Page direction

The page is meant to work as a link someone can open from a stream and understand quickly:

- real product images first;
- short names and useful specs;
- a light pink visual identity;
- PC components without purchase-status badges;
- technical details kept lower on the page;
- no serial numbers, receipt numbers, IP addresses, credentials, or other private information.

## Build goals

- Make good use of the 1920 × 1080, 165 Hz monitor in EuroAion 4.6 and other light or CPU-bound games.
- Prioritize comfortable 1080p play in demanding games such as Baldur's Gate 3.
- Keep the AM5 foundation and upgrade memory, storage, or graphics when there is a practical reason.

## Validation

Install Google Chrome, or provision it with Playwright:

```sh
npx playwright install chrome
npm run check
npm test
npm run build
```

Playwright exercises the site on desktop and mobile viewports. Tests cover local image loading, navigation, keyboard interaction, loading failures and retry recovery, safe rendering, no-JavaScript fallback, and WCAG A/AA checks.

## GitHub Pages

`.github/workflows/pages.yml` runs checks on pull requests and pushes to `main`. A successful push to `main` publishes through GitHub Pages.

`npm run build` stages only public files in `dist/`. The site uses relative asset paths, so it works under `/setup/`.

## Structure

- `index.html`: page structure and static copy.
- `styles.css`: responsive layout and the pink visual system.
- `script.js`: data validation, rendering, image fallbacks, and retry behavior.
- `data/setup.json`: hardware, connections, and upgrade plans.
- `assets/`: locally served product images and favicon.
- `scripts/`: local preview server and deployment staging.
- `tests/`: browser regression and accessibility checks.

## Product image sources

Product photographs are served locally for reliable loading. Brands and product photographs belong to their respective owners.

- HP OMEN 25i image
- Razer BlackWidow V4 image
- Logitech G502 X LIGHTSPEED image
- Logitech G325 image
- ASUS A31 Plus image

## Privacy

Do not store serial numbers, receipts, IP addresses, credentials, or other private information in this public repository.
