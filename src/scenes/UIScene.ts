import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SIDEBAR_WIDTH,
  GAME_AREA_WIDTH,
  MAX_POWER_STACK,
  FONT_FAMILY,
  FONT_SMALL,
  POWER_SYMBOLS,
} from '../config/constants';
import type { PowerType } from '../types';

interface GameData {
  score: number;
  level: number;
  limitPct: number;
  progressPct: number;
  powerStack: PowerType[];
  wordsCompleted: number;
  wordsMissed: number;
  input: string;
  gameState: string;
}

const POWER_COLORS: Record<PowerType, number> = {
  none: 0x2a3a3a,
  fire: 0xff6b35,
  ice: 0x64b5f6,
  wind: 0xba68c8,
  slow: 0xffb74d,
};

const POWER_NAMES: Record<PowerType, string> = {
  none: '',
  fire: 'FIRE',
  ice: 'ICE',
  wind: 'WIND',
  slow: 'SLOW',
};

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private limitPctText!: Phaser.GameObjects.Text;
  private progressPctText!: Phaser.GameObjects.Text;
  private powerBoxGraphics: Phaser.GameObjects.Graphics[] = [];
  private powerLabels: Phaser.GameObjects.Text[] = [];
 private powerContainers: Phaser.GameObjects.Container[] = [];
  private powerTweens: Phaser.Tweens.Tween[] = [];
  private previousPowerStack: PowerType[] = [];
  private displayedLevel = 1;
  private gameOverOverlay?: Phaser.GameObjects.Container;
  private levelCompleteOverlay?: Phaser.GameObjects.Container;
  private levelCompleteTween?: Phaser.Tweens.Tween;
  private levelCompleteTimer?: Phaser.Time.TimerEvent;
  private levelCompleteTimers: Phaser.Time.TimerEvent[] = [];
  private levelCompleteTweens: Phaser.Tweens.Tween[] = [];

  private progressBarH = 195;
  private progressBarW = 40;
  private powerBoxW = 200;
  private powerBoxH = 30;

  private displayedScore = 0;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.drawSidebar();
    this.createPowerBoxes();
    this.createProgressBars();

    const gameScene = this.scene.get('GameScene') as any;
    gameScene.events.on('gameDataUpdate', (data: GameData) => {
      this.updateUI(data);
    });
    gameScene.events.on('gameReset', () => {
      this.resetUI();
    });
  }

  resetUI() {
    this.hideOverlays();
    this.displayedScore = 0;
    this.displayedLevel = 1;
    this.scoreText.setText('0');
    this.levelText.setText('1');
    this.currentLimitHeight = 0;
    this.currentProgressHeight = 0;
    this.drawLimitBar(0);
    this.drawProgressBar(0);
    this.limitPctText.setText('0%');
    this.progressPctText.setText('0%');
    this.previousPowerStack = [];
    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const graphics = this.powerBoxGraphics[i];
      const label = this.powerLabels[i];
      graphics.clear();
      graphics.fillStyle(0x0f1f1f, 1);
      const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
      const sidebarX = sidebarCenterX - this.powerBoxW / 2;
      const startY = 378;
      const gap = 8;
      const y = startY + i * (this.powerBoxH + gap);
      graphics.fillRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      graphics.lineStyle(1, 0x2a4a4a, 0.5);
      graphics.strokeRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      label.setText('');
    }
  }

  drawSidebar() {
    const centerX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
    const boxWidth = SIDEBAR_WIDTH - 50;
    const boxX = centerX - boxWidth / 2;

    const sidebarBg = this.add.graphics();
    sidebarBg.fillStyle(0x0d2525, 1);
    sidebarBg.fillRoundedRect(GAME_AREA_WIDTH + 10, 20, SIDEBAR_WIDTH - 20, GAME_HEIGHT - 40, 20);
    sidebarBg.lineStyle(3, 0x2a5a5a, 1);
    sidebarBg.strokeRoundedRect(GAME_AREA_WIDTH + 10, 20, SIDEBAR_WIDTH - 20, GAME_HEIGHT - 40, 20);

    const levelBox = this.add.graphics();
    levelBox.fillStyle(0x1a3a3a, 1);
    levelBox.fillRoundedRect(boxX, 50, boxWidth, 100, 12);
    levelBox.lineStyle(2, 0x2a5a5a, 0.5);
    levelBox.strokeRoundedRect(boxX, 50, boxWidth, 100, 12);

    const levelLabel = this.add.text(centerX, 75, 'LEVEL', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#7ab8b8',
    });
    levelLabel.setOrigin(0.5, 0.5);

    this.levelText = this.add.text(centerX, 120, '1', {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    this.levelText.setOrigin(0.5, 0.5);

    const scoreBox = this.add.graphics();
    scoreBox.fillStyle(0x1a3a3a, 1);
    scoreBox.fillRoundedRect(boxX, 180, boxWidth, 130, 12);
    scoreBox.lineStyle(2, 0x2a5a5a, 0.5);
    scoreBox.strokeRoundedRect(boxX, 180, boxWidth, 130, 12);

    const scoreLabel = this.add.text(centerX, 205, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#7ab8b8',
    });
    scoreLabel.setOrigin(0.5, 0.5);

    this.scoreText = this.add.text(centerX, 260, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: '#ff8c42',
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(0.5, 0.5);

    const specialLabel = this.add.text(centerX, 340, 'SPECIAL', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#7ab8b8',
    });
    specialLabel.setOrigin(0.5, 0.5);
  }

  createPowerBoxes() {
    const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
    const sidebarX = sidebarCenterX - this.powerBoxW / 2;
    const startY = 378;
    const gap = 8;
    const boxW = this.powerBoxW;
    const boxH = this.powerBoxH;

    const containerBg = this.add.graphics();
    containerBg.fillStyle(0x0a1515, 0.9);
    containerBg.fillRoundedRect(sidebarX - 8, startY - 8, boxW + 16, (boxH + gap) * MAX_POWER_STACK + 8, 12);
    containerBg.lineStyle(2, 0x1a3a3a, 0.8);
    containerBg.strokeRoundedRect(sidebarX - 8, startY - 8, boxW + 16, (boxH + gap) * MAX_POWER_STACK + 8, 12);

    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const y = startY + i * (this.powerBoxH + gap);

      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x0f1f1f, 1);
      slotBg.fillRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      slotBg.lineStyle(1, 0x2a4a4a, 0.5);
      slotBg.strokeRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);

      this.powerBoxGraphics.push(slotBg);

      const container = this.add.container(sidebarX + this.powerBoxW / 2, y + this.powerBoxH / 2);
      this.powerContainers.push(container);

      const label = this.add.text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      label.setOrigin(0.5, 0.5);
      container.add(label);
      this.powerLabels.push(label);
    }
  }

  private limitBarGraphics!: Phaser.GameObjects.Graphics;
  private progressBarGraphics!: Phaser.GameObjects.Graphics;
  private currentLimitHeight = 0;
  private currentProgressHeight = 0;

  private limitBarX = 0;
  private progressBarX = 0;

  createProgressBars() {
    const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
    this.limitBarX = sidebarCenterX - 55;
    this.progressBarX = sidebarCenterX + 55;
    const limitBarX = this.limitBarX;
    const progressBarX = this.progressBarX;
    const barY = 705;
    const barBottom = barY + this.progressBarH;
    const barW = this.progressBarW;
    const barH = this.progressBarH;
    const radius = 8;

    const drawBarContainer = (x: number) => {
      const container = this.add.graphics();
      container.fillStyle(0x0a0a0a, 0.9);
      container.fillRoundedRect(x - barW / 2 - 4, barY - 4, barW + 8, barH + 8, radius + 4);
      container.fillStyle(0x1a1a1a, 1);
      container.fillRoundedRect(x - barW / 2, barY, barW, barH, radius);
      container.lineStyle(2, 0x3a3a3a, 1);
      container.strokeRoundedRect(x - barW / 2, barY, barW, barH, radius);
      for (let i = 1; i < 4; i++) {
        const tickY = barY + (barH / 4) * i;
        container.lineStyle(1, 0x3a3a3a, 0.8);
        container.lineBetween(x - barW / 2 + 4, tickY, x + barW / 2 - 4, tickY);
      }
      const shine = this.add.graphics();
      shine.fillStyle(0xffffff, 0.08);
      shine.fillRoundedRect(x - barW / 2 + 3, barY + 3, barW - 6, barH / 3, radius - 2);
    };

    drawBarContainer(limitBarX);
    drawBarContainer(progressBarX);

    this.limitBarGraphics = this.add.graphics();
    this.progressBarGraphics = this.add.graphics();

    const limitLabel = this.add.text(limitBarX, 665, 'LIMIT', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#ff6b6b',
      fontStyle: 'bold',
    });
    limitLabel.setOrigin(0.5, 0);

    this.limitPctText = this.add.text(limitBarX, barBottom + 38, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#ff6b6b',
      fontStyle: 'bold',
    });
    this.limitPctText.setOrigin(0.5, 0);

    const progressLabel = this.add.text(progressBarX, 665, 'PROG', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SMALL}px`,
      color: '#4ecdc4',
      fontStyle: 'bold',
    });
    progressLabel.setOrigin(0.5, 0);

    this.progressPctText = this.add.text(progressBarX, barBottom + 38, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#4ecdc4',
      fontStyle: 'bold',
    });
    this.progressPctText.setOrigin(0.5, 0);

    this.drawLimitBar(0);
    this.drawProgressBar(0);
  }

  private drawLimitBar(height: number) {
    const barY = 705;
    const barW = this.progressBarW;
    const barH = this.progressBarH;
    const radius = 6;

    this.limitBarGraphics.clear();
    if (height < 2) return;

    const x = this.limitBarX - barW / 2;
    const bottomY = barY + barH;
    const fillY = bottomY - height;
    const cappedHeight = Math.min(height, barH - 4);

    this.limitBarGraphics.fillStyle(0xff4444, 1);
    this.limitBarGraphics.fillRoundedRect(x + 2, fillY, barW - 4, cappedHeight, { tl: radius, tr: radius, bl: 0, br: 0 });
    if (cappedHeight > radius) {
      this.limitBarGraphics.fillRect(x + 2, fillY + radius, barW - 4, cappedHeight - radius);
    }

    this.limitBarGraphics.fillStyle(0xffffff, 0.2);
    this.limitBarGraphics.fillRect(x + 4, fillY + 3, 6, Math.min(cappedHeight - 6, 30));
  }

  private drawProgressBar(height: number) {
    const barY = 705;
    const barW = this.progressBarW;
    const barH = this.progressBarH;
    const radius = 6;

    this.progressBarGraphics.clear();
    if (height < 2) return;

    const x = this.progressBarX - barW / 2;
    const bottomY = barY + barH;
    const fillY = bottomY - height;
    const cappedHeight = Math.min(height, barH - 4);

    this.progressBarGraphics.fillStyle(0x2ecc71, 1);
    this.progressBarGraphics.fillRoundedRect(x + 2, fillY, barW - 4, cappedHeight, { tl: radius, tr: radius, bl: 0, br: 0 });
    if (cappedHeight > radius) {
      this.progressBarGraphics.fillRect(x + 2, fillY + radius, barW - 4, cappedHeight - radius);
    }

    this.progressBarGraphics.fillStyle(0xffffff, 0.2);
    this.progressBarGraphics.fillRect(x + 4, fillY + 3, 6, Math.min(cappedHeight - 6, 30));
  }

  updateUI(data: GameData) {
    if (data.level !== this.displayedLevel) {
      this.displayedLevel = data.level;
      this.levelText.setText(data.level.toString());
      this.tweens.add({
        targets: this.levelText,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 150,
        ease: 'Power2',
        yoyo: true,
      });
    }

    if (data.score !== this.displayedScore) {
      const fromScore = this.displayedScore;
      const toScore = data.score;

      this.tweens.addCounter({
        from: fromScore,
        to: toScore,
        duration: 300,
        ease: 'Power2',
        onUpdate: (tween) => {
          const value = Math.floor(tween.getValue() ?? toScore);
          this.scoreText.setText(value.toString());
        },
      });

      this.displayedScore = toScore;
    }

    const targetLimitHeight = (data.limitPct / 100) * this.progressBarH;
    const targetProgressHeight = (data.progressPct / 100) * this.progressBarH;

    const isResetting = data.progressPct === 0 && this.currentProgressHeight > 10;

    if (isResetting) {
      this.currentLimitHeight = 0;
      this.currentProgressHeight = 0;
      this.drawLimitBar(0);
      this.drawProgressBar(0);
      this.limitPctText.setText('0%');
      this.progressPctText.setText('0%');
    } else {
      if (Math.abs(this.currentLimitHeight - targetLimitHeight) > 1) {
        this.tweens.addCounter({
          from: this.currentLimitHeight,
          to: targetLimitHeight,
          duration: 200,
          ease: 'Power2',
          onUpdate: (tween) => {
            const height = tween.getValue() ?? targetLimitHeight;
            this.drawLimitBar(height);
            const pct = Math.round((height / this.progressBarH) * 100);
            this.limitPctText.setText(`${pct}%`);
          },
          onComplete: () => {
            this.currentLimitHeight = targetLimitHeight;
          },
        });
      }

      if (Math.abs(this.currentProgressHeight - targetProgressHeight) > 1) {
        this.tweens.addCounter({
          from: this.currentProgressHeight,
          to: targetProgressHeight,
          duration: 200,
          ease: 'Power2',
          onUpdate: (tween) => {
            const height = tween.getValue() ?? targetProgressHeight;
            this.drawProgressBar(height);
            const pct = Math.round((height / this.progressBarH) * 100);
            this.progressPctText.setText(`${pct}%`);
          },
          onComplete: () => {
            this.currentProgressHeight = targetProgressHeight;
          },
        });
      }
    }

    const usedPowerIndex = this.findUsedPowerIndex(this.previousPowerStack, data.powerStack);
    if (usedPowerIndex !== -1 && usedPowerIndex < this.powerContainers.length) {
      const container = this.powerContainers[usedPowerIndex];
      const tween = this.tweens.add({
        targets: container,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (!this.levelCompleteOverlay) {
            container.setScale(1, 1);
            container.setAlpha(1);
            this.updatePowerBoxes(data);
          }
        },
      });
      this.powerTweens.push(tween);
    } else {
      this.updatePowerBoxes(data);
    }
    this.previousPowerStack = [...data.powerStack];

    if (data.gameState === 'gameOver') {
      this.showGameOver();
    } else if (data.gameState === 'levelComplete') {
      this.showLevelComplete();
    } else {
      this.hideOverlays();
    }
  }

  findUsedPowerIndex(previous: PowerType[], current: PowerType[]): number {
    if (previous.length === current.length) return -1;
    for (let i = 0; i < previous.length; i++) {
      if (i >= current.length || previous[i] !== current[i]) {
        return i;
      }
    }
    return -1;
  }

  updatePowerBoxes(data: GameData) {
    for (const tween of this.powerTweens) {
      tween.stop();
    }
    this.powerTweens = [];

    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const graphics = this.powerBoxGraphics[i];
      const label = this.powerLabels[i];
      const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
      const sidebarX = sidebarCenterX - this.powerBoxW / 2;
      const startY = 378;
      const gap = 8;
      const y = startY + i * (this.powerBoxH + gap);
      const boxW = this.powerBoxW;
      const boxH = this.powerBoxH;

      graphics.clear();

      if (i < data.powerStack.length) {
        const power = data.powerStack[i];
        const color = POWER_COLORS[power];

        graphics.fillStyle(0x0a0a0a, 0.5);
        graphics.fillRoundedRect(sidebarX + 2, y + 2, boxW, boxH, 6);

        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(sidebarX, y, boxW, boxH, 6);

        graphics.lineStyle(2, 0xffffff, 0.25);
        graphics.strokeRoundedRect(sidebarX, y, boxW, boxH, 6);

        graphics.fillStyle(0xffffff, 0.15);
        graphics.fillRoundedRect(sidebarX + 4, y + 2, boxW - 8, boxH / 2 - 2, 4);

        label.setText(`${POWER_SYMBOLS[power]} ${POWER_NAMES[power]}`);
        label.setColor('#ffffff');
        label.setShadow(1, 1, '#000000', 3, true, true);
      } else {
        graphics.fillStyle(0x0f1f1f, 1);
        graphics.fillRoundedRect(sidebarX, y, boxW, boxH, 6);
        graphics.lineStyle(1, 0x2a4a4a, 0.4);
        graphics.strokeRoundedRect(sidebarX, y, boxW, boxH, 6);
        label.setText('');
        label.setShadow(0, 0, '#000000', 0, false, false);
      }
    }
  }

  showGameOver() {
    if (this.gameOverOverlay) return;

    this.gameOverOverlay = this.add.container(0, 0);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.gameOverOverlay.add(bg);

    const vignette = this.add.graphics();
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    for (let i = 0; i < 8; i++) {
      const radius = 800 - i * 80;
      const alpha = 0.03 + i * 0.02;
      vignette.fillStyle(0x8b0000, alpha);
      vignette.fillCircle(cx, cy, radius);
    }
    this.gameOverOverlay.add(vignette);

    const panelW = 520;
    const panelH = 400;
    const panelX = GAME_WIDTH / 2 - panelW / 2;
    const panelY = GAME_HEIGHT / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0a1515, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 24);
    panel.lineStyle(4, 0x8b0000, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 24);
    panel.lineStyle(2, 0x3a1a1a, 1);
    panel.strokeRoundedRect(panelX + 8, panelY + 8, panelW - 16, panelH - 16, 20);
    this.gameOverOverlay.add(panel);

    const skull = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, '💀', {
      fontSize: '80px',
    });
    skull.setOrigin(0.5, 0.5);
    skull.setAlpha(0);
    skull.setScale(0);
    this.gameOverOverlay.add(skull);

    const gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: '72px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5, 0.5);
    gameOverText.setAlpha(0);
    gameOverText.setScale(0.5);
    this.gameOverOverlay.add(gameOverText);

    const scoreLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'FINAL SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#7ab8b8',
    });
    scoreLabel.setOrigin(0.5, 0.5);
    scoreLabel.setAlpha(0);
    this.gameOverOverlay.add(scoreLabel);

    const gameScene = this.scene.get('GameScene') as any;
    const finalScore = gameScene.score;
    const scoreValue = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 75, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '56px',
      color: '#ff8c42',
      fontStyle: 'bold',
    });
    scoreValue.setOrigin(0.5, 0.5);
    scoreValue.setAlpha(0);
    this.gameOverOverlay.add(scoreValue);

    const restartText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, 'Press SPACE to restart', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#4fc3f7',
    });
    restartText.setOrigin(0.5, 0.5);
    restartText.setAlpha(0);
    this.gameOverOverlay.add(restartText);

    this.gameOverOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.gameOverOverlay,
      alpha: 1,
      duration: 400,
      onComplete: () => {
        this.tweens.add({
          targets: skull,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 300,
          ease: 'Back.easeOut',
        });

        this.time.delayedCall(200, () => {
          this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
              this.tweens.add({
                targets: gameOverText,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
              });
            },
          });
        });

        this.time.delayedCall(500, () => {
          this.tweens.add({
            targets: scoreLabel,
            alpha: 1,
            duration: 200,
          });
          this.tweens.add({
            targets: scoreValue,
            alpha: 1,
            duration: 200,
            onComplete: () => {
              this.tweens.addCounter({
                from: 0,
                to: finalScore,
                duration: 1000,
                ease: 'Power2',
                onUpdate: (tween) => {
                  const v = Math.floor(tween.getValue() ?? finalScore);
                  scoreValue.setText(this.formatNumber(v));
                },
              });
            },
          });
        });

        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: restartText,
            alpha: 1,
            duration: 200,
            onComplete: () => {
              this.tweens.add({
                targets: restartText,
                alpha: { from: 1, to: 0.4 },
                duration: 500,
                yoyo: true,
                repeat: -1,
              });
            },
          });
        });
      },
    });
  }

  showLevelComplete() {
    if (this.levelCompleteOverlay) {
      this.levelCompleteOverlay.destroy();
      this.levelCompleteOverlay = undefined;
    }

    for (const timer of this.levelCompleteTimers) {
      timer.destroy();
    }
    this.levelCompleteTimers = [];

    this.levelCompleteOverlay = this.add.container(0, 0);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    this.levelCompleteOverlay.add(bg);

    const scrollX = GAME_WIDTH / 2;
    const scrollY = GAME_HEIGHT / 2;
    const scrollW = 500;
    const scrollH = 580;

    const scrollOuter = this.add.graphics();
    scrollOuter.fillStyle(0x8b5a2b, 1);
    scrollOuter.fillRoundedRect(scrollX - scrollW / 2, scrollY - scrollH / 2, scrollW, scrollH, 20);
    scrollOuter.lineStyle(6, 0x5a3a1a, 1);
    scrollOuter.strokeRoundedRect(scrollX - scrollW / 2, scrollY - scrollH / 2, scrollW, scrollH, 20);
    this.levelCompleteOverlay.add(scrollOuter);

    const scrollInner = this.add.graphics();
    scrollInner.fillStyle(0xd2b48c, 1);
    scrollInner.fillRoundedRect(scrollX - scrollW / 2 + 15, scrollY - scrollH / 2 + 15, scrollW - 30, scrollH - 30, 15);
    this.levelCompleteOverlay.add(scrollInner);

    const gameScene = this.scene.get('GameScene') as any;
    const currentScore = gameScene.score;
    const accuracy = gameScene.calculateAccuracy();
    const accBonus = gameScene.calculateAccuracyBonus();
    const errorFree = gameScene.isErrorFree();
    const errBonus = gameScene.calculateErrorFreeBonus();
    const bonusTotal = gameScene.calculateLevelTotal();
    const finalScore = currentScore + bonusTotal;

    const titleText = this.add.text(scrollX, scrollY - 240, 'LEVEL COMPLETE!', {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: '#4a2a0a',
      fontStyle: 'bold',
    });
    titleText.setOrigin(0.5, 0.5);
    this.levelCompleteOverlay.add(titleText);

    const divider = this.add.graphics();
    divider.lineStyle(2, 0x8b5a2b, 0.5);
    divider.lineBetween(scrollX - 180, scrollY - 190, scrollX + 180, scrollY - 190);
    this.levelCompleteOverlay.add(divider);

    const stats: { label: string; value: number; suffix: string; y: number }[] = [
      { label: 'Accuracy', value: accuracy, suffix: '%', y: -130 },
      { label: 'Bonus', value: accBonus, suffix: '', y: -70 },
      { label: errorFree ? 'Error Free' : 'Errors', value: -1, suffix: errorFree ? ':)' : ':(', y: 0 },
      { label: 'Bonus', value: errBonus, suffix: '', y: 60 },
    ];

    const valueTexts: Phaser.GameObjects.Text[] = [];

    for (const stat of stats) {
      const label = this.add.text(scrollX - 80, scrollY + stat.y, stat.label, {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#5a3a1a',
      });
      label.setOrigin(0, 0.5);
      label.setAlpha(0);
      this.levelCompleteOverlay.add(label);

      const isSpecial = stat.value < 0;
      const value = this.add.text(scrollX + 120, scrollY + stat.y, isSpecial ? stat.suffix : '0' + stat.suffix, {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        color: '#4a2a0a',
        fontStyle: 'bold',
      });
      value.setOrigin(1, 0.5);
      value.setAlpha(0);
      this.levelCompleteOverlay.add(value);

      valueTexts.push(value);

      const delay = 600 + stats.indexOf(stat) * 400;
      const timer = this.time.delayedCall(delay, () => {
        const fadeTween = this.tweens.add({
          targets: [label, value],
          alpha: 1,
          duration: 200,
        });
        this.levelCompleteTweens.push(fadeTween);
        if (!isSpecial && stat.value > 0) {
          const counterTween = this.tweens.addCounter({
            from: 0,
            to: stat.value,
            duration: 500,
            ease: 'Power2',
            onUpdate: (tween) => {
              const v = Math.floor(tween.getValue() ?? stat.value);
              value.setText(stat.suffix === '%' ? `${v}%` : this.formatNumber(v));
            },
          });
          this.levelCompleteTweens.push(counterTween);
        }
      });
      this.levelCompleteTimers.push(timer);
    }

    const divider2 = this.add.graphics();
    divider2.lineStyle(2, 0x8b5a2b, 0.5);
    divider2.lineBetween(scrollX - 180, scrollY + 120, scrollX + 180, scrollY + 120);
    this.levelCompleteOverlay.add(divider2);

    const totalLabel = this.add.text(scrollX - 180, scrollY + 170, 'TOTAL SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '32px',
      color: '#5a3a1a',
      fontStyle: 'bold',
    });
    totalLabel.setOrigin(0, 0.5);
    this.levelCompleteOverlay.add(totalLabel);

    const totalValue = this.add.text(scrollX + 180, scrollY + 170, this.formatNumber(currentScore), {
      fontFamily: FONT_FAMILY,
      fontSize: '38px',
      color: '#ff6b35',
      fontStyle: 'bold',
    });
    totalValue.setOrigin(1, 0.5);
    this.levelCompleteOverlay.add(totalValue);

    this.levelCompleteTimer = this.time.delayedCall(2400, () => {
      this.levelCompleteTween = this.tweens.addCounter({
        from: currentScore,
        to: finalScore,
        duration: 1000,
        ease: 'Power2',
        onUpdate: (tween) => {
          totalValue.setText(this.formatNumber(Math.floor(tween.getValue() ?? finalScore)));
        },
      });
      this.levelCompleteTweens.push(this.levelCompleteTween);
    });

    const continueText = this.add.text(scrollX, scrollY + 250, 'Press ENTER', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#8b5a2b',
    });
    continueText.setOrigin(0.5, 0.5);
    this.levelCompleteOverlay.add(continueText);

    const blinkTween = this.tweens.add({
      targets: continueText,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.levelCompleteTweens.push(blinkTween);

    this.levelCompleteOverlay.setAlpha(0);
    const fadeTween = this.tweens.add({
      targets: this.levelCompleteOverlay,
      alpha: 1,
      duration: 400,
    });
    this.levelCompleteTweens.push(fadeTween);
  }

  formatNumber(n: number): string {
    let s = n.toString();
    while (s.length < 4) s = '0' + s;
    return s;
  }

  hideOverlays() {
    if (this.gameOverOverlay) {
      this.tweens.killTweensOf(this.gameOverOverlay);
      this.gameOverOverlay.destroy();
      this.gameOverOverlay = undefined;
    }
    if (this.levelCompleteOverlay) {
      for (const timer of this.levelCompleteTimers) {
        timer.destroy();
      }
      this.levelCompleteTimers = [];
      if (this.levelCompleteTimer) {
        this.levelCompleteTimer.destroy();
        this.levelCompleteTimer = undefined;
      }
      for (const tween of this.levelCompleteTweens) {
        tween.stop();
      }
      this.levelCompleteTweens = [];
      this.levelCompleteTween = undefined;
      this.levelCompleteOverlay.destroy();
      this.levelCompleteOverlay = undefined;
    }
  }
}
