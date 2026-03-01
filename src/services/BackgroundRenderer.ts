import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { themeService } from './ThemeService';

export class BackgroundRenderer {
  static draw(scene: Phaser.Scene, width: number = GAME_WIDTH) {
    const themeName = themeService.getTheme();
    
    switch (themeName) {
      case 'alchemist':
        this.drawAlchemistBackground(scene, width);
        break;
      default:
        this.drawCyberpunkBackground(scene, width);
    }
  }

  private static drawCyberpunkBackground(scene: Phaser.Scene, width: number) {
    this.createBaseGradient(scene, width);
    this.createGridFloor(scene, width);
    this.createCitySilhouette(scene, width);
    this.createFloatingParticles(scene, width);
    this.createScanlines(scene, width);
    this.createAmbientGlow(scene, width);
  }

  private static drawAlchemistBackground(scene: Phaser.Scene, width: number) {
    this.createGrandLibrary(scene, width);
    this.createArches(scene, width);
    this.createFloatingRunes(scene, width);
    this.createMagicAura(scene, width);
    this.createDustMotes(scene, width);
  }

  private static createGrandLibrary(scene: Phaser.Scene, width: number) {
    const bg = scene.add.graphics();
    
    for (let y = 0; y < GAME_HEIGHT; y++) {
      const ratio = y / GAME_HEIGHT;
      const r = Math.floor(15 + ratio * 25);
      const g = Math.floor(10 + ratio * 18);
      const b = Math.floor(5 + ratio * 12);
      bg.fillStyle((r << 16) | (g << 8) | b, 1);
      bg.fillRect(0, y, width, 1);
    }
    bg.setDepth(-10);

    const floorY = GAME_HEIGHT - 100;
    for (let x = 0; x < width; x += 80) {
      const floorTile = scene.add.graphics();
      floorTile.fillStyle(0x2a1a08, 1);
      floorTile.fillRect(x, floorY, 78, 98);
      floorTile.lineStyle(2, 0x4a3020, 0.5);
      floorTile.strokeRect(x + 5, floorY + 5, 68, 88);
      floorTile.setDepth(-8);
    }

    const drawGrandBookshelf = (x: number, w: number, shelves: number) => {
      const shelf = scene.add.graphics();
      const woodDark = 0x2a1a0a;
      const woodLight = 0x4a3020;
      const shelfH = GAME_HEIGHT - 150;
      
      shelf.fillStyle(woodDark, 1);
      shelf.fillRect(x, 50, w, shelfH);
      shelf.fillStyle(woodLight, 1);
      shelf.fillRect(x + 3, 53, w - 6, shelfH - 6);
      
      shelf.lineStyle(3, 0x8b6914, 0.6);
      shelf.strokeRect(x, 50, w, shelfH);
      
      shelf.fillStyle(0xffd700, 0.15);
      for (let i = 0; i < 3; i++) {
        shelf.fillRect(x + 10 + i * 25, 55, 3, shelfH - 10);
      }

      const bookColors = [0x8b0000, 0x2e4a2e, 0x1a237e, 0x4a3728, 0x5d4037, 0x3e2723, 0x6b4423, 0x4a2c2a];
      const goldColors = [0xffd700, 0xdaa520, 0xb8860b];
      
      for (let s = 0; s < shelves; s++) {
        const shelfY = 100 + s * 130;
        shelf.fillStyle(woodDark, 1);
        shelf.fillRect(x + 5, shelfY + 100, w - 10, 12);
        shelf.fillStyle(woodLight, 0.5);
        shelf.fillRect(x + 5, shelfY + 100, w - 10, 3);
        
        let bookX = x + 12;
        while (bookX < x + w - 20) {
          const bookW = 12 + Math.random() * 18;
          const bookH = 85 + Math.random() * 15;
          const bookColor = bookColors[Math.floor(Math.random() * bookColors.length)];
          
          shelf.fillStyle(bookColor, 1);
          shelf.fillRect(bookX, shelfY + 100 - bookH, bookW, bookH);
          
          if (Math.random() > 0.7) {
            const gold = goldColors[Math.floor(Math.random() * goldColors.length)];
            shelf.fillStyle(gold, 0.8);
            shelf.fillRect(bookX + 2, shelfY + 100 - bookH + 5, bookW - 4, 3);
            shelf.fillRect(bookX + 2, shelfY + 100 - 10, bookW - 4, 3);
          }
          
          shelf.lineStyle(1, 0x000000, 0.3);
          shelf.strokeRect(bookX, shelfY + 100 - bookH, bookW, bookH);
          
          bookX += bookW + 3;
        }
      }
      
      shelf.setDepth(-5);
    };

    drawGrandBookshelf(0, 150, 6);
    drawGrandBookshelf(width - 150, 150, 6);

    const createGlobe = (x: number, y: number) => {
      const globe = scene.add.graphics();
      globe.fillStyle(0x8b4513, 1);
      globe.fillCircle(x, y + 25, 15);
      globe.fillStyle(0x654321, 1);
      globe.fillRect(x - 3, y - 40, 6, 50);
      globe.fillStyle(0x4169e1, 0.8);
      globe.fillCircle(x, y - 50, 40);
      globe.fillStyle(0x228b22, 0.6);
      globe.fillCircle(x - 10, y - 55, 15);
      globe.fillCircle(x + 15, y - 45, 10);
      globe.lineStyle(2, 0xffd700, 0.5);
      globe.strokeCircle(x, y - 50, 42);
      globe.setDepth(-4);
    };
    
    createGlobe(75, 200);
    createGlobe(width - 75, 200);
  }

  private static createArches(scene: Phaser.Scene, width: number) {
    const arch = scene.add.graphics();
    const stoneColor = 0x3d3020;
    const stoneLight = 0x5a4a35;
    const goldColor = 0xffd700;
    
    const drawArch = (centerX: number, archWidth: number) => {
      
      arch.fillStyle(stoneColor, 1);
      arch.beginPath();
      arch.moveTo(centerX - archWidth / 2 - 30, GAME_HEIGHT - 100);
      arch.lineTo(centerX - archWidth / 2 - 30, 100);
      arch.lineTo(centerX - archWidth / 2, 100);
      arch.lineTo(centerX - archWidth / 2, 100);
      arch.arc(centerX, 100, archWidth / 2, Math.PI, 0, false);
      arch.lineTo(centerX + archWidth / 2 + 30, GAME_HEIGHT - 100);
      arch.lineTo(centerX + archWidth / 2, GAME_HEIGHT - 100);
      arch.arc(centerX, 100, archWidth / 2, 0, Math.PI, false);
      arch.closePath();
      arch.fillPath();
      
      arch.lineStyle(4, stoneLight, 0.5);
      arch.beginPath();
      arch.moveTo(centerX - archWidth / 2 - 15, GAME_HEIGHT - 100);
      arch.lineTo(centerX - archWidth / 2 - 15, 115);
      arch.arc(centerX, 115, archWidth / 2 + 15, Math.PI, 0, false);
      arch.lineTo(centerX + archWidth / 2 + 15, GAME_HEIGHT - 100);
      arch.strokePath();

      for (let i = 0; i < 5; i++) {
        const runeY = 200 + i * 120;
        arch.fillStyle(goldColor, 0.4);
        arch.fillCircle(centerX - archWidth / 2 - 15, runeY, 8);
        arch.fillCircle(centerX + archWidth / 2 + 15, runeY, 8);
      }
    };

    drawArch(width / 2, width - 200);
    
    arch.setDepth(-6);
  }

  private static createFloatingRunes(scene: Phaser.Scene, width: number) {
    const runeSymbols = ['✧', '◈', '❈', '✦', '◆', '❖'];
    
    for (let i = 0; i < 12; i++) {
      const x = 100 + Math.random() * (width - 200);
      const y = 100 + Math.random() * (GAME_HEIGHT - 400);
      const symbol = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
      
      const rune = scene.add.text(x, y, symbol, {
        fontFamily: 'Arial',
        fontSize: `${20 + Math.random() * 30}px`,
        color: '#ffd700',
      });
      rune.setAlpha(0.3 + Math.random() * 0.3);
      rune.setDepth(-2);
      
      scene.tweens.add({
        targets: rune,
        y: y - 30 - Math.random() * 40,
        alpha: { from: rune.alpha, to: 0 },
        angle: { from: 0, to: (Math.random() - 0.5) * 30 },
        duration: 4000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          rune.setPosition(100 + Math.random() * (width - 200), GAME_HEIGHT - 200 + Math.random() * 100);
          rune.setAlpha(0.3 + Math.random() * 0.3);
          rune.setAngle(0);
        },
      });
    }
  }

  private static createMagicAura(scene: Phaser.Scene, width: number) {
    const centerX = width / 2;
    const centerY = GAME_HEIGHT / 2;

    const outerGlow = scene.add.graphics();
    for (let i = 10; i >= 0; i--) {
      const radius = 300 + i * 40;
      const alpha = 0.02 * (10 - i);
      outerGlow.fillStyle(0xffd700, alpha);
      outerGlow.fillCircle(centerX, centerY, radius);
    }
    outerGlow.setDepth(-7);
    outerGlow.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: outerGlow,
      alpha: { from: 0.6, to: 0.3 },
      scale: { from: 1, to: 1.1 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const innerGlow = scene.add.graphics();
    innerGlow.fillStyle(0xff8c00, 0.15);
    innerGlow.fillCircle(centerX, centerY + 200, 150);
    innerGlow.setDepth(-3);
    innerGlow.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: innerGlow,
      alpha: { from: 0.15, to: 0.25 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private static createDustMotes(scene: Phaser.Scene, width: number) {
    const moteCount = 30;
    
    for (let i = 0; i < moteCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * GAME_HEIGHT;
      const size = 0.5 + Math.random() * 1.5;
      
      const mote = scene.add.circle(x, y, size, 0xffffff, 0.2);
      mote.setDepth(-1);
      
      scene.tweens.add({
        targets: mote,
        x: x + (Math.random() - 0.5) * 100,
        y: y - 50 - Math.random() * 100,
        alpha: { from: 0.2, to: 0 },
        duration: 5000 + Math.random() * 5000,
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => {
          mote.setPosition(Math.random() * width, GAME_HEIGHT + 20);
          mote.setAlpha(0.2);
        },
      });
    }
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
    const gridColor = themeService.getNumber('grid.primary');
    
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
    
    cityGraphics.fillStyle(themeService.getNumber('bg.dark'), 1);
    
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
      
      cityGraphics.fillStyle(themeService.getNumber('bg.dark'), 1);
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
    const primaryColor = themeService.getNumber('grid.secondary');
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * GAME_HEIGHT * 0.6;
      const size = 1 + Math.random() * 3;
      const color = Math.random() > 0.5 ? primaryColor : (Math.random() > 0.5 ? 0xff6688 : 0x88ff88);
      
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
    scanlines.lineStyle(1, themeService.getNumber('effects.scanline'), 0.1);
    
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
