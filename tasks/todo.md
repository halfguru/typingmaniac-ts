# Implementation Plan: Game Features

## Overview
Add high score display, tutorial, scene transitions, audio, and settings with volume control.

## Tasks

### 1. Audio System
- [x] Create `AudioService` for managing all game sounds
- [x] Add sound effects: keypress, word complete, power activation, game over, level complete
- [x] Add background music (ambient tones)
- [x] Store volume settings in localStorage

### 2. Settings Scene
- [x] Create `SettingsScene` with volume sliders (master, sfx, music)
- [x] Add settings button to MenuScene
- [x] Mute/unmute toggle option

### 3. Scene Transitions
- [x] Create transition effects (fade) between scenes
- [x] Add smooth transitions for Menu → Countdown → Game
- [x] Add transitions for Game Over and Level Complete returns

### 4. Tutorial System
- [x] Fix broken tutorial code in MenuScene (syntax errors)
- [x] Create tutorial overlay with interactive guide
- [x] Explain: typing words, power-ups, progress/limit bars
- [x] Show tutorial on T key press

### 5. High Score Display Enhancement
- [x] Add high score to game over screen (already had it)
- [x] Add high score leaderboard (top 5 scores)
- [x] Show "NEW HIGH SCORE" celebration animation
- [x] Show leaderboard rank on game over

## Review

All features implemented and TypeScript compiles successfully.

### Files Created:
- `src/services/AudioService.ts` - Sound management with Web Audio API
- `src/scenes/SettingsScene.ts` - Volume control UI

### Files Modified:
- `src/main.ts` - Added SettingsScene
- `src/scenes/MenuScene.ts` - Fixed tutorial, added settings/leaderboard buttons, transitions
- `src/scenes/CountdownScene.ts` - Added audio and transitions
- `src/scenes/GameScene.ts` - Added audio hooks and transitions
- `src/scenes/UIScene.ts` - Enhanced game over with leaderboard position
- `src/services/StorageService.ts` - Added leaderboard storage

### How to Test:
1. Run `npm run dev`
2. Click PLAY to see scene transitions
3. Press T for tutorial
4. Click SETTINGS for volume controls
5. Click SCORES for leaderboard (after playing)
6. Complete a game to see game over with leaderboard rank
