<div align="center">

# ⌨️ Typing Maniac

**A web-based recreation of the classic Facebook game**

*Words fall. You type. They vanish.*

[![Go](https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Ebitengine](https://img.shields.io/badge/Ebitengine-v2-00ADD8?style=flat)](https://ebitengine.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build](https://github.com/halfguru/typingmaniac-go/actions/workflows/build.yml/badge.svg)](https://github.com/halfguru/typingmaniac-go/actions/workflows/build.yml)

<img src="https://img.shields.io/badge/platform-web%20%7C%20desktop-lightgrey?style=flat" alt="Platform">

</div>

---

## 🎮 How to Play

Words fall from the top of the screen. Type them correctly to destroy them before they reach the bottom.

### Power-Ups

| Power | Effect |
|-------|--------|
| 🔥 **Fire** | Destroys all visible words |
| ❄️ **Ice** | Slows falling words |
| 💨 **Wind** | Pushes words back up |

---

## 🚀 Quick Start

### Desktop

```bash
make run
```

### Web (WASM)

```bash
make wasm    # Build WebAssembly
make serve   # Start server at http://localhost:8080
```

Then open http://localhost:8080 in your browser.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Language | [Go](https://go.dev/) |
| Game Engine | [Ebitengine](https://ebitengine.org/) |
| Web Target | WebAssembly |

---

## 📋 Prerequisites

- Go 1.26+
- For Linux desktop: `libgl1-mesa-dev`, `xorg-dev`, `libasound2-dev`

---

## 🏗️ Project Structure

```
.
├── main.go           # Game entry point
├── game/             # Game logic
├── web/              # WebAssembly build output
│   ├── index.html
│   ├── game.wasm
│   └── wasm_exec.js
├── Makefile
└── go.mod
```

---

## 📜 License

[MIT](LICENSE) © 2025 halfguru

---

<div align="center">

*Inspired by the original Typing Maniac by MetroGames*

</div>
