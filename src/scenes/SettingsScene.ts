import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { themeService } from '../services/ThemeService';

export class SettingsScene extends Phaser.Scene {
  private sliders: {
    track: Phaser.GameObjects.Graphics;
    fill: Phaser.GameObjects.Graphics;
    handle: Phaser.GameObjects.Arc;
    value: number;
    type: 'master' | 'sfx' | 'music';
    valueText: Phaser.GameObjects.Text;
    trackX: number;
    trackW: number;
    trackY: number;
  }[] = [];

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    this.drawBackground();

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const panelW = 520;
    const panelH = 420;

    const panel = this.add.graphics();
    panel.fillStyle(themeService.getNumber('bg.sidebar'), 1);
    panel.fillRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 20);
    
    for (let i = 0; i < 3; i++) {
      panel.lineStyle(2 - i * 0.5, themeService.getNumber('ui.panelBorder'), 0.4 - i * 0.1);
      panel.strokeRoundedRect(centerX - panelW / 2 + i, centerY - panelH / 2 + i, panelW - i * 2, panelH - i * 2, 20 - i);
    }

    const title = this.add.text(centerX, centerY - 170, '⚙️ SETTINGS', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    const audioHeader = this.add.text(centerX, centerY - 120, '🔊 AUDIO', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    audioHeader.setOrigin(0.5, 0.5);

    const headerLine = this.add.graphics();
    headerLine.lineStyle(1, 0x4fc3f7, 0.3);
    headerLine.lineBetween(centerX - 200, centerY - 100, centerX + 200, centerY - 100);
  
    const settings = audioService.getSettings();
  
    this.createSlider(centerX, centerY - 65, 'MASTER', settings.masterVolume, 'master');
    this.createSlider(centerX, centerY + 5, 'EFFECTS', settings.sfxVolume, 'sfx');
    this.createSlider(centerX, centerY + 75, 'MUSIC', settings.musicVolume, 'music');

    this.createMuteButton(centerX, centerY + 145);

    const closeText = this.add.text(centerX, centerY + panelH / 2 - 25, 'Press ESC or click anywhere to close', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      color: themeService.getText('text.secondary'),
    });
    closeText.setOrigin(0.5, 0.5);

    const bg = this.add.rectangle(centerX, centerY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.goBack());
    bg.setDepth(-1);
  
    this.input.keyboard!.on('keydown-ESC', () => this.goBack());
    this.input.keyboard!.on('keydown-BACKSPACE', () => this.goBack());
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
    const overlay = this.add.graphics();
    overlay.fillStyle(themeService.getNumber('effects.shadow'), 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  createSlider(x: number, y: number, label: string, value: number, type: 'master' | 'sfx' | 'music') {
    const labelText = this.add.text(x - 180, y, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    labelText.setOrigin(0, 0.5);

    const trackW = 220;
    const trackH = 10;
    const trackX = x + 20;
    const trackY = y;

    const trackBg = this.add.graphics();
    trackBg.fillStyle(themeService.getNumber('bg.slot'), 1);
    trackBg.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW, trackH, 5);
    trackBg.lineStyle(1, themeService.getNumber('ui.panelBorder'), 0.3);
    trackBg.strokeRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW, trackH, 5);

    const fill = this.add.graphics();
    const fillW = trackW * value;
    fill.fillStyle(themeService.getNumber('ui.panelBorder'), 1);
    fill.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, fillW, trackH, 5);

    const handleX = trackX - trackW / 2 + trackW * value;
    const handle = this.add.circle(handleX, trackY, 12, 0xffffff, 1);
    handle.setStrokeStyle(2, themeService.getNumber('ui.panelBorder'), 1);

    const valueText = this.add.text(trackX + trackW / 2 + 20, trackY, `${Math.round(value * 100)}%`, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: themeService.getText('text.primary'),
      fontStyle: 'bold',
    });
    valueText.setOrigin(0, 0.5);
  
    const sliderData = { track: trackBg, fill, handle, value, type, valueText, trackX, trackW, trackY };
    this.sliders.push(sliderData);
  
    const hitArea = this.add.rectangle(trackX, trackY, trackW + 40, 40, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true, draggable: true });
  
    const updateSlider = (pointerX: number) => {
      const relX = pointerX - (trackX - trackW / 2);
      const newValue = Math.max(0, Math.min(1, relX / trackW));
  
      sliderData.value = newValue;
      fill.clear();
      fill.fillStyle(themeService.getNumber('ui.panelBorder'), 1);
      fill.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW * newValue, trackH, 5);

      handle.setPosition(trackX - trackW / 2 + trackW * newValue, trackY);
      valueText.setText(`${Math.round(newValue * 100)}%`);
  
      if (type === 'master') {
        audioService.setMasterVolume(newValue);
      } else if (type === 'sfx') {
        audioService.setSfxVolume(newValue);
      } else if (type === 'music') {
        audioService.setMusicVolume(newValue);
      }
  
      audioService.playButtonClick();
    };
  
    this.input.setDraggable(hitArea);
  
    hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer.x);
    });
  
    hitArea.on('drag', (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer.x);
    });
  }

  createMuteButton(x: number, y: number) {
    const buttonW = 180;
    const buttonH = 44;
    const muted = audioService.getSettings().muted;

    const button = this.add.graphics();
    const drawButton = (isMuted: boolean, hover: boolean) => {
      button.clear();
      if (isMuted) {
        button.fillStyle(0x4a1a1a, 1);
      } else {
        button.fillStyle(hover ? themeService.getNumber('ui.buttonHover') : themeService.getNumber('ui.buttonBg'), 1);
      }
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
      button.lineStyle(2, isMuted ? themeService.getNumber('accent.danger') : themeService.getNumber('ui.buttonBorder'), isMuted ? 1 : (hover ? 0.9 : 0.5));
      button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
    };
    drawButton(muted, false);

    const icon = muted ? '🔇' : '🔊';
    const text = this.add.text(x, y, `${icon} ${muted ? 'UNMUTE' : 'MUTE ALL'}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: muted ? '#ff6b6b' : themeService.getText('game.wordText'),
      fontStyle: 'bold',
    });
    text.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    let currentMuted = muted;
    hitArea.on('pointerover', () => drawButton(currentMuted, true));
    hitArea.on('pointerout', () => drawButton(currentMuted, false));
    hitArea.on('pointerdown', () => {
      currentMuted = audioService.toggleMute();
      drawButton(currentMuted, true);
      text.setText(`${currentMuted ? '🔇' : '🔊'} ${currentMuted ? 'UNMUTE' : 'MUTE ALL'}`);
      text.setColor(currentMuted ? '#ff6b6b' : themeService.getText('game.wordText'));
    });
  }

  goBack() {
    this.scene.stop('SettingsScene');
    this.scene.resume('MenuScene');
  }
}
