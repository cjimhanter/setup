import { cp, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'styles.css', 'script.js', '.nojekyll', 'data', 'assets']) {
  await cp(new URL(name, root), new URL(name, output), { recursive: true });
}
console.log('Static site staged in dist/');
