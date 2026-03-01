import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { authService, AuthUser } from '../services/AuthService';
import { themeService } from '../services/ThemeService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';

export class AuthScene extends Phaser.Scene {
  private loading = false;
  private authHandled = false;

  constructor() {
    super({ key: 'AuthScene' });
  }

  create() {
    this.loading = false;
    this.authHandled = false;
    this.drawBackground();

    authService.onAuthChange((user) => {
      if (user && !this.authHandled) {
        this.authHandled = true;
        this.onAuthSuccess(user);
      }
    });

    authService.initialize().then((user) => {
      if (user && !this.authHandled) {
        this.authHandled = true;
        this.onAuthSuccess(user);
      } else if (!user) {
        this.drawAuthUI();
      }
    });
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
  }

  drawAuthUI() {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const titleContainer = this.add.graphics();
    titleContainer.fillStyle(themeService.getNumber('bg.sidebar'), 0.8);
    titleContainer.fillRoundedRect(centerX - 300, centerY - 250, 600, 80, 20);
    titleContainer.lineStyle(2, themeService.getNumber('ui.panelBorder'), 0.5);
    titleContainer.strokeRoundedRect(centerX - 300, centerY - 250, 600, 80, 20);

    const title = this.add.text(centerX, centerY - 210, 'TYPING MANIAC', {
      fontFamily: FONT_FAMILY,
      fontSize: '64px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setShadow(4, 4, '#0a2a4a', 8, true, true);

    const panelW = 450;
    const panelH = 380;
    const panelX = centerX - panelW / 2;
    const panelY = centerY - 130;

    const panel = this.add.graphics();
    panel.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 20);
    for (let i = 0; i < 3; i++) {
      panel.lineStyle(2 - i * 0.5, themeService.getNumber('ui.panelBorder'), 0.5 - i * 0.1);
      panel.strokeRoundedRect(panelX + i, panelY + i, panelW - i * 2, panelH - i * 2, 20 - i);
    }

    const subtitle = this.add.text(centerX, panelY + 35, 'Sign in to compete', {
      fontFamily: FONT_FAMILY,
      fontSize: '26px',
      color: themeService.getText('text.secondary'),
    });
    subtitle.setOrigin(0.5, 0.5);

    this.createOAuthButton(centerX, panelY + 85, 'Continue with Google', 0xdb4437, async () => {
      if (this.loading) return;
      this.loading = true;
      this.showLoading();
      const result = await authService.signInWithGoogle();
      if (!result.success) {
        this.loading = false;
        this.hideLoading();
        this.showError(result.error || 'Sign in failed');
      }
    });

    this.createOAuthButton(centerX, panelY + 150, 'Continue with Facebook', 0x1877f2, async () => {
      if (this.loading) return;
      this.loading = true;
      this.showLoading();
      const result = await authService.signInWithFacebook();
      if (!result.success) {
        this.loading = false;
        this.hideLoading();
        this.showError(result.error || 'Sign in failed');
      }
    });

    const dividerY = panelY + 215;
    const divider = this.add.graphics();
    divider.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.3);
    divider.lineBetween(panelX + 50, dividerY, panelX + panelW - 50, dividerY);

    const orText = this.add.text(centerX, dividerY, 'or', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: themeService.getText('text.secondary'),
    });
    orText.setOrigin(0.5, 0.5);

    this.createGuestButton(centerX, panelY + 260, async () => {
      if (this.loading) return;
      this.loading = true;
      this.showLoading('Creating guest account...');
      const result = await authService.signInAnonymously();
      if (!result.success) {
        this.loading = false;
        this.hideLoading();
        this.showError(result.error || 'Failed to create guest account');
      }
    });

    const guestNote = this.add.text(centerX, panelY + panelH - 25, 'Guest scores are saved to leaderboard', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: themeService.getText('text.secondary'),
    });
    guestNote.setOrigin(0.5, 0.5);
  }

  createOAuthButton(x: number, y: number, text: string, color: number, onClick: () => void) {
    const buttonW = 320;
    const buttonH = 50;

    const button = this.add.graphics();
    button.fillStyle(color, 1);
    button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);

    const label = this.add.text(x, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      button.clear();
      button.fillStyle(color, 0.85);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      label.setScale(1.02);
    });

    hitArea.on('pointerout', () => {
      button.clear();
      button.fillStyle(color, 1);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      label.setScale(1);
    });

    hitArea.on('pointerdown', () => {
      audioService.playButtonClick();
      onClick();
    });
  }

  createGuestButton(x: number, y: number, onClick: () => void) {
    const buttonW = 320;
    const buttonH = 50;
    const color = themeService.getNumber('ui.panelBorder');

    const button = this.add.graphics();
    button.fillStyle(themeService.getNumber('bg.slot'), 1);
    button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
    button.lineStyle(2, color, 0.8);
    button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);

    const label = this.add.text(x, y, '🎮 Play as Guest', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    label.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => {
      button.clear();
      button.fillStyle(themeService.getNumber('ui.buttonHover'), 1);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      button.lineStyle(2, color, 1);
      button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      label.setScale(1.02);
    });

    hitArea.on('pointerout', () => {
      button.clear();
      button.fillStyle(themeService.getNumber('bg.slot'), 1);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      button.lineStyle(2, color, 0.8);
      button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 12);
      label.setScale(1);
    });

    hitArea.on('pointerdown', () => {
      audioService.playButtonClick();
      onClick();
    });
  }

  showLoading(message = 'Signing in...') {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    const overlay = this.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    overlay.setDepth(100);

    const loadingText = this.add.text(centerX, centerY, message, {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: themeService.getText('text.primary'),
    });
    loadingText.setOrigin(0.5, 0.5);
    loadingText.setDepth(101);
    loadingText.setName('loadingText');
  }

  hideLoading() {
    const loadingText = this.children.getByName('loadingText');
    if (loadingText) loadingText.destroy();
  }

  showError(message: string) {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2 + 200;

    const errorText = this.add.text(centerX, centerY, message, {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#' + themeService.getNumber('accent.danger').toString(16).padStart(6, '0'),
    });
    errorText.setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: errorText,
      alpha: 0,
      delay: 3000,
      duration: 500,
      onComplete: () => errorText.destroy(),
    });
  }

  onAuthSuccess(user: AuthUser) {
    console.log('Auth success:', user.name);
    this.scene.start('MenuScene');
  }
}
