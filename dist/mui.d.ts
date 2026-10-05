/* deva-design v1.0.0 — generado desde tokens/tokens.json. No editar a mano. */

export type DevaMode = 'light' | 'dark';
export interface DevaColorTokens {
  brand: string;
  bar: string;
  onBar: string;
  action: string;
  onAction: string;
  bg: string;
  surface: string;
  surface2: string;
  chipBg: string;
  chipInk: string;
  ink: string;
  inkSoft: string;
  line: string;
  ok: string;
  okBg: string;
  warn: string;
  warnBg: string;
  danger: string;
  dangerBg: string;
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
