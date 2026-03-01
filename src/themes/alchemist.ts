import type { Theme } from './types';

export const alchemistTheme: Theme = {
  name: 'alchemist',
  displayName: 'Alchemist',
  colors: {
    bg: {
      primary: 0x1a1208,
      secondary: 0x2d1f0f,
      panel: 0x3d2810,
      overlay: 0x1a0f05,
      dark: 0x0d0a04,
      sidebar: 0x2a1a0a,
      input: 0x3a2510,
      slot: 0x4a3015,
    },
    text: {
      primary: '#f4d03f',
      secondary: '#c9a227',
      muted: '#8b7355',
      glow: '#ffd700',
      danger: '#d35400',
      warning: '#e67e22',
    },
    accent: {
      primary: 0xf4d03f,
      secondary: 0xe67e22,
      danger: 0xd35400,
      success: 0x27ae60,
      warning: 0xe67e22,
    },
    game: {
      wordText: '#f5e6d3',
      wordMatched: '#27ae60',
      wordGlow: '#ffd700',
      inputText: '#f4d03f',
      inputBg: 0x3a2510,
      inputBorder: 0xc9a227,
      dangerZone: 0xd35400,
      dangerGlow: 0xe67e22,
    },
    effects: {
      glow: 0xffd700,
      shadow: 0x1a0f05,
      scanline: 0x2d1f0f,
      vignette: 0x0d0a04,
    },
    powers: {
      fire: 0xff6b35,
      ice: 0x5dade2,
      wind: 0xa569bd,
      slow: 0xf39c12,
    },
    character: {
      hood: 0x2c1810,
      face: 0x1a1008,
      skin: 0x3d2810,
      eyes: 0xffd700,
      eyesGlow: 0xf4d03f,
      eyesDanger: 0xd35400,
    },
    ui: {
      panelBg: 0x3d2810,
      panelBorder: 0xc9a227,
      buttonBg: 0x3a2510,
      buttonHover: 0x4a3015,
      buttonBorder: 0xf4d03f,
      divider: 0x8b7355,
    },
    grid: {
      primary: 0xc9a227,
      secondary: 0xf4d03f,
    },
  },
  fonts: {
    primary: 'Fredoka, Arial, sans-serif',
    mono: 'monospace',
  },
};
