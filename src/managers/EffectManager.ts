import Phaser from 'phaser';
import type { PowerType } from '../types';
import { GAME_AREA_WIDTH, GAME_WIDTH, GAME_HEIGHT, COLORS, POWER_COLORS, FONT_FAMILY } from '../config/constants';
import { themeService } from '../services/ThemeService';

const INPUT_CONTAINER_W = 600;
const INPUT_CONTAINER_H = 60;
const INPUT_CONTAINER_X = GAME_AREA_WIDTH / 2 - INPUT_CONTAINER_W / 2;
const INPUT_CONTAINER_Y = GAME_HEIGHT - 90;

export class EffectManager {
  private scene: Phaser.Scene;
  private iceOverlay?: Phaser.GameObjects.Graphics;
  private slowOverlay?: Phaser.GameObjects.Graphics;
  private fadeOverlay?: Phaser.GameObjects.Rectangle;
  private emberPool: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createFadeOverlay() {
    this.fadeOverlay = this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, themeService.getNumber('effects.shadow'), 1);
    this.fadeOverlay.setDepth(2000);
    this.scene.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  createEmberParticles(zoneY: number) {
    const emberCount = 15;
    for (let i = 0; i < emberCount; i++) {
      this.createEmber(zoneY, i * 150);
    }
  }

  private createEmber(baseY: number, delay: number) {
    const baseX = Math.random() * GAME_AREA_WIDTH;
    const ember = this.scene.add.circle(baseX, baseY, 2 + Math.random() * 3, themeService.getNumber('game.dangerGlow'), 0.8);
    ember.setDepth(7);
    ember.setAlpha(0);
    this.emberPool.push(ember);

    const animate = () => {
      if (!ember.active) return;
      const startX = Math.random() * GAME_AREA_WIDTH;
      const startY = baseY + Math.random() * 20;
      const size = 1 + Math.random() * 3;
      const color = Math.random() > 0.5 ? 0xff6644 : (Math.random() > 0.5 ? 0xffaa44 : themeService.getNumber('accent.danger'));

      ember.setPosition(startX, startY);
      ember.setRadius(size);
      ember.setFillStyle(color);
      ember.setAlpha(0);

      this.scene.tweens.add({
        targets: ember,
        y: startY - 60 - Math.random() * 40,
        x: startX + (Math.random() - 0.5) * 40,
        alpha: { from: 0.9, to: 0 },
        duration: 1500 + Math.random() * 1000,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.scene.time.delayedCall(200 + Math.random() * 500, animate);
        },
      });
    };

    this.scene.time.delayedCall(delay, animate);
  }

  flashInputRed() {
    const flash = this.scene.add.graphics();
    flash.fillStyle(themeService.getNumber('accent.danger'), 0.5);
    flash.fillRoundedRect(INPUT_CONTAINER_X, INPUT_CONTAINER_Y, INPUT_CONTAINER_W, INPUT_CONTAINER_H, 12);
    flash.setDepth(99);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  flashInputBox(inputText: Phaser.GameObjects.Text) {
    this.scene.tweens.add({
      targets: inputText,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 60,
      yoyo: true,
      ease: 'Power1',
    });
  }

  showPowerFlash(color: number) {
    const flash = this.scene.add.rectangle(GAME_AREA_WIDTH / 2, GAME_HEIGHT / 2, GAME_AREA_WIDTH, GAME_HEIGHT, color, 0.5);
    flash.setDepth(50);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  showFireParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        x + (Math.random() - 0.5) * 60,
        y + (Math.random() - 0.5) * 30,
        4 + Math.random() * 6,
        POWER_COLORS.fire,
        1
      );
      particle.setDepth(100);
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 60 - Math.random() * 60,
        x: particle.x + (Math.random() - 0.5) * 80,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 700 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  showIceOverlay() {
    if (this.iceOverlay) {
      this.iceOverlay.destroy();
    }
    this.iceOverlay = this.scene.add.graphics();
    this.iceOverlay.fillStyle(POWER_COLORS.ice, 0.15);
    this.iceOverlay.fillRect(0, 0, GAME_AREA_WIDTH, GAME_HEIGHT);
    this.iceOverlay.setDepth(49);
  }

  hideIceOverlay() {
    if (this.iceOverlay) {
      this.scene.tweens.add({
        targets: this.iceOverlay,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.iceOverlay?.destroy();
          this.iceOverlay = undefined;
        },
      });
    }
  }

  showSlowOverlay() {
    if (this.slowOverlay) {
      this.slowOverlay.destroy();
    }
    this.slowOverlay = this.scene.add.graphics();
    const cx = GAME_AREA_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (1 - i * 0.15);
      const alpha = 0.05 + i * 0.03;
      this.slowOverlay.fillStyle(POWER_COLORS.slow, alpha);
      this.slowOverlay.fillCircle(cx, cy, radius);
    }
    this.slowOverlay.setDepth(49);
  }

  hideSlowOverlay() {
    if (this.slowOverlay) {
      this.scene.tweens.add({
        targets: this.slowOverlay,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.slowOverlay?.destroy();
          this.slowOverlay = undefined;
        },
      });
    }
  }

  showWindEffect() {
    for (let i = 0; i < 12; i++) {
      const line = this.scene.add.graphics();
      line.lineStyle(3, POWER_COLORS.wind, 0.6);
      const y = Math.random() * GAME_HEIGHT;
      const startX = -100;
      const length = 150 + Math.random() * 150;
      line.lineBetween(startX, y, startX + length, y);
      line.setDepth(50);
      this.scene.tweens.add({
        targets: line,
        x: GAME_AREA_WIDTH + 200,
        duration: 600 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => line.destroy(),
      });
    }
  }

  showWordCompleteEffect(x: number, y: number, power: PowerType) {
    const ring = this.scene.add.circle(x, y, 20, themeService.getNumber('effects.glow'), 0.6);
    ring.setDepth(100);
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    if (power !== 'none') {
      const glow = this.scene.add.circle(x, y, 30, POWER_COLORS[power], 0.4);
      glow.setDepth(99);
      this.scene.tweens.add({
        targets: glow,
        scaleX: 2.5,
        scaleY: 2.5,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => glow.destroy(),
      });
    }
  }

  showBurstParticles(x: number, y: number, power: PowerType) {
    const color = power !== 'none' ? POWER_COLORS[power] : COLORS.PROGRESS_FILL;

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      const size = 3 + Math.random() * 4;

      const particle = this.scene.add.circle(x, y, size, color, 1);
      particle.setDepth(100);

      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 450 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }

    for (let i = 0; i < 6; i++) {
      const spark = this.scene.add.rectangle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        2,
        8 + Math.random() * 8,
        themeService.getNumber('effects.glow'),
        0.8
      );
      spark.setDepth(100);
      spark.setRotation(Math.random() * Math.PI);

      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 40 - Math.random() * 40,
        alpha: 0,
        duration: 550,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      });
    }
  }

  showComboPopup(x: number, y: number, text: string, color: string) {
    const popup = this.scene.add.text(x, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: color,
      fontStyle: 'bold',
    });
    popup.setOrigin(0, 0.5);
    popup.setDepth(100);

    this.scene.tweens.add({
      targets: popup,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => popup.destroy(),
    });
  }

  showMissPopup(x: number, y: number) {
    const missText = this.scene.add.text(x, y, 'MISS', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: themeService.getText('text.danger'),
      fontStyle: 'bold',
    });
    missText.setOrigin(0, 0.5);
    missText.setDepth(100);
    missText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.scene.tweens.add({
      targets: missText,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => missText.destroy(),
    });
  }

  showMissedWordEffect(word: { x: number; y: number; letters: Phaser.GameObjects.Text[] }) {
    const flash = this.scene.add.circle(word.x + 30, word.y, 60, themeService.getNumber('accent.danger'), 0.8);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    for (const letter of word.letters) {
      const letterY = letter.y;

      this.scene.tweens.add({
        targets: letter,
        y: letterY + 100,
        alpha: 0,
        angle: (Math.random() - 0.5) * 60,
        duration: 400,
        ease: 'Power2',
      });
    }

    this.scene.cameras.main.shake(150, 0.005);
  }

  showWrongWordPopup(targetWord: { x: number; y: number; letters: Phaser.GameObjects.Text[] } | null) {
    let x: number;
    let y: number;

    if (targetWord) {
      const totalWidth = targetWord.letters.reduce((sum, l) => sum + l.width, 0);
      x = targetWord.x + totalWidth + 20;
      y = targetWord.y;
    } else {
      x = GAME_AREA_WIDTH / 2;
      y = GAME_HEIGHT / 2;
    }

    const missText = this.scene.add.text(x, y, 'MISS', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: themeService.getText('text.danger'),
      fontStyle: 'bold',
    });
    missText.setOrigin(0, 0.5);
    missText.setDepth(100);
    missText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.scene.tweens.add({
      targets: missText,
      y: y - 50,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => missText.destroy(),
    });
  }

  clearOverlays() {
    this.iceOverlay?.destroy();
    this.iceOverlay = undefined;
    this.slowOverlay?.destroy();
    this.slowOverlay = undefined;
    for (const ember of this.emberPool) {
      ember.destroy();
    }
    this.emberPool = [];
  }
}
