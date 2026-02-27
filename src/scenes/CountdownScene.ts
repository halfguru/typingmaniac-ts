import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';

export class CountdownScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CountdownScene' });
  }

  create() {
    this.drawBackground();

    const sequence = [
      { text: '3', duration: 800 },
      { text: '2', duration: 800 },
      { text: '1', duration: 800 },
      { text: 'Start typing!', duration: 1000 },
    ];

    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex >= sequence.length) {
        this.scene.start('GameScene');
        return;
      }

      const item = sequence[currentIndex];
      const textObj = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, item.text, {
        fontFamily: FONT_FAMILY,
        fontSize: item.text === 'Start typing!' ? '56px' : '120px',
        color: '#4fc3f7',
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

  drawBackground() {
    const graphics = this.add.graphics();
    
    const colorTop = Phaser.Display.Color.IntegerToColor(0x0d2b2b);
    const colorBottom = Phaser.Display.Color.IntegerToColor(0x1a4a4a);
    
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const ratio = y / GAME_HEIGHT;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(colorTop, colorBottom, 100, ratio * 100);
      const colorInt = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      graphics.fillStyle(colorInt, 1);
      graphics.fillRect(0, y, GAME_WIDTH, 1);
    }
  }
}
