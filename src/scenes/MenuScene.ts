import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { storageService } from '../services/StorageService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { themeService } from '../services/ThemeService';

export class MenuScene extends Phaser.Scene {
  private tutorialOverlay?: Phaser.GameObjects.Container;
  private leaderboardOverlay?: Phaser.GameObjects.Container;
  private fadeOverlay?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.drawBackground();

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const titleContainer = this.add.graphics();
    titleContainer.fillStyle(themeService.getNumber('bg.sidebar'), 0.8);
    titleContainer.fillRoundedRect(centerX - 350, centerY - 180, 700, 140, 20);
    titleContainer.lineStyle(2, themeService.getNumber('ui.panelBorder'), 0.5);
    titleContainer.strokeRoundedRect(centerX - 350, centerY - 180, 700, 140, 20);

    const title = this.add.text(centerX, centerY - 120, 'TYPING MANIAC', {
      fontFamily: FONT_FAMILY,
      fontSize: '80px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setShadow(4, 4, '#0a2a4a', 8, true, true);

    const buttonW = 280;
    const buttonH = 80;
    const buttonX = centerX;
    const buttonY = centerY + 50;

    const playButtonBg = this.add.graphics();
    playButtonBg.fillStyle(themeService.getNumber('bg.sidebar'), 0.6);
    playButtonBg.fillRoundedRect(buttonX - buttonW / 2 + 4, buttonY - buttonH / 2 + 4, buttonW, buttonH, 16);

    const playButton = this.add.graphics();
    const drawPlayButton = (hover: boolean) => {
      playButton.clear();
      playButton.fillStyle(hover ? themeService.getNumber('ui.buttonHover') : themeService.getNumber('ui.buttonBg'), 1);
      playButton.fillRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, 16);
      playButton.lineStyle(2, themeService.getNumber('ui.buttonBorder'), hover ? 1 : 0.6);
      playButton.strokeRoundedRect(buttonX - buttonW / 2, buttonY - buttonH / 2, buttonW, buttonH, 16);
    };
    drawPlayButton(false);

    const playHitArea = this.add.rectangle(buttonX, buttonY, buttonW, buttonH, 0x000000, 0);
    playHitArea.setInteractive({ useHandCursor: true });

    const playText = this.add.text(buttonX, buttonY, '▶ PLAY', {
      fontFamily: FONT_FAMILY,
      fontSize: '40px',
      color: themeService.getText('game.wordText'),
      fontStyle: 'bold',
    });
    playText.setOrigin(0.5, 0.5);
    playText.setShadow(2, 2, '#000000', 4, true, true);

    playHitArea.on('pointerover', () => {
      drawPlayButton(true);
      playText.setScale(1.05);
    });
    playHitArea.on('pointerout', () => {
      drawPlayButton(false);
      playText.setScale(1);
    });
    playHitArea.on('pointerdown', () => {
      audioService.playButtonClick();
      this.tweens.add({
        targets: [playButton, playText, playHitArea],
        scaleX: 0.95,
        scaleY: 0.95,
        yoyo: true,
        duration: 100,
        onComplete: () => this.transitionTo('CountdownScene'),
      });
    });

    const smallButtonY = centerY + 150;
    const gap = 20;
    const smallButtonW = 160;
    const smallButtonH = 50;
    const offset = smallButtonW / 2 + gap / 2;

    this.createSmallButton(centerX - offset, smallButtonY, smallButtonW, smallButtonH, '📖 TUTORIAL', () => {
      audioService.playButtonClick();
      this.showTutorial();
    });

    this.createSmallButton(centerX + offset, smallButtonY, smallButtonW, smallButtonH, '⚙️ SETTINGS', () => {
      audioService.playButtonClick();
      this.scene.pause();
      this.scene.launch('SettingsScene');
    });

    const leaderboard = storageService.getLeaderboard();
    if (leaderboard.length > 0) {
      this.createSmallButton(centerX, smallButtonY + 65, smallButtonW, smallButtonH, '🏆 SCORES', () => {
        audioService.playButtonClick();
        this.showLeaderboard();
      });
    }

    this.input.keyboard!.on('keydown-ENTER', () => {
      audioService.playButtonClick();
      this.transitionTo('CountdownScene');
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      audioService.playButtonClick();
      this.transitionTo('CountdownScene');
    });

    this.input.keyboard!.on('keydown-T', () => {
      if (this.tutorialOverlay) {
        this.hideTutorial();
      } else {
        this.showTutorial();
      }
    });

    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.tutorialOverlay) {
        this.hideTutorial();
      }
      if (this.leaderboardOverlay) {
        this.hideLeaderboard();
      }
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

    this.createFadeOverlay();
  }

  createSmallButton(x: number, y: number, w: number, h: number, label: string, onClick: () => void) {
    const button = this.add.graphics();
    const drawButton = (hover: boolean) => {
      button.clear();
      button.fillStyle(hover ? themeService.getNumber('ui.buttonHover') : themeService.getNumber('ui.buttonBg'), 1);
      button.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      button.lineStyle(2, themeService.getNumber('ui.buttonBorder'), hover ? 0.8 : 0.5);
      button.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    };
    drawButton(false);

    const text = this.add.text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: themeService.getText('game.wordText'),
      fontStyle: 'bold',
    });
    text.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, w, h, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      drawButton(true);
      text.setScale(1.05);
    });
    hitArea.on('pointerout', () => {
      drawButton(false);
      text.setScale(1);
    });
    hitArea.on('pointerdown', onClick);
  }

  createFadeOverlay() {
    this.fadeOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, themeService.getNumber('effects.shadow'), 1);
    this.fadeOverlay.setDepth(1000);

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
    });
  }

  transitionTo(sceneKey: string) {
    if (!this.fadeOverlay) return;

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start(sceneKey);
      },
    });
  }

  showTutorial() {
    if (this.tutorialOverlay) return;

    this.tutorialOverlay = this.add.container(0, 0);
    this.tutorialOverlay.setDepth(500);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.tutorialOverlay.add(bg);

    const panelW = 700;
    const panelH = 600;
    const panelX = GAME_WIDTH / 2 - panelW / 2;
    const panelY = GAME_HEIGHT / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 20);
    for (let i = 0; i < 3; i++) {
      panel.lineStyle(2 - i * 0.5, themeService.getNumber('ui.panelBorder'), 0.4 - i * 0.1);
      panel.strokeRoundedRect(panelX + i, panelY + i, panelW - i * 2, panelH - i * 2, 20 - i);
    }
    this.tutorialOverlay.add(panel);

    const title = this.add.text(GAME_WIDTH / 2, panelY + 40, 'HOW TO PLAY', {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    this.tutorialOverlay.add(title);

    const instructions = [
      { icon: '⌨️', text: 'Type the falling words before they hit the bottom' },
      { icon: '🎯', text: 'Matched letters turn GREEN, active word turns BLUE' },
      { icon: '🔥', text: 'FIRE: Destroys all words on screen' },
      { icon: '❄️', text: 'ICE: Freezes all words for 5 seconds' },
      { icon: '💨', text: 'WIND: Resets the LIMIT bar to zero' },
      { icon: '⏱️', text: 'SLOW: Slows words to 30% speed for 5 seconds' },
      { icon: '📊', text: 'PROGRESS fills when you complete words' },
      { icon: '⚠️', text: 'LIMIT fills when you miss words - game over at 100%!' },
      { icon: '✨', text: 'Build combos for bonus points!' },
    ];

    let y = panelY + 100;
    for (const instruction of instructions) {
      const iconText = this.add.text(panelX + 40, y, instruction.icon, {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
      });
      iconText.setOrigin(0, 0.5);
      this.tutorialOverlay.add(iconText);

      const text = this.add.text(panelX + 90, y, instruction.text, {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: themeService.getText('game.wordText'),
      });
      text.setOrigin(0, 0.5);
      this.tutorialOverlay.add(text);

      y += 50;
    }

    const closeText = this.add.text(GAME_WIDTH / 2, panelY + panelH - 40, 'Press ESC or click to close', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: themeService.getText('text.secondary'),
    });
    closeText.setOrigin(0.5, 0.5);
    this.tutorialOverlay.add(closeText);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.hideTutorial());

    this.tutorialOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.tutorialOverlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  hideTutorial() {
    if (!this.tutorialOverlay) return;

    this.tweens.add({
      targets: this.tutorialOverlay,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.tutorialOverlay?.destroy();
        this.tutorialOverlay = undefined;
      },
    });
  }

  showLeaderboard() {
    if (this.leaderboardOverlay) return;

    this.leaderboardOverlay = this.add.container(0, 0);
    this.leaderboardOverlay.setDepth(500);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.leaderboardOverlay.add(bg);

    const panelW = 500;
    const panelH = 450;
    const panelX = GAME_WIDTH / 2 - panelW / 2;
    const panelY = GAME_HEIGHT / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 20);
    for (let i = 0; i < 3; i++) {
      panel.lineStyle(2 - i * 0.5, 0xffd700, 0.4 - i * 0.1);
      panel.strokeRoundedRect(panelX + i, panelY + i, panelW - i * 2, panelH - i * 2, 20 - i);
    }
    this.leaderboardOverlay.add(panel);

    const title = this.add.text(GAME_WIDTH / 2, panelY + 40, '🏆 HIGH SCORES 🏆', {
      fontFamily: FONT_FAMILY,
      fontSize: '38px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(title);

    const leaderboard = storageService.getLeaderboard();
    let y = panelY + 100;

    if (leaderboard.length === 0) {
      const noScores = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'No scores yet!', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: themeService.getText('text.secondary'),
      });
      noScores.setOrigin(0.5, 0.5);
      this.leaderboardOverlay.add(noScores);
    } else {
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      for (let i = 0; i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        const row = this.add.text(panelX + 40, y, `${medals[i]}  ${this.formatNumber(entry.score)}  Lvl ${entry.level}`, {
          fontFamily: FONT_FAMILY,
          fontSize: '28px',
          color: i === 0 ? '#ffd700' : themeService.getText('game.wordText'),
          fontStyle: i === 0 ? 'bold' : 'normal',
        });
        row.setOrigin(0, 0.5);
        this.leaderboardOverlay.add(row);

        const date = this.add.text(panelX + panelW - 40, y, entry.date, {
          fontFamily: FONT_FAMILY,
          fontSize: '20px',
          color: themeService.getText('text.secondary'),
        });
        date.setOrigin(1, 0.5);
        this.leaderboardOverlay.add(date);

        y += 55;
      }
    }

    const closeText = this.add.text(GAME_WIDTH / 2, panelY + panelH - 40, 'Press ESC or click to close', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: themeService.getText('text.secondary'),
    });
    closeText.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(closeText);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.hideLeaderboard());

    this.leaderboardOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.leaderboardOverlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  hideLeaderboard() {
    if (!this.leaderboardOverlay) return;

    this.tweens.add({
      targets: this.leaderboardOverlay,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.leaderboardOverlay?.destroy();
        this.leaderboardOverlay = undefined;
      },
    });
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
    this.createFloatingWords();
  }

  createFloatingWords() {
    for (let i = 0; i < 6; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = GAME_HEIGHT + 50;
      const word = this.add.text(x, y, this.getRandomWord(), {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: themeService.getText('text.primary'),
      });
      word.setAlpha(0.12);
      word.setOrigin(0.5, 0.5);

      this.tweens.add({
        targets: word,
        y: -50,
        duration: 10000 + Math.random() * 5000,
        delay: i * 2000,
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

  formatNumber(n: number): string {
    let s = n.toString();
    while (s.length < 4) s = '0' + s;
    return s;
  }
}
