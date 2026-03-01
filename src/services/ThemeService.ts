import type { Theme, ThemeName } from '../themes/types';
import { defaultTheme } from '../themes/default';
import { alchemistTheme } from '../themes/alchemist';

const STORAGE_KEY = 'typingmaniac-theme';

class ThemeService {
  private currentThemeName: ThemeName;
  private themes: Record<ThemeName, Theme> = {
    default: defaultTheme,
    alchemist: alchemistTheme,
  };
  private listeners: Set<(theme: ThemeName) => void> = new Set();

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    this.currentThemeName = stored && stored in this.themes ? stored : 'alchemist';
  }

  get current(): Theme {
    return this.themes[this.currentThemeName];
  }

  get colors() {
    return this.current.colors;
  }

  get fonts() {
    return this.current.fonts;
  }

  get name(): ThemeName {
    return this.currentThemeName;
  }

  getTheme(): ThemeName {
    return this.currentThemeName;
  }

  setTheme(name: ThemeName) {
    if (name in this.themes && name !== this.currentThemeName) {
      this.currentThemeName = name;
      localStorage.setItem(STORAGE_KEY, name);
      this.notifyListeners();
    }
  }

  onThemeChange(callback: (theme: ThemeName) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentThemeName));
  }

  getAvailableThemes(): { name: ThemeName; displayName: string }[] {
    return Object.entries(this.themes).map(([name, theme]) => ({
      name: name as ThemeName,
      displayName: theme.displayName,
    }));
  }

  getHex(path: string): string {
    const value = this.getPathValue(path);
    if (typeof value === 'number') {
      return `#${value.toString(16).padStart(6, '0')}`;
    }
    if (typeof value === 'string' && value.startsWith('#')) {
      return value;
    }
    return '#ffffff';
  }

  getNumber(path: string): number {
    const value = this.getPathValue(path);
    return typeof value === 'number' ? value : 0xffffff;
  }

  getText(path: string): string {
    const value = this.getPathValue(path);
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return `#${value.toString(16).padStart(6, '0')}`;
    }
    return '#ffffff';
  }

  private getPathValue(path: string): unknown {
    const parts = path.split('.');
    let current: unknown = this.colors;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        console.warn(`Theme path not found: ${path}`);
        return null;
      }
    }
    
    return current;
  }
}

export const themeService = new ThemeService();
