# Game Design Reference

Based on `design-example.png` - Original Typing Maniac UI design.

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                     ┌───────────────────────────┤
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
| Background | Dark teal gradient (#0d2b2b to #1a4a4a) | Main background |
| Panel | Dark teal (#0d2525) | Sidebar background |
| Accent (active) | Bright blue (#4fc3f7) | Active words, highlights |
| Text | White (#ffffff) | Primary UI text |
| Progress (green) | Teal/green (#2ecc71) | Progress bar fill |
| Limit (red) | Red (#ff4444) | Limit bar fill |
| Power Fire | Red/orange (#ff6b35) | Fire power containers |
| Power Ice | Light blue (#64b5f6) | Ice power containers |
| Power Wind | Purple (#ba68c8) | Wind power containers |
| Power Slow | Orange (#ffb74d) | Slow power containers |
| Frozen words | Light blue (#a8e6ff) | Frozen word letters |
| Matched letters | Green (#4CAF50) | Correctly typed letters |

## Game Scenes

### 1. Menu Scene
- Animated title "TYPING MANIAC" with shadow
- Play button with hover/click effects
- Floating background words
- Twinkling star particles

### 2. Countdown Scene
- 3-2-1 countdown with scale animation
- "GO!" message before game starts

### 3. Game Scene
- Falling words with letter-by-letter typing
- Power-up words with colored containers
- Danger zone indicator at bottom
- Input display at bottom

### 4. UI Scene (overlay)
- Sidebar with level, score, powers, progress bars
- Runs parallel to Game Scene

## UI Components

### Right Panel (Sidebar)
- **LEVEL**: Current level number (large, blue, centered in box)
- **SCORE**: Points accumulated (large, orange, centered in box)
- **SPECIAL**: Power-up stack (max 6, styled boxes with emoji and name)
  - Animated disappearance when used (scale up + fade)
- **LIMIT**: Red vertical bar with percentage (fills from bottom)
- **PROG**: Green vertical bar with percentage (fills from bottom)

### Progress Bars
- Dark container with rounded corners
- Tick marks at 25% intervals
- Fill animates from bottom with rounded top corners
- Shine highlight effect
- Percentage text below each bar

### Main Area
- **Falling words**: Individual letter Text objects
- **Power-up words**: Words with styled container (rounded rect, shadow, shine)
- **Danger zone**: Red line at y=930 (150px from bottom)
- **Frozen indicator**: ❄️ emoji above frozen words

### Bottom Area
- **Typing input**: Current input text (blue, centered in dark box)

## Game Mechanics

### Two-Column Progress System

| Column | Color | Increases When | At 100% |
|--------|-------|----------------|---------|
| PROGRESS | Green | Word completed (+12%) | Level complete |
| LIMIT | Red | Word missed (+10%) | Game over |

### Power-Up System

**Acquiring Powers:**
- Random words have styled containers (~5-25% based on level)
- Container colors match power type
- Completing a colored word adds that power to SPECIAL stack (max 6)

**Activating Powers:**
- Type the power name directly: "FIRE", "ICE", "WIND", "SLOW"
- Consumes one power from stack
- Animated disappearance effect

**Power Effects:**

| Power | Effect | Visual |
|-------|--------|--------|
| FIRE | Destroys all words on screen, +50 points each | All words vanish |
| ICE | Freezes all words for 5 seconds | ❄️ emoji appears, words turn light blue |
| WIND | Resets LIMIT (red column) to 0% | Bar instantly empties |
| SLOW | Slows falling speed to 30% for 5 seconds | Words move slower |

### Difficulty Scaling

| Setting | Formula |
|---------|---------|
| Word length (L1) | 4 letters |
| Word length increase | +1 every 3 levels |
| Word length cap | 10 letters |
| Fall speed base | 1.5 |
| Fall speed increase | +0.15 per level |
| Power drop rate (L1) | 5% |
| Power drop rate increase | +2% per level |
| Power drop rate cap | 25% |

### Combo System

| Combo | Text | Color | Multiplier |
|-------|------|-------|------------|
| 1+ | GOOD | Green | 1.2x |
| 3+ | GREAT | Blue | 1.5x |
| 5+ | PERFECT | Orange | 2x |
| 8+ | FANTASTIC | Pink | 3x |

- Combo resets on missed word
- Popup shows combo level on word completion

### Level Complete Screen

When PROGRESS reaches 100%, show scroll overlay:

```
┌─────────────────────────────────┐
│       LEVEL COMPLETE!           │
│─────────────────────────────────│
│ Accuracy        [animates] 100% │
│ Bonus           [animates] 2240 │
│ Error Free      [animates]  :)  │
│ Bonus           [animates] 0224 │
│─────────────────────────────────│
│ TOTAL SCORE     [animates] 4480 │
│                                 │
│       Press ENTER               │
└─────────────────────────────────┘
```

**Animation Sequence:**
1. Overlay fades in
2. Stats appear one by one (400ms delay each)
3. Each stat value counts up from 0
4. Total score counts up last
5. "Press ENTER" pulses

**Calculations:**
- **Accuracy**: (words completed / total words) × 100%
- **Accuracy bonus**: accuracy% × level × 10
- **Error-free**: `:)` if 0 missed words, `:(` otherwise
- **Error-free bonus**: level × 20 (only if error-free)
- **Total**: score + accuracy bonus + error-free bonus

### Game Over Screen

When LIMIT reaches 100%:
- Dark overlay with red-bordered panel
- "GAME OVER" text
- "Press SPACE to restart"

## Word Display

### Normal Words
- Individual letter Text objects positioned horizontally
- White text by default
- Cyan (#4fc3f7) when being typed (active target)
- Green (#4CAF50) for matched letters
- Light blue (#a8e6ff) when frozen (not active target)

### Power-Up Words
- Styled container behind letters:
  - Drop shadow (black, 40% opacity)
  - Colored rounded rectangle
  - White border (30% opacity)
  - Shine highlight at top
- Container redraws each frame as word moves

## Typography

- **Font**: Fredoka (Google Font), rounded sans-serif fallback
- **Title**: 80px bold with shadow
- **Game text**: 42px for main elements
- **Small text**: 24-33px for labels
- **Interactive words**: Letter-by-letter coloring

## Design Notes

1. **Screen layout**: 1920×1080 with 270px sidebar on right
2. **Game area**: 1650×1080 for falling words
3. **Word positioning**: Words spawn in game area only
4. **Progress bars**: Vertical orientation, fill from bottom, right side
5. **Color scheme**: Dark teal dominant with blue/green/red accents
6. **Animations**: Smooth tweens for UI changes, particles for atmosphere
