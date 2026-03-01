import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { authService, GlobalLeaderboardEntry } from '../services/AuthService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { themeService } from '../services/ThemeService';
import { storageService, LeaderboardEntry } from '../services/StorageService';
import { trackTutorialView, trackSettingsView, trackLeaderboardView } from '../services/AnalyticsService';

export class MenuScene extends Phaser.Scene {
  private tutorialOverlay?: Phaser.GameObjects.Container;
  private leaderboardOverlay?: Phaser.GameObjects.Container;
  private fadeOverlay?: Phaser.GameObjects.Rectangle;
  private leaderboardData: GlobalLeaderboardEntry[] = [];
  private localLeaderboardData: LeaderboardEntry[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.drawBackground();
    this.preloadLeaderboard();

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const titleContainer = this.add.graphics();
    titleContainer.fillStyle(themeService.getNumber('bg.sidebar'), 0.8);
    titleContainer.fillRoundedRect(centerX - 350, centerY - 220, 700, 160, 20);
    titleContainer.lineStyle(2, themeService.getNumber('ui.panelBorder'), 0.5);
    titleContainer.strokeRoundedRect(centerX - 350, centerY - 220, 700, 160, 20);

    const title = this.add.text(centerX, centerY - 160, 'TYPING MANIAC', {
      fontFamily: FONT_FAMILY,
      fontSize: '72px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setShadow(4, 4, '#0a2a4a', 8, true, true);

    const versionBg = this.add.graphics();
    versionBg.fillStyle(themeService.getNumber('bg.sidebar'), 0.9);
    versionBg.fillRoundedRect(10, 10, 70, 28, 8);
    versionBg.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.5);
    versionBg.strokeRoundedRect(10, 10, 70, 28, 8);

    const version = this.add.text(45, 24, 'v1.1.0', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    version.setOrigin(0.5, 0.5);

    const user = authService.getUser();
    if (user) {
      const userText = this.add.text(centerX, centerY - 80, `Welcome, ${user.name}!`, {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        color: themeService.getText('text.secondary'),
      });
      userText.setOrigin(0.5, 0.5);
    }

    const playButtonW = 320;
    const playButtonH = 90;
    const playButtonY = centerY + 30;

    const playButtonShadow = this.add.graphics();
    playButtonShadow.fillStyle(0x000000, 0.3);
    playButtonShadow.fillRoundedRect(centerX - playButtonW / 2 + 4, playButtonY - playButtonH / 2 + 4, playButtonW, playButtonH, 16);

    const playButton = this.add.graphics();
    const drawPlayButton = (hover: boolean) => {
      playButton.clear();
      playButton.fillStyle(hover ? 0x5a9a5a : 0x4a8a4a, 1);
      playButton.fillRoundedRect(centerX - playButtonW / 2, playButtonY - playButtonH / 2, playButtonW, playButtonH, 16);
      playButton.lineStyle(3, hover ? 0x7aba7a : 0x6aaa6a, 1);
      playButton.strokeRoundedRect(centerX - playButtonW / 2, playButtonY - playButtonH / 2, playButtonW, playButtonH, 16);
    };
    drawPlayButton(false);

    const playHitArea = this.add.rectangle(centerX, playButtonY, playButtonW, playButtonH, 0x000000, 0);
    playHitArea.setInteractive({ useHandCursor: true });

    const playText = this.add.text(centerX, playButtonY, '▶  PLAY', {
      fontFamily: FONT_FAMILY,
      fontSize: '42px',
      color: '#ffffff',
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

    const secondaryButtonW = 240;
    const secondaryButtonH = 50;
    const buttonSpacing = 15;
    const columnX = centerX;
    const startY = centerY + 120;

    this.createSecondaryButton(columnX, startY, secondaryButtonW, secondaryButtonH, '📖 TUTORIAL', () => {
      audioService.playButtonClick();
      this.showTutorial();
    });

    this.createSecondaryButton(columnX, startY + secondaryButtonH + buttonSpacing, secondaryButtonW, secondaryButtonH, '🏆 SCORES', () => {
      audioService.playButtonClick();
      this.showLeaderboard();
    });

    this.createSecondaryButton(columnX, startY + (secondaryButtonH + buttonSpacing) * 2, secondaryButtonW, secondaryButtonH, '⚙️ SETTINGS', () => {
      audioService.playButtonClick();
      trackSettingsView();
      this.scene.pause();
      this.scene.launch('SettingsScene');
    });

    if (user) {
      const logoutY = startY + (secondaryButtonH + buttonSpacing) * 3 + 15;
      const logoutW = 140;
      const logoutH = 36;

      const logoutBg = this.add.graphics();
      logoutBg.fillStyle(themeService.getNumber('bg.slot'), 1);
      logoutBg.fillRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);
      logoutBg.lineStyle(1, themeService.getNumber('accent.danger'), 0.5);
      logoutBg.strokeRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);

      const logoutText = this.add.text(centerX, logoutY, '🚪 Sign Out', {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: themeService.getText('text.secondary'),
      });
      logoutText.setOrigin(0.5, 0.5);

      const logoutHitArea = this.add.rectangle(centerX, logoutY, logoutW, logoutH, 0x000000, 0);
      logoutHitArea.setInteractive({ useHandCursor: true });

      logoutHitArea.on('pointerover', () => {
        logoutBg.clear();
        logoutBg.fillStyle(themeService.getNumber('accent.danger'), 0.2);
        logoutBg.fillRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);
        logoutBg.lineStyle(2, themeService.getNumber('accent.danger'), 0.8);
        logoutBg.strokeRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);
        logoutText.setColor('#ff6b6b');
      });

      logoutHitArea.on('pointerout', () => {
        logoutBg.clear();
        logoutBg.fillStyle(themeService.getNumber('bg.slot'), 1);
        logoutBg.fillRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);
        logoutBg.lineStyle(1, themeService.getNumber('accent.danger'), 0.5);
        logoutBg.strokeRoundedRect(centerX - logoutW / 2, logoutY - logoutH / 2, logoutW, logoutH, 8);
        logoutText.setColor(themeService.getText('text.secondary'));
      });

      logoutHitArea.on('pointerdown', async () => {
        audioService.playButtonClick();
        await authService.signOut();
        this.scene.start('AuthScene');
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

  async preloadLeaderboard() {
    this.leaderboardData = await authService.getLeaderboard(20);
  }

  createSecondaryButton(x: number, y: number, w: number, h: number, label: string, onClick: () => void) {
    const button = this.add.graphics();
    const drawButton = (hover: boolean) => {
      button.clear();
      button.fillStyle(hover ? themeService.getNumber('ui.buttonHover') : themeService.getNumber('bg.sidebar'), 1);
      button.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
      button.lineStyle(2, themeService.getNumber('ui.panelBorder'), hover ? 0.9 : 0.4);
      button.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    };
    drawButton(false);

    const text = this.add.text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
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

    trackTutorialView();

    this.tutorialOverlay = this.add.container(0, 0);
    this.tutorialOverlay.setDepth(500);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.tutorialOverlay.add(bg);

    const panelW = 750;
    const panelH = 620;
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

    const title = this.add.text(GAME_WIDTH / 2, panelY + 35, '📖 HOW TO PLAY', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    this.tutorialOverlay.add(title);

    const section1Y = panelY + 85;
    const section1Header = this.add.text(panelX + 25, section1Y, '⌨️ BASICS', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    this.tutorialOverlay.add(section1Header);

    const section1Bg = this.add.graphics();
    section1Bg.fillStyle(0x4fc3f7, 0.08);
    section1Bg.fillRoundedRect(panelX + 20, section1Y + 25, panelW - 40, 75, 10);
    this.tutorialOverlay.add(section1Bg);

    const basics = [
      'Type falling words before they hit the red zone',
      'Press ENTER to submit • Wrong submission speeds up the word!',
    ];

    let y = section1Y + 45;
    for (const item of basics) {
      const bullet = this.add.text(panelX + 35, y, '•', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#4fc3f7',
      });
      bullet.setOrigin(0, 0.5);
      this.tutorialOverlay.add(bullet);

      const text = this.add.text(panelX + 50, y, item, {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: themeService.getText('game.wordText'),
      });
      text.setOrigin(0, 0.5);
      this.tutorialOverlay.add(text);
      y += 28;
    }

    const section2Y = panelY + 205;
    const section2Header = this.add.text(panelX + 25, section2Y, '⚡ POWER-UPS', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    this.tutorialOverlay.add(section2Header);

    const powers = [
      { icon: '🔥', name: 'FIRE', key: '1', desc: 'Destroy all words on screen', color: '#ff6b35' },
      { icon: '❄️', name: 'ICE', key: '2', desc: 'Freeze all words for 5 seconds', color: '#64b5f6' },
      { icon: '💨', name: 'WIND', key: '3', desc: 'Reset LIMIT bar to 0%', color: '#ba68c8' },
      { icon: '🐌', name: 'SLOW', key: '4', desc: 'Slow words to 30% for 5 seconds', color: '#ffb74d' },
    ];

    y = section2Y + 30;
    for (const power of powers) {
      const powerBg = this.add.graphics();
      powerBg.fillStyle(themeService.getNumber('ui.panelBorder'), 0.1);
      powerBg.fillRoundedRect(panelX + 25, y - 15, panelW - 50, 35, 8);
      this.tutorialOverlay.add(powerBg);

      const iconText = this.add.text(panelX + 40, y, power.icon, {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
      });
      iconText.setOrigin(0, 0.5);
      this.tutorialOverlay.add(iconText);

      const nameText = this.add.text(panelX + 80, y, power.name, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        color: power.color,
        fontStyle: 'bold',
      });
      nameText.setOrigin(0, 0.5);
      this.tutorialOverlay.add(nameText);

      const keyBg = this.add.graphics();
      keyBg.fillStyle(0x333333, 1);
      keyBg.fillRoundedRect(panelX + 160, y - 12, 30, 24, 4);
      this.tutorialOverlay.add(keyBg);

      const keyText = this.add.text(panelX + 175, y, power.key, {
        fontFamily: FONT_FAMILY,
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      keyText.setOrigin(0.5, 0.5);
      this.tutorialOverlay.add(keyText);

      const descText = this.add.text(panelX + 205, y, power.desc, {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: themeService.getText('text.secondary'),
      });
      descText.setOrigin(0, 0.5);
      this.tutorialOverlay.add(descText);

      y += 42;
    }

    const section3Y = panelY + 425;
    const section3Header = this.add.text(panelX + 25, section3Y, '🎯 OBJECTIVES', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#2ecc71',
      fontStyle: 'bold',
    });
    this.tutorialOverlay.add(section3Header);

    const section3Bg = this.add.graphics();
    section3Bg.fillStyle(0x2ecc71, 0.08);
    section3Bg.fillRoundedRect(panelX + 20, section3Y + 25, (panelW - 50) / 2, 75, 10);
    this.tutorialOverlay.add(section3Bg);

    const progressIcon = this.add.text(panelX + 40, section3Y + 55, '📊', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
    });
    progressIcon.setOrigin(0, 0.5);
    this.tutorialOverlay.add(progressIcon);

    const progressTitle = this.add.text(panelX + 80, section3Y + 45, 'PROGRESS', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#2ecc71',
      fontStyle: 'bold',
    });
    progressTitle.setOrigin(0, 0.5);
    this.tutorialOverlay.add(progressTitle);

    const progressDesc = this.add.text(panelX + 80, section3Y + 70, 'Fill to 100% to level up!', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: themeService.getText('text.secondary'),
    });
    progressDesc.setOrigin(0, 0.5);
    this.tutorialOverlay.add(progressDesc);

    const section3Bg2 = this.add.graphics();
    section3Bg2.fillStyle(0xff4444, 0.08);
    section3Bg2.fillRoundedRect(panelX + 25 + (panelW - 50) / 2 + 10, section3Y + 25, (panelW - 50) / 2, 75, 10);
    this.tutorialOverlay.add(section3Bg2);

    const limitIcon = this.add.text(panelX + 45 + (panelW - 50) / 2 + 10, section3Y + 55, '⚠️', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
    });
    limitIcon.setOrigin(0, 0.5);
    this.tutorialOverlay.add(limitIcon);

    const limitTitle = this.add.text(panelX + 85 + (panelW - 50) / 2 + 10, section3Y + 45, 'LIMIT', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    limitTitle.setOrigin(0, 0.5);
    this.tutorialOverlay.add(limitTitle);

    const limitDesc = this.add.text(panelX + 85 + (panelW - 50) / 2 + 10, section3Y + 70, '100% = GAME OVER!', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: themeService.getText('text.secondary'),
    });
    limitDesc.setOrigin(0, 0.5);
    this.tutorialOverlay.add(limitDesc);

    const comboBg = this.add.graphics();
    comboBg.fillStyle(0xffd700, 0.08);
    comboBg.fillRoundedRect(panelX + 20, panelY + 525, panelW - 40, 40, 10);
    this.tutorialOverlay.add(comboBg);

    const comboIcon = this.add.text(GAME_WIDTH / 2 - 180, panelY + 545, '✨', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
    });
    comboIcon.setOrigin(0, 0.5);
    this.tutorialOverlay.add(comboIcon);

    const comboText = this.add.text(GAME_WIDTH / 2 - 150, panelY + 545, 'COMBOS: 9+ words = GOOD (1.2x) → 36+ words = FANTASTIC (3x)', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    comboText.setOrigin(0, 0.5);
    this.tutorialOverlay.add(comboText);

    const closeText = this.add.text(GAME_WIDTH / 2, panelY + panelH - 30, 'Press ESC or click anywhere to close', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
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

  async showLeaderboard() {
    if (this.leaderboardOverlay) return;

    const isGlobal = authService.isConfigured();
    trackLeaderboardView(isGlobal);
    
    if (isGlobal) {
      this.leaderboardData = await authService.getLeaderboard(20);
    } else {
      this.localLeaderboardData = storageService.getLeaderboard();
    }

    this.leaderboardOverlay = this.add.container(0, 0);
    this.leaderboardOverlay.setDepth(500);

    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    this.leaderboardOverlay.add(bg);

    const panelW = 700;
    const panelH = 580;
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

    const titleText = isGlobal ? '🏆 GLOBAL LEADERBOARD 🏆' : '🏆 LOCAL LEADERBOARD 🏆';
    const title = this.add.text(GAME_WIDTH / 2, panelY + 35, titleText, {
      fontFamily: FONT_FAMILY,
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(title);

    const headerY = panelY + 85;
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0xffd700, 0.1);
    headerBg.fillRoundedRect(panelX + 15, headerY - 15, panelW - 30, 35, 8);
    this.leaderboardOverlay.add(headerBg);

    const rankHeader = this.add.text(panelX + 45, headerY, 'RANK', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    rankHeader.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(rankHeader);

    const playerHeader = this.add.text(panelX + 140, headerY, 'PLAYER', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    playerHeader.setOrigin(0, 0.5);
    this.leaderboardOverlay.add(playerHeader);

    const scoreHeader = this.add.text(panelX + panelW - 140, headerY, 'SCORE', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    scoreHeader.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(scoreHeader);

    const levelHeader = this.add.text(panelX + panelW - 50, headerY, 'LVL', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: '#ffd700',
      fontStyle: 'bold',
    });
    levelHeader.setOrigin(0.5, 0.5);
    this.leaderboardOverlay.add(levelHeader);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0xffd700, 0.3);
    divider.lineBetween(panelX + 20, headerY + 20, panelX + panelW - 20, headerY + 20);
    this.leaderboardOverlay.add(divider);

    const hasData = isGlobal ? this.leaderboardData.length > 0 : this.localLeaderboardData.length > 0;

    if (!hasData) {
      const noScores = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'No scores yet! Be the first!', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: themeService.getText('text.secondary'),
      });
      noScores.setOrigin(0.5, 0.5);
      this.leaderboardOverlay.add(noScores);
    } else {
      const medals = ['🥇', '🥈', '🥉'];
      const displayCount = isGlobal 
        ? Math.min(this.leaderboardData.length, 10)
        : Math.min(this.localLeaderboardData.length, 5);
      const rowStartY = panelY + 130;
      const rowHeight = 42;

      for (let i = 0; i < displayCount; i++) {
        const currentY = rowStartY + i * rowHeight;

        if (i % 2 === 1) {
          const rowBg = this.add.graphics();
          rowBg.fillStyle(themeService.getNumber('ui.panelBorder'), 0.05);
          rowBg.fillRoundedRect(panelX + 15, currentY - 18, panelW - 30, 36, 6);
          this.leaderboardOverlay.add(rowBg);
        }

        const rankText = i < 3 ? medals[i] : `${i + 1}`;
        const rankLabel = this.add.text(panelX + 45, currentY, rankText, {
          fontFamily: FONT_FAMILY,
          fontSize: i < 3 ? '24px' : '18px',
          color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : themeService.getText('text.secondary'),
          fontStyle: i < 3 ? 'bold' : 'normal',
        });
        rankLabel.setOrigin(0.5, 0.5);
        this.leaderboardOverlay.add(rankLabel);

        if (isGlobal) {
          const entry = this.leaderboardData[i];
          const avatarX = panelX + 90;
          const avatarSize = 32;
          const avatarBg = this.add.circle(avatarX, currentY, avatarSize / 2 + 2, themeService.getNumber('ui.panelBorder'), 0.5);
          this.leaderboardOverlay.add(avatarBg);

          if (entry.avatar_url && this.textures.exists(`avatar_${entry.user_id}`)) {
            const avatar = this.add.image(avatarX, currentY, `avatar_${entry.user_id}`);
            avatar.setDisplaySize(avatarSize, avatarSize);
            
            const maskGraphics = this.make.graphics({});
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillCircle(avatarX, currentY, avatarSize / 2);
            const mask = maskGraphics.createGeometryMask();
            avatar.setMask(mask);
            
            this.leaderboardOverlay.add(avatar);
          } else {
            const initial = entry.username.charAt(0).toUpperCase();
            const initialText = this.add.text(avatarX, currentY, initial, {
              fontFamily: FONT_FAMILY,
              fontSize: '16px',
              color: themeService.getText('text.primary'),
              fontStyle: 'bold',
            });
            initialText.setOrigin(0.5, 0.5);
            this.leaderboardOverlay.add(initialText);
          }

          const username = entry.username.length > 14 ? entry.username.substring(0, 14) + '…' : entry.username;
          const nameLabel = this.add.text(panelX + 115, currentY, username, {
            fontFamily: FONT_FAMILY,
            fontSize: '20px',
            color: i < 3 ? themeService.getText('text.primary') : themeService.getText('game.wordText'),
            fontStyle: i < 3 ? 'bold' : 'normal',
          });
          nameLabel.setOrigin(0, 0.5);
          this.leaderboardOverlay.add(nameLabel);

          const scoreLabel = this.add.text(panelX + panelW - 140, currentY, this.formatNumber(entry.score), {
            fontFamily: FONT_FAMILY,
            fontSize: '20px',
            color: i === 0 ? '#ffd700' : themeService.getText('text.primary'),
            fontStyle: 'bold',
          });
          scoreLabel.setOrigin(0.5, 0.5);
          this.leaderboardOverlay.add(scoreLabel);

          const levelLabel = this.add.text(panelX + panelW - 50, currentY, `${entry.level}`, {
            fontFamily: FONT_FAMILY,
            fontSize: '18px',
            color: themeService.getText('text.secondary'),
          });
          levelLabel.setOrigin(0.5, 0.5);
          this.leaderboardOverlay.add(levelLabel);
        } else {
          const entry = this.localLeaderboardData[i];
          
          const avatarX = panelX + 90;
          const avatarBg = this.add.circle(avatarX, currentY, 18, themeService.getNumber('ui.panelBorder'), 0.5);
          this.leaderboardOverlay.add(avatarBg);
          
          const initialText = this.add.text(avatarX, currentY, '👤', {
            fontSize: '16px',
          });
          initialText.setOrigin(0.5, 0.5);
          this.leaderboardOverlay.add(initialText);

          const nameLabel = this.add.text(panelX + 115, currentY, 'You', {
            fontFamily: FONT_FAMILY,
            fontSize: '20px',
            color: i < 3 ? themeService.getText('text.primary') : themeService.getText('game.wordText'),
            fontStyle: i < 3 ? 'bold' : 'normal',
          });
          nameLabel.setOrigin(0, 0.5);
          this.leaderboardOverlay.add(nameLabel);

          const scoreLabel = this.add.text(panelX + panelW - 140, currentY, this.formatNumber(entry.score), {
            fontFamily: FONT_FAMILY,
            fontSize: '20px',
            color: i === 0 ? '#ffd700' : themeService.getText('text.primary'),
            fontStyle: 'bold',
          });
          scoreLabel.setOrigin(0.5, 0.5);
          this.leaderboardOverlay.add(scoreLabel);

          const levelLabel = this.add.text(panelX + panelW - 50, currentY, `${entry.level}`, {
            fontFamily: FONT_FAMILY,
            fontSize: '18px',
            color: themeService.getText('text.secondary'),
          });
          levelLabel.setOrigin(0.5, 0.5);
          this.leaderboardOverlay.add(levelLabel);
        }
      }
    }

    const closeText = this.add.text(GAME_WIDTH / 2, panelY + panelH - 35, 'Press ESC or click anywhere to close', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
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
    return n.toLocaleString();
  }
}
