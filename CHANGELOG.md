# Changelog

## [1.1.0] - 2026-10-05

### Agregado
- `bar-button-ink`: texto de los botones blancos de la barra ("Cerrar sesión"). Es `#1E73BE` en los dos modos: en oscuro, `action` (`#5DADE2`) sobre blanco daba 2,4:1. El test controla el par contra `on-bar` (4,9:1).

## [1.0.0] - 2026-10-05

### Agregado
- Tokens de color en claro y oscuro: `brand`, `bar`, `on-bar`, `action`, `on-action`, `bg`, `surface`, `surface-2`, `chip-bg`, `chip-ink`, `ink`, `ink-soft`, `line`, `ok`, `warn`, `danger` y sus fondos. También fuente (Inter), radio (8 px) y sombras.
- Salidas: `tokens.css` (variables `--deva-*`), `tailwind.css` (Tailwind v4), `createDevaPalette` para MUI (ESM, CJS y tipos).
- Logo oficial en azul y blanco.
- Test de contraste WCAG: el build falla si un par de texto normal baja de 4,5:1, o si la barra baja de 3:1.
