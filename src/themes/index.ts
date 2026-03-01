import type { Theme, ThemeName } from './types';
import { defaultTheme } from './default';
import { alchemistTheme } from './alchemist';

const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
  alchemist: alchemistTheme,
};

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export { defaultTheme } from './default';
export { alchemistTheme } from './alchemist';
export type { Theme, ThemeName, ThemeColors, ThemeFonts } from './types';
