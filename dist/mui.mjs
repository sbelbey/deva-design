// deva-design v1.0.0 — generado desde tokens/tokens.json. No editar a mano.
const devaTokens = {
  "light": {
    "brand": "#3498db",
    "bar": "#3498db",
    "onBar": "#ffffff",
    "action": "#1E73BE",
    "onAction": "#ffffff",
    "bg": "#F0F7FF",
    "surface": "#ffffff",
    "surface2": "#E6F0FB",
    "chipBg": "#e3f2fd",
    "chipInk": "#1A68AD",
    "ink": "#1a2332",
    "inkSoft": "#4a5a70",
    "line": "#d6e7f8",
    "ok": "#2e7d32",
    "okBg": "#e8f5e9",
    "warn": "#7a5900",
    "warnBg": "#fff8e1",
    "danger": "#c62828",
    "dangerBg": "#fdecea"
  },
  "dark": {
    "brand": "#3498db",
    "bar": "#1f5f96",
    "onBar": "#ffffff",
    "action": "#5DADE2",
    "onAction": "#0a1428",
    "bg": "#0a1428",
    "surface": "#00193b",
    "surface2": "#0b2147",
    "chipBg": "#10305a",
    "chipInk": "#5DADE2",
    "ink": "#e8f0fe",
    "inkSoft": "#a9bbd6",
    "line": "#17345f",
    "ok": "#66bb6a",
    "okBg": "#12321f",
    "warn": "#ffe082",
    "warnBg": "#3a2e07",
    "danger": "#ef9a9a",
    "dangerBg": "#3d1519"
  }
};
const devaFontFamily = "'Inter', 'Roboto', 'Arial', sans-serif";
const devaRadius = 8;

function createDevaPalette(mode) {
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
}

export { createDevaPalette, devaTokens, devaFontFamily, devaRadius };
