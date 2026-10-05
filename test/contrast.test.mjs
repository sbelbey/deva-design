import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio, checkContrast } from '../scripts/lib.mjs';

const tokens = JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url), 'utf8'));

test('contrastRatio: blanco sobre negro es 21 y es simétrico', () => {
  assert.equal(Math.round(contrastRatio('#ffffff', '#000000')), 21);
  assert.equal(contrastRatio('#1E73BE', '#ffffff'), contrastRatio('#ffffff', '#1E73BE'));
});

test('contrastRatio: valores de referencia del spec', () => {
  assert.equal(contrastRatio('#ffffff', '#1E73BE').toFixed(2), '4.94');
  assert.equal(contrastRatio('#ffffff', '#3498db').toFixed(2), '3.15');
});

test('todos los pares de los tokens v1 pasan (4.5 normal, 3 grande) en claro y oscuro', () => {
  assert.deepEqual(checkContrast(tokens), []);
});

test('checkContrast detecta un par que no llega', () => {
  const broken = structuredClone(tokens);
  broken.color.action.light = '#3498db';
  const failures = checkContrast(broken);
  assert.ok(failures.some((f) => f.mode === 'light' && f.fg === 'on-action' && f.bg === 'action'));
  assert.ok(failures.every((f) => f.ratio < f.min));
});
