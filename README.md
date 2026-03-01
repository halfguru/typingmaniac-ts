<div align="center">

# ⌨️ Typing Maniac

**A web-based recreation of the classic Facebook game**

*Words fall. You type. They vanish.*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.70-3178C6?style=flat)](https://phaser.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🎮 How to Play

Words fall from the top of the screen. Type them letter-by-letter to destroy them before they reach the bottom. **One mistake costs you!**

### Power-Ups

Collect power words to activate special abilities:

| Power | Effect |
|-------|--------|
| 🔥 **Fire** | Burns all words on screen (+50 pts each) |
| ❄️ **Ice** | Freezes all words for 5 seconds |
| ⏱️ **Slow** | Slows falling speed for 5 seconds |
| 💨 **Wind** | Resets the danger (LIMIT) bar to 0% |

### Themes

The game features multiple visual themes:
- **Cyberpunk** (default): Neon cyberpunk aesthetic with grid floor and city skyline
- **Alchemist**: Mystical wizard's study with animated wizard character, magical effects, and alchemical atmosphere

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Game Engine | [Phaser 3](https://phaser.io/) |
| Bundler | [Vite](https://vitejs.dev/) |

---

## 🏗️ Project Structure

```
.
├── src/
│   ├── main.ts              # Entry point, scene registration
│   ├── scenes/              # Phaser scenes (Menu, Game, UI, Countdown)
│   ├── config/              # Game constants, colors
│   ├── data/                # Word lists (JSON)
│   ├── services/            # Game services (Audio, Storage, Theme, etc.)
│   ├── themes/              # Theme definitions and styling
│   ├── ui/                  # UI components (buttons, progress bars)
│   ├── managers/            # Effect managers
│   └── types/               # TypeScript types
├── docs/                    # Documentation
├── index.html
├── package.json
└── vite.config.ts
```

---

## 📜 License

[MIT](LICENSE) © 2025 halfguru

---

<div align="center">

*Inspired by the original Typing Maniac by MetroGames*

</div>
