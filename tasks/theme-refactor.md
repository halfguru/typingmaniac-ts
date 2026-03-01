# Theme System Refactor

## Goal
Make it easy to change the game's visual theme without hunting through code.

## Progress

### ✅ Phase 1: Create Theme Infrastructure
- [x] Create `src/themes/types.ts` - Theme interface with all color categories
- [x] Create `src/themes/default.ts` - Current cyberpunk theme as default
- [x] Create `src/themes/index.ts` - Theme exports
- [x] Create `src/services/ThemeService.ts` - Theme access helpers
- [x] Update `src/config/constants.ts` - Use theme service

### ✅ Phase 2: Refactor Components
- [x] GameScene - replace hardcoded colors (~30 locations)
- [x] UIScene - replace hardcoded colors (~40 locations)
- [x] BackgroundRenderer - replace hardcoded colors (~10 locations)
- [x] EffectManager - replaced hardcoded colors
- [x] MenuScene - replace hardcoded colors (~20 locations)
- [x] SettingsScene - replace hardcoded colors (~15 locations)
- [x] CountdownScene - replace hardcoded colors (~5 locations)
- [ ] ProgressBar - partially done (uses colors from props)
- [ ] HackerCharacter - file not found (may not exist)

### 🔄 Phase 3: Clean Up
- [ ] Remove unused color exports from constants
- [ ] Test all scenes
- [ ] Document how to create new themes

## Theme Structure
```typescript
interface Theme {
  name: string;
  displayName: string;
  colors: {
    bg: { primary, secondary, panel, overlay, dark, sidebar, input, slot }
    text: { primary, secondary, muted, glow, danger, warning }
    accent: { primary, secondary, danger, success, warning }
    game: { wordText, wordMatched, wordGlow, inputText, inputBg, inputBorder, dangerZone, dangerGlow }
    effects: { glow, shadow, scanline, vignette }
    powers: { fire, ice, wind, slow }
    character: { hood, face, skin, eyes, eyesGlow, eyesDanger }
    ui: { panelBg, panelBorder, buttonBg, buttonHover, buttonBorder, divider }
    grid: { primary, secondary }
  }
  fonts: { primary, mono }
}
```

## Usage Examples
```typescript
import { themeService } from './services/ThemeService';

// Get hex color string for text
const textColor = themeService.getText('text.primary'); // '#4fc3f7'

// Get number color for graphics
const bgColor = themeService.getNumber('bg.panel'); // 0x000a00

// Access colors directly
const colors = themeService.colors;
```

## Future Themes Ideas
- `retro` - 8-bit pixel art style
- `minimal` - Clean, high contrast
- `neon` - Bright neon on dark
- `light` - Light mode for daytime
