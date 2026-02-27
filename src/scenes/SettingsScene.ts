import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT_FAMILY } from '../config/constants';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';

export class SettingsScene extends Phaser.Scene {
  private sliders: { track: Phaser.GameObjects.Graphics; fill: Phaser.GameObjects.Graphics; handle: Phaser.GameObjects.Arc; value: number; type: 'master' | 'sfx' | 'music' }[] = [];

  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    this.drawBackground();

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;
    const panelW = 480;
    const panelH = 420;

    const panel = this.add.graphics();
    panel.fillStyle(0x050a12, 1);
    panel.fillRoundedRect(centerX - panelW / 2, centerY - panelH / 2, panelW, panelH, 20);
    
    for (let i = 0; i < 3; i++) {
      panel.lineStyle(2 - i * 0.5, 0x4fc3f7, 0.4 - i * 0.1);
      panel.strokeRoundedRect(centerX - panelW / 2 + i, centerY - panelH / 2 + i, panelW - i * 2, panelH - i * 2, 20 - i);
    }
    
    const panelGlow = this.add.graphics();
    panelGlow.fillStyle(0x4fc3f7, 0.03);
    panelGlow.fillRoundedRect(centerX - panelW / 2 + 10, centerY - panelH / 2 + 10, panelW - 20, panelH - 20, 15);
    this.tweens.add({
      targets: panelGlow,
      alpha: { from: 1, to: 0.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

  
    const title = this.add.text(centerX, centerY - 170, 'SETTINGS', {
      fontFamily: FONT_FAMILY,
      fontSize: '48px',
      color: '#4fc3f7',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);
    title.setShadow(0, 0, '#4fc3f7', 12, true, true);
  
    const settings = audioService.getSettings();
  
    this.createSlider(centerX, centerY - 80, 'MASTER', settings.masterVolume, 'master');
    this.createSlider(centerX, centerY - 10, 'SOUND EFFECTS', settings.sfxVolume, 'sfx');
    this.createSlider(centerX, centerY + 60, 'MUSIC', settings.musicVolume, 'music');
  
    this.createMuteButton(centerX, centerY + 130, settings.muted);
   
    this.createBackButton(centerX, centerY + 185);
  
    this.input.keyboard!.on('keydown-ESC', () => this.goBack());
    this.input.keyboard!.on('keydown-BACKSPACE', () => this.goBack());
  }

  drawBackground() {
    BackgroundRenderer.draw(this);
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.5);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  createSlider(x: number, y: number, label: string, value: number, type: 'master' | 'sfx' | 'music') {
    const labelText = this.add.text(x - 210, y - 18, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#7ab8b8',
    });
    labelText.setOrigin(0, 0.5);

    const trackW = 200;
    const trackH = 10;
    const trackX = x - 100;
    const trackY = y + 8;

    const track = this.add.graphics();
    track.fillStyle(0x0a1520, 1);
    track.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW, trackH, 5);
    track.lineStyle(1, 0x4fc3f7, 0.3);
    track.strokeRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW, trackH, 5);
  
    const fill = this.add.graphics();
    const fillW = trackW * value;
    fill.fillStyle(0x4fc3f7, 1);
    fill.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, fillW, trackH, 5);
  
    const handleX = trackX - trackW / 2 + trackW * value;
    const handle = this.add.circle(handleX, trackY, 12, 0x4fc3f7, 1);
    handle.setStrokeStyle(2, 0xffffff, 0.9);
  
    const valueText = this.add.text(x + 110, y, `${Math.round(value * 100)}%`, {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#4fc3f7',
    });
    valueText.setOrigin(0.5, 0.5);
    valueText.setShadow(0, 0, '#4fc3f7', 6, true, true);
  
    const sliderData = { track, fill, handle, value, type, valueText, trackX, trackW };
    this.sliders.push(sliderData as any);
  
    const hitArea = this.add.rectangle(trackX, trackY, trackW + 40, 40, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true, draggable: true });
  
    const updateSlider = (pointerX: number) => {
      const relX = pointerX - (trackX - trackW / 2);
      const newValue = Math.max(0, Math.min(1, relX / trackW));
  
      sliderData.value = newValue;
      fill.clear();
      fill.fillStyle(0x4fc3f7, 1);
      fill.fillRoundedRect(trackX - trackW / 2, trackY - trackH / 2, trackW * newValue, trackH, 6);
  
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

  createMuteButton(x: number, y: number, muted: boolean) {
    const buttonW = 180;
    const buttonH = 44;

    const button = this.add.graphics();
    const drawButton = (isMuted: boolean) => {
      button.clear();
      button.fillStyle(isMuted ? 0x3a1520 : 0x050a12, 1);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
      button.lineStyle(2, isMuted ? 0xff6666 : 0x4fc3f7, 0.7);
      button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
    };
    drawButton(muted);

    const icon = muted ? '🔇' : '🔊';
    const text = this.add.text(x, y, `${icon} ${muted ? 'MUTED' : 'SOUND ON'}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    let currentMuted = muted;
    hitArea.on('pointerdown', () => {
      currentMuted = audioService.toggleMute();
      drawButton(currentMuted);
      text.setText(`${currentMuted ? '🔇' : '🔊'} ${currentMuted ? 'MUTED' : 'SOUND ON'}`);
    });
  }

  createBackButton(x: number, y: number) {
    const buttonW = 160;
    const buttonH = 44;

    const button = this.add.graphics();
    const drawButton = (hover: boolean) => {
      button.clear();
      button.fillStyle(hover ? 0x0a2535 : 0x050a12, 1);
      button.fillRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
      button.lineStyle(2, 0x4fc3f7, hover ? 0.9 : 0.5);
      button.strokeRoundedRect(x - buttonW / 2, y - buttonH / 2, buttonW, buttonH, 10);
    };
    drawButton(false);

    const text = this.add.text(x, y, '← BACK', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5, 0.5);

    const hitArea = this.add.rectangle(x, y, buttonW, buttonH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', () => drawButton(true));
    hitArea.on('pointerout', () => drawButton(false));
    hitArea.on('pointerdown', () => {
      audioService.playButtonClick();
      this.goBack();
    });
  }

  goBack() {
    this.scene.stop('SettingsScene');
    this.scene.resume('MenuScene');
  }
}
