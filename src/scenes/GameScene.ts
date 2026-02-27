import Phaser from 'phaser';
import type { PowerType, GameState as GState } from '../types';
import { wordService } from '../services/WordService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import {
  GAME_AREA_WIDTH,
  GAME_WIDTH,
  GAME_HEIGHT,
  DANGER_ZONE_Y,
  BASE_FALL_SPEED,
  SPAWN_DELAY_BASE,
  LIMIT_PCT_PER_MISSED,
  PROGRESS_PCT_PER_WORD,
  POWER_DROP_RATE_BASE,
  POWER_DROP_RATE_PER_LEVEL,
  POWER_DROP_RATE_MAX,
  POWER_DURATION_ICE,
  POWER_DURATION_SLOW,
  SLOW_FACTOR,
  FIRE_POINTS_PER_WORD,
  POWER_KEYS,
  FONT_FAMILY,
  FONT_SIZE,
  COLORS,
} from '../config/constants';

interface WordObject {
  text: Phaser.GameObjects.Text;
  textValue: string;
  x: number;
  y: number;
  speed: number;
  frozen: boolean;
  power: PowerType;
  container?: Phaser.GameObjects.Graphics;
  letters: Phaser.GameObjects.Text[];
  frozenIndicator?: Phaser.GameObjects.Text;
}

export class GameScene extends Phaser.Scene {
  words: WordObject[] = [];
  typedInput = '';
  score = 0;
  level = 1;
  limitPct = 0;
  progressPct = 0;
  powerStack: PowerType[] = [];
  wordsCompleted = 0;
  wordsMissed = 0;
  gameState: GState = 'playing';
  spawnTimer = 0;
  slowFactor = 1;
  powerTimer = 0;
  activePower: PowerType = 'none';
  inputText!: Phaser.GameObjects.Text;
  combo = 0;
  private slowOverlay?: Phaser.GameObjects.Graphics;
  private iceOverlay?: Phaser.GameObjects.Graphics;

  private readonly COMBO_LEVELS = [
    { min: 1, text: 'GOOD', color: '#4CAF50', multiplier: 1.2 },
    { min: 3, text: 'GREAT', color: '#2196F3', multiplier: 1.5 },
    { min: 5, text: 'PERFECT', color: '#FF9800', multiplier: 2 },
    { min: 8, text: 'FANTASTIC', color: '#E91E63', multiplier: 3 },
  ];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.drawBackground();
    this.drawDangerZone();
    this.drawInputArea();
    this.createFadeOverlay();
    this.input.keyboard!.on('keydown', this.handleKeyDown, this);
    this.scene.launch('UIScene');
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  drawBackground() {
    BackgroundRenderer.draw(this, GAME_AREA_WIDTH);
  }

  getGameData() {
    return {
      score: this.score,
      level: this.level,
      limitPct: this.limitPct,
      progressPct: this.progressPct,
      powerStack: this.powerStack,
      wordsCompleted: this.wordsCompleted,
      wordsMissed: this.wordsMissed,
      input: this.typedInput,
      gameState: this.gameState,
    };
  }

  drawDangerZone() {
    const zoneHeight = 80;
    const zoneY = DANGER_ZONE_Y;

    const zoneBg = this.add.graphics();
    const gradientSteps = 20;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const alpha = 0.6 * (1 - ratio);
      const r = Math.floor(200 - ratio * 80);
      const g = Math.floor(60 - ratio * 40);
      const b = Math.floor(60 - ratio * 40);
      const color = (r << 16) | (g << 8) | b;
      zoneBg.fillStyle(color, alpha);
      zoneBg.fillRect(0, zoneY + (ratio * zoneHeight), GAME_AREA_WIDTH, zoneHeight / gradientSteps + 1);
    }
    zoneBg.setDepth(5);

    const topGlow = this.add.graphics();
    for (let i = 0; i < 15; i++) {
      const alpha = 0.4 - i * 0.025;
      topGlow.fillStyle(0xff6644, Math.max(0, alpha));
      topGlow.fillRect(0, zoneY - i * 3, GAME_AREA_WIDTH, 3);
    }
    topGlow.setDepth(6);

    const coreLine = this.add.graphics();
    coreLine.fillStyle(0xff8844, 1);
    coreLine.fillRect(0, zoneY - 2, GAME_AREA_WIDTH, 4);
    coreLine.fillStyle(0xffcc88, 0.8);
    coreLine.fillRect(0, zoneY - 1, GAME_AREA_WIDTH, 2);
    coreLine.setDepth(7);

    this.tweens.add({
      targets: topGlow,
      alpha: { from: 1, to: 0.6 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: coreLine,
      alpha: { from: 1, to: 0.7 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.createFlameParticles(zoneY);
  }

  createFlameParticles(zoneY: number) {
    const flameCount = 25;
    
    for (let i = 0; i < flameCount; i++) {
      const x = (GAME_AREA_WIDTH / flameCount) * i + Math.random() * (GAME_AREA_WIDTH / flameCount);
      this.createFlame(x, zoneY);
    }
  }

  createFlame(baseX: number, baseY: number) {
    const flame = this.add.graphics();
    flame.setDepth(8);

    const animData = { progress: 0 };

    const animate = () => {
      animData.progress = 0;
      const targetX = baseX + (Math.random() - 0.5) * 10;
      const duration = 200 + Math.random() * 300;
      const scale = 0.5 + Math.random() * 0.5;

      this.tweens.add({
        targets: animData,
        progress: 1,
        duration: duration,
        onUpdate: () => {
          const p = animData.progress;
          const currentScale = scale * (1 - p * 0.5);
          const currentAlpha = 1 - p * 0.7;
          const offsetY = p * 20;
          const offsetX = (targetX - baseX) * p;
          
          flame.clear();
          const height = 20 + currentScale * 15;
          const width = 8 + currentScale * 4;

          for (let i = 0; i < 5; i++) {
            const layerAlpha = currentAlpha * (1 - i * 0.15);
            const layerHeight = height * (1 - i * 0.1);
            const layerWidth = width * (1 - i * 0.15);
            
            const r = 255;
            const g = Math.floor(100 + i * 30);
            const b = Math.floor(30 + i * 20);
            const color = (r << 16) | (g << 8) | b;
            
            flame.fillStyle(color, layerAlpha);
            flame.fillTriangle(
              baseX + offsetX, baseY - layerHeight - offsetY,
              baseX + offsetX - layerWidth / 2, baseY - offsetY,
              baseX + offsetX + layerWidth / 2, baseY - offsetY
            );
          }
        },
        onComplete: () => {
          animate();
        },
      });
    };

    animate();
  }

  drawInputArea() {
    const containerW = 600;
    const containerH = 60;
    const containerX = GAME_AREA_WIDTH / 2 - containerW / 2;
    const containerY = GAME_HEIGHT - 90;

  
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x050a12, 1);
    inputBg.fillRoundedRect(containerX, containerY, containerW, containerH, 12);
    inputBg.lineStyle(2, 0x4fc3f7, 0.6);
    inputBg.strokeRoundedRect(containerX, containerY, containerW, containerH, 12);
    inputBg.fillStyle(0x4fc3f7, 0.1);
    inputBg.fillRoundedRect(containerX + 4, containerY + 4, containerW - 8, containerH / 2 - 4, 6);

  
    this.inputText = this.add.text(GAME_AREA_WIDTH / 2, containerY + containerH / 2, '', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: '#4fc3f7',
    });
    this.inputText.setOrigin(0.5, 0.5);
    this.inputText.setShadow(0, 0, '#4fc3f7', 10, true, true);
  }

  private fadeOverlay?: Phaser.GameObjects.Rectangle;

  createFadeOverlay() {
    this.fadeOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1);
    this.fadeOverlay.setDepth(2000);

    this.tweens.add({
      targets: this.fadeOverlay,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.gameState === 'gameOver') {
      if (event.code === 'Space') {
        this.resetGame();
      }
      return;
    }

    if (this.gameState === 'levelComplete') {
      if (event.code === 'Enter' || event.code === 'Space') {
        this.continueAfterLevelComplete();
      }
      return;
    }

    if (this.gameState !== 'playing') return;

    if (event.key === '1' && this.powerStack.length < 6) {
      this.powerStack.push('fire');
      this.events.emit('gameDataUpdate', this.getGameData());
      return;
    }
    if (event.key === '2' && this.powerStack.length < 6) {
      this.powerStack.push('ice');
      this.events.emit('gameDataUpdate', this.getGameData());
      return;
    }
    if (event.key === '3' && this.powerStack.length < 6) {
      this.powerStack.push('wind');
      this.events.emit('gameDataUpdate', this.getGameData());
      return;
    }
    if (event.key === '4' && this.powerStack.length < 6) {
      this.powerStack.push('slow');
      this.events.emit('gameDataUpdate', this.getGameData());
      return;
    }

    if (event.key === 'Backspace') {
      this.typedInput = this.typedInput.slice(0, -1);
      this.updateInputDisplay();
      return;
    }

    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      this.typedInput += event.key.toLowerCase();
      audioService.playKeypress();
      this.updateInputDisplay();
      this.checkWordMatch();
    }
  }

  updateInputDisplay() {
    this.inputText.setText(this.typedInput.toUpperCase());
    this.flashInputBox();
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  flashInputBox() {
    this.tweens.add({
      targets: this.inputText,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 60,
      yoyo: true,
      ease: 'Power1',
    });
  }

  checkWordMatch() {
    const powerType = POWER_KEYS[this.typedInput.toUpperCase()];
    if (powerType && this.hasPowerInStack(powerType)) {
      this.activatePower(powerType);
      this.typedInput = '';
      this.updateInputDisplay();
      return;
    }

    const targetWord = this.findTargetWord();
    if (targetWord && targetWord.textValue.toLowerCase() === this.typedInput.toLowerCase()) {
      this.onWordComplete(targetWord);
    }
  }

  hasPowerInStack(power: PowerType): boolean {
    return this.powerStack.includes(power);
  }

  removePowerFromStack(power: PowerType) {
    const idx = this.powerStack.indexOf(power);
    if (idx >= 0) {
      this.powerStack.splice(idx, 1);
    }
  }

  activatePower(power: PowerType) {
    this.removePowerFromStack(power);
    this.activePower = power;

    const powerColors: Record<PowerType, number> = {
      none: 0xffffff,
      fire: COLORS.POWER_FIRE,
      ice: COLORS.POWER_ICE,
      wind: COLORS.POWER_WIND,
      slow: COLORS.POWER_SLOW,
    };

    if (this.iceOverlay) {
      this.iceOverlay.destroy();
      this.iceOverlay = undefined;
    }
    if (this.slowOverlay) {
      this.slowOverlay.destroy();
      this.slowOverlay = undefined;
    }
    this.words.forEach(w => {
      w.frozen = false;
      w.frozenIndicator?.destroy();
      w.frozenIndicator = undefined;
    });
    this.slowFactor = 1;

    this.showPowerFlash(powerColors[power]);
    if (power !== 'none') {
      audioService.playPowerActivate(power as 'fire' | 'ice' | 'wind' | 'slow');
    }

    switch (power) {
      case 'fire':
        this.score += this.words.length * FIRE_POINTS_PER_WORD;
        this.words.forEach(w => {
          this.showFireParticles(w.x + w.letters.reduce((sum, l) => sum + l.width, 0) / 2, w.y);
          w.letters.forEach(l => l.destroy());
          w.container?.destroy();
          w.frozenIndicator?.destroy();
        });
        this.words = [];
        break;
      case 'ice':
        this.showIceOverlay();
        this.words.forEach(w => {
          w.frozen = true;
          const totalWidth = w.letters.reduce((sum, l) => sum + l.width, 0);
          w.frozenIndicator = this.add.text(w.x + totalWidth / 2, w.y - 25, '❄️', {
            fontFamily: FONT_FAMILY,
            fontSize: '20px',
          });
          w.frozenIndicator.setOrigin(0.5, 0.5);
          w.frozenIndicator.setDepth(2);
        });
        this.powerTimer = POWER_DURATION_ICE;
        break;
      case 'slow':
        this.showSlowOverlay();
        this.slowFactor = SLOW_FACTOR;
        this.powerTimer = POWER_DURATION_SLOW;
        break;
      case 'wind':
        this.showWindEffect();
        this.limitPct = 0;
        break;
    }

    this.events.emit('gameDataUpdate', this.getGameData());
  }

  findTargetWord(): WordObject | null {
    let target: WordObject | null = null;
    let targetY = -1;

    for (const word of this.words) {
      if (word.textValue.toLowerCase().startsWith(this.typedInput.toLowerCase())) {
        if (word.y > targetY) {
          targetY = word.y;
          target = word;
        }
      }
    }

    return target;
  }

  onWordComplete(word: WordObject) {
    this.combo++;

    const comboLevel = this.getComboLevel();
    const basePoints = word.textValue.length * 10;
    const points = Math.floor(basePoints * (comboLevel?.multiplier || 1));
    this.score += points;
    this.wordsCompleted++;
    this.progressPct += PROGRESS_PCT_PER_WORD;
    if (this.progressPct > 100) this.progressPct = 100;

    audioService.playWordComplete();
    if (comboLevel) {
      audioService.playCombo(this.combo);
    }

    const wordCenterX = word.x + word.letters.reduce((sum, l) => sum + l.width, 0) / 2;
    const wordCenterY = word.y;

    this.showWordCompleteEffect(wordCenterX, wordCenterY, word.power);
    this.showBurstParticles(wordCenterX, wordCenterY, word.power);

    if (comboLevel) {
      this.showComboPopup(word.x + 50, word.y, comboLevel.text, comboLevel.color);
    }

    if (word.power !== 'none' && this.powerStack.length < 6) {
      this.powerStack.push(word.power);
    }

    word.letters.forEach(l => l.destroy());
    word.container?.destroy();
    word.frozenIndicator?.destroy();
    this.words = this.words.filter(w => w !== word);

    this.typedInput = '';
    this.updateInputDisplay();

    if (this.progressPct >= 100 && this.gameState === 'playing') {
      this.gameState = 'levelComplete';
      audioService.playLevelComplete();
    }

    this.events.emit('gameDataUpdate', this.getGameData());
  }

  getComboLevel(): { text: string; color: string; multiplier: number } | null {
    for (let i = this.COMBO_LEVELS.length - 1; i >= 0; i--) {
      if (this.combo >= this.COMBO_LEVELS[i].min) {
        return this.COMBO_LEVELS[i];
      }
    }
    return null;
  }

  showComboPopup(x: number, y: number, text: string, color: string) {
    const popup = this.add.text(x, y, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: color,
      fontStyle: 'bold',
    });
    popup.setOrigin(0, 0.5);
    popup.setDepth(100);

    this.tweens.add({
      targets: popup,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => popup.destroy(),
    });
  }

  update(_time: number, delta: number) {
    if (this.gameState !== 'playing') return;

    this.updatePowerTimer(delta);
    this.spawnWords(delta);
    this.moveWords(delta);
    this.checkMissedWords();
    this.highlightTargetWord();
  }

  updatePowerTimer(delta: number) {
    if (this.powerTimer > 0) {
      this.powerTimer -= delta;
      if (this.powerTimer <= 0) {
        const wasIce = this.activePower === 'ice';
        const wasSlow = this.activePower === 'slow';
        this.activePower = 'none';
        this.slowFactor = 1;
        this.words.forEach(w => {
          w.frozen = false;
          if (w.frozenIndicator) {
            w.frozenIndicator.destroy();
            w.frozenIndicator = undefined;
          }
        });
        if (wasIce) {
          this.hideIceOverlay();
        }
        if (wasSlow) {
          this.hideSlowOverlay();
        }
      }
    }
  }

  spawnWords(delta: number) {
    if (this.activePower === 'ice') return;

    this.spawnTimer += delta;
    const spawnDelay = Math.max(SPAWN_DELAY_BASE - this.level * 5, 30) * (1000 / 60);

    if (this.spawnTimer >= spawnDelay) {
      this.spawnTimer = 0;
      this.createWord();
    }
  }

  createWord() {
    const wordLength = Math.min(4 + Math.floor((this.level - 1) / 3), 10);
    const textValue = wordService.getWord(wordLength);
    const speed = (BASE_FALL_SPEED + (this.level - 1) * 0.15) * (0.8 + Math.random() * 0.4);

    let power: PowerType = 'none';
    const dropRate = Math.min(POWER_DROP_RATE_BASE + (this.level - 1) * POWER_DROP_RATE_PER_LEVEL, POWER_DROP_RATE_MAX);
    if (Math.random() < dropRate) {
      const powers: PowerType[] = ['fire', 'ice', 'wind', 'slow'];
      power = powers[Math.floor(Math.random() * powers.length)];
    }

    const x = Math.random() * (GAME_AREA_WIDTH - 225) + 30;
    const y = -45;

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: '#ffffff',
    };

    const letters: Phaser.GameObjects.Text[] = [];
    let letterX = x;
    for (const char of textValue.toUpperCase()) {
      const letterText = this.add.text(letterX, y, char, style);
      letterText.setAlpha(0);
      letters.push(letterText);
      letterX += letterText.width;
    }

    const totalWidth = letterX - x;
    let container: Phaser.GameObjects.Graphics | undefined;
    if (power !== 'none') {
      const powerColors: Record<PowerType, number> = {
        none: 0,
        fire: COLORS.POWER_FIRE,
        ice: COLORS.POWER_ICE,
        wind: COLORS.POWER_WIND,
        slow: COLORS.POWER_SLOW,
      };
      const padding = 14;
      const containerW = totalWidth + padding * 2;
      const containerH = 44;
      const centerX = x + totalWidth / 2;
      const containerX = centerX - containerW / 2;
      const containerY = y - 2;

      container = this.add.graphics();
      container.fillStyle(0x000000, 0.4);
      container.fillRoundedRect(containerX + 3, containerY + 3, containerW, containerH, 10);
      container.fillStyle(powerColors[power], 1);
      container.fillRoundedRect(containerX, containerY, containerW, containerH, 10);
      container.lineStyle(2, 0xffffff, 0.3);
      container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
      container.fillStyle(0xffffff, 0.2);
      container.fillRoundedRect(containerX + 4, containerY + 3, containerW - 8, containerH / 2 - 3, 6);

      container.setDepth(0);
      container.setAlpha(0);
      letters.forEach(l => l.setDepth(1));

      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 200,
        ease: 'Power2',
      });
    }

    this.tweens.add({
      targets: letters,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
    });

    const placeholderText = this.add.text(x, y, '', style);

    this.words.push({
      text: placeholderText,
      textValue,
      x,
      y,
      speed,
      frozen: false,
      power,
      container,
      letters,
    });
  }

  moveWords(delta: number) {
    const deltaSec = delta / 1000;
    for (const word of this.words) {
      if (!word.frozen) {
        word.y += word.speed * this.slowFactor * 60 * deltaSec;
        word.letters.forEach(l => l.setY(word.y));
        if (word.container && word.power !== 'none') {
          const totalWidth = word.letters.reduce((sum, l) => sum + l.width, 0);
          const padding = 14;
          const containerW = totalWidth + padding * 2;
          const containerH = 44;
          const centerX = word.x + totalWidth / 2;
          const containerX = centerX - containerW / 2;
          const containerY = word.y - 2;

          const powerColors: Record<PowerType, number> = {
            none: 0,
            fire: COLORS.POWER_FIRE,
            ice: COLORS.POWER_ICE,
            wind: COLORS.POWER_WIND,
            slow: COLORS.POWER_SLOW,
          };

          word.container.clear();
          word.container.fillStyle(0x000000, 0.4);
          word.container.fillRoundedRect(containerX + 3, containerY + 3, containerW, containerH, 10);
          word.container.fillStyle(powerColors[word.power], 1);
          word.container.fillRoundedRect(containerX, containerY, containerW, containerH, 10);
          word.container.lineStyle(2, 0xffffff, 0.3);
          word.container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
          word.container.fillStyle(0xffffff, 0.2);
          word.container.fillRoundedRect(containerX + 4, containerY + 3, containerW - 8, containerH / 2 - 3, 6);
        }
      }
    }
  }

  checkMissedWords() {
    const toRemove: WordObject[] = [];

    for (const word of this.words) {
      if (word.y + FONT_SIZE >= DANGER_ZONE_Y) {
        this.wordsMissed++;
        this.combo = 0;
        this.showMissedWordEffect(word);
        audioService.playWordMissed();
        this.limitPct += LIMIT_PCT_PER_MISSED;
        if (this.limitPct >= 100) {
          this.limitPct = 100;
          this.gameState = 'gameOver';
          audioService.playGameOver();
          audioService.stopMusic();
        }
        toRemove.push(word);
      }
    }

    for (const word of toRemove) {
      word.letters.forEach(l => l.destroy());
      word.container?.destroy();
      word.frozenIndicator?.destroy();
      this.words = this.words.filter(w => w !== word);
    }

    if (toRemove.length > 0) {
      this.events.emit('gameDataUpdate', this.getGameData());
    }
  }

  showMissedWordEffect(word: WordObject) {
    const flash = this.add.circle(word.x + 30, word.y, 60, 0xff4444, 0.8);
    this.tweens.add({
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

      this.tweens.add({
        targets: letter,
        y: letterY + 100,
        alpha: 0,
        angle: (Math.random() - 0.5) * 60,
        duration: 400,
        ease: 'Power2',
      });
    }

    this.cameras.main.shake(150, 0.005);
  }

  highlightTargetWord() {
    for (const word of this.words) {
      const isTarget = this.typedInput !== '' &&
        word.textValue.toLowerCase().startsWith(this.typedInput.toLowerCase()) &&
        word === this.findTargetWord();

      const matchedLen = isTarget ? this.typedInput.length : 0;

      for (let i = 0; i < word.letters.length; i++) {
        if (i < matchedLen) {
          word.letters[i].setColor('#4CAF50');
        } else if (isTarget) {
          word.letters[i].setColor('#4fc3f7');
        } else if (word.frozen) {
          word.letters[i].setColor('#a8e6ff');
        } else {
          word.letters[i].setColor('#ffffff');
        }
      }
    }
  }

  resetGame() {
    this.words.forEach(w => {
      w.letters.forEach(l => l.destroy());
      w.container?.destroy();
      w.frozenIndicator?.destroy();
    });
    this.words = [];
    this.typedInput = '';
    this.score = 0;
    this.level = 1;
    this.limitPct = 0;
    this.progressPct = 0;
    this.wordsCompleted = 0;
    this.wordsMissed = 0;
    this.powerStack = [];
    this.gameState = 'playing';
    this.slowFactor = 1;
    this.powerTimer = 0;
    this.activePower = 'none';
    this.spawnTimer = 0;
    this.combo = 0;
    this.slowOverlay?.destroy();
    this.slowOverlay = undefined;
    this.iceOverlay?.destroy();
    this.iceOverlay = undefined;
    this.events.emit('gameReset');
    this.updateInputDisplay();
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  continueAfterLevelComplete() {
    if (this.gameState !== 'levelComplete') return;

    this.score += this.calculateLevelTotal();
    this.level++;
    this.progressPct = 0;
    this.limitPct = 0;
    this.wordsCompleted = 0;
    this.wordsMissed = 0;
    this.combo = 0;
    this.words.forEach(w => {
      w.letters.forEach(l => l.destroy());
      w.container?.destroy();
      w.frozenIndicator?.destroy();
    });
    this.words = [];
    this.typedInput = '';
    this.spawnTimer = 0;
    this.activePower = 'none';
    this.powerTimer = 0;
    this.slowFactor = 1;
    this.slowOverlay?.destroy();
    this.slowOverlay = undefined;
    this.iceOverlay?.destroy();
    this.iceOverlay = undefined;
    this.gameState = 'playing';
    this.updateInputDisplay();
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  calculateAccuracy(): number {
    const total = this.wordsCompleted + this.wordsMissed;
    if (total === 0) return 100;
    return (this.wordsCompleted / total) * 100;
  }

  calculateAccuracyBonus(): number {
    return Math.floor((this.calculateAccuracy() / 100) * this.level * 10);
  }

  isErrorFree(): boolean {
    return this.wordsMissed === 0;
  }

  calculateErrorFreeBonus(): number {
    return this.isErrorFree() ? this.level * 20 : 0;
  }

  calculateLevelTotal(): number {
    return this.calculateAccuracyBonus() + this.calculateErrorFreeBonus();
  }

  showPowerFlash(color: number) {
    const flash = this.add.rectangle(GAME_AREA_WIDTH / 2, GAME_HEIGHT / 2, GAME_AREA_WIDTH, GAME_HEIGHT, color, 0.5);
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
  }

  showFireParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const particle = this.add.circle(
        x + (Math.random() - 0.5) * 60,
        y + (Math.random() - 0.5) * 30,
        4 + Math.random() * 6,
        COLORS.POWER_FIRE,
        1
      );
      particle.setDepth(100);
      this.tweens.add({
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
    this.iceOverlay = this.add.graphics();
    this.iceOverlay.fillStyle(COLORS.POWER_ICE, 0.15);
    this.iceOverlay.fillRect(0, 0, GAME_AREA_WIDTH, GAME_HEIGHT);
    this.iceOverlay.setDepth(49);
  }

  hideIceOverlay() {
    if (this.iceOverlay) {
      this.tweens.add({
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
    this.slowOverlay = this.add.graphics();
    const cx = GAME_AREA_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    for (let i = 0; i < 5; i++) {
      const radius = maxRadius * (1 - i * 0.15);
      const alpha = 0.05 + i * 0.03;
      this.slowOverlay.fillStyle(COLORS.POWER_SLOW, alpha);
      this.slowOverlay.fillCircle(cx, cy, radius);
    }
    this.slowOverlay.setDepth(49);
  }

  hideSlowOverlay() {
    if (this.slowOverlay) {
      this.tweens.add({
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
    const windLines: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < 12; i++) {
      const line = this.add.graphics();
      line.lineStyle(3, COLORS.POWER_WIND, 0.6);
      const y = Math.random() * GAME_HEIGHT;
      const startX = -100;
      const length = 150 + Math.random() * 150;
      line.lineBetween(startX, y, startX + length, y);
      line.setDepth(50);
      windLines.push(line);
      this.tweens.add({
        targets: line,
        x: GAME_AREA_WIDTH + 200,
        duration: 600 + Math.random() * 300,
        ease: 'Power2',
        onComplete: () => line.destroy(),
      });
    }
  }

  showWordCompleteEffect(x: number, y: number, power: PowerType) {
    const ring = this.add.circle(x, y, 20, 0xffffff, 0.6);
    ring.setDepth(100);
    this.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => ring.destroy(),
    });

    if (power !== 'none') {
      const powerColors: Record<PowerType, number> = {
        none: 0xffffff,
        fire: COLORS.POWER_FIRE,
        ice: COLORS.POWER_ICE,
        wind: COLORS.POWER_WIND,
        slow: COLORS.POWER_SLOW,
      };
      const glow = this.add.circle(x, y, 30, powerColors[power], 0.4);
      glow.setDepth(99);
      this.tweens.add({
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
    const powerColors: Record<PowerType, number> = {
      none: 0x4CAF50,
      fire: COLORS.POWER_FIRE,
      ice: COLORS.POWER_ICE,
      wind: COLORS.POWER_WIND,
      slow: COLORS.POWER_SLOW,
    };
    const color = powerColors[power];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      const size = 3 + Math.random() * 4;

      const particle = this.add.circle(x, y, size, color, 1);
      particle.setDepth(100);

      const targetX = x + Math.cos(angle) * speed;
      const targetY = y + Math.sin(angle) * speed;

      this.tweens.add({
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
      const spark = this.add.rectangle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        2,
        8 + Math.random() * 8,
        0xffffff,
        0.8
      );
      spark.setDepth(100);
      spark.setRotation(Math.random() * Math.PI);

      this.tweens.add({
        targets: spark,
        y: spark.y - 40 - Math.random() * 40,
        alpha: 0,
        duration: 550,
        ease: 'Power2',
        onComplete: () => spark.destroy(),
      });
    }
  }
}
