# cjimhanter / setup

A personal home for my gaming and work setup: desk gear, an AM5 PC build, connections, and future upgrades. The site is in English and keeps owned components separate from planned purchases.

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

- `updated`: date in `YYYY-MM-DD` format; displayed in English without timezone shifts.
- `gear`: category, model name, short specifications, local image path, and HTTPS product URL.
- `case`: model name, local image, HTTPS product URL, and ownership status.
- `pc`: component category, model name, specifications, and status.
- `status`: `owned`, `planned`, or `unconfirmed`. Use `unconfirmed` when ownership has not been established. The original case entry had no status, so it is explicitly unconfirmed.
- `connections`: device, connection notes, destination, and port. Unconfirmed ports remain clearly identified.
- `upgrades`: possible future purchases and the reason for each upgrade.

Keep product images in `assets/`. The page validates the data before rendering, displays an error with a retry button if loading fails, and shows a text fallback if an image is missing. Network and software details live in `index.html`; native disclosure controls keep these available even if data loading fails or JavaScript is disabled.

## Build goals

- Make good use of the 1920 × 1080, 165 Hz monitor in EuroAion 4.6 and other light or CPU-bound games.
- Prioritize stable, comfortable play in demanding games such as Baldur's Gate 3. The display refresh rate is not a promise of measured game performance.
- Keep the AM5 foundation and upgrade memory, storage, or graphics when there is a practical reason.

## Validation

Install Google Chrome, or provision it with Playwright:

```sh
npx playwright install chrome
npm run check
npm test
npm run build
```

Playwright exercises the site in desktop Chrome and Chromium with a mobile viewport. Tests cover English content, ownership statuses, local image loading and sizing, navigation at 320-1440 px, keyboard interaction, missing images, HTTP/network/JSON/schema failures, timeouts, retry recovery, safe rendering, and the no-JavaScript fallback. Axe checks the expanded page against WCAG A/AA rules. Automated checks complement visual review; mobile emulation is not a physical-device Safari test.

## GitHub Pages

`.github/workflows/pages.yml` runs checks on pull requests and pushes to `main`. A successful push to `main` publishes through GitHub Pages. The repository's Pages source must be set to **GitHub Actions**.

`npm run build` stages only public files in `dist/`. Dependencies, tests, development scripts, and local screenshots are excluded from the deployment artifact. The site uses relative asset paths, so it works under a repository subpath such as `/setup/`.

## Structure

- `index.html`: page structure, English copy, and native disclosure panels.
- `styles.css`: responsive layout, focus states, and reduced-motion support.
- `script.js`: data validation, rendering, image fallbacks, and retry behavior.
- `data/setup.json`: hardware, connections, statuses, and upgrade plans.
- `assets/`: locally served product images and favicon.
- `scripts/`: local preview server and deployment staging.
- `tests/`: browser regression and accessibility checks.

## Design references

Reviewed on 18 September 2026 for information structure, not as verification of anyone's current hardware:

- [ShroudSetup](https://shroudsetup.com/): an independent fan site with visual product cards and equipment categories.
- [Summit1g on Setup.gg](https://www.setup.gg/player/summit1g/): a third-party profile with clearly labelled gear, product links, and an update date.
- [The Cohhilition information thread](https://www.cohhilition.com/forum/viewtopic.php?f=53&p=24257&t=10445): CohhCarnage's community resource with hardware/setup information and expandable details.

The layout applies those useful patterns while preserving this project's pink palette and actual setup data. No streamer branding, unverified performance figures, or social profiles were added.

## Product image sources

Product photographs are retained from the original project and served locally for reliable loading. Brands and product photographs belong to their respective owners.

- [HP OMEN 25i image](https://pe-media.hptiendaenlinea.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/2/2/22J05AA-1_T1679060313.png)
- [Razer BlackWidow V4 image](https://medias-p1.phoenix.razer.com/sys-master-phoenix-images-container/h36/h5a/9640099184670/blackwidow-v4-2-500x500.png)
- [Logitech G502 X LIGHTSPEED image](https://resource.logitechg.com/w_544%2Ch_466%2Car_7%3A6%2Cc_pad%2Cq_auto%2Cf_auto%2Cdpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g502x-lightspeed/gallery/g502-x-lightspeed-mouse-top-angle-white-gallery-1.png)
- [Logitech G325 image via Jarir](https://ak-asset.jarir.com/akeneo-prod/asset/f/8/9/2/f892100320665770b0849ac2f8ad069a56ae41ad_676103.jpg)
- [ASUS A31 Plus image](https://dlcdnwebimgs.asus.com/files/media/fa00bc94-c735-4405-b57b-3ff92217597b/v1/img/asus-a31-plus-boundless.png)

## Privacy

Do not store serial numbers, receipts, IP addresses, credentials, or other private information in this public repository.
