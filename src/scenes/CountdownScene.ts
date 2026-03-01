import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { themeService } from '../services/ThemeService';

export class CountdownScene extends Phaser.Scene {
  private fadeOverlay?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'CountdownScene' });
  }

  create() {
    this.drawBackground();
    this.createFadeOverlay();

    const sequence = [
      { text: '3', duration: 800 },
      { text: '2', duration: 800 },
      { text: '1', duration: 800 },
      { text: 'Start typing!', duration: 1000 },
    ];

    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= sequence.length) {
        this.transitionToGame();
        return;
      }

      const item = sequence[currentIndex];
      const textObj = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, item.text, {
        fontFamily: FONT_FAMILY,
        fontSize: item.text === 'Start typing!' ? '56px' : '120px',
        color: themeService.getText('text.primary'),
        fontStyle: 'bold',
      });
      textObj.setOrigin(0.5, 0.5);
      textObj.setAlpha(0);
      textObj.setScale(0.5);

      this.tweens.add({
        targets: textObj,
        alpha: 1,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.time.delayedCall(item.duration - 300, () => {
            this.tweens.add({
              targets: textObj,
              alpha: 0,
              scale: 0.8,
              duration: 300,
              ease: 'Power2',
              onComplete: () => {
                textObj.destroy();
                currentIndex++;
                showNext();
              },
            });
          });
        },
      });
    };

    showNext();
  }

  createFadeOverlay() {
    this.fadeOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, themeService.getNumber('bg.dark'), 1);
    this.fadeOverlay.setDepth(1000);

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  transitionToGame() {
    if (!this.fadeOverlay) return;

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        audioService.startMusic();
        this.scene.start('GameScene');
      },
    });
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
  }
}