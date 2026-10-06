# Design tokens de la familia DEVA

**Fecha:** 2026-10-05 · **Ticket:** DEVA-67 · **Estado:** diseño aprobado por Saúl, falta el plan de implementación.

## Objetivo

DEVA, el portal de pedidos, Nexus y la landing deva.ar tienen que reconocerse como parte de la misma familia, con diferencias sutiles que permitan distinguirlos a simple vista. Hoy cada app tiene su propia identidad:

| App | Estilo hoy | Color principal |
|---|---|---|
| DEVA | MUI, `src/renderer/config/theme.config.tsx` | `#2196F3` |
| Portal de pedidos | Tailwind v4, variables en `src/index.css` | `#2196f3` |
| Nexus | Tailwind v4 + shadcn, `src/index.css` | `#4F46E5` (índigo) + naranja |
| Landing | Next.js + Tailwind v4, `globals.css` | `#3498db` / `#52c3ff` |

## Decisiones

1. **Cómo se distinguen:** con el mismo azul en todas las apps. Lo único que cambia es el nombre del producto junto al logo oficial de DEVA (el wordmark limpio `deva-logo-loading.png`), con una línea fina vertical en medio: `[logo] | Pedidos`. Va sin punto de color ni acento propio. DEVA, la app principal, lleva sólo el logo.
2. **Azul:**
   - `brand` es el `#3498db` del logo, para la barra y la marca.
   - `action` es `#1E73BE`, el mismo tono más oscuro, para botones, enlaces, foco y selección.
   - Con `#2196F3` o `#3498db` en botones, el texto blanco quedaba en 3,1:1 y no llegaba a AA. Con `#1E73BE` da 4,9:1.
3. **Paleta completa:** la del portal, ajustada al azul elegido, en claro y oscuro (tabla abajo).
4. **Forma:**
   - tipografía Inter en las tres apps;
   - bordes de 8 px;
   - las sombras suaves del portal.
5. **Landing:** toma sólo `brand` y el logo, y conserva su tipografía (Archivo/Gloock), el fondo oscuro y los colores de marketing.
6. **Distribución:**
   - paquete en un repo **público** nuevo, `sbelbey/deva-design`, que cada app instala desde GitHub con un tag fijo;
   - es público porque sólo tiene colores, tipografía y el logo, que ya son públicos;
   - así ni el CI, ni Amplify, ni Docker necesitan credenciales.

## Tokens (v1.0.0)

| Token | Uso | Claro | Oscuro |
|---|---|---|---|
| `brand` | Marca, logo, ilustraciones | `#3498db` | `#3498db` |
| `bar` | Barra superior | `#3498db` | `#1f5f96` |
| `action` | Botones, enlaces, foco, selección | `#1E73BE` | `#5DADE2` |
| `on-action` | Texto sobre `action` | `#ffffff` | `#0a1428` |
| `bg` | Fondo de la pantalla | `#F0F7FF` | `#0a1428` |
| `surface` | Tarjetas, diálogos, tablas | `#ffffff` | `#00193b` |
| `surface-2` | Campos, filas alternas | `#E6F0FB` | `#0b2147` |
| `chip-bg` | Fondo de etiquetas de marca | `#e3f2fd` | `#10305a` |
| `chip-ink` | Texto de esas etiquetas | `#1A68AD` | `#5DADE2` |
| `on-bar` | Logo y texto sobre la barra | `#ffffff` | `#ffffff` |
| `ink` | Texto principal | `#1a2332` | `#e8f0fe` |
| `ink-soft` | Texto secundario | `#4a5a70` | `#a9bbd6` |
| `line` | Bordes y separadores | `#d6e7f8` | `#17345f` |
| `ok` / `ok-bg` | Éxito | `#2e7d32` / `#e8f5e9` | `#66bb6a` / `#12321f` |
| `warn` / `warn-bg` | Aviso | `#7a5900` / `#fff8e1` | `#ffe082` / `#3a2e07` |
| `danger` / `danger-bg` | Error, peligro | `#c62828` / `#fdecea` | `#ef9a9a` / `#3d1519` |

Además:
* `font-body`: `'Inter', 'Roboto', 'Arial', sans-serif`;
* `radius`: `8px`;
* `shadow-sm`, `shadow-md`, `shadow-lg`: los valores actuales del portal (`deva-ward-portal/src/index.css`), con su versión oscura.

Contrastes verificados (WCAG). Todos los pares de texto normal llegan a 4,5:1 o más en los dos modos (mínimo: 4,6 en claro y 5,4 en oscuro):

| Par | Claro | Oscuro |
|---|---|---|
| `on-action` sobre `action` | 4,9:1 | 7,5:1 |
| `action` sobre `bg` | 4,6:1 | 7,5:1 |
| `chip-ink` sobre `chip-bg` | 5,1:1 | 5,4:1 |
| `ink` sobre `bg` | 14,6:1 | 16,0:1 |

Los demás pares que controla el test son:
* `action` sobre `surface`;
* `ink` sobre `surface` y `surface-2`;
* `ink-soft` sobre `bg` y `surface`;
* `ok`, `warn` y `danger` sobre su fondo y sobre `surface`.

**La barra es la excepción.** `on-bar` sobre `bar` da 3,15:1 en claro, porque la barra es el azul exacto del logo, y 6,7:1 en oscuro. Alcanza para el logo y para texto grande (mínimo 3:1), pero no para texto chico. Regla: sobre la barra van el logo y el nombre del producto en 19 px peso 600 o más. El texto chico (usuario, "Cerrar sesión") va dentro de un botón blanco con texto `action`, como hoy en DEVA. El test controla este par con el mínimo de texto grande.

**Barra en dos niveles (decisión de Saúl del 5/10, al migrar el portal).** Las apps con menú (portal, DEVA, Nexus) usan dos barras:
* **arriba**, la barra `bar`, sólo con el logo, el nombre del producto y "Cerrar sesión" en un botón blanco con texto `action`;
* **abajo**, una barra `surface` con borde inferior `line`, que lleva el menú (texto `ink-soft`, la sección activa en `chip-bg` con texto `chip-ink`), el origen o sector, los avisos y el modo oscuro.

Así todo el texto chico queda legible. Hoy, sobre `#2196F3`, el menú daba 3,1:1.

## Paquete `deva-design`

```
tokens/tokens.json      única fuente
scripts/build.mjs       genera dist/ y corre el test de contraste
dist/tokens.css         variables --deva-*: :root (claro) y [data-theme="dark"] (oscuro)
dist/tailwind.css       @theme inline que mapea --deva-* a clases de Tailwind v4 con prefijo deva (bg-deva-surface, text-deva-ink, bg-deva-action…), para no pisar los nombres que cada app ya usa
dist/mui.js, mui.d.ts   createDevaPalette(mode) para createTheme de MUI
dist/tokens.json        copia de los valores crudos
assets/deva-logo.png        wordmark oficial azul (1306x610, fondo transparente)
assets/deva-logo-white.png  el mismo en blanco
README.md, CHANGELOG.md
```

- Las variables CSS llevan prefijo `--deva-` para no chocar con las que cada app ya tiene (por ejemplo, `--brand` del portal es hoy el azul de los botones).
- `dist/` se commitea, para que instalar desde GitHub no tenga que compilar nada.
- El lockup "logo | Producto" no es una imagen por producto: es el logo blanco más el nombre en Inter. El README trae el HTML y CSS de ejemplo.
- **Test de contraste:** `npm test` falla si algún par de texto normal baja de 4,5:1, o si `on-bar` sobre `bar` baja de 3:1.
- **Versionado:** un tag semver por cambio (`v1.0.0`, `v1.1.0`…). Las apps fijan el tag con `npm install github:sbelbey/deva-design#vX.Y.Z`. Un cambio en el paquete no llega solo a ninguna app: se actualiza a propósito, app por app.

## Migración por app (en este orden)

| Orden | App | Versión | Alcance |
|---|---|---|---|
| 1 | deva-design | v1.0.0 | Repo, tokens, generador, test de contraste, README |
| 2 | Portal de pedidos | 1.3.8 | Importar `tokens.css`; las variables actuales apuntan a las `--deva-*`; la barra pasa al lockup "logo \| Pedidos" |
| 3 | DEVA | 1.3.8 | `theme.config.tsx` arma la paleta con `createDevaPalette(mode)`; la barra usa el logo blanco del paquete |
| 4 | Nexus | 1.2.2 | Las variables de shadcn (`--primary`, `--border`, `--ring`…) pasan a las `--deva-*`; deja el índigo y el naranja; `--radius` de 0,85rem a 8 px; Inter; la barra lateral pasa a "logo \| Nexus" |
| 5 | Landing | — | Toma `--deva-brand` y el logo del paquete; el resto queda como está |

## Pruebas

- **Paquete:** el test de contraste y una verificación de que `dist/` está al día respecto de `tokens.json`.
- **Cada app:**
  - typecheck y tests de su repo;
  - capturas antes y después, en claro y oscuro, de 3 o 4 pantallas clave, para que Saúl las compare.

## Fuera de alcance

- Componentes compartidos. Los autocompletes dedicados son un ticket aparte (DEVA-66), que usará estos tokens.
- Rediseñar pantallas: sólo cambian colores, tipografía, bordes, sombras y la barra.
- Gráficos y paletas de datos (`--chart-*` de Nexus): quedan como están.

## Pasos manuales

Saúl crea el repo público vacío `sbelbey/deva-design` en GitHub, sin README, `.gitignore` ni licencia. El resto lo hace Claude.
