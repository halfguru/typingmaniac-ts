# Lessons Learned

# Sessions
- 2025-02-26: Timer/Tween Cleanup
- 2025-02-26: State Transitions
- 2025-02-26: Phaser Graphics positioning
- 2025-02-26: UI animation priority

## Timer/Tween Cleanup
- Always track timers and tweens in instance variables for cleanup
- When destroying overlays with animations, destroy all timers first
- Use arrays to track multiple timers (e.g., `levelCompleteTimers: Phaser.Time.TimerEvent[]`)
- Store timer references when creating delayed animations (not just `this.levelCompleteTimer`)
- Clean up all stored timers on `hideOverlays()`:
- Example:
```typescript
this.levelCompleteTimers = [];
this.time.delayedCall(500, () => { ... });
```

## State Transitions
- Reset all relevant state when transitioning between game states (level complete -> playing)
- Include: `spawnTimer`, `activePower`, `powerTimer`, `slowFactor`, `combo`, frozen indicators
- Always check current state before transitioning to prevent double-triggering
- example
```typescript
continueAfterLevelComplete() {
  if (this.gameState !== 'levelComplete') return;
  // ... reset all state
}
```

## Phaser Graphics Positioning
- `Graphics.fillRoundedRect` draws at absolute coordinates, not relative to Graphics position
- When moving Graphics objects, either redraw at new position OR track position with centered drawing
- For animated containers (like power word backgrounds), redraw each frame
- Alternative: use Container with child elements,- When using `setPosition`, remember that `fillRoundedRect` draws at the provided coordinates, so the original drawing remains visible

## UI Animation Priority
- When highlighting target words, check frozen state FIRST: then target state, then matched letters
- Priority: matched letters > target word > frozen > default
- Stat animations should have proper cleanup before starting new ones
- Kill tweens and destroy timers before recreating overlays
- Reset internal state variables when instant-reset is needed
