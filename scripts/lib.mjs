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
