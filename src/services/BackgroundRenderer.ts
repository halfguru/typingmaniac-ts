import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class BackgroundRenderer {
  static draw(scene: Phaser.Scene, width: number = GAME_WIDTH) {
    this.createBaseGradient(scene, width);
    this.createGridFloor(scene, width);
    this.createCitySilhouette(scene, width);
    this.createFloatingParticles(scene, width);
    this.createScanlines(scene, width);
    this.createAmbientGlow(scene, width);
  }

  private static createBaseGradient(scene: Phaser.Scene, width: number) {
    const graphics = scene.add.graphics();
    
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const ratio = y / GAME_HEIGHT;
      let r, g, b;
      
      if (ratio < 0.3) {
        r = Math.floor(5 + ratio * 20);
        g = Math.floor(10 + ratio * 40);
        b = Math.floor(30 + ratio * 50);
      } else {
        const subRatio = (ratio - 0.3) / 0.7;
        r = Math.floor(11 + subRatio * 15);
        g = Math.floor(22 + subRatio * 20);
        b = Math.floor(45 - subRatio * 10);
      }
      
      const colorInt = (r << 16) | (g << 8) | b;
      graphics.fillStyle(colorInt, 1);
      graphics.fillRect(0, y, width, 1);
    }
    
    graphics.setDepth(-10);
  }

  private static createGridFloor(scene: Phaser.Scene, width: number) {
    const gridGraphics = scene.add.graphics();
    gridGraphics.setAlpha(0.3);
    
    const horizonY = GAME_HEIGHT * 0.65;
    const gridColor = 0x00ffff;
    
    for (let i = 0; i < 30; i++) {
      const y = horizonY + Math.pow(i / 30, 1.5) * (GAME_HEIGHT - horizonY);
      const alpha = 0.15 + (i / 30) * 0.25;
      gridGraphics.lineStyle(1, gridColor, alpha);
      gridGraphics.lineBetween(0, y, width, y);
    }
    
    const vanishX = width / 2;
    const lineCount = 20;
    for (let i = 0; i <= lineCount; i++) {
      const ratio = i / lineCount;
      const bottomX = ratio * width;
      const alpha = 0.2 + Math.abs(0.5 - ratio) * 0.3;
      gridGraphics.lineStyle(1, gridColor, alpha);
      gridGraphics.lineBetween(vanishX, horizonY, bottomX, GAME_HEIGHT);
    }
    
    gridGraphics.setDepth(-1);
  }

  private static createCitySilhouette(scene: Phaser.Scene, width: number) {
    const cityGraphics = scene.add.graphics();
    const skylineY = GAME_HEIGHT * 0.55;
    
    cityGraphics.fillStyle(0x0a0a15, 1);
    
    let x = 0;
    const seed = Date.now();
    const seededRandom = this.createSeededRandom(seed);
    
    while (x < width) {
      const buildingWidth = 30 + seededRandom() * 80;
      const buildingHeight = 50 + seededRandom() * 150;
      const topY = skylineY - buildingHeight;
      
      cityGraphics.fillRect(x, topY, buildingWidth, buildingHeight + (GAME_HEIGHT - skylineY));
      
      if (seededRandom() > 0.5) {
        const antennaHeight = 10 + seededRandom() * 30;
        const antennaX = x + buildingWidth / 2;
        cityGraphics.fillRect(antennaX - 2, topY - antennaHeight, 4, antennaHeight);
      }
      
      const windowColor = seededRandom() > 0.7 ? 0xffff88 : (seededRandom() > 0.5 ? 0x88ccff : 0x000000);
      const windowAlpha = windowColor === 0x000000 ? 0 : (0.3 + seededRandom() * 0.5);
      cityGraphics.fillStyle(windowColor, windowAlpha);
      
      for (let wy = topY + 10; wy < skylineY - 20; wy += 15) {
        for (let wx = x + 5; wx < x + buildingWidth - 10; wx += 12) {
          if (seededRandom() > 0.4) {
            const w = 6 + seededRandom() * 4;
            const h = 8 + seededRandom() * 4;
            cityGraphics.fillRect(wx, wy, w, h);
          }
        }
      }
      
      cityGraphics.fillStyle(0x0a0a15, 1);
      x += buildingWidth + seededRandom() * 10;
    }
    
    cityGraphics.setDepth(-1);
    
    this.createCityLights(scene, skylineY, width);
  }

  private static createCityLights(scene: Phaser.Scene, skylineY: number, width: number) {
    const lightCount = 40;
    
    for (let i = 0; i < lightCount; i++) {
      const x = Math.random() * width;
      const y = skylineY - 200 + Math.random() * 180;
      const color = Math.random() > 0.5 ? 0xff6644 : (Math.random() > 0.5 ? 0x44ff88 : 0x4488ff);
      
      const light = scene.add.circle(x, y, 1 + Math.random() * 2, color, 0.8);
      light.setDepth(-1);
      
      scene.tweens.add({
        targets: light,
        alpha: { from: 0.8, to: 0.2 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
    }
  }

  private static createFloatingParticles(scene: Phaser.Scene, width: number) {
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * GAME_HEIGHT * 0.6;
      const size = 1 + Math.random() * 3;
      const color = Math.random() > 0.5 ? 0x4fc3f7 : (Math.random() > 0.5 ? 0xff6688 : 0x88ff88);
      
      const particle = scene.add.circle(x, y, size, color, 0.4);
      particle.setDepth(-1);
      
      scene.tweens.add({
        targets: particle,
        y: y - 100 - Math.random() * 200,
        x: x + (Math.random() - 0.5) * 100,
        alpha: 0,
        duration: 4000 + Math.random() * 4000,
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => {
          particle.setPosition(Math.random() * width, GAME_HEIGHT * 0.6 + Math.random() * 100);
          particle.setAlpha(0.4);
        },
      });
    }
  }

  private static createScanlines(scene: Phaser.Scene, width: number) {
    const scanlines = scene.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.1);
    
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      scanlines.lineBetween(0, y, width, y);
    }
    
    scanlines.setDepth(100);
    scanlines.setAlpha(0.5);
  }

  private static createAmbientGlow(scene: Phaser.Scene, width: number) {
    const glowCount = 5;
    
    for (let i = 0; i < glowCount; i++) {
      const x = Math.random() * width;
      const y = GAME_HEIGHT * 0.3 + Math.random() * GAME_HEIGHT * 0.3;
      const radius = 100 + Math.random() * 200;
      const color = i % 2 === 0 ? 0x4400ff : 0xff0066;
      
      const glow = scene.add.graphics();
      for (let j = 5; j >= 0; j--) {
        const r = radius * (j / 5);
        const alpha = 0.02 * (6 - j);
        glow.fillStyle(color, alpha);
        glow.fillCircle(x, y, r);
      }
      glow.setDepth(-2);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.6, to: 0.3 },
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
    }
  }

  private static createSeededRandom(seed: number) {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }
}
