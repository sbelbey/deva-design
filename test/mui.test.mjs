import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { renderMuiModule, renderMuiDts } from '../scripts/lib.mjs';

const tokens = JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url), 'utf8'));
const dir = mkdtempSync(join(tmpdir(), 'deva-design-'));
writeFileSync(join(dir, 'mui.cjs'), renderMuiModule(tokens, 'cjs'));
writeFileSync(join(dir, 'mui.mjs'), renderMuiModule(tokens, 'esm'));

test('CJS: createDevaPalette arma la paleta MUI de cada modo', () => {
  const { createDevaPalette, devaTokens, devaFontFamily, devaRadius } = createRequire(import.meta.url)(join(dir, 'mui.cjs'));
  const light = createDevaPalette('light');
  assert.equal(light.mode, 'light');
  assert.deepEqual(light.primary, { main: '#1E73BE', contrastText: '#ffffff' });
  assert.deepEqual(light.secondary, { main: '#3498db', contrastText: '#0a1428' });
  assert.deepEqual(light.background, { default: '#F0F7FF', paper: '#ffffff' });
  assert.deepEqual(light.text, { primary: '#1a2332', secondary: '#4a5a70' });
  assert.equal(light.divider, '#d6e7f8');
  assert.equal(light.error.main, '#c62828');
  assert.equal(light.warning.main, '#7a5900');
  assert.equal(light.success.main, '#2e7d32');
  assert.equal(light.info.main, '#1E73BE');
  const dark = createDevaPalette('dark');
  assert.deepEqual(dark.primary, { main: '#5DADE2', contrastText: '#0a1428' });
  assert.equal(dark.background.paper, '#00193b');
  assert.equal(devaTokens.dark.surface2, '#0b2147');
  assert.equal(devaTokens.light.onBar, '#ffffff');
  assert.equal(devaFontFamily, "'Inter', 'Roboto', 'Arial', sans-serif");
  assert.equal(devaRadius, 8);
});

test('ESM exporta lo mismo que CJS', async () => {
  const esm = await import(pathToFileURL(join(dir, 'mui.mjs')).href);
  assert.deepEqual(esm.createDevaPalette('dark'), createRequire(import.meta.url)(join(dir, 'mui.cjs')).createDevaPalette('dark'));
});

test('d.ts declara las exportaciones', () => {
  const dts = renderMuiDts(tokens);
  for (const s of ['export declare function createDevaPalette', 'export declare const devaTokens', 'export declare const devaFontFamily', 'export declare const devaRadius', 'surface2: string', 'onBar: string']) {
    assert.ok(dts.includes(s), s);
  }
});
