# Implementation Plan: Game Features

## Overview
Add high score display, tutorial, scene transitions, audio, settings, global leaderboard, and visual polish.

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

### 6. Global Leaderboard with Auth
- [x] Create AuthService with Supabase (Google/Facebook/Anonymous)
- [x] Create AuthScene with OAuth buttons and guest option
- [x] Store scores in Supabase leaderboard table
- [x] Show user avatars in leaderboard
- [x] Move credentials to environment variables

### 7. Visual Polish
- [x] Improved tutorial with sections (BASICS, POWER-UPS, OBJECTIVES)
- [x] Improved settings scene with consistent sliders
- [x] Improved mute button with circular background
- [x] Improved menu layout (single column of buttons below PLAY)
- [x] Improved countdown scene with ring animation, particles, and burst effect
- [x] Add blur effect to game over and level complete screens

### 8. Observability (Sentry)
- [x] Create `ObservabilityService` for error tracking
- [x] Add Sentry integration with environment variable
- [x] Track auth events (sign in, sign out, errors)
- [x] Track leaderboard errors
- [x] Make Sentry optional (no credentials = console only)

### 9. Analytics (PostHog)
- [x] Create `AnalyticsService` for event tracking
- [x] Add PostHog integration with environment variables
- [x] Track game events (starts, overs, levels, power-ups)
- [x] Track UI events (tutorial, settings, leaderboard)
- [x] Track auth events (sign in method, sign out)
- [x] Make PostHog optional (no credentials = console only)

### 10. Optional Dependencies
- [x] Supabase is now optional (skip AuthScene if not configured)
- [x] Local leaderboard fallback when Supabase not configured
- [x] All services work independently

### 11. Versioning & Deployment
- [x] Add CHANGELOG.md following Keep a Changelog format
- [x] Display version badge in menu
- [x] Update deploy.yml to use GitHub Secrets
- [x] Update README with deployment instructions

## Review

All features implemented and TypeScript compiles successfully.

### Files Created:
- `src/services/AudioService.ts` - Sound management with Web Audio API
- `src/services/AuthService.ts` - Supabase auth and leaderboard
- `src/services/ObservabilityService.ts` - Sentry error tracking
- `src/services/AnalyticsService.ts` - PostHog analytics
- `src/scenes/SettingsScene.ts` - Volume control UI
- `src/scenes/AuthScene.ts` - Login UI with OAuth buttons
- `CHANGELOG.md` - Version history
- `.env.example` - Placeholder credentials (Supabase, Sentry, PostHog)

### Files Modified:
- `src/main.ts` - Init observability and analytics
- `src/scenes/MenuScene.ts` - Version badge, local leaderboard, analytics tracking
- `src/scenes/CountdownScene.ts` - Ring animation with particles
- `src/scenes/GameScene.ts` - Analytics tracking, ESC to menu
- `src/scenes/UIScene.ts` - ESC option on game over
- `src/services/AuthService.ts` - Analytics integration
- `src/vite-env.d.ts` - TypeScript types for Vite env variables
- `.github/workflows/deploy.yml` - GitHub Secrets for env vars
- `README.md` - Configuration docs

### How to Test:
1. Run `npm run dev`
2. Click PLAY to see scene transitions
3. Press T for tutorial
4. Click SETTINGS for volume controls
5. Click SCORES for leaderboard (after playing)
6. Complete a game to see game over with blur effect and leaderboard rank
7. Level complete also shows blur effect
