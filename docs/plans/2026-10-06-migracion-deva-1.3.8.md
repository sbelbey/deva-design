# Migración de DEVA a deva-design (1.3.8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DEVA (Electron + MUI) toma los colores, la tipografía y el radio de `deva-design` v1.1.0, con la barra superior según la regla de la familia. No se rediseña ninguna pantalla.

**Architecture:**
- `theme.config.tsx` arma la paleta con `createDevaPalette(mode)` y usa `devaTokens` en los overrides de AppBar, Paper y Card. Se borra `themePalette`, que no usa nadie más.
- `NavBar.tsx`:
  - barra sólida `bar`, con el logo blanco del paquete;
  - sin "| Producto", porque DEVA es la app principal;
  - "Cerrar sesión" en un botón blanco con `barButtonInk`;
  - el texto "Modo oscuro" pasa a tooltip del interruptor: es texto chico sobre el azul y la regla lo saca de la barra.
- DEVA tiene el menú en la barra lateral, así que no necesita la barra en dos niveles.
- Los tintes del azul viejo escritos a mano (`rgba(33,150,243,…)` y similares) pasan a `alpha(theme.palette.primary.main, …)`.

**Tech Stack:** Electron, React 18 (renderer), MUI v5/v6, webpack (asset/resource para `.png`), jest + Testing Library.

**Spec:** `deva-design/docs/specs/2026-10-05-design-tokens-familia-deva-design.md`

**Ramas:**
- La 1.3.7 está sin publicar y tiene trabajo en curso de otra sesión (arreglo de multiDiv, sin commitear) en `Certia/deva`.
- Por eso la 1.3.8 se arma en un worktree aparte, `Certia/deva-1.3.8`, desde la punta de la 1.3.7. Lo que se agregue después a la 1.3.7 se trae con `git merge 1.3.7`.
- Los `node_modules` se comparten con junctions (como en el worktree de comunicados, ver memoria) para no reinstalar Electron.

---

### Task 1: Worktree, versión y dependencia

- [ ] **Step 1:** Crear el worktree y la rama.

```bash
cd Certia/deva
git worktree add ../deva-1.3.8 -b 1.3.8 1.3.7
```

- [ ] **Step 2:** Junctions de `node_modules` (raíz y `release/app`) al worktree principal. En PowerShell:

```powershell
New-Item -ItemType Junction -Path ..\deva-1.3.8\node_modules -Target (Resolve-Path .\node_modules)
New-Item -ItemType Junction -Path ..\deva-1.3.8\release\app\node_modules -Target (Resolve-Path .\release\app\node_modules)
```

- [ ] **Step 3:** En el worktree:
  * `chore(release): 1.3.8`: `"version": "1.3.8"` en `package.json` y en `release/app/package.json`;
  * `## [1.3.8] - Sin publicar` arriba de 1.3.7 en el CHANGELOG;
  * `npm install github:sbelbey/deva-design#v1.1.0 --no-audit`. La dependencia va al `package.json` raíz: el renderer lo empaqueta webpack.

```bash
git add package.json package-lock.json release/app/package.json CHANGELOG.md
git commit -m "chore(release): 1.3.8"
```

---

### Task 2: Capturas "antes"

- [ ] Con la app de la 1.3.7 (`Certia/deva`, `env -u ELECTRON_RUN_AS_NODE npm start`, renderer en `http://localhost:1212`, usuario `saul`), capturar con Playwright a 1440x900, en claro y oscuro:
  * login;
  * Centro de Mando;
  * Estadísticas;
  * Configuraciones > Laboratorio.

  El modo se cambia con `localStorage['deva-color-mode']` antes de cargar. Si la cuenta trae otro modo guardado, forzarlo después con el interruptor de la barra y volver a dejarlo como estaba. Sólo lectura.

---

### Task 3: Tema MUI desde deva-design

**Files:** Modify `src/renderer/config/theme.config.tsx`. Test: `src/renderer/config/theme.config.test.tsx` (nuevo).

- [ ] **Step 1: Write the failing test** — `src/renderer/config/theme.config.test.tsx`

```tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useTheme } from '@mui/material/styles';
import { ThemeConfig, COLOR_MODE_STORAGE_KEY } from './theme.config';

function Probe() {
  const t = useTheme();
  return (
    <span data-testid="probe">
      {[t.palette.mode, t.palette.primary.main, t.palette.background.default, t.palette.background.paper, t.palette.text.primary, t.shape.borderRadius].join('|')}
    </span>
  );
}

const renderWith = (mode: 'light' | 'dark') => {
  localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
  render(<ThemeConfig><Probe /></ThemeConfig>);
  return screen.getByTestId('probe').textContent;
};

describe('ThemeConfig con deva-design', () => {
  afterEach(() => localStorage.clear());

  it('claro: action #1E73BE, fondo #F0F7FF, papel blanco, radio 8', () => {
    expect(renderWith('light')).toBe('light|#1E73BE|#F0F7FF|#ffffff|#1a2332|8');
  });

  it('oscuro: action #5DADE2, fondo #0a1428, papel #00193b', () => {
    expect(renderWith('dark')).toBe('dark|#5DADE2|#0a1428|#00193b|#e8f0fe|8');
  });
});
```

- [ ] **Step 2:** Run `npx jest src/renderer/config/theme.config.test.tsx`. Expected: FAIL (`#2196F3` en lugar de `#1E73BE`).

- [ ] **Step 3:** En `theme.config.tsx`:
  * importar `import { createDevaPalette, devaFontFamily, devaRadius, devaTokens } from 'deva-design';` y `alpha` de `@mui/material/styles`;
  * borrar `themePalette`;
  * en `getDesignTokens`, `palette: createDevaPalette(mode)`;
  * `typography.fontFamily: devaFontFamily`;
  * `shape.borderRadius: devaRadius`;
  * overrides:
    * `MuiAppBar.root`: `backgroundImage: 'none'`, `backgroundColor: devaTokens[mode].bar`, `boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)'`;
    * `MuiPaper.root` y `MuiCard.root`: `border: \`1px solid ${devaTokens[mode].line}\``;
    * sombra de `MuiCard`: `0 2px 8px ${alpha(devaTokens[mode].action, 0.08)}`.

- [ ] **Step 4:** Run el test. Expected: PASS. Run `npx tsc --noEmit`. Expected: sin errores (si TS no encuentra los tipos de `deva-design`, revisar `moduleResolution` y usar el `types` de la raíz del paquete).

- [ ] **Step 5: Commit** `feat(estilo): tema MUI desde deva-design`

---

### Task 4: NavBar según la regla de la barra

**Files:** Modify `src/renderer/common/NavBar.tsx`.

- [ ] **Step 1:** Logo del paquete:

```tsx
import logoWhite from 'deva-design/assets/deva-logo-white.png';
import { devaTokens } from 'deva-design';
```

En lugar de `${urlsBases.STATIC_URL}/branding/deva-logo-header.png`, `src={logoWhite}` con `height: 32`. Si `urlsBases` queda sin uso, se borra el import.

- [ ] **Step 2:** AppBar: `sx={{ backgroundColor: devaTokens[theme.palette.mode].bar, backgroundImage: 'none', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)', borderRadius: 0 }}`.

- [ ] **Step 3:** El interruptor pierde el texto visible. Va dentro de `<Tooltip title={theme.palette.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>` con `inputProps={{ 'aria-label': 'Modo oscuro' }}`, y se saca el `FormControlLabel`.

- [ ] **Step 4:** "Cerrar sesión": `backgroundColor: '#fff'`, `color: devaTokens[theme.palette.mode].barButtonInk`, `'&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }`.

- [ ] **Step 5:** `npx tsc --noEmit` y `npx jest src/renderer/common`. Expected: OK. **Commit** `feat(estilo): barra de DEVA con el logo de deva-design y la regla de contraste`

---

### Task 5: Tintes del azul viejo

**Files:**
* `src/renderer/common/Sidebar.tsx:154-167`
* `src/renderer/components/LoadResultsGrid/WorksheetTable/index.tsx:80,148,187`
* `src/renderer/pages/patient-orders/index.tsx:433`
* `src/renderer/pages/billing/config.tsx:94`
* `src/renderer/pages/analysesPrintPriority/index.tsx:144`
* `src/renderer/pages/analysesEdit/index.tsx:477`
* `src/renderer/pages/billing/scan.tsx:258`
* `src/renderer/pages/analysesGroups/index.tsx:90`

- [ ] **Step 1:** Cada `rgba(33, 150, 243, X)`, `rgba(100, 181, 246, X)` o `rgba(25, 118, 210, X)` pasa a `alpha(theme.palette.primary.main, X)`. Donde ya hay `theme` (Sidebar, WorksheetTable) se usa directo. En los `sx` sin `theme` se usa la forma función: `backgroundColor: (t) => alpha(t.palette.primary.main, 0.08)`. El ternario claro/oscuro de Sidebar se colapsa, porque `primary.main` ya cambia con el modo. Mantener la misma opacidad que en claro.

- [ ] **Step 2:** `#2196f3` de `billing/scan.tsx:258` → `theme.palette.primary.main` (si la función no tiene `theme`, usar `useTheme()` en el componente). `#1976d2` de `analysesGroups` → `primary.main` vía `sx` función.

- [ ] **Step 3:** Verificar que no quede ninguno:

```bash
grep -rniE "#(2196F3|1976D2|64B5F6|90CAF9|1565C0|0d47a1|1a237e)\b|rgba\((33, ?150, ?243|100, ?181, ?246|25, ?118, ?210)" src/renderer --include=*.tsx --include=*.ts
```
Expected: sin resultados.

- [ ] **Step 4:** `npx tsc --noEmit && npx jest src/renderer`. Expected: OK. **Commit** `refactor(estilo): tintes azules desde el color primario del tema`

---

### Task 6: Capturas "después", tests completos y push

- [ ] **Step 1:** App desde el worktree (`Certia/deva-1.3.8`, con el `npm start` de la 1.3.7 apagado): repetir las capturas de la Task 2.
- [ ] **Step 2:** Correr la suite como el CI (`tsc` de la app y del backend, `npm run build`, jest backend, main y renderer). Expected: todo verde.
- [ ] **Step 3:** CHANGELOG 1.3.8, sección `### Cambiado`: la familia DEVA (colores de deva-design, la barra, "Modo oscuro" como tooltip, el logo del paquete). **Commit** y `git push -u origin 1.3.8`.
- [ ] **Step 4:** Comparación de antes y después para Saúl. El portal 1.3.8 se publica junto con DEVA 1.3.8.
