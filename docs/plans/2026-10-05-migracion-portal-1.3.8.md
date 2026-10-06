# Migración del portal de pedidos a deva-design (1.3.8) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pasar el portal de pedidos (`deva-ward-portal`, pedidos.deva.ar) a los tokens de `deva-design` v1.0.0. Lleva la barra en dos niveles con el lockup "[logo] | Pedidos" y no cambia ningún componente de negocio.

**Architecture:** `src/index.css` importa `deva-design/tokens.css`. Las variables propias del portal (`--brand`, `--ink`, `--surface`…) pasan a ser alias de las `--deva-*`, así que los ~200 usos en los componentes no se tocan. Como las `--deva-*` ya cambian con `data-theme="dark"`, el bloque oscuro del portal queda sólo con lo que el paquete no tiene. La barra se reescribe en `AppShell.tsx` en dos niveles. El logo sale de los assets del paquete.

**Tech Stack:** React 19, Vite, Tailwind v4 (sintaxis `bg-(--var)`), lucide-react. No hay tests unitarios en el repo: se verifica con `npm run build` (tsc + vite), `npm run lint` (oxlint) y capturas con Playwright contra producción.

**Spec:** `deva-design/docs/specs/2026-10-05-design-tokens-familia-deva-design.md` (incluye la decisión de la barra en dos niveles).

**Ojo con el deploy:** Amplify deploya el portal al pushear a `main`. Todo va en la rama `1.3.8`. Nada se mergea a `main` sin el OK de Saúl.

---

### Task 1: Rama, versión y dependencia

**Files:** Modify: `package.json`, `package-lock.json`

- [ ] **Step 1:** Rama `1.3.8` desde `origin/main` (el portal sigue la numeración de DEVA).

```bash
cd deva-ward-portal
git fetch origin && git checkout -b 1.3.8 origin/main
```

- [ ] **Step 2:** Subir la versión y agregar el paquete.

```bash
npm version 1.3.8 --no-git-tag-version
npm install github:sbelbey/deva-design#v1.0.0
```

Expected: `package.json` con `"version": "1.3.8"` y `"deva-design": "github:sbelbey/deva-design#v1.0.0"` en dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(release): 1.3.8 + deva-design v1.0.0"
```

---

### Task 2: Capturas "antes"

- [ ] **Step 1:** Antes de tocar estilos, build de producción y `vite preview` contra Nucleus de producción. El dev server recarga la página y rompe Playwright.

```bash
VITE_NUCLEUS_API_URL=https://qrnn65ulkwvp5qdt6pyjmf3yja0nrift.lambda-url.us-east-1.on.aws/api/v1 npx vite build && npx vite preview --port 4173
```

- [ ] **Step 2:** Con Playwright (script en el scratchpad), capturar en claro y oscuro, a 1440x900 y 390x844:
  * el login;
  * "Nueva ronda", con la cuenta de prueba `saultest`;
  * "Historial";
  * "Resultados", con la cuenta `saulobs`.

  Guardarlas como `antes-<pantalla>-<modo>.png`. El modo se cambia con `localStorage` y `data-theme` antes de cargar (ver `src/theme/colorMode.tsx`). Sólo lectura: no enviar rondas.

---

### Task 3: index.css con los tokens

**Files:** Modify: `src/index.css:1-100` (bloques `:root` y `:root[data-theme='dark']`)

- [ ] **Step 1:** Después de `@import "tailwindcss";` y los `@fontsource`, agregar:

```css
@import "deva-design/tokens.css";
```

- [ ] **Step 2:** Reemplazar el bloque `:root { … }` completo (hoy de la línea 14 a la 55, desde `--brand: #2196f3;` hasta `--radius`) por:

```css
:root {
  /*
   * Familia DEVA: los colores salen de deva-design (tokens.css, variables
   * --deva-*), compartidos con DEVA y Nexus. Estas variables del portal son
   * alias para no tocar los componentes. Las --deva-* cambian solas con
   * data-theme="dark", así que el bloque oscuro de abajo sólo lleva lo que el
   * paquete no tiene.
   */
  --brand: var(--deva-action);
  --brand-hover: color-mix(in srgb, var(--deva-action) 86%, #000);
  --brand-deep: var(--deva-chip-ink);
  --brand-ink: var(--deva-chip-ink);
  --brand-3: var(--deva-brand);
  --brand-bg: var(--deva-chip-bg);
  --on-brand: var(--deva-on-action);
  --bar: var(--deva-bar);
  --on-bar: var(--deva-on-bar);
  --header-h: 6.5rem; /* barra (3.5rem) + menú (3rem) */
  --brand-gradient: radial-gradient(circle at 100% 0%, rgba(37, 177, 207, 0.95) 0%, rgba(37, 177, 207, 0) 45%),
    radial-gradient(circle at 0% 0%, rgba(91, 174, 238, 0.9) 0%, rgba(91, 174, 238, 0) 50%),
    linear-gradient(60deg, #71fefe 0%, #56c8ee 35%, #4492de 68%, #3c80d7 100%);

  --ok: var(--deva-ok);
  --ok-ink: var(--deva-ok);
  --ok-bg: var(--deva-ok-bg);
  --warn: #fbc02d; /* sólo el punto de estado; el texto usa --warn-ink */
  --warn-ink: var(--deva-warn);
  --warn-bg: var(--deva-warn-bg);
  --danger: #d32f2f; /* relleno (botón de peligro, anillo) */
  --danger-ink: var(--deva-danger);
  --danger-bg: var(--deva-danger-bg);

  --ink: var(--deva-ink);
  --ink-soft: var(--deva-ink-soft);
  --ink-faint: #9aa8b8; /* sólo decorativo (íconos acompañando texto) */
  --ink-placeholder: #5f6f82; /* 5:1 sobre blanco */
  --bg: var(--deva-bg);
  --surface: var(--deva-surface);
  --surface-2: var(--deva-surface-2);
  --muted-bg: #eef2f7;
  --line: var(--deva-line);
  --line-strong: #bcd4ee;
  --backdrop: rgba(13, 71, 161, 0.28);

  --shadow-sm: var(--deva-shadow-sm);
  --shadow-md: var(--deva-shadow-md);
  --shadow-lg: var(--deva-shadow-lg);

  --font-body: var(--deva-font-body);
  --radius: var(--deva-radius);
}
```

- [ ] **Step 3:** Reemplazar el bloque `:root[data-theme='dark'] { … }` completo por:

```css
:root[data-theme='dark'] {
  --brand-gradient: linear-gradient(rgba(10, 20, 40, 0.35), rgba(10, 20, 40, 0.35)),
    radial-gradient(circle at 100% 0%, rgba(37, 177, 207, 0.95) 0%, rgba(37, 177, 207, 0) 45%),
    radial-gradient(circle at 0% 0%, rgba(91, 174, 238, 0.9) 0%, rgba(91, 174, 238, 0) 50%),
    linear-gradient(60deg, #71fefe 0%, #56c8ee 35%, #4492de 68%, #3c80d7 100%);
  --warn: #ffc107;
  --danger: #f44336;
  --ink-faint: #5f7596;
  --ink-placeholder: #8a9dba;
  --muted-bg: #13294f;
  --line-strong: #25497c;
  --backdrop: rgba(0, 0, 0, 0.55);
}
```

- [ ] **Step 4:** Verificar que ya no quede `--header-gradient` en el CSS (lo reemplaza `--bar`) y que compile.

Run: `grep -n "header-gradient" src/index.css; npm run build`
Expected: grep sin resultados; build OK.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat(estilo): colores de la familia DEVA desde deva-design"
```

---

### Task 4: Lockup "[logo] | Pedidos" con el logo del paquete

**Files:** Modify: `src/components/BrandLockup.tsx`, `src/pages/Login/index.tsx:104-130`

- [ ] **Step 1:** Reemplazar `src/components/BrandLockup.tsx` completo:

```tsx
import logoBlue from 'deva-design/assets/deva-logo.png';
import logoWhite from 'deva-design/assets/deva-logo-white.png';

/**
 * Lockup de la familia DEVA: logo oficial | "Pedidos" (deva-design). El
 * portal es un módulo de DEVA, no una marca aparte: nunca un logo propio.
 * `tone`: 'white' sobre la barra o fondos de color, 'blue' sobre fondos claros.
 */
export function BrandLockup({
  tone,
  logoClassName,
  textClassName,
  stacked = false,
}: {
  tone: 'white' | 'blue';
  logoClassName: string;
  textClassName: string;
  /** Descriptor debajo del logo, alineado a la derecha con la "a" (panel grande del login). */
  stacked?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 ${stacked ? 'flex-col items-end gap-3' : 'items-center gap-3'}`}
    >
      <img src={tone === 'white' ? logoWhite : logoBlue} alt="DEVA" className={logoClassName} />
      {!stacked && <span aria-hidden className="h-6 w-px bg-current opacity-55" />}
      <span className={`leading-none font-semibold tracking-[-0.01em] ${textClassName}`}>Pedidos</span>
    </span>
  );
}
```

- [ ] **Step 2:** En `src/pages/Login/index.tsx`, el panel grande (`stacked`) pasa a `tone="white"` sin el filtro `brightness-0 invert`. El de mobile pasa a `tone="blue"`:

```tsx
        <BrandLockup
          stacked
          tone="white"
          logoClassName="h-auto w-[280px] drop-shadow-[0_6px_18px_rgba(8,61,120,0.25)] lg:w-[340px]"
          textClassName="text-3xl text-white/90 drop-shadow-[0_4px_12px_rgba(8,61,120,0.25)] lg:text-4xl"
        />
```

```tsx
            <BrandLockup
              tone="blue"
              logoClassName="h-auto w-28"
              textClassName="text-2xl text-(--ink-soft)"
            />
```

- [ ] **Step 3:** Run: `npm run build`. Expected: OK, sin errores de tipos. Si TS no reconoce el `.png` del paquete, ya está cubierto por `vite/client` en `src/vite-env.d.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/components/BrandLockup.tsx src/pages/Login/index.tsx
git commit -m "feat(estilo): lockup logo | Pedidos con el logo de deva-design"
```

---

### Task 5: Barra en dos niveles

**Files:** Modify: `src/layout/AppShell.tsx` (`NotificationsToggle`, `navClass`, `<header>`), `src/layout/WorkspaceLayout.tsx:17`

- [ ] **Step 1:** En `NotificationsToggle`, el botón deja de ser blanco sobre azul y pasa a la barra blanca:

```tsx
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-(--ink-soft) transition-colors hover:bg-(--surface-2) hover:text-(--ink)"
```

- [ ] **Step 2:** `navClass`:

```tsx
const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-(--brand-bg) text-(--brand-ink)'
      : 'text-(--ink-soft) hover:bg-(--surface-2) hover:text-(--ink)'
  }`;
```

- [ ] **Step 3:** Reemplazar el `<header>…</header>` completo:

```tsx
      <header className="sticky top-0 z-20 shadow-(--shadow-sm)">
        <div className="text-(--on-bar)" style={{ background: 'var(--bar)' }}>
          <div className="mx-auto flex h-14 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
            <BrandLockup tone="white" logoClassName="h-[30px] w-auto" textClassName="text-[19px]" />
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-(--brand) transition-colors hover:bg-white/90 sm:px-4"
            >
              <LogOut className="size-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div className="border-b border-(--line) bg-(--surface)">
          <div className="mx-auto flex h-12 max-w-[90rem] items-center gap-1 px-2 sm:gap-2 sm:px-6">
            <nav className="flex items-center gap-1" aria-label="Secciones">
              {observer ? (
                <NavLink to="/" end className={navClass}>
                  <FileText className="size-4" aria-hidden />
                  <span className="hidden md:inline">Resultados</span>
                </NavLink>
              ) : (
                <>
                  <NavLink to="/" end className={navClass}>
                    <ClipboardPlus className="size-4" aria-hidden />
                    <span className="hidden md:inline">Nueva ronda</span>
                  </NavLink>
                  <NavLink to="/rondas" end className={(state) => `${navClass(state)} xl:hidden`}>
                    <History className="size-4" aria-hidden />
                    <span className="hidden md:inline">Rondas</span>
                    {pendingCount > 0 && (
                      <span className="tabular rounded-full bg-(--brand) px-1.5 text-[11px] text-(--on-brand)">
                        {pendingCount}
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/historial" className={navClass}>
                    <Search className="size-4" aria-hidden />
                    <span className="hidden md:inline">Historial</span>
                  </NavLink>
                </>
              )}
            </nav>

            <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
              {session?.originLabel && (
                <span className="hidden min-w-0 items-center gap-2 text-sm font-semibold text-(--ink-soft) sm:inline-flex">
                  <span className="max-w-48 truncate">{session.originLabel}</span>
                  <span className="shrink-0 rounded-full bg-(--brand-bg) px-2 py-px text-[11px] font-semibold text-(--brand-ink)">
                    {sectorLabel}
                  </span>
                </span>
              )}
              <NotificationsToggle />
              <label className="hidden items-center text-sm font-semibold text-(--ink-soft) lg:inline-flex">
                <ColorModeSwitch saveToAccount />
                <span className="sr-only lg:not-sr-only">Modo oscuro</span>
              </label>
              <ColorModeSwitch className="lg:hidden" saveToAccount />
            </div>
          </div>
        </div>
      </header>
```

- [ ] **Step 4:** En `src/layout/WorkspaceLayout.tsx:17`, el panel lateral fijo usa el alto nuevo de la barra:

```tsx
        className="sticky top-(--header-h) hidden h-[calc(100dvh-var(--header-h))] w-[22rem] shrink-0 border-l border-(--line) bg-(--surface-2) xl:block"
```

- [ ] **Step 5:** Run: `npm run build && npm run lint`. Expected: OK, sin errores nuevos.

- [ ] **Step 6: Commit**

```bash
git add src/layout/AppShell.tsx src/layout/WorkspaceLayout.tsx
git commit -m "feat(estilo): barra en dos niveles (marca arriba, menú legible abajo)"
```

---

### Task 6: Capturas "después", revisión y DESIGN.md

**Files:** Modify: `DESIGN.md` (sección Colors)

- [ ] **Step 1:** Repetir las capturas de la Task 2 (`despues-*`). Verificar a ojo:
  * la barra azul en claro (`#3498db`) y en oscuro (`#1f5f96`);
  * el menú legible;
  * la sección activa en chip celeste;
  * el panel de rondas sin solaparse con la barra (xl, 1440 px);
  * el login con el logo blanco nítido;
  * los estados (pendiente, completo, rechazado) con sus colores.

- [ ] **Step 2:** Al principio de la sección `## Colors` de `DESIGN.md`, agregar:

```markdown
> **Desde 1.3.8 los colores salen de [deva-design](https://github.com/sbelbey/deva-design)** (tokens de la familia DEVA, v1.0.0). Las variables del portal (`--brand`, `--ink`, `--surface`…) son alias de las `--deva-*` en `src/index.css`. Para cambiar un color se cambia en deva-design, no acá. Barra en dos niveles: arriba `[logo] | Pedidos` y "Cerrar sesión"; abajo el menú.
```

- [ ] **Step 3: Commit y push de la rama** (no a `main`)

```bash
git add DESIGN.md
git commit -m "docs: DESIGN.md apunta a deva-design"
git push -u origin 1.3.8
```

- [ ] **Step 4:** Pasarle a Saúl las capturas de antes y después. El merge a `main` (deploy en Amplify) lo decide él.
