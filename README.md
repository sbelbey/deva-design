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
