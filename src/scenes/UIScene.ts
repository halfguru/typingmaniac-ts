import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SIDEBAR_WIDTH,
  GAME_AREA_WIDTH,
  MAX_POWER_STACK,
  FONT_FAMILY,
  POWER_SYMBOLS,
  POWER_COLORS,
  POWER_NAMES,
} from '../config/constants';
import type { PowerType, GameData } from '../types';
import { storageService } from '../services/StorageService';
import { themeService } from '../services/ThemeService';
import { audioService } from '../services/AudioService';
import type { GameScene } from './GameScene';
import { ProgressBar } from '../ui/ProgressBar';

export class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private limitBar!: ProgressBar;
  private progressBar!: ProgressBar;
  private powerBoxGraphics: Phaser.GameObjects.Graphics[] = [];
  private powerLabels: Phaser.GameObjects.Text[] = [];
  private powerContainers: Phaser.GameObjects.Container[] = [];
  private powerGlowGraphics: Phaser.GameObjects.Graphics[] = [];
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
    this.createMuteButton();

    const gameScene = this.scene.get('GameScene') as GameScene;
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
    this.limitBar.reset();
    this.progressBar.reset();
    this.previousPowerStack = [];
    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const graphics = this.powerBoxGraphics[i];
      const label = this.powerLabels[i];
      graphics.clear();
      graphics.fillStyle(themeService.getNumber('bg.slot'), 1);
      const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
      const sidebarX = sidebarCenterX - this.powerBoxW / 2;
      const startY = 378;
      const gap = 8;
      const y = startY + i * (this.powerBoxH + gap);
      graphics.fillRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      graphics.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.2);
      graphics.strokeRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      label.setText('');
    }
  }

  drawSidebar() {
    const sidebarFullBg = this.add.graphics();
    sidebarFullBg.fillStyle(themeService.getNumber('bg.dark'), 1);
    sidebarFullBg.fillRect(GAME_AREA_WIDTH, 0, SIDEBAR_WIDTH, GAME_HEIGHT);

    const centerX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
    const boxWidth = SIDEBAR_WIDTH - 50;
    const boxX = centerX - boxWidth / 2;

    const sidebarBg = this.add.graphics();
    sidebarBg.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    sidebarBg.fillRoundedRect(GAME_AREA_WIDTH + 10, 20, SIDEBAR_WIDTH - 20, GAME_HEIGHT - 40, 20);
    
    for (let i = 0; i < 3; i++) {
      sidebarBg.lineStyle(2 - i * 0.5, themeService.getNumber('ui.panelBorder'), 0.3 - i * 0.1);
      sidebarBg.strokeRoundedRect(GAME_AREA_WIDTH + 10 + i, 20 + i, SIDEBAR_WIDTH - 20 - i * 2, GAME_HEIGHT - 40 - i * 2, 20 - i);
    }

    const sidebarGlow = this.add.graphics();
    sidebarGlow.fillStyle(themeService.getNumber('ui.panelBorder'), 0.03);
    sidebarGlow.fillRoundedRect(GAME_AREA_WIDTH + 15, 25, SIDEBAR_WIDTH - 30, GAME_HEIGHT - 50, 18);
    this.tweens.add({
      targets: sidebarGlow,
      alpha: { from: 1, to: 0.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const levelBox = this.add.graphics();
    levelBox.fillStyle(themeService.getNumber('bg.slot'), 1);
    levelBox.fillRoundedRect(boxX, 50, boxWidth, 100, 12);
    levelBox.lineStyle(2, themeService.getNumber('ui.panelBorder'), 0.6);
    levelBox.strokeRoundedRect(boxX, 50, boxWidth, 100, 12);
    levelBox.fillStyle(themeService.getNumber('ui.panelBorder'), 0.08);
    levelBox.fillRoundedRect(boxX + 4, 54, boxWidth - 8, 45, 8);

    const levelLabel = this.add.text(centerX, 75, 'LEVEL', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: themeService.getText('text.secondary'),
    });
    levelLabel.setOrigin(0.5, 0.5);

    this.levelText = this.add.text(centerX, 120, '1', {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.levelText.setShadow(0, 0, themeService.getText('text.glow'), 8, true, true);

    const scoreBox = this.add.graphics();
    scoreBox.fillStyle(themeService.getNumber('bg.slot'), 1);
    scoreBox.fillRoundedRect(boxX, 180, boxWidth, 130, 12);
    scoreBox.lineStyle(2, themeService.getNumber('accent.warning'), 0.6);
    scoreBox.strokeRoundedRect(boxX, 180, boxWidth, 130, 12);
    scoreBox.fillStyle(themeService.getNumber('accent.warning'), 0.08);
    scoreBox.fillRoundedRect(boxX + 4, 184, boxWidth - 8, 55, 8);

    const scoreLabel = this.add.text(centerX, 205, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: '#cc8866',
    });
    scoreLabel.setOrigin(0.5, 0.5);

    this.scoreText = this.add.text(centerX, 260, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: themeService.getText('text.warning'),
      fontStyle: 'bold',
    });
    this.scoreText.setOrigin(0.5, 0.5);
    this.scoreText.setShadow(0, 0, '#ff6b35', 10, true, true);

    const specialLabel = this.add.text(centerX, 340, 'SPECIAL', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      color: themeService.getText('text.secondary'),
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
    containerBg.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    containerBg.fillRoundedRect(sidebarX - 8, startY - 8, boxW + 16, (boxH + gap) * MAX_POWER_STACK + 8, 12);
    containerBg.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.3);
    containerBg.strokeRoundedRect(sidebarX - 8, startY - 8, boxW + 16, (boxH + gap) * MAX_POWER_STACK + 8, 12);

    for (let i = 0; i < MAX_POWER_STACK; i++) {
      const y = startY + i * (this.powerBoxH + gap);

      const glowGraphic = this.add.graphics();
      glowGraphic.setAlpha(0);
      this.powerGlowGraphics.push(glowGraphic);

      const slotBg = this.add.graphics();
      slotBg.fillStyle(themeService.getNumber('bg.slot'), 1);
      slotBg.fillRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);
      slotBg.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.2);
      slotBg.strokeRoundedRect(sidebarX, y, this.powerBoxW, this.powerBoxH, 6);

      this.powerBoxGraphics.push(slotBg);

      const container = this.add.container(sidebarX + this.powerBoxW / 2, y + this.powerBoxH / 2);
      this.powerContainers.push(container);

      const label = this.add.text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: themeService.getText('game.wordText'),
        fontStyle: 'bold',
      });
      label.setOrigin(0.5, 0.5);
      container.add(label);
      this.powerLabels.push(label);
    }
  }

  private barY = 705;

  createProgressBars() {
    const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
    const limitBarX = sidebarCenterX - 55;
    const progressBarX = sidebarCenterX + 55;
    const barW = this.progressBarW;
    const barH = this.progressBarH;
    const barY = this.barY;

    this.limitBar = new ProgressBar(this, {
      x: limitBarX,
      y: barY + barH / 2,
      width: barW,
      height: barH,
      fillColor: themeService.getNumber('accent.danger'),
      glowColor: themeService.getNumber('game.dangerGlow'),
      bgColor: themeService.getNumber('bg.slot'),
      label: 'LIMIT',
      showValue: true,
      orientation: 'vertical',
      style: 'elaborate',
      animated: true,
    });
    this.add.existing(this.limitBar);

    this.progressBar = new ProgressBar(this, {
      x: progressBarX,
      y: barY + barH / 2,
      width: barW,
      height: barH,
      fillColor: themeService.getNumber('accent.success'),
      glowColor: themeService.getNumber('effects.glow'),
      bgColor: themeService.getNumber('bg.slot'),
      label: 'PROG',
      showValue: true,
      orientation: 'vertical',
      style: 'elaborate',
      animated: true,
    });
    this.add.existing(this.progressBar);
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

    this.limitBar.setValue(data.limitPct, true);
    this.progressBar.setValue(data.progressPct, true);

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
      const glowGraphic = this.powerGlowGraphics[i];
      const label = this.powerLabels[i];
      const sidebarCenterX = GAME_AREA_WIDTH + SIDEBAR_WIDTH / 2;
      const sidebarX = sidebarCenterX - this.powerBoxW / 2;
      const startY = 378;
      const gap = 8;
      const y = startY + i * (this.powerBoxH + gap);
      const boxW = this.powerBoxW;
      const boxH = this.powerBoxH;

      graphics.clear();
      glowGraphic.clear();

      if (i < data.powerStack.length) {
        const power = data.powerStack[i];
        const color = POWER_COLORS[power];

        graphics.fillStyle(themeService.getNumber('bg.sidebar'), 0.8);
        graphics.fillRoundedRect(sidebarX + 2, y + 2, boxW, boxH, 6);

        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(sidebarX, y, boxW, boxH, 6);

        graphics.lineStyle(2, color, 0.8);
        graphics.strokeRoundedRect(sidebarX, y, boxW, boxH, 6);

        graphics.fillStyle(themeService.getNumber('effects.glow'), 0.2);
        graphics.fillRoundedRect(sidebarX + 4, y + 2, boxW - 8, boxH / 2 - 2, 4);

        for (let j = 0; j < 3; j++) {
          glowGraphic.lineStyle(4 - j, color, 0.3 - j * 0.1);
          glowGraphic.strokeRoundedRect(sidebarX - 3 - j * 2, y - 3 - j * 2, boxW + 6 + j * 4, boxH + 6 + j * 4, 8 + j);
        }
        glowGraphic.setAlpha(0.6);

        const glowTween = this.tweens.add({
          targets: glowGraphic,
          alpha: { from: 0.6, to: 0.2 },
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.powerTweens.push(glowTween);

        label.setText(`${POWER_SYMBOLS[power]} ${POWER_NAMES[power]}`);
        label.setColor(themeService.getText('game.wordText'));
        const shadowColor = '#' + color.toString(16).padStart(6, '0');
        label.setShadow(0, 0, shadowColor, 6, true, true);
      } else {
        graphics.fillStyle(themeService.getNumber('bg.slot'), 1);
        graphics.fillRoundedRect(sidebarX, y, boxW, boxH, 6);
        graphics.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.2);
        graphics.strokeRoundedRect(sidebarX, y, boxW, boxH, 6);
        glowGraphic.setAlpha(0);
        label.setText('');
        label.setShadow(0, 0, '#000000', 0, false, false);
      }
    }
  }

  showGameOver() {
    if (this.gameOverOverlay) return;

    const gameScene = this.scene.get('GameScene') as GameScene;
    const finalScore = gameScene.score;
    const finalLevel = gameScene.level;
    const isNewHighScore = storageService.setHighScore(finalScore);
    const highScore = storageService.getHighScore();
    const leaderboardPosition = storageService.addToLeaderboard(finalScore, finalLevel);

    this.gameOverOverlay = this.add.container(0, 0);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    this.gameOverOverlay.add(bg);
    
    this.tweens.add({
      targets: bg,
      alpha: 0.85,
      duration: 300,
      ease: 'Quad.easeOut',
    });

    const scrollX = GAME_WIDTH / 2;
    const scrollY = GAME_HEIGHT / 2;
    const scrollW = 480;
    const scrollH = 500;

    const scrollContainer = this.add.container(scrollX, scrollY);
    
    const scrollBg = this.add.graphics();
    scrollBg.fillStyle(0x2a1f14, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 - 5, -scrollH / 2 - 5, scrollW + 10, scrollH + 10, 18);
    
    scrollBg.fillStyle(0x1a1208, 1);
    scrollBg.fillRoundedRect(-scrollW / 2, -scrollH / 2, scrollW, scrollH, 15);
    
    scrollBg.fillStyle(0x3d2a18, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 + 8, -scrollH / 2 + 8, scrollW - 16, scrollH - 16, 12);
    
    scrollBg.fillStyle(0x4a3520, 0.4);
    scrollBg.fillRect(-scrollW / 2 + 15, -scrollH / 2 + 15, scrollW - 30, 50);
    scrollBg.fillRect(-scrollW / 2 + 15, scrollH / 2 - 65, scrollW - 30, 50);
    
    scrollBg.fillStyle(0x8b6914, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 - 28, -scrollH / 2 - 18, scrollW + 56, 38, 14);
    scrollBg.fillRoundedRect(-scrollW / 2 - 28, scrollH / 2 - 20, scrollW + 56, 38, 14);
    
    scrollBg.lineStyle(1, 0xb8860b, 0.4);
    scrollBg.strokeRoundedRect(-scrollW / 2 + 20, -scrollH / 2 + 30, scrollW - 40, scrollH - 60, 10);
    
    scrollBg.lineStyle(1, 0xb8860b, 0.2);
    for (let i = 1; i < 4; i++) {
      const y = -scrollH / 2 + 30 + (scrollH - 60) / 4 * i;
      scrollBg.lineBetween(-scrollW / 2 + 30, y, scrollW / 2 - 30, y);
    }
    
    scrollContainer.add(scrollBg);
    
    const cornerDecor = this.add.graphics();
    cornerDecor.fillStyle(0x8b0000, 0.6);
    cornerDecor.fillCircle(-scrollW / 2 + 35, -scrollH / 2 + 45, 6);
    cornerDecor.fillCircle(scrollW / 2 - 35, -scrollH / 2 + 45, 6);
    cornerDecor.fillCircle(-scrollW / 2 + 35, scrollH / 2 - 45, 6);
    cornerDecor.fillCircle(scrollW / 2 - 35, scrollH / 2 - 45, 6);
    scrollContainer.add(cornerDecor);

    const skull = this.add.text(0, -180, '💀', {
      fontSize: '50px',
    });
    skull.setOrigin(0.5, 0.5);
    skull.setAlpha(0);
    skull.setScale(0);
    scrollContainer.add(skull);

    const gameOverText = this.add.text(0, -115, 'GAME OVER', {
      fontFamily: FONT_FAMILY,
      fontSize: '38px',
      color: '#cc4422',
      fontStyle: 'bold',
    });
    gameOverText.setOrigin(0.5, 0.5);
    gameOverText.setAlpha(0);
    gameOverText.setScale(0.5);
    scrollContainer.add(gameOverText);

    const divider1 = this.add.graphics();
    divider1.lineStyle(1, 0x8b4513, 0.5);
    divider1.lineBetween(-160, -70, 160, -70);
    scrollContainer.add(divider1);

    const divider2 = this.add.graphics();
    divider2.lineStyle(1, 0x8b4513, 0.5);
    divider2.lineBetween(-160, 60, 160, 60);
    scrollContainer.add(divider2);

    const divider3 = this.add.graphics();
    divider3.lineStyle(2, 0x8b4513, 0.5);
    divider3.lineBetween(-160, 120, 160, 120);
    scrollContainer.add(divider3);

    const scoreLabel = this.add.text(-60, -40, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      color: '#a08060',
    });
    scoreLabel.setOrigin(0.5, 0.5);
    scoreLabel.setAlpha(0);
    scrollContainer.add(scoreLabel);

    const scoreValue = this.add.text(60, -40, this.formatNumber(finalScore), {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    scoreValue.setOrigin(0.5, 0.5);
    scoreValue.setAlpha(0);
    scrollContainer.add(scoreValue);

    const levelLabel = this.add.text(-60, 15, 'LEVEL', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      color: '#a08060',
    });
    levelLabel.setOrigin(0.5, 0.5);
    levelLabel.setAlpha(0);
    scrollContainer.add(levelLabel);

    const levelValue = this.add.text(60, 15, `${finalLevel}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#c9a060',
      fontStyle: 'bold',
    });
    levelValue.setOrigin(0.5, 0.5);
    levelValue.setAlpha(0);
    scrollContainer.add(levelValue);

    const highScoreLabel = this.add.text(0, 80, 'HIGH SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      color: '#a08060',
    });
    highScoreLabel.setOrigin(0.5, 0.5);
    highScoreLabel.setAlpha(0);
    scrollContainer.add(highScoreLabel);

    const highScoreValue = this.add.text(0, 115, this.formatNumber(highScore), {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: isNewHighScore ? '#ffd700' : '#c9a060',
      fontStyle: 'bold',
    });
    highScoreValue.setOrigin(0.5, 0.5);
    highScoreValue.setAlpha(0);
    scrollContainer.add(highScoreValue);

    let newRecordText: Phaser.GameObjects.Text | null = null;
    if (isNewHighScore) {
      newRecordText = this.add.text(0, 155, '★ NEW RECORD ★', {
        fontFamily: FONT_FAMILY,
        fontSize: '20px',
        color: '#ffd700',
        fontStyle: 'bold',
      });
      newRecordText.setOrigin(0.5, 0.5);
      newRecordText.setAlpha(0);
      scrollContainer.add(newRecordText);
    } else if (leaderboardPosition >= 0 && leaderboardPosition < 5) {
      newRecordText = this.add.text(0, 155, `★ #${leaderboardPosition + 1} LEADERBOARD ★`, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: '#c9a060',
        fontStyle: 'bold',
      });
      newRecordText.setOrigin(0.5, 0.5);
      newRecordText.setAlpha(0);
      scrollContainer.add(newRecordText);
    }

    const restartText = this.add.text(0, 200, 'Press SPACE to restart', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#a08060',
    });
    restartText.setOrigin(0.5, 0.5);
    restartText.setAlpha(0);
    scrollContainer.add(restartText);

    this.gameOverOverlay.add(scrollContainer);

    scrollContainer.setScale(0.8, 0.8);
    scrollContainer.setAlpha(0);
    
    this.tweens.add({
      targets: scrollContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: 150,
      ease: 'Back.easeOut',
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
            targets: [scoreLabel, scoreValue, levelLabel, levelValue],
            alpha: 1,
            duration: 200,
          });
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
        });

        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: [highScoreLabel, highScoreValue],
            alpha: 1,
            duration: 200,
            onComplete: () => {
              if (isNewHighScore && newRecordText) {
                this.time.delayedCall(300, () => {
                  this.tweens.add({
                    targets: newRecordText,
                    alpha: 1,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 200,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                      this.tweens.add({
                        targets: newRecordText,
                        alpha: 1,
                        scaleX: 1,
                        scaleY: 1,
                      });
                    },
                  });
                });
              }
            },
          });
        });

        this.time.delayedCall(1800, () => {
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

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    this.levelCompleteOverlay.add(bg);
    
    this.tweens.add({
      targets: bg,
      alpha: 0.75,
      duration: 300,
      ease: 'Quad.easeOut',
    });

    const scrollX = GAME_WIDTH / 2;
    const scrollY = GAME_HEIGHT / 2;
    const scrollW = 500;
    const scrollH = 580;

    const scrollContainer = this.add.container(scrollX, scrollY);
    
    const scrollBg = this.add.graphics();
    scrollBg.fillStyle(0x2a1f14, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 - 5, -scrollH / 2 - 5, scrollW + 10, scrollH + 10, 18);
    
    scrollBg.fillStyle(0x1a1208, 1);
    scrollBg.fillRoundedRect(-scrollW / 2, -scrollH / 2, scrollW, scrollH, 15);
    
    scrollBg.fillStyle(0x3d2a18, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 + 8, -scrollH / 2 + 8, scrollW - 16, scrollH - 16, 12);
    
    scrollBg.fillStyle(0x4a3520, 0.4);
    scrollBg.fillRect(-scrollW / 2 + 15, -scrollH / 2 + 15, scrollW - 30, 50);
    scrollBg.fillRect(-scrollW / 2 + 15, scrollH / 2 - 65, scrollW - 30, 50);
    
    scrollBg.fillStyle(0x8b6914, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 - 28, -scrollH / 2 - 18, scrollW + 56, 38, 14);
    scrollBg.fillRoundedRect(-scrollW / 2 - 28, scrollH / 2 - 20, scrollW + 56, 38, 14);
    
    scrollBg.fillStyle(0x6b4a10, 1);
    scrollBg.fillRoundedRect(-scrollW / 2 - 22, -scrollH / 2 - 12, scrollW + 44, 26, 10);
    scrollBg.fillRoundedRect(-scrollW / 2 - 22, scrollH / 2 - 14, scrollW + 44, 26, 10);
    
    scrollBg.fillStyle(0xffd700, 0.3);
    scrollBg.fillCircle(-scrollW / 2 - 5, -scrollH / 2 + 1, 14);
    scrollBg.fillCircle(scrollW / 2 + 5, -scrollH / 2 + 1, 14);
    scrollBg.fillCircle(-scrollW / 2 - 5, scrollH / 2 - 1, 14);
    scrollBg.fillCircle(scrollW / 2 + 5, scrollH / 2 - 1, 14);
    
    scrollBg.fillStyle(0xb8860b, 1);
    scrollBg.fillCircle(-scrollW / 2 - 5, -scrollH / 2 + 1, 8);
    scrollBg.fillCircle(scrollW / 2 + 5, -scrollH / 2 + 1, 8);
    scrollBg.fillCircle(-scrollW / 2 - 5, scrollH / 2 - 1, 8);
    scrollBg.fillCircle(scrollW / 2 + 5, scrollH / 2 - 1, 8);
    
    scrollBg.lineStyle(1, 0xb8860b, 0.4);
    scrollBg.strokeRoundedRect(-scrollW / 2 + 20, -scrollH / 2 + 30, scrollW - 40, scrollH - 60, 10);
    
    scrollBg.lineStyle(1, 0xb8860b, 0.2);
    for (let i = 1; i < 4; i++) {
      const y = -scrollH / 2 + 30 + (scrollH - 60) / 4 * i;
      scrollBg.lineBetween(-scrollW / 2 + 30, y, scrollW / 2 - 30, y);
    }
    
    scrollContainer.add(scrollBg);
    
    const cornerDecor = this.add.graphics();
    cornerDecor.fillStyle(0xffd700, 0.5);
    cornerDecor.fillCircle(-scrollW / 2 + 35, -scrollH / 2 + 45, 6);
    cornerDecor.fillCircle(scrollW / 2 - 35, -scrollH / 2 + 45, 6);
    cornerDecor.fillCircle(-scrollW / 2 + 35, scrollH / 2 - 45, 6);
    cornerDecor.fillCircle(scrollW / 2 - 35, scrollH / 2 - 45, 6);
    scrollContainer.add(cornerDecor);

    const gameScene = this.scene.get('GameScene') as GameScene;
    const currentScore = gameScene.score;
    const accuracy = gameScene.calculateAccuracy();
    const accBonus = gameScene.calculateAccuracyBonus();
    const errorFree = gameScene.isErrorFree();
    const bonusTotal = gameScene.calculateLevelTotal();
    const finalScore = currentScore + bonusTotal;

    const titleText = this.add.text(0, -200, 'LEVEL COMPLETE!', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    titleText.setOrigin(0.5, 0.5);
    titleText.setShadow(2, 2, '#8b4513', 2, true, true);
    scrollContainer.add(titleText);

    const divider = this.add.graphics();
    divider.lineStyle(2, 0x8b4513, 0.5);
    divider.lineBetween(-180, -155, 180, -155);
    scrollContainer.add(divider);

    const stats: { label: string; value: number; suffix: string; y: number }[] = [
      { label: 'Accuracy', value: accuracy, suffix: '%', y: -80 },
      { label: errorFree ? 'Error Free' : 'Errors', value: -1, suffix: errorFree ? '✅' : '❌', y: -20 },
      { label: 'Bonus', value: accBonus, suffix: '', y: 40 },
    ];

    const valueTexts: Phaser.GameObjects.Text[] = [];

    for (const stat of stats) {
      const label = this.add.text(-120, stat.y, stat.label, {
        fontFamily: FONT_FAMILY,
        fontSize: '30px',
        color: '#a08060',
      });
      label.setOrigin(0, 0.5);
      label.setAlpha(0);
      scrollContainer.add(label);

      const isSpecial = stat.value < 0;
      const value = this.add.text(140, stat.y, isSpecial ? stat.suffix : '0' + stat.suffix, {
        fontFamily: FONT_FAMILY,
        fontSize: '30px',
        color: '#ffd700',
        fontStyle: 'bold',
      });
      value.setOrigin(1, 0.5);
      value.setAlpha(0);
      scrollContainer.add(value);

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
    divider2.lineStyle(2, 0x8b4513, 0.5);
    divider2.lineBetween(-180, 120, 180, 120);
    scrollContainer.add(divider2);

    const totalLabel = this.add.text(0, 160, 'TOTAL SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '26px',
      color: '#a08060',
      fontStyle: 'bold',
    });
    totalLabel.setOrigin(0.5, 0.5);
    scrollContainer.add(totalLabel);

    const totalValue = this.add.text(0, 195, this.formatNumber(currentScore), {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    totalValue.setOrigin(0.5, 0.5);
    totalValue.setShadow(1, 1, '#8b4513', 3, true, true);
    scrollContainer.add(totalValue);

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

    const continueText = this.add.text(0, 240, 'Press ENTER to continue', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      color: '#ffd700',
    });
    continueText.setOrigin(0.5, 0.5);
    continueText.setShadow(0, 0, '#8b4513', 4, true, true);
    scrollContainer.add(continueText);

    const blinkTween = this.tweens.add({
      targets: continueText,
      alpha: { from: 1, to: 0.4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
    this.levelCompleteTweens.push(blinkTween);

    scrollContainer.setScale(0.8, 0.8);
    scrollContainer.setAlpha(0);
    
    this.tweens.add({
      targets: scrollContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: 150,
      ease: 'Back.easeOut',
    });

    this.levelCompleteOverlay.add(scrollContainer);

    const divider3 = this.add.graphics();
    divider3.lineStyle(1, 0x8b4513, 0.5);
    divider3.lineBetween(-160, -70, 160, -70);
    scrollContainer.add(divider3);
  }

  createMuteButton() {
    const settings = audioService.getSettings();
    
    const muteIcon = this.add.text(30, 30, settings.muted ? '🔇' : '🔊', {
      fontSize: '28px',
    });
    muteIcon.setOrigin(0.5, 0.5);
    muteIcon.setInteractive({ useHandCursor: true });
    
    muteIcon.on('pointerdown', () => {
      const muted = audioService.toggleMute();
      muteIcon.setText(muted ? '🔇' : '🔊');
    });
    
    muteIcon.on('pointerover', () => {
      muteIcon.setAlpha(0.7);
    });
    
    muteIcon.on('pointerout', () => {
      muteIcon.setAlpha(1);
    });
  }

  formatNumber(n: number): string {
    let s = n.toString();
    while (s.length < 4) s = '0' + s;
    return s;
  }

  hideOverlays() {
    if (this.gameOverOverlay) {
      this.tweens.add({
        targets: this.gameOverOverlay,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeIn',
        onComplete: () => {
          if (this.gameOverOverlay) {
            this.tweens.killTweensOf(this.gameOverOverlay);
            this.gameOverOverlay.destroy();
            this.gameOverOverlay = undefined;
          }
        },
      });
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
      
      this.tweens.add({
        targets: this.levelCompleteOverlay,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeIn',
        onComplete: () => {
          if (this.levelCompleteOverlay) {
            this.levelCompleteOverlay.destroy();
            this.levelCompleteOverlay = undefined;
          }
        },
      });
    }
  }
}
