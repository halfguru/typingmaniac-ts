import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { AuthScene } from './scenes/AuthScene';
import { MenuScene } from './scenes/MenuScene';
import { CountdownScene } from './scenes/CountdownScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { SettingsScene } from './scenes/SettingsScene';
import { initObservability } from './services/ObservabilityService';
import { initAnalytics } from './services/AnalyticsService';

initObservability();
initAnalytics();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x000000,
  roundPixels: true,
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [AuthScene, MenuScene, CountdownScene, GameScene, UIScene, SettingsScene],
};

// @ts-expect-error - resolution is valid but not in types
config.resolution = window.devicePixelRatio || 1;

new Phaser.Game(config);
