import type { Theme, ThemeName } from '../themes/types';
import { defaultTheme } from '../themes/default';

class ThemeService {
  private currentThemeName: ThemeName = 'default';
  private themes: Record<ThemeName, Theme> = {
    default: defaultTheme,
  };

  get current(): Theme {
    return this.themes[this.currentThemeName];
  }

  get colors() {
    return this.current.colors;
  }

  get fonts() {
    return this.current.fonts;
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
