import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

test('dist/ está al día con tokens/tokens.json (npm run check)', () => {
  // Falla con código distinto de 0 si algún archivo de dist/ no coincide.
  execFileSync(process.execPath, ['scripts/build.mjs', '--check'], { cwd: root, stdio: 'pipe' });
});
