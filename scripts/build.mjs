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
