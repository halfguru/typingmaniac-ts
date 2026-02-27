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
    },
    text: {
      primary: '#00ff41',
      secondary: '#00aa41',
      muted: '#006622',
      glow: '#00ff41',
    },
    accent: {
      primary: 0x00ff41,
      secondary: 0x00ffff,
      danger: 0xff0040,
      success: 0x88ff88,
    },
    game: {
      wordText: '#00ff41',
      wordMatched: '#ffffff',
      wordGlow: '#00ff41',
      inputText: '#00ff41',
      inputBg: 0x001a00,
      inputBorder: 0x00ff41,
      dangerZone: 0xff0040,
      dangerGlow: 0xff0040,
    },
    effects: {
      glow: 0x00ff41,
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
      eyes: 0x00ff41,
      eyesGlow: 0x88ff88,
      eyesDanger: 0xff0040,
    },
  },
  fonts: {
    primary: 'Fredoka, Arial, sans-serif',
    mono: 'monospace',
  },
};
