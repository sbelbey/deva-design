import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const png = (name) => readFileSync(new URL(`../assets/${name}`, import.meta.url));
const ihdr = (buf) => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25] });

test('logo azul y blanco: PNG RGBA del mismo tamaño', () => {
  const blue = ihdr(png('deva-logo.png'));
  const white = ihdr(png('deva-logo-white.png'));
  assert.deepEqual(blue, { width: 1306, height: 610, colorType: 6 });
  assert.deepEqual(white, blue);
});
