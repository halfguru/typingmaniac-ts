export interface WordsPerLevelConfig {
  minLevel: number;
  maxLevel: number;
  words: number;
}

export interface ComboLevelConfig {
  minWords: number;
  text: string;
  multiplier: number;
}

export interface ProgressionConfig {
  wordsPerLevel: WordsPerLevelConfig[];
}

export interface ScoringConfig {
  pointsPerLetter: number;
  firePointsPerWord: number;
}

export interface ComboConfig {
  levels: ComboLevelConfig[];
}

export interface DifficultyConfig {
  baseFallSpeed: number;
  speedIncreasePerLevel: number;
  spawnDelayBase: number;
  spawnDelayDecreasePerLevel: number;
  minSpawnDelay: number;
  limitPctPerMissed: number;
}

export interface PowersConfig {
  dropRateBase: number;
  dropRateIncreasePerLevel: number;
  dropRateMax: number;
  iceDuration: number;
  slowDuration: number;
  slowFactor: number;
}

export interface WordGenerationConfig {
  baseWordLength: number;
  wordLengthIncreasePerLevels: number;
  maxWordLength: number;
}

export interface GameConfig {
  progression: ProgressionConfig;
  scoring: ScoringConfig;
  combo: ComboConfig;
  difficulty: DifficultyConfig;
  powers: PowersConfig;
  wordGeneration: WordGenerationConfig;
}

export interface ComboLevel {
  minWords: number;
  text: string;
  multiplier: number;
  color: string;
}

const COMBO_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];

import gameConfigJson from '../config/gameConfig.json';
const gameConfig = gameConfigJson as GameConfig;

export const GameConfigService = {
  getWordsPerLevel(level: number): number {
    const config = gameConfig.progression.wordsPerLevel.find(
      (w: WordsPerLevelConfig) => level >= w.minLevel && level <= w.maxLevel
    );
    return config?.words ?? 8;
  },

  getProgressPctPerWord(level: number): number {
    const words = this.getWordsPerLevel(level);
    return 100 / words;
  },

  getPointsPerLetter(): number {
    return gameConfig.scoring.pointsPerLetter;
  },

  getFirePointsPerWord(): number {
    return gameConfig.scoring.firePointsPerWord;
  },

  getComboLevels(): ComboLevel[] {
    return gameConfig.combo.levels.map((level: ComboLevelConfig, index: number) => ({
      ...level,
      color: COMBO_COLORS[index] || '#ffffff',
    }));
  },

  getComboLevel(comboCount: number): ComboLevel | null {
    const levels = this.getComboLevels();
    for (let i = levels.length - 1; i >= 0; i--) {
      if (comboCount >= levels[i].minWords) {
        return levels[i];
      }
    }
    return null;
  },

  getBaseFallSpeed(): number {
    return gameConfig.difficulty.baseFallSpeed;
  },

  getSpeedIncreasePerLevel(): number {
    return gameConfig.difficulty.speedIncreasePerLevel;
  },

  getSpawnDelayBase(): number {
    return gameConfig.difficulty.spawnDelayBase;
  },

  getSpawnDelayDecreasePerLevel(): number {
    return gameConfig.difficulty.spawnDelayDecreasePerLevel;
  },

  getMinSpawnDelay(): number {
    return gameConfig.difficulty.minSpawnDelay;
  },

  getLimitPctPerMissed(): number {
    return gameConfig.difficulty.limitPctPerMissed;
  },

  getPowerDropRateBase(): number {
    return gameConfig.powers.dropRateBase;
  },

  getPowerDropRateIncreasePerLevel(): number {
    return gameConfig.powers.dropRateIncreasePerLevel;
  },

  getPowerDropRateMax(): number {
    return gameConfig.powers.dropRateMax;
  },

  getIceDuration(): number {
    return gameConfig.powers.iceDuration;
  },

  getSlowDuration(): number {
    return gameConfig.powers.slowDuration;
  },

  getSlowFactor(): number {
    return gameConfig.powers.slowFactor;
  },

  getBaseWordLength(): number {
    return gameConfig.wordGeneration.baseWordLength;
  },

  getWordLengthIncreasePerLevels(): number {
    return gameConfig.wordGeneration.wordLengthIncreasePerLevels;
  },

  getMaxWordLength(): number {
    return gameConfig.wordGeneration.maxWordLength;
  },
};
