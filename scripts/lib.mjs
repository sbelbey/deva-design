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
