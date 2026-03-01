import type { Theme } from './types';

export const defaultTheme: Theme = {
  name: 'default',
  displayName: 'Cyberpunk',
  colors: {
    bg: {
      primary: 0x0a0a0a,
      secondary: 0x001a00,
      panel: 0x000a00,
      overlay: 0x000500,
      dark: 0x050505,
      sidebar: 0x050a12,
      input: 0x050a12,
      slot: 0x0a1520,
    },
    text: {
      primary: '#4fc3f7',
      secondary: '#7ab8b8',
      muted: '#5a8a8a',
      glow: '#4fc3f7',
      danger: '#ff4444',
      warning: '#ff8c42',
    },
    accent: {
      primary: 0x4fc3f7,
      secondary: 0x00ffff,
      danger: 0xff4444,
      success: 0x4CAF50,
      warning: 0xff6b35,
    },
    game: {
      wordText: '#ffffff',
      wordMatched: '#4CAF50',
      wordGlow: '#4fc3f7',
      inputText: '#4fc3f7',
      inputBg: 0x050a12,
      inputBorder: 0x4fc3f7,
      dangerZone: 0xff4444,
      dangerGlow: 0xff6644,
    },
    effects: {
      glow: 0x4fc3f7,
      shadow: 0x000000,
      scanline: 0x000000,
      vignette: 0x000000,
    },
    powers: {
      fire: 0xff6b35,
      ice: 0x00ffff,
      wind: 0xba68c8,
      slow: 0xffb74d,
    },
    character: {
      hood: 0x080808,
      face: 0x121212,
      skin: 0x181818,
      eyes: 0x4fc3f7,
      eyesGlow: 0x88ff88,
      eyesDanger: 0xff4444,
    },
    ui: {
      panelBg: 0x050a12,
      panelBorder: 0x4fc3f7,
      buttonBg: 0x050a12,
      buttonHover: 0x0a2535,
      buttonBorder: 0x4fc3f7,
      divider: 0x4fc3f7,
    },
    grid: {
      primary: 0x00ffff,
      secondary: 0x4fc3f7,
    },
  },
  fonts: {
    primary: 'Fredoka, Arial, sans-serif',
    mono: 'monospace',
  },
};
