# deva-design v1.0.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar en `github.com/sbelbey/deva-design` (público) el paquete de design tokens de la familia DEVA, v1.0.0. Lo instalan las apps con `npm install github:sbelbey/deva-design#v1.0.0`.

**Architecture:** La única fuente es `tokens/tokens.json`. `scripts/lib.mjs` tiene funciones puras para el contraste WCAG y para generar el CSS, el módulo MUI y sus tipos. `scripts/build.mjs` escribe `dist/` y falla si algún contraste no alcanza. `dist/` y `assets/` se commitean, así instalar desde GitHub no compila nada. Sin dependencias: Node 20+, con `node:test` para los tests.

**Tech Stack:** Node.js (ESM), `node:test`, `node:zlib` (logo blanco). Salidas: CSS (variables + `@theme inline` de Tailwind v4) y JS (ESM + CJS) con `.d.ts` para MUI.

**Spec:** `docs/specs/2026-10-05-design-tokens-familia-deva-design.md`

Este plan cubre sólo el paquete. Las migraciones del portal (1.3.8), DEVA (1.3.8), Nexus (1.2.2) y la landing tienen cada una su plan, escrito al arrancarla.

---

## File structure

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Nombre `deva-design`, `exports` (JS, CSS, assets), scripts |
| `tokens/tokens.json` | Única fuente: colores claro/oscuro, fuente, radio, sombras, pares de contraste |
| `scripts/lib.mjs` | Funciones puras: `contrastRatio`, `checkContrast`, `renderTokensCss`, `renderTailwindCss`, `renderMuiModule`, `renderMuiDts` |
| `scripts/build.mjs` | Lee los tokens, verifica el contraste, escribe `dist/`; `--check` compara sin escribir |
| `scripts/white-logo.mjs` | Recolorea a blanco un PNG RGBA (uso único, para `assets/deva-logo-white.png`) |
| `dist/*` | Generado y commiteado: `tokens.css`, `tailwind.css`, `mui.mjs`, `mui.cjs`, `mui.d.ts`, `tokens.json` |
| `assets/deva-logo.png`, `assets/deva-logo-white.png` | Wordmark oficial azul y blanco |
| `test/*.test.mjs` | Contraste, salidas generadas, `dist` al día, assets |
| `README.md`, `CHANGELOG.md`, `.gitignore` | Uso por app, flujo de actualización |

---

### Task 1: package.json, tokens y contraste

**Files:**
- Create: `package.json`, `.gitignore`, `tokens/tokens.json`, `scripts/lib.mjs`
- Test: `test/contrast.test.mjs`

- [ ] **Step 1: package.json y .gitignore**

`package.json`:
```json
{
  "name": "deva-design",
  "version": "1.0.0",
  "description": "Design tokens de la familia DEVA (DEVA, DEVA Pedidos, DEVA Nexus, deva.ar)",
  "license": "UNLICENSED",
  "type": "module",
  "main": "./dist/mui.cjs",
  "module": "./dist/mui.mjs",
  "types": "./dist/mui.d.ts",
  "exports": {
    ".": {
      "types": "./dist/mui.d.ts",
      "import": "./dist/mui.mjs",
      "require": "./dist/mui.cjs"
    },
    "./tokens.css": "./dist/tokens.css",
    "./tailwind.css": "./dist/tailwind.css",
    "./tokens.json": "./dist/tokens.json",
    "./dist/*": "./dist/*",
    "./assets/*": "./assets/*"
  },
  "files": ["dist", "assets"],
  "scripts": {
    "build": "node scripts/build.mjs",
    "check": "node scripts/build.mjs --check",
    "test": "node --test test/"
  },
  "engines": { "node": ">=20" }
}
```

`.gitignore`:
```
node_modules/
```

- [ ] **Step 2: tokens/tokens.json**

```json
{
  "version": "1.0.0",
  "color": {
    "brand":      { "light": "#3498db", "dark": "#3498db" },
    "bar":        { "light": "#3498db", "dark": "#1f5f96" },
    "on-bar":     { "light": "#ffffff", "dark": "#ffffff" },
    "action":     { "light": "#1E73BE", "dark": "#5DADE2" },
    "on-action":  { "light": "#ffffff", "dark": "#0a1428" },
    "bg":         { "light": "#F0F7FF", "dark": "#0a1428" },
    "surface":    { "light": "#ffffff", "dark": "#00193b" },
    "surface-2":  { "light": "#E6F0FB", "dark": "#0b2147" },
    "chip-bg":    { "light": "#e3f2fd", "dark": "#10305a" },
    "chip-ink":   { "light": "#1A68AD", "dark": "#5DADE2" },
    "ink":        { "light": "#1a2332", "dark": "#e8f0fe" },
    "ink-soft":   { "light": "#4a5a70", "dark": "#a9bbd6" },
    "line":       { "light": "#d6e7f8", "dark": "#17345f" },
    "ok":         { "light": "#2e7d32", "dark": "#66bb6a" },
    "ok-bg":      { "light": "#e8f5e9", "dark": "#12321f" },
    "warn":       { "light": "#7a5900", "dark": "#ffe082" },
    "warn-bg":    { "light": "#fff8e1", "dark": "#3a2e07" },
    "danger":     { "light": "#c62828", "dark": "#ef9a9a" },
    "danger-bg":  { "light": "#fdecea", "dark": "#3d1519" }
  },
  "font": { "body": "'Inter', 'Roboto', 'Arial', sans-serif" },
  "radius": "8px",
  "shadow": {
    "sm": { "light": "0 1px 2px rgba(26, 35, 50, 0.06)", "dark": "0 1px 2px rgba(0, 0, 0, 0.3)" },
    "md": { "light": "0 4px 16px -4px rgba(26, 35, 50, 0.14), 0 1px 3px rgba(26, 35, 50, 0.06)", "dark": "0 4px 16px -4px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)" },
    "lg": { "light": "0 18px 48px -12px rgba(26, 35, 50, 0.3)", "dark": "0 18px 48px -12px rgba(0, 0, 0, 0.7)" }
  },
  "contrast": {
    "normal": [
      ["on-action", "action"], ["action", "bg"], ["action", "surface"],
      ["chip-ink", "chip-bg"],
      ["ink", "bg"], ["ink", "surface"], ["ink", "surface-2"],
      ["ink-soft", "bg"], ["ink-soft", "surface"],
      ["ok", "ok-bg"], ["warn", "warn-bg"], ["danger", "danger-bg"],
      ["ok", "surface"], ["warn", "surface"], ["danger", "surface"]
    ],
    "large": [["on-bar", "bar"]]
  }
}
```

- [ ] **Step 3: Write the failing test** — `test/contrast.test.mjs`

```js
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
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../scripts/lib.mjs'`

- [ ] **Step 5: Write minimal implementation** — `scripts/lib.mjs` (sólo contraste por ahora)

```js
// Funciones puras del paquete: contraste WCAG y generación de dist/.

function channel(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG 2.x entre dos colores #rrggbb. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const MODES = ['light', 'dark'];
const MIN = { normal: 4.5, large: 3 };

/** Pares que no alcanzan el mínimo, en cualquiera de los dos modos. */
export function checkContrast(tokens) {
  const failures = [];
  for (const [kind, pairs] of Object.entries(tokens.contrast)) {
    for (const [fg, bg] of pairs) {
      for (const mode of MODES) {
        const ratio = contrastRatio(tokens.color[fg][mode], tokens.color[bg][mode]);
        if (ratio < MIN[kind]) failures.push({ mode, fg, bg, ratio, min: MIN[kind] });
      }
    }
  }
  return failures;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore tokens scripts/lib.mjs test/contrast.test.mjs
git commit -m "feat: tokens v1 y test de contraste WCAG"
```

---

### Task 2: Generar tokens.css y tailwind.css

**Files:**
- Modify: `scripts/lib.mjs` (agregar al final)
- Test: `test/render.test.mjs`

- [ ] **Step 1: Write the failing test** — `test/render.test.mjs`

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `renderTokensCss is not a function` (export inexistente)

- [ ] **Step 3: Write minimal implementation** — agregar al final de `scripts/lib.mjs`

```js
function header(tokens) {
  return `/* deva-design v${tokens.version} — generado desde tokens/tokens.json. No editar a mano. */\n`;
}

function block(selector, tokens, mode) {
  const lines = [`${selector} {`, `  color-scheme: ${mode};`];
  for (const [name, value] of Object.entries(tokens.color)) lines.push(`  --deva-${name}: ${value[mode]};`);
  if (mode === 'light') {
    lines.push(`  --deva-font-body: ${tokens.font.body};`);
    lines.push(`  --deva-radius: ${tokens.radius};`);
  }
  for (const [name, value] of Object.entries(tokens.shadow)) lines.push(`  --deva-shadow-${name}: ${value[mode]};`);
  lines.push('}');
  return lines.join('\n');
}

/** Variables CSS: claro en :root, oscuro con data-theme="dark" en <html>. */
export function renderTokensCss(tokens) {
  return `${header(tokens)}\n${block(':root', tokens, 'light')}\n\n${block(':root[data-theme="dark"]', tokens, 'dark')}\n`;
}

/** Tailwind v4: clases bg-deva-*, text-deva-*, font-deva, rounded-deva, shadow-deva-*. */
export function renderTailwindCss(tokens) {
  const lines = ['@import "./tokens.css";', '', '@theme inline {'];
  for (const name of Object.keys(tokens.color)) lines.push(`  --color-deva-${name}: var(--deva-${name});`);
  lines.push('  --font-deva: var(--deva-font-body);');
  lines.push('  --radius-deva: var(--deva-radius);');
  for (const name of Object.keys(tokens.shadow)) lines.push(`  --shadow-deva-${name}: var(--deva-shadow-${name});`);
  lines.push('}');
  return `${header(tokens)}\n${lines.join('\n')}\n`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib.mjs test/render.test.mjs
git commit -m "feat: generar tokens.css y tailwind.css"
```

---

### Task 3: Módulo MUI (ESM + CJS + tipos)

**Files:**
- Modify: `scripts/lib.mjs` (agregar al final)
- Test: `test/mui.test.mjs`

- [ ] **Step 1: Write the failing test** — `test/mui.test.mjs`

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `renderMuiModule is not a function`

- [ ] **Step 3: Write minimal implementation** — agregar al final de `scripts/lib.mjs`

```js
const camel = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function resolvedColors(tokens) {
  const out = { light: {}, dark: {} };
  for (const [name, value] of Object.entries(tokens.color)) {
    for (const mode of MODES) out[mode][camel(name)] = value[mode];
  }
  return out;
}

const MUI_BODY = `function createDevaPalette(mode) {
  const t = devaTokens[mode];
  return {
    mode,
    primary: { main: t.action, contrastText: t.onAction },
    // Texto oscuro: el blanco sobre brand (#3498db) no llega a 4,5:1.
    secondary: { main: t.brand, contrastText: '#0a1428' },
    error: { main: t.danger },
    warning: { main: t.warn },
    success: { main: t.ok },
    info: { main: t.action },
    background: { default: t.bg, paper: t.surface },
    text: { primary: t.ink, secondary: t.inkSoft },
    divider: t.line,
  };
}`;

/** Módulo para MUI, en 'esm' o 'cjs'. */
export function renderMuiModule(tokens, format) {
  const consts = [
    `const devaTokens = ${JSON.stringify(resolvedColors(tokens), null, 2)};`,
    `const devaFontFamily = ${JSON.stringify(tokens.font.body)};`,
    `const devaRadius = ${parseInt(tokens.radius, 10)};`,
  ].join('\n');
  const names = 'createDevaPalette, devaTokens, devaFontFamily, devaRadius';
  const exportLine = format === 'cjs' ? `module.exports = { ${names} };` : `export { ${names} };`;
  return `${header(tokens).replace('/*', '//').replace(' */', '')}${consts}\n\n${MUI_BODY}\n\n${exportLine}\n`;
}

export function renderMuiDts(tokens) {
  const fields = Object.keys(tokens.color).map((n) => `  ${camel(n)}: string;`).join('\n');
  return `${header(tokens)}
export type DevaMode = 'light' | 'dark';
export interface DevaColorTokens {
${fields}
}
export declare const devaTokens: Record<DevaMode, DevaColorTokens>;
export declare const devaFontFamily: string;
export declare const devaRadius: number;
export interface DevaPaletteOptions {
  mode: DevaMode;
  primary: { main: string; contrastText: string };
  secondary: { main: string; contrastText: string };
  error: { main: string };
  warning: { main: string };
  success: { main: string };
  info: { main: string };
  background: { default: string; paper: string };
  text: { primary: string; secondary: string };
  divider: string;
}
export declare function createDevaPalette(mode: DevaMode): DevaPaletteOptions;
`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib.mjs test/mui.test.mjs
git commit -m "feat: módulo MUI createDevaPalette (ESM, CJS y tipos)"
```

---

### Task 4: build.mjs y dist/ commiteado

**Files:**
- Create: `scripts/build.mjs`, `dist/*` (generado)
- Test: `test/dist.test.mjs`

- [ ] **Step 1: Write the failing test** — `test/dist.test.mjs`

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('dist/ está al día con tokens/tokens.json (npm run check)', () => {
  // Falla con código distinto de 0 si algún archivo de dist/ no coincide.
  execFileSync(process.execPath, ['scripts/build.mjs', '--check'], { cwd: root, stdio: 'pipe' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '.../scripts/build.mjs'`

- [ ] **Step 3: Write implementation** — `scripts/build.mjs`

```js
// Genera dist/ desde tokens/tokens.json. Con --check no escribe: falla si dist/ está desactualizado.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { checkContrast, renderTokensCss, renderTailwindCss, renderMuiModule, renderMuiDts } from './lib.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokens = JSON.parse(readFileSync(join(root, 'tokens', 'tokens.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (pkg.version !== tokens.version) {
  console.error(`La versión de package.json (${pkg.version}) y la de tokens.json (${tokens.version}) no coinciden.`);
  process.exit(1);
}

const failures = checkContrast(tokens);
if (failures.length > 0) {
  for (const f of failures) {
    console.error(`Contraste insuficiente (${f.mode}): ${f.fg} sobre ${f.bg} = ${f.ratio.toFixed(2)}:1, mínimo ${f.min}:1`);
  }
  process.exit(1);
}

const outputs = {
  'tokens.css': renderTokensCss(tokens),
  'tailwind.css': renderTailwindCss(tokens),
  'mui.mjs': renderMuiModule(tokens, 'esm'),
  'mui.cjs': renderMuiModule(tokens, 'cjs'),
  'mui.d.ts': renderMuiDts(tokens),
  'tokens.json': `${JSON.stringify(tokens, null, 2)}\n`,
};

const dist = join(root, 'dist');
if (process.argv.includes('--check')) {
  const stale = Object.entries(outputs)
    .filter(([file, content]) => !existsSync(join(dist, file)) || readFileSync(join(dist, file), 'utf8').replace(/\r\n/g, '\n') !== content)
    .map(([file]) => file);
  if (stale.length > 0) {
    console.error(`dist/ desactualizado: ${stale.join(', ')}. Correr npm run build.`);
    process.exit(1);
  }
  console.log('dist/ al día.');
} else {
  mkdirSync(dist, { recursive: true });
  for (const [file, content] of Object.entries(outputs)) writeFileSync(join(dist, file), content);
  console.log(`dist/ generado (v${tokens.version}).`);
}
```

- [ ] **Step 4: Generar dist y correr los tests**

Run: `npm run build && npm test`
Expected: `dist/ generado (v1.0.0).` y PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/build.mjs dist test/dist.test.mjs
git commit -m "feat: build de dist/ con chequeo de contraste y --check"
```

---

### Task 5: Logo azul y blanco

**Files:**
- Create: `scripts/white-logo.mjs`, `assets/deva-logo.png`, `assets/deva-logo-white.png`
- Test: `test/assets.test.mjs`

- [ ] **Step 1: Write the failing test** — `test/assets.test.mjs`

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `ENOENT ... assets/deva-logo.png`

- [ ] **Step 3: Copiar el logo oficial**

```bash
mkdir -p assets
cp "../deva/src/public/branding/deva-logo-loading.png" assets/deva-logo.png
```

- [ ] **Step 4: Write `scripts/white-logo.mjs`** (recolorea a blanco conservando la transparencia)

```js
// Uso: node scripts/white-logo.mjs <entrada.png> <salida.png>
// Sólo PNG RGBA de 8 bits sin entrelazado (el wordmark oficial lo es).
import { readFileSync, writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

const [src, dst] = process.argv.slice(2);
const buf = readFileSync(src);
const chunks = [];
for (let pos = 8; pos < buf.length; ) {
  const len = buf.readUInt32BE(pos);
  chunks.push({ type: buf.toString('ascii', pos + 4, pos + 8), data: buf.subarray(pos + 8, pos + 8 + len) });
  pos += 12 + len;
}
const ihdr = chunks.find((c) => c.type === 'IHDR').data;
const width = ihdr.readUInt32BE(0);
const height = ihdr.readUInt32BE(4);
if (ihdr[8] !== 8 || ihdr[9] !== 6 || ihdr[12] !== 0) throw new Error('Sólo PNG RGBA de 8 bits sin entrelazado');

const raw = zlib.inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
const bpp = 4;
const stride = width * bpp;
const out = Buffer.alloc(height * (stride + 1));
let prev = Buffer.alloc(stride);
for (let y = 0; y < height; y += 1) {
  const filter = raw[y * (stride + 1)];
  const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
  for (let x = 0; x < stride; x += 1) {
    const a = x >= bpp ? line[x - bpp] : 0;
    const b = prev[x];
    const c = x >= bpp ? prev[x - bpp] : 0;
    let add = 0;
    if (filter === 1) add = a;
    else if (filter === 2) add = b;
    else if (filter === 3) add = Math.floor((a + b) / 2);
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
    }
    line[x] = (line[x] + add) & 255;
  }
  prev = line;
  const o = y * (stride + 1);
  out[o] = 0; // sin filtro
  for (let x = 0; x < width; x += 1) {
    out[o + 1 + x * 4] = 255;
    out[o + 2 + x * 4] = 255;
    out[o + 3 + x * 4] = 255;
    out[o + 4 + x * 4] = line[x * 4 + 3];
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (data) => {
  let c = 0xffffffff;
  for (const byte of data) c = crcTable[(c ^ byte) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
writeFileSync(dst, Buffer.concat([
  buf.subarray(0, 8),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(out, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]));
console.log(`${dst}: ${width}x${height} en blanco.`);
```

- [ ] **Step 5: Generar el logo blanco y verificar**

Run: `node scripts/white-logo.mjs assets/deva-logo.png assets/deva-logo-white.png && npm test`
Expected: `assets/deva-logo-white.png: 1306x610 en blanco.` y PASS (11 tests). Abrir `assets/deva-logo-white.png` sobre un fondo oscuro para confirmarlo a ojo.

- [ ] **Step 6: Commit**

```bash
git add scripts/white-logo.mjs assets test/assets.test.mjs
git commit -m "feat: logo oficial azul y blanco"
```

---

### Task 6: README y CHANGELOG

**Files:**
- Create: `README.md`, `CHANGELOG.md`

- [ ] **Step 1: README.md**

````markdown
# deva-design

Design tokens de la familia DEVA: **DEVA**, **DEVA Pedidos**, **DEVA Nexus** y **deva.ar**. Todas usan el mismo azul y el logo oficial. Cada producto se distingue sólo por el nombre que acompaña al logo (`[logo] | Pedidos`).

Diseño completo: [docs/specs/2026-10-05-design-tokens-familia-deva-design.md](docs/specs/2026-10-05-design-tokens-familia-deva-design.md).

## Instalar

```bash
npm install github:sbelbey/deva-design#v1.0.0
```

El repo es público, así que no hace falta ninguna credencial (ni en el CI, ni en Amplify, ni en Docker). Fijá siempre un tag: un cambio acá no llega solo a ninguna app.

## Usar

### Tailwind v4 (portal de pedidos, Nexus, landing)

```css
@import "tailwindcss";
@import "deva-design/tailwind.css";
```

Da las variables `--deva-*` y las clases `bg-deva-surface`, `text-deva-ink`, `bg-deva-action`, `text-deva-on-action`, `border-deva-line`, `rounded-deva`, `shadow-deva-md`, `font-deva`. El modo oscuro se activa con `<html data-theme="dark">`.

Si la app ya tiene sus propias variables, alcanza con apuntarlas a las nuevas:

```css
@import "deva-design/tokens.css";
:root { --brand: var(--deva-action); --ink: var(--deva-ink); }
```

### MUI (DEVA)

```ts
import { createTheme } from '@mui/material';
import { createDevaPalette, devaFontFamily, devaRadius } from 'deva-design';

const theme = createTheme({
  palette: createDevaPalette(mode), // 'light' | 'dark'
  typography: { fontFamily: devaFontFamily },
  shape: { borderRadius: devaRadius },
});
```

### Logo

`deva-design/assets/deva-logo.png` (azul) y `deva-design/assets/deva-logo-white.png` (blanco, para la barra). Son el wordmark oficial: no usar el ícono de la app (`assets/deva.png` de DEVA), que es otro logotipo.

### Barra con el nombre del producto

```html
<header class="deva-bar">
  <img src="deva-logo-white.png" alt="DEVA" height="28" />
  <span class="deva-bar__sep"></span>
  <span class="deva-bar__product">Pedidos</span>
</header>
```

```css
.deva-bar { display: flex; align-items: center; gap: 12px; height: 56px; padding: 0 16px;
  background: var(--deva-bar); color: var(--deva-on-bar); }
.deva-bar__sep { width: 1px; height: 24px; background: currentColor; opacity: .55; }
.deva-bar__product { font: 600 19px/1 var(--deva-font-body); }
```

DEVA (la app principal) lleva sólo el logo, sin separador ni nombre.

## Reglas

- **Sobre la barra** van sólo el logo y el nombre del producto en 19 px y peso 600 o más: el contraste blanco sobre `bar` en modo claro (3,15:1) alcanza para texto grande, no para texto chico. El texto chico (usuario, "Cerrar sesión") va dentro de un botón blanco con texto `action`.
- **Botones, enlaces, foco y selección**: `action` / `on-action`. `brand` es sólo marca (logo, barra, ilustraciones).
- **Estados**: `ok`, `warn`, `danger`, con su fondo `*-bg`.

## Cambiar un token

1. Editar `tokens/tokens.json` y subir `version` (también en `package.json`).
2. `npm run build` regenera `dist/`. Falla si algún contraste no alcanza (4,5:1 texto normal, 3:1 la barra).
3. `npm test`.
4. Anotar el cambio en `CHANGELOG.md`, commitear, crear el tag y pushear:
   ```bash
   git tag v1.1.0 && git push origin main --tags
   ```
5. En cada app que lo quiera: `npm install github:sbelbey/deva-design#v1.1.0`, revisar en claro y oscuro, y publicar con la versión de esa app.
````

- [ ] **Step 2: CHANGELOG.md**

```markdown
# Changelog

## [1.0.0] - 2026-10-05

### Agregado
- Tokens de color en claro y oscuro: `brand`, `bar`, `on-bar`, `action`, `on-action`, `bg`, `surface`, `surface-2`, `chip-bg`, `chip-ink`, `ink`, `ink-soft`, `line`, `ok`, `warn`, `danger` y sus fondos. También fuente (Inter), radio (8 px) y sombras.
- Salidas: `tokens.css` (variables `--deva-*`), `tailwind.css` (Tailwind v4), `createDevaPalette` para MUI (ESM, CJS y tipos).
- Logo oficial en azul y blanco.
- Test de contraste WCAG: el build falla si un par de texto normal baja de 4,5:1, o si la barra baja de 3:1.
```

- [ ] **Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: README de uso por app y CHANGELOG 1.0.0"
```

---

### Task 7: Publicar v1.0.0 en GitHub

- [ ] **Step 1: Verificación final**

Run: `npm run check && npm test`
Expected: `dist/ al día.` y todos los tests PASS.

- [ ] **Step 2: Push y tag**

```bash
git remote add origin https://github.com/sbelbey/deva-design.git
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

- [ ] **Step 3: Verificar la instalación desde GitHub** (en una carpeta temporal)

```bash
cd "$(mktemp -d)" && npm init -y >/dev/null && npm install github:sbelbey/deva-design#v1.0.0
node -e "console.log(require('deva-design').createDevaPalette('light').primary.main)"
node --input-type=module -e "import('deva-design').then(m => console.log(m.createDevaPalette('dark').primary.main))"
ls node_modules/deva-design/dist node_modules/deva-design/assets
```
Expected: `#1E73BE`, `#5DADE2`, y los 6 archivos de `dist/` y los 2 PNG.

- [ ] **Step 4: Jira** — comentar en DEVA-67 que v1.0.0 está publicado (link al tag) y que siguen las migraciones por app.
