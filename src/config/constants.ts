import type { PowerType } from '../types';

export const COLORS = {
  BG_DARK: 0x1a4a4a,
  BG_PANEL: 0x143c3c,
  ACCENT_BLUE: 0x4fc3f7,
  ACCENT_WARM: 0xff8c42,
  TEXT: 0xffffff,
  PROGRESS_BG: 0x282828,
  PROGRESS_FILL: 0x4CAF50,
  LIMIT_FILL: 0xC83232,
  DANGER: 0xC83C3C,
  INPUT: 0x4fc3f7,
  TYPED: 0x4CAF50,
  FROZEN: 0x64b4ff,
  SCROLL: 0x8b5a2b,
  SCROLL_LIGHT: 0xd2b48c,
  POWER_FIRE: 0xff6b35,
  POWER_ICE: 0x64b5f6,
  POWER_WIND: 0xba68c8,
  POWER_SLOW: 0xffb74d,
} as const;

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const SIDEBAR_WIDTH = 270;
export const GAME_AREA_WIDTH = GAME_WIDTH - SIDEBAR_WIDTH;
export const DANGER_ZONE_Y = GAME_HEIGHT - 150;

export const FONT_SIZE = 42;
export const FONT_SMALL = 33;
export const FONT_LARGE = 54;
export const FONT_FAMILY = 'Fredoka, Arial, sans-serif';

export const BASE_FALL_SPEED = 1.5;
export const SPAWN_DELAY_BASE = 90;
export const MAX_POWER_STACK = 6;

export const LIMIT_PCT_PER_MISSED = 10;
export const PROGRESS_PCT_PER_WORD = 12;
export const POWER_DROP_RATE_BASE = 0.05;
export const POWER_DROP_RATE_PER_LEVEL = 0.02;
export const POWER_DROP_RATE_MAX = 0.25;

export const POWER_DURATION_ICE = 5000;
export const POWER_DURATION_SLOW = 5000;
export const SLOW_FACTOR = 0.3;
export const FIRE_POINTS_PER_WORD = 50;

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
