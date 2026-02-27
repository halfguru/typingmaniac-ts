import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY, COLORS } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.drawBackground();

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const titleContainer = this.add.graphics();
    titleContainer.fillStyle(0x000000, 0.3);
    titleContainer.fillRoundedRect(centerX - 350, centerY - 180, 700, 140, 20);
    titleContainer.lineStyle(3, 0x4fc3f7, 0.5);
    titleContainer.strokeRoundedRect(centerX - 350, centerY - 180, 700, 140, 20);

    const title = this.add.text(centerX, centerY - 120, 'TYPING MANIAC', {
      fontFamily: FONT_FAMILY,
      fontSize: '80px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setShadow(4, 4, '#0a2a4a', 8, true, true);

    const buttonW = 280;
    const buttonH = 80;
    const buttonX = centerX;
    const buttonY = centerY + 80;

    const playButtonBg = this.add.graphics();
    playButtonBg.fillStyle(0x000000, 0.4);
    playButtonBg.fillRoundedRect(buttonX - buttonW / 2 + 4, buttonY - buttonH / 2 + 4, buttonW, buttonH, 16);

    const playButton = this.add.graphics();
    const drawPlayButton = (hover: boolean) => {
      playButton.clear();
      const color = hover ? 0xffa726 : COLORS.ACCENT_WARM;
      playButton.fillStyle(color, 1);
      playButton.fillRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, 16);
      playButton.lineStyle(3, 0xffffff, 0.3);
      playButton.strokeRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, 16);
      playButton.fillStyle(0xffffff, 0.15);
      playButton.fillRoundedRect(buttonX - buttonW / 2 + 6, buttonY - buttonH / 2 + 4, buttonW - 12, buttonH / 2 - 4, { tl: 12, tr: 12, bl: 0, br: 0 });
    };
    drawPlayButton(false);

    const hitArea = this.add.rectangle(buttonX, buttonY, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    const playText = this.add.text(buttonX, buttonY, '▶ PLAY', {
      fontFamily: FONT_FAMILY,
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    playText.setOrigin(0.5, 0.5);
    playText.setShadow(2, 2, '#000000', 4, true, true);

    hitArea.on('pointerover', () => {
      drawPlayButton(true);
      playText.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
      drawPlayButton(false);
      playText.setScale(1);
    });

    hitArea.on('pointerdown', () => {
      this.tweens.add({
        targets: [playButton, playText, hitArea],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => this.startCountdown(),
      });
    });

    this.tweens.add({
      targets: title,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.startCountdown();
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.startCountdown();
    });
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

    for (let i = 0; i < 30; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const size = 2 + Math.random() * 4;
      const alpha = 0.1 + Math.random() * 0.2;

      const star = this.add.circle(x, y, size, 0x4fc3f7, alpha);

      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: alpha * 0.3 },
        duration: 2000 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    for (let i = 0; i < 5; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = GAME_HEIGHT + 50;
      const word = this.add.text(x, y, this.getRandomWord(), {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#4fc3f7',
      });
      word.setAlpha(0.15);
      word.setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: word,
        y: -50,
        duration: 8000 + Math.random() * 4000,
        delay: i * 1500,
        repeat: -1,
        onRepeat: () => {
          word.setX(Math.random() * GAME_WIDTH);
          word.setText(this.getRandomWord());
        },
      });
    }
  }

  getRandomWord(): string {
    const words = ['TYPE', 'FAST', 'WORDS', 'MANIAC', 'SPEED', 'QUICK', 'LETTERS', 'KEYS', 'RUSH', 'SCORE'];
    return words[Math.floor(Math.random() * words.length)];
  }

  startCountdown() {
    this.scene.start('CountdownScene');
  }
}
