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
    this.createMagicCircle(scene, width);
    this.createFloatingRunes(scene, width);
    this.createFloatingCrystals(scene, width);
    this.createPotionBottles(scene, width);
    this.createMagicAura(scene, width);
    this.createMysticalFog(scene, width);
    this.createAmbientEnergy(scene, width);
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

    const createGlowingTome = (x: number, shelfIndex: number) => {
      const shelfY = 100 + shelfIndex * 130;
      const bookY = shelfY + 100 - 90;
      
      const tome = scene.add.graphics();
      tome.fillStyle(0x4a1a4a, 0.9);
      tome.fillRect(x, bookY, 16, 85);
      tome.lineStyle(1, 0xffd700, 0.4);
      tome.strokeRect(x, bookY, 16, 85);
      tome.fillStyle(0xffd700, 0.3);
      tome.fillRect(x + 2, bookY + 5, 12, 3);
      tome.fillRect(x + 2, bookY + 75, 12, 3);
      tome.setDepth(-4);

      const glow = scene.add.graphics();
      for (let i = 3; i >= 0; i--) {
        glow.fillStyle(0xffd700, 0.03 * (4 - i));
        glow.fillRoundedRect(x - 8 - i * 4, bookY - 8 - i * 4, 32 + i * 8, 101 + i * 8, 6);
      }
      glow.setDepth(-5);
      glow.setBlendMode(Phaser.BlendModes.ADD);

      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.7, to: 0.3 },
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      for (let i = 0; i < 3; i++) {
        const sparkle = scene.add.circle(
          x + 8 + (Math.random() - 0.5) * 20,
          bookY + 20 + Math.random() * 50,
          1,
          0xffd700,
          0.4
        );
        sparkle.setDepth(-3);

        scene.tweens.add({
          targets: sparkle,
          alpha: 0,
          scale: { from: 1, to: 0.5 },
          duration: 1500 + Math.random() * 500,
          repeat: -1,
          delay: i * 600 + Math.random() * 400,
          onRepeat: () => {
            sparkle.setPosition(
              x + 8 + (Math.random() - 0.5) * 20,
              bookY + 20 + Math.random() * 50
            );
            sparkle.setAlpha(0.4);
            sparkle.setScale(1);
          },
        });
      }
    };

    createGlowingTome(50, 1);
    createGlowingTome(100, 3);
    createGlowingTome(width - 130, 2);
    createGlowingTome(width - 80, 4);
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

  private static createMagicCircle(scene: Phaser.Scene, width: number) {
    const centerX = width / 2;
    const centerY = GAME_HEIGHT - 250;
    const circle = scene.add.graphics();
    
    circle.lineStyle(2, 0xffd700, 0.15);
    circle.strokeCircle(centerX, centerY, 200);
    circle.strokeCircle(centerX, centerY, 160);
    circle.strokeCircle(centerX, centerY, 120);
    
    circle.lineStyle(1, 0xffd700, 0.1);
    circle.strokeCircle(centerX, centerY, 180);
    circle.strokeCircle(centerX, centerY, 140);
    
    const hexSize = 100;
    circle.lineStyle(1, 0xffd700, 0.12);
    circle.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * hexSize;
      const y = centerY + Math.sin(angle) * hexSize;
      if (i === 0) circle.moveTo(x, y);
      else circle.lineTo(x, y);
    }
    circle.closePath();
    circle.strokePath();
    
    const alchemicalSymbols = ['☉', '☽', '🜁', '🜂', '🜃', '🜄'];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * 130;
      const y = centerY + Math.sin(angle) * 130;
      
      const symbol = scene.add.text(x, y, alchemicalSymbols[i], {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffd700',
      });
      symbol.setOrigin(0.5, 0.5);
      symbol.setAlpha(0.2);
      symbol.setDepth(-4);
      
      scene.tweens.add({
        targets: symbol,
        alpha: { from: 0.2, to: 0.35 },
        duration: 2000 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    
    circle.fillStyle(0xffd700, 0.05);
    circle.fillCircle(centerX, centerY, 200);
    circle.setDepth(-5);
    
    scene.tweens.add({
      targets: circle,
      alpha: { from: 0.8, to: 0.5 },
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private static createFloatingRunes(scene: Phaser.Scene, width: number) {
    const runeSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛋ'];
    const alchemicalSymbols = ['🜛', '🜚', '🜙', '⍟', '🜍', '🜎'];
    const allSymbols = [...runeSymbols, ...alchemicalSymbols];
    
    for (let i = 0; i < 18; i++) {
      const x = 80 + Math.random() * (width - 160);
      const y = 80 + Math.random() * (GAME_HEIGHT - 350);
      const symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      
      const rune = scene.add.text(x, y, symbol, {
        fontFamily: 'Arial',
        fontSize: `${16 + Math.random() * 24}px`,
        color: '#ffd700',
      });
      rune.setAlpha(0.15 + Math.random() * 0.2);
      rune.setDepth(-2);
      
      scene.tweens.add({
        targets: rune,
        y: y - 40 - Math.random() * 60,
        alpha: { from: rune.alpha, to: 0 },
        angle: { from: 0, to: (Math.random() - 0.5) * 20 },
        duration: 5000 + Math.random() * 4000,
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => {
          rune.setPosition(80 + Math.random() * (width - 160), GAME_HEIGHT - 150 + Math.random() * 80);
          rune.setAlpha(0.15 + Math.random() * 0.2);
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

  private static createFloatingCrystals(scene: Phaser.Scene, width: number) {
    const crystalData = [
      { x: width * 0.15, y: 280, color: 0xffa500, size: 22 },
      { x: width * 0.85, y: 320, color: 0xff6b35, size: 18 },
      { x: width * 0.25, y: 500, color: 0xffd700, size: 15 },
      { x: width * 0.75, y: 450, color: 0xcc7700, size: 20 },
    ];

    for (const data of crystalData) {
      const crystal = scene.add.graphics();
      
      crystal.fillStyle(data.color, 0.5);
      crystal.beginPath();
      crystal.moveTo(data.x, data.y - data.size);
      crystal.lineTo(data.x + data.size * 0.6, data.y);
      crystal.lineTo(data.x, data.y + data.size * 0.8);
      crystal.lineTo(data.x - data.size * 0.6, data.y);
      crystal.closePath();
      crystal.fillPath();
      
      crystal.lineStyle(1, 0xffffff, 0.2);
      crystal.strokePath();
      
      crystal.fillStyle(0xffffff, 0.15);
      crystal.beginPath();
      crystal.moveTo(data.x, data.y - data.size);
      crystal.lineTo(data.x + data.size * 0.3, data.y - data.size * 0.3);
      crystal.lineTo(data.x, data.y);
      crystal.lineTo(data.x - data.size * 0.3, data.y - data.size * 0.3);
      crystal.closePath();
      crystal.fillPath();
      
      crystal.setDepth(-3);

      const glow = scene.add.graphics();
      for (let i = 3; i >= 0; i--) {
        glow.fillStyle(data.color, 0.03 * (4 - i));
        glow.fillCircle(data.x, data.y, data.size + i * 8);
      }
      glow.setDepth(-4);
      glow.setBlendMode(Phaser.BlendModes.ADD);

      scene.tweens.add({
        targets: crystal,
        y: data.y - 15,
        duration: 3000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.6, to: 0.3 },
        scale: { from: 1, to: 1.1 },
        duration: 2000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      for (let i = 0; i < 3; i++) {
        const particle = scene.add.circle(
          data.x + (Math.random() - 0.5) * 30,
          data.y + data.size,
          1,
          0xffd700,
          0.3
        );
        particle.setDepth(-2);

        scene.tweens.add({
          targets: particle,
          y: data.y + data.size + 30 + Math.random() * 20,
          alpha: 0,
          duration: 2000 + Math.random() * 1000,
          repeat: -1,
          delay: i * 700 + Math.random() * 500,
          onRepeat: () => {
            particle.setPosition(
              data.x + (Math.random() - 0.5) * 30,
              data.y + data.size
            );
            particle.setAlpha(0.3);
          },
        });
      }
    }
  }

  private static createPotionBottles(scene: Phaser.Scene, width: number) {
    const potions = [
      { x: 180, y: 350, color: 0xffa500 },
      { x: width - 180, y: 400, color: 0xffd700 },
      { x: 200, y: 600, color: 0xff6b35 },
    ];

    for (const potion of potions) {
      const bottle = scene.add.graphics();
      
      bottle.fillStyle(0x4a3520, 0.6);
      bottle.fillRect(potion.x - 4, potion.y - 20, 8, 6);
      
      bottle.fillStyle(0x654321, 0.8);
      bottle.fillRoundedRect(potion.x - 10, potion.y - 14, 20, 28, 4);
      
      bottle.fillStyle(potion.color, 0.4);
      bottle.fillRoundedRect(potion.x - 8, potion.y - 10, 16, 22, 3);
      
      bottle.fillStyle(0xffffff, 0.1);
      bottle.fillRoundedRect(potion.x - 6, potion.y - 8, 4, 8, 2);
      
      bottle.setDepth(-3);

      const glow = scene.add.graphics();
      glow.fillStyle(potion.color, 0.08);
      glow.fillCircle(potion.x, potion.y, 25);
      glow.setDepth(-4);
      glow.setBlendMode(Phaser.BlendModes.ADD);

      scene.tweens.add({
        targets: bottle,
        y: potion.y - 8,
        duration: 2500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.8, to: 0.4 },
        duration: 1500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      for (let i = 0; i < 2; i++) {
        const bubble = scene.add.circle(
          potion.x + (Math.random() - 0.5) * 10,
          potion.y + 5,
          1.5,
          potion.color,
          0.4
        );
        bubble.setDepth(-2);

        scene.tweens.add({
          targets: bubble,
          y: potion.y - 15,
          alpha: 0,
          duration: 1500 + Math.random() * 500,
          repeat: -1,
          delay: i * 800 + Math.random() * 400,
          onRepeat: () => {
            bubble.setPosition(
              potion.x + (Math.random() - 0.5) * 10,
              potion.y + 5
            );
            bubble.setAlpha(0.4);
          },
        });
      }
    }
  }

  private static createMysticalFog(scene: Phaser.Scene, width: number) {
    const fogY = GAME_HEIGHT - 180;
    
    for (let i = 0; i < 5; i++) {
      const fog = scene.add.graphics();
      const fogWidth = 300 + Math.random() * 200;
      const fogX = Math.random() * width;
      
      for (let j = 5; j >= 0; j--) {
        const alpha = 0.02 * (6 - j);
        fog.fillStyle(0xffd700, alpha);
        fog.fillEllipse(fogX, fogY + Math.random() * 40, fogWidth + j * 30, 60 + j * 15);
      }
      
      fog.setDepth(-3);
      fog.setBlendMode(Phaser.BlendModes.ADD);

      scene.tweens.add({
        targets: fog,
        x: fog.x + (Math.random() > 0.5 ? 30 : -30),
        alpha: { from: 0.6, to: 0.3 },
        duration: 4000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 500,
      });
    }
  }

  private static createAmbientEnergy(scene: Phaser.Scene, width: number) {
    const centerX = width / 2;
    const centerY = GAME_HEIGHT - 250;

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 180;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      const particle = scene.add.circle(x, y, 0.8 + Math.random() * 1.2, 0xffd700, 0.25);
      particle.setDepth(-2);

      const targetAngle = angle + (Math.random() > 0.5 ? 1 : -1) * 0.5;
      const targetDistance = distance + (Math.random() - 0.5) * 50;
      const targetX = centerX + Math.cos(targetAngle) * targetDistance;
      const targetY = centerY + Math.sin(targetAngle) * targetDistance;

      scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY - 50,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          const newAngle = Math.random() * Math.PI * 2;
          const newDistance = 50 + Math.random() * 180;
          particle.setPosition(
            centerX + Math.cos(newAngle) * newDistance,
            centerY + Math.sin(newAngle) * newDistance
          );
          particle.setAlpha(0.25);
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
