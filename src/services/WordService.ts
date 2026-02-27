import wordData from '../data/words.json';

const MAX_RECENT_WORDS = 50;

class WordService {
  private wordsByLength: Map<number, string[]> = new Map();
  private recentWords: Set<string> = new Set();

  constructor() {
    this.loadWords();
    this.loadRecentWords();
  }

  private loadWords() {
    const data = wordData as Record<string, string[]>;
    for (const [length, words] of Object.entries(data)) {
      this.wordsByLength.set(parseInt(length), words);
    }
  }

  private loadRecentWords() {
    try {
      const saved = localStorage.getItem('recentWords');
      if (saved) {
        this.recentWords = new Set(JSON.parse(saved));
      }
    } catch {
      this.recentWords = new Set();
    }
  }

  private saveRecentWords() {
    try {
      const arr = Array.from(this.recentWords).slice(-MAX_RECENT_WORDS);
      localStorage.setItem('recentWords', JSON.stringify(arr));
    } catch {}
  }

  getWord(length: number): string {
    const words = this.wordsByLength.get(length);
    if (!words || words.length === 0) {
      return this.getWord(4);
    }

    const availableWords = words.filter(w => !this.recentWords.has(w));
    
    if (availableWords.length === 0) {
      const arr = Array.from(this.recentWords);
      arr.slice(0, Math.floor(arr.length / 2)).forEach(w => this.recentWords.delete(w));
      return words[Math.floor(Math.random() * words.length)];
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.recentWords.add(word);
    this.saveRecentWords();
    
    return word;
  }

  clearRecentWords() {
    this.recentWords.clear();
    localStorage.removeItem('recentWords');
  }
}

export const wordService = new WordService();
