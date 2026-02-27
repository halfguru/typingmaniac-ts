export interface ThemeColors {
  bg: {
    primary: number;
    secondary: number;
    panel: number;
    overlay: number;
    dark: number;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    glow: string;
  };
  accent: {
    primary: number;
    secondary: number;
    danger: number;
    success: number;
  };
  game: {
    wordText: string;
    wordMatched: string;
    wordGlow: string;
    inputText: string;
    inputBg: number;
    inputBorder: number;
    dangerZone: number;
    dangerGlow: number;
  };
  effects: {
    glow: number;
    shadow: number;
    scanline: number;
    vignette: number;
  };
  powers: {
    fire: number;
    ice: number;
    wind: number;
    slow: number;
  };
  character: {
    hood: number;
    face: number;
    skin: number;
    eyes: number;
    eyesGlow: number;
    eyesDanger: number;
  };
}

export interface ThemeFonts {
  primary: string;
  mono: string;
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
}

export type ThemeName = 'default';
