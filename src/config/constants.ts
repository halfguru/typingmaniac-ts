import type { PowerType } from '../types';
import { themeService } from '../services/ThemeService';

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const SIDEBAR_WIDTH = 270;
export const GAME_AREA_WIDTH = GAME_WIDTH - SIDEBAR_WIDTH;
export const DANGER_ZONE_Y = GAME_HEIGHT - 150;

export const FONT_SIZE = 42;
export const FONT_SMALL = 33;
export const FONT_LARGE = 54;
export const FONT_FAMILY = themeService.fonts.primary;
export const FONT_MONO = themeService.fonts.mono;

export const MAX_POWER_STACK = 6;

export const POWER_KEYS: Record<string, PowerType> = {
  FIRE: 'fire',
  ICE: 'ice',
  WIND: 'wind',
  SLOW: 'slow',
};

export const POWER_SYMBOLS: Record<PowerType, string> = {
  none: '',
  fire: '🔥',
  ice: '❄️',
  wind: '💨',
  slow: '⏱️',
};

export const POWER_COLORS: Record<PowerType, number> = {
  none: themeService.getNumber('bg.panel'),
  fire: themeService.getNumber('powers.fire'),
  ice: themeService.getNumber('powers.ice'),
  wind: themeService.getNumber('powers.wind'),
  slow: themeService.getNumber('powers.slow'),
};

export const POWER_NAMES: Record<PowerType, string> = {
  none: '',
  fire: 'FIRE',
  ice: 'ICE',
  wind: 'WIND',
  slow: 'SLOW',
};

export const COLORS = {
  MATRIX_GREEN: themeService.getNumber('accent.primary'),
  MATRIX_DARK: themeService.getNumber('bg.secondary'),
  MATRIX_BRIGHT: themeService.getNumber('accent.success'),
  DANGER: themeService.getNumber('accent.danger'),
  PROGRESS_BG: themeService.getNumber('bg.panel'),
  PROGRESS_FILL: themeService.getNumber('accent.primary'),
  LIMIT_FILL: themeService.getNumber('accent.danger'),
} as const;
