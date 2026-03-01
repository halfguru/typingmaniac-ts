import Phaser from 'phaser';
import type { PowerType, GameState as GState } from '../types';
import { wordService } from '../services/WordService';
import { audioService } from '../services/AudioService';
import { BackgroundRenderer } from '../services/BackgroundRenderer';
import { GameConfigService } from '../services/GameConfigService';
import { EffectManager } from '../managers/EffectManager';
import { themeService } from '../services/ThemeService';
import { WizardRenderer } from '../services/WizardRenderer';
import {
  GAME_AREA_WIDTH,
  GAME_HEIGHT,
  DANGER_ZONE_Y,
  POWER_KEYS,
  FONT_FAMILY,
  FONT_SIZE,
  POWER_COLORS,
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
  iceActive = false;
  iceTimer = 0;
  slowActive = false;
  slowTimer = 0;
  inputText!: Phaser.GameObjects.Text;
  combo = 0;
  private levelStartScore = 0;
  private effects!: EffectManager;
  private wizard!: WizardRenderer;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.effects = new EffectManager(this);
    this.drawBackground();
    this.drawDangerZone();
    this.createWizard();
    this.drawInputArea();
    this.effects.createFadeOverlay();
    this.input.keyboard!.on('keydown', this.handleKeyDown, this);
    this.scene.launch('UIScene');
    this.events.emit('gameDataUpdate', this.getGameData());
  }

  createWizard() {
    this.wizard = new WizardRenderer(this);
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
      topGlow.fillStyle(themeService.getNumber('game.dangerGlow'), Math.max(0, alpha));
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
    const dangerColor = themeService.getNumber('accent.danger');

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
          glowLine.lineStyle(width, dangerColor, alpha);
          glowLine.lineBetween(0, zoneY - i * 2, GAME_AREA_WIDTH, zoneY - i * 2);
          glowLine.lineBetween(0, zoneY + i * 2, GAME_AREA_WIDTH, zoneY + i * 2);
        }
      },
    });

    this.effects.createEmberParticles(zoneY);
  }

  drawInputArea() {
    const containerW = 600;
    const containerH = 60;
    const containerX = GAME_AREA_WIDTH / 2 - containerW / 2;
    const containerY = GAME_HEIGHT - 90;

    const inputBg = this.add.graphics();
    inputBg.fillStyle(themeService.getNumber('bg.input'), 1);
    inputBg.fillRoundedRect(containerX, containerY, containerW, containerH, 12);
    inputBg.lineStyle(2, themeService.getNumber('ui.buttonBorder'), 0.6);
    inputBg.strokeRoundedRect(containerX, containerY, containerW, containerH, 12);
    inputBg.fillStyle(themeService.getNumber('ui.buttonBorder'), 0.1);
    inputBg.fillRoundedRect(containerX + 4, containerY + 4, containerW - 8, containerH / 2 - 4, 6);

    this.inputText = this.add.text(GAME_AREA_WIDTH / 2, containerY + containerH / 2, '', {
      fontFamily: FONT_FAMILY,
      fontSize: `${FONT_SIZE}px`,
      color: themeService.getText('text.primary'),
    });
    this.inputText.setOrigin(0.5, 0.5);
    this.inputText.setShadow(0, 0, themeService.getText('text.glow'), 10, true, true);
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
      this.wizard.onTyping();
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
      this.wizard.onTyping();
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
      audioService.playTypingError();
      if (targetWord) {
        targetWord.speed *= 1.5;
      }
      this.effects.showWrongWordPopup(targetWord);
      this.wizard.onWordFail();
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
      color: themeService.getText('text.danger'),
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

    this.effects.flashInputRed();
    audioService.playWordMissed();
  }

  updateInputDisplay() {
    this.inputText.setText(this.typedInput.toUpperCase());
    this.effects.flashInputBox(this.inputText);
    this.events.emit('gameDataUpdate', this.getGameData());
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

    this.effects.showPowerFlash(power !== 'none' ? POWER_COLORS[power] : 0xffffff);
    if (power !== 'none') {
      audioService.playPowerActivate(power as 'fire' | 'ice' | 'wind' | 'slow');
    }

    switch (power) {
      case 'fire':
        this.score += this.words.length * GameConfigService.getFirePointsPerWord();
        this.words.forEach(w => {
          this.effects.showFireParticles(w.x + w.letters.reduce((sum, l) => sum + l.width, 0) / 2, w.y);
          w.letters.forEach(l => l.destroy());
          w.container?.destroy();
          w.frozenIndicator?.destroy();
        });
        this.words = [];
        break;
      case 'ice':
        this.effects.showIceOverlay();
        this.iceActive = true;
        this.iceTimer = GameConfigService.getIceDuration();
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
        break;
      case 'slow':
        this.effects.showSlowOverlay();
        this.slowActive = true;
        this.slowFactor = GameConfigService.getSlowFactor();
        this.slowTimer = GameConfigService.getSlowDuration();
        break;
      case 'wind':
        this.effects.showWindEffect();
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

    this.effects.showWordCompleteEffect(wordCenterX, wordCenterY, word.power);
    this.effects.showBurstParticles(wordCenterX, wordCenterY, word.power);
    this.wizard.onWordSuccess();

    if (comboLevel) {
      this.effects.showComboPopup(word.x + 50, word.y, comboLevel.text, comboLevel.color);
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
    if (this.iceTimer > 0) {
      this.iceTimer -= delta;
      if (this.iceTimer <= 0) {
        this.iceActive = false;
        this.words.forEach(w => {
          w.frozen = false;
          if (w.frozenIndicator) {
            w.frozenIndicator.destroy();
            w.frozenIndicator = undefined;
          }
        });
        this.effects.hideIceOverlay();
      }
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowActive = false;
        this.slowFactor = 1;
        this.effects.hideSlowOverlay();
      }
    }
  }

  spawnWords(delta: number) {
    if (this.iceActive) return;

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
      color: themeService.getText('game.wordText'),
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

    container.fillStyle(themeService.getNumber('effects.shadow'), 0.4);
    container.fillRoundedRect(containerX + 3, containerY + 3, containerW, containerH, 10);
    container.fillStyle(POWER_COLORS[power], 1);
    container.fillRoundedRect(containerX, containerY, containerW, containerH, 10);
    container.lineStyle(2, themeService.getNumber('effects.glow'), power !== 'none' ? 0.3 : 0.15);
    container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
    container.fillStyle(themeService.getNumber('effects.glow'), power !== 'none' ? 0.2 : 0.1);
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
        this.effects.showMissedWordEffect(word);
        this.effects.showMissPopup(word.x + 50, word.y);
        this.wizard.onWordFail();
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
      color: themeService.getText('text.danger'),
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

  highlightTargetWord() {
    for (const word of this.words) {
      const isTarget = this.typedInput !== '' &&
        word.textValue.toLowerCase().startsWith(this.typedInput.toLowerCase()) &&
        word === this.findTargetWord();

      const matchedLen = isTarget ? this.typedInput.length : 0;

      for (let i = 0; i < word.letters.length; i++) {
        if (i < matchedLen) {
          word.letters[i].setColor(themeService.getText('game.wordMatched'));
        } else {
          word.letters[i].setColor(themeService.getText('game.wordText'));
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

    word.container.clear();
    
    word.container.fillStyle(themeService.getNumber('effects.shadow'), 0.4);
    word.container.fillRoundedRect(containerX + 3, containerY + 3, containerW, containerH, 10);
    word.container.fillStyle(POWER_COLORS[word.power], 1);
    word.container.fillRoundedRect(containerX, containerY, containerW, containerH, 10);
    word.container.lineStyle(2, themeService.getNumber('effects.glow'), word.power !== 'none' ? 0.3 : 0.15);
    word.container.strokeRoundedRect(containerX, containerY, containerW, containerH, 10);
    word.container.fillStyle(themeService.getNumber('effects.glow'), word.power !== 'none' ? 0.2 : 0.1);
    word.container.fillRoundedRect(containerX + 4, containerY + 3, containerW - 8, containerH / 2 - 3, 6);

    if (isFocused) {
      word.container.lineStyle(3, themeService.getNumber('ui.buttonBorder'), 1);
      word.container.strokeRoundedRect(containerX - 4, containerY - 4, containerW + 8, containerH + 8, 12);
    }
  }

  resetGame() {
    this.wizard.destroy();
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
    this.iceActive = false;
    this.iceTimer = 0;
    this.slowActive = false;
    this.slowTimer = 0;
    this.spawnTimer = 0;
    this.combo = 0;
    this.effects.clearOverlays();
    this.events.emit('gameReset');
    this.createWizard();
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
    this.iceActive = false;
    this.iceTimer = 0;
    this.slowActive = false;
    this.slowTimer = 0;
    this.slowFactor = 1;
    this.effects.clearOverlays();
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
}
