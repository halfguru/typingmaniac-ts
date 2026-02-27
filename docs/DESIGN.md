# Game Design Reference

Based on `design-example.png` - Original Typing Maniac UI design.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                     ┌───────────────────────────┐
│                                     │ LEVEL       1             │
│                                     │ SCORE   804               │
│    ┌─────────────────────────────┐  │                           │
│    │                             │  │ SPECIAL                   │
│    │    MAIN GAME AREA           │  │ ┌─────────────────────┐   │
│    │    (falling words)          │  │ │ 🔥 FIRE             │   │
│    │                             │  │ │ ❄️ ICE              │   │
│    │                             │  │ │ 💨 WIND             │   │
│    │                             │  │ └─────────────────────┘   │
│    │                             │  │                           │
│    │                             │  │   LIMIT      PROG         │
│    │                             │  │    ▓▓        ▓▓           │
│    │                             │  │    ▓▓ 40%    ▓▓ 26%       │
│    └─────────────────────────────┘  │                           │
│    > typing input                   └───────────────────────────┤
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Screen Dimensions

- **Resolution**: 1920×1080
- **Game Area**: 1650×1080 (falling words)
- **Sidebar**: 270px wide on right side

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | Dark teal gradient | Main background |
| Panel | Dark teal (#050a12) | Sidebar/panel backgrounds |
| Accent (active) | Bright blue (#4fc3f7) | Active words, highlights, borders |
| Text | White (#ffffff) | Primary UI text |
| Progress (green) | Green (#2ecc71) | Progress bar fill |
| Limit (red) | Red (#ff4444) | Limit bar fill |
| Matched letters | Green (#4CAF50) | Correctly typed letters |
| Power colors | Fire: #ff6b35, Ice: #64b5f6, Wind: #ba68c8, Slow: #ffb74d | Power containers |

## Game Scenes

1. **Menu Scene** - Title, play button, tutorial/settings/scores
2. **Countdown Scene** - 3-2-1 countdown
3. **Game Scene** - Falling words, typing, powers
4. **UI Scene** - Sidebar overlay with stats

## Game Mechanics

### Word Submission
- Type letters to match a falling word
- Press **Enter** to submit
- Correct → word completes
- Wrong → MISS popup, input clears, red flash

### Word Focus Highlighting
- When typing matches a word, container highlights cyan
- Typed letters turn green, remaining letters stay white
- Power words lose their color when focused

### Progress System
- **PROGRESS** (green): Fills when completing words → Level complete at 100%
- **LIMIT** (red): Fills when words hit bottom → Game over at 100%

### Combo System
9/18/27/36 consecutive words trigger GOOD/GREAT/PERFECT/FANTASTIC with 1.2x/1.5x/2x/3x multipliers

### Power-Ups
- **FIRE**: Destroy all words (+50 pts each)
- **ICE**: Freeze words 5 seconds
- **WIND**: Reset LIMIT to 0%
- **SLOW**: 30% speed for 5 seconds

### Level Complete Screen
Shows accuracy, bonuses, total score with ✅/❌ for error-free status

## Configuration

All tunable parameters (words per level, combo thresholds, difficulty scaling, etc.) are in `src/config/gameConfig.json`.
