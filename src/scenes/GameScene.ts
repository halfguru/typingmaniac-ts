import Phaser from 'phaser';
import type { PowerType, GameState as GState } from '../types';
import { wordService } from '../services/WordService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { GameConfigService } from '../services/GameConfigService';
import {
  GAME_AREA_WIDTH,
  GAME_WIDTH,
  GAME_HEIGHT,
  DANGER_ZONE_Y,
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
  private levelStartScore = 0;

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

    this.createDangerLineEffects(zoneY);
  }

  createDangerLineEffects(zoneY: number) {
    const glowLine = this.add.graphics();
    glowLine.setDepth(6);

    this.tweens.add({
      targets: { intensity: 0 },
      intensity: 1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        const target = tween.targets[0] as { intensity: number };
        const intensity = target.intensity;
        glowLine.clear();
        
        for (let i = 0; i < 8; i++) {
          const alpha = 0.15 * intensity * (1 - i * 0.1);
          const width = 3 + i * 2;
          glowLine.lineStyle(width, 0xff4444, alpha);
          glowLine.lineBetween(0, zoneY - i * 2, GAME_AREA_WIDTH, zoneY - i * 2);
          glowLine.lineBetween(0, zoneY + i * 2, GAME_AREA_WIDTH, zoneY + i * 2);
        }
      },
    });

    this.createEmberParticles(zoneY);
  }

  createEmberParticles(zoneY: number) {
    const emberCount = 15;
    
    for (let i = 0; i < emberCount; i++) {
      this.createEmber(zoneY, i * 150);
    }
  }

  createEmber(baseY: number, delay: number) {
    const baseX = Math.random() * GAME_AREA_WIDTH;
    
    const ember = this.add.circle(baseX, baseY, 2 + Math.random() * 3, 0xff6644, 0.8);
    ember.setDepth(7);
    ember.setAlpha(0);

    const animate = () => {
      const startX = Math.random() * GAME_AREA_WIDTH;
      const startY = baseY + Math.random() * 20;
      const size = 1 + Math.random() * 3;
      const color = Math.random() > 0.5 ? 0xff6644 : (Math.random() > 0.5 ? 0xffaa44 : 0xff4444);
      
      ember.setPosition(startX, startY);
      ember.setRadius(size);
      ember.setFillStyle(color);
      ember.setAlpha(0);

      this.tweens.add({
        targets: ember,
        y: startY - 60 - Math.random() * 40,
        x: startX + (Math.random() - 0.5) * 40,
        alpha: { from: 0.9, to: 0 },
        duration: 1500 + Math.random() * 1000,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.time.delayedCall(200 + Math.random() * 500, animate);
        },
      });
    };

    this.time.delayedCall(delay, animate);
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
      audioService.playKeypress();
      this.updateInputDisplay();
      return;
    }

    if (event.code === 'Enter') {
      this.submitWord();
      return;
    }

    if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
      this.typedInput += event.key.toLowerCase();
      audioService.playKeypress();
      this.updateInputDisplay();
    }
  }

  submitWord() {
    if (this.typedInput.length === 0) return;

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
    } else {
      this.showWrongWordPopup(targetWord);
      this.typedInput = '';
      this.updateInputDisplay();
    }
  }

  showWrongWordPopup(targetWord: WordObject | null) {
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

    const missText = this.add.text(x, y, 'MISS', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    missText.setOrigin(0, 0.5);
    missText.setDepth(100);
    missText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.tweens.add({
      targets: missText,
      y: y - 50,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => missText.destroy(),
    });

    this.flashInputRed();
    audioService.playWordMissed();
  }

  flashInputRed() {
    const containerW = 600;
    const containerH = 60;
    const containerX = GAME_AREA_WIDTH / 2 - containerW / 2;
    const containerY = GAME_HEIGHT - 90;

    const flash = this.add.graphics();
    flash.fillStyle(0xff4444, 0.5);
    flash.fillRoundedRect(containerX, containerY, containerW, containerH, 12);
    flash.setDepth(99);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
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
        this.score += this.words.length * GameConfigService.getFirePointsPerWord();
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
        this.powerTimer = GameConfigService.getIceDuration();
        break;
      case 'slow':
        this.showSlowOverlay();
        this.slowFactor = GameConfigService.getSlowFactor();
        this.powerTimer = GameConfigService.getSlowDuration();
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

    const comboLevel = GameConfigService.getComboLevel(this.combo);
    const basePoints = word.textValue.length * GameConfigService.getPointsPerLetter();
    const points = Math.floor(basePoints * (comboLevel?.multiplier || 1));
    this.score += points;
    this.wordsCompleted++;
    this.progressPct += GameConfigService.getProgressPctPerWord(this.level);
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
    const spawnDelay = Math.max(
      GameConfigService.getSpawnDelayBase() - this.level * GameConfigService.getSpawnDelayDecreasePerLevel(),
      GameConfigService.getMinSpawnDelay()
    ) * (1000 / 60);

    if (this.spawnTimer >= spawnDelay) {
      this.spawnTimer = 0;
      this.createWord();
    }
  }

  createWord() {
    const wordLength = Math.min(
      GameConfigService.getBaseWordLength() + Math.floor((this.level - 1) / GameConfigService.getWordLengthIncreasePerLevels()),
      GameConfigService.getMaxWordLength()
    );
    const textValue = wordService.getWord(wordLength);
    const speed = (GameConfigService.getBaseFallSpeed() + (this.level - 1) * GameConfigService.getSpeedIncreasePerLevel()) * (0.8 + Math.random() * 0.4);

    let power: PowerType = 'none';
    const dropRate = Math.min(
      GameConfigService.getPowerDropRateBase() + (this.level - 1) * GameConfigService.getPowerDropRateIncreasePerLevel(),
      GameConfigService.getPowerDropRateMax()
    );
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
    const padding = 14;
    const containerW = totalWidth + padding * 2;
    const containerH = 44;
    const centerX = x + totalWidth / 2;
    const containerX = centerX - containerW / 2;
    const containerY = y - 2;

    const container = this.add.graphics();
    
    const powerColors: Record<PowerType, number> = {
      none: 0x1a3a4a,
      fire: COLORS.POWER_FIRE,
      ice: COLORS.POWER_ICE,
      wind: COLORS.POWER_WIND,
      slow: COLORS.POWER_SLOW,
    };

    container.fillStyle(0x000000, 0.4);
    container.fillRoundedRect(containerX + 3, containerY + 3, containerW, containerH, 10);
    container.fillStyle(powerColors[power], 1);
    container.fillRoundedRect(containerX, containerY, containerW, containerH, 10);
    container.lineStyle(2, 0xffffff, power !== 'none' ? 0.3 : 0.15);
    container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
    container.fillStyle(0xffffff, power !== 'none' ? 0.2 : 0.1);
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
        this.showMissPopup(word.x + 50, word.y);
        audioService.playWordMissed();
        this.limitPct += GameConfigService.getProgressPctPerWord(this.level);
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

  showMissPopup(x: number, y: number) {
    const missText = this.add.text(x, y, 'MISS', {
      fontFamily: FONT_FAMILY,
      fontSize: '36px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    missText.setOrigin(0, 0.5);
    missText.setDepth(100);
    missText.setShadow(0, 0, '#ff0000', 10, true, true);

    this.tweens.add({
      targets: missText,
      y: y - 60,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => missText.destroy(),
    });
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
        } else {
          word.letters[i].setColor('#ffffff');
        }
      }

      this.redrawWordContainer(word, isTarget);
    }
  }

  redrawWordContainer(word: WordObject, isFocused: boolean) {
    if (!word.container) return;

    const totalWidth = word.letters.reduce((sum, l) => sum + l.width, 0);
    const padding = 14;
    const containerW = totalWidth + padding * 2;
    const containerH = 44;
    const centerX = word.x + totalWidth / 2;
    const containerX = centerX - containerW / 2;
    const containerY = word.y - 2;

    const powerColors: Record<PowerType, number> = {
      none: 0x1a3a4a,
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
    word.container.lineStyle(2, 0xffffff, word.power !== 'none' ? 0.3 : 0.15);
    word.container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
    word.container.fillStyle(0xffffff, word.power !== 'none' ? 0.2 : 0.1);
    word.container.fillRoundedRect(containerX + 4, containerY + 3, containerW - 8, containerH / 2 - 3, 6);

    if (isFocused) {
      word.container.lineStyle(3, 0x4fc3f7, 1);
      word.container.strokeRoundedRect(containerX - 4, containerY - 4, containerW + 8, containerH + 8, 12);
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
    this.levelStartScore = this.score;
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
    const levelScore = this.score - this.levelStartScore;
    return Math.floor((this.calculateAccuracy() / 100) * levelScore);
  }

  isErrorFree(): boolean {
    return this.wordsMissed === 0;
  }

  calculateLevelTotal(): number {
    return this.calculateAccuracyBonus();
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
