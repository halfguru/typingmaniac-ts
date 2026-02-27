import type { Theme, ThemeName } from './types';
import { defaultTheme } from './default';

const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
};

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export { defaultTheme } from './default';
export type { Theme, ThemeName, ThemeColors, ThemeFonts } from './types';
