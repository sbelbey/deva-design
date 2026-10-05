import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderTokensCss, renderTailwindCss } from '../scripts/lib.mjs';

const tokens = JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url), 'utf8'));

test('tokens.css: claro en :root y oscuro en [data-theme="dark"], con prefijo --deva-', () => {
  const css = renderTokensCss(tokens);
  const [light, dark] = css.split(':root[data-theme="dark"]');
  assert.match(light, /--deva-action: #1E73BE;/);
  assert.match(light, /--deva-chip-ink: #1A68AD;/);
  assert.match(light, /color-scheme: light;/);
  assert.match(dark, /--deva-action: #5DADE2;/);
  assert.match(dark, /--deva-bar: #1f5f96;/);
  assert.match(dark, /color-scheme: dark;/);
  assert.match(light, /--deva-font-body: 'Inter', 'Roboto', 'Arial', sans-serif;/);
  assert.match(light, /--deva-radius: 8px;/);
  assert.match(dark, /--deva-shadow-lg: 0 18px 48px -12px rgba\(0, 0, 0, 0.7\);/);
  for (const name of Object.keys(tokens.color)) {
    assert.match(light, new RegExp(`--deva-${name}: `));
    assert.match(dark, new RegExp(`--deva-${name}: `));
  }
  assert.match(css, /v1\.0\.0/);
});

test('tailwind.css: importa tokens.css y mapea con prefijo deva', () => {
  const css = renderTailwindCss(tokens);
  assert.match(css, /@import "\.\/tokens\.css";/);
  assert.match(css, /@theme inline \{/);
  assert.match(css, /--color-deva-action: var\(--deva-action\);/);
  assert.match(css, /--color-deva-surface-2: var\(--deva-surface-2\);/);
  assert.match(css, /--font-deva: var\(--deva-font-body\);/);
  assert.match(css, /--radius-deva: var\(--deva-radius\);/);
  assert.match(css, /--shadow-deva-md: var\(--deva-shadow-md\);/);
});
