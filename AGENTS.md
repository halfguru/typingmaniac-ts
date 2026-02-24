# AGENTS.md - Coding Agent Guidelines

## Project Overview

**Typing Maniac** - A web-based recreation of the classic Facebook game by MetroGames. Words fall from the top of the screen and players type them to destroy them. The game features power-ups (fire, ice, wind) and progressive difficulty.

## Tech Stack

- **Language**: Go 1.21+
- **Game Engine**: Ebiten (https://ebiten.org/)
- **Web Target**: Go → WebAssembly (GOOS=js GOARCH=wasm)
- **Desktop Target**: Native Go

## Prerequisites

```bash
# Install Go 1.21+ (required)
# Ubuntu/Debian:
sudo apt install golang-go

# Or download from https://go.dev/dl/
```

## Build Commands

```bash
# Run desktop version (development)
make run
# Or: go run .

# Build desktop executable
make build
# Or: go build -o typingmaniac .

# Build for web (WASM)
make wasm
# Or: tinygo build -o web/game.wasm -target wasm ./...

# Serve web version locally
make serve
# Or: python3 -m http.server 8080 -d web
```

## Project Structure

```
.
├── main.go              # Entry point, Ebiten game struct
├── game/
│   ├── game.go          # Game logic, state management
│   ├── word.go          # Word spawning, movement, typing
│   ├── powerup.go       # Power-up logic (fire, ice, wind)
│   └── ui.go            # UI rendering (score, lives, powers)
├── assets/
│   ├── fonts/           # TTF fonts
│   ├── images/          # Backgrounds, sprites
│   └── sounds/          # Sound effects, music
├── dictionary.txt       # Word list for the game
├── web/
│   ├── index.html       # HTML wrapper for WASM
│   └── game.wasm        # Compiled WASM (generated)
├── go.mod               # Go module definition
├── go.sum               # Dependencies (generated)
└── Makefile             # Build commands
```

## Code Style Guidelines

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Packages | lowercase, short | `game`, `ui` |
| Types/Structs | PascalCase | `GameState`, `WordManager` |
| Functions/Methods | PascalCase (exported), camelCase (private) | `NewGame()`, `updateWords()` |
| Variables | camelCase | `wordList`, `currentWord` |
| Constants | PascalCase or SCREAMING_SNAKE_CASE | `ScreenWidth`, `MAX_WORDS` |
| Interfaces | PascalCase + "-er" suffix | `Renderer`, `Updator` |

### Go Idioms

```go
// Constructor pattern
func NewGame() *Game {
    return &Game{
        score: 0,
        lives: 3,
    }
}

// Error handling - return error, don't panic
func loadDictionary(path string) ([]string, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("failed to load dictionary: %w", err)
    }
    // ...
}

// Use context for cancellation (if needed)
// Prefer channels for goroutine communication
```

### Ebiten Game Structure

```go
type Game struct {
    // State fields
}

// Required interface methods:
func (g *Game) Update() error {
    // Game logic, called 60 times per second
    return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
    // Rendering, called at refresh rate
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
    // Logical screen size
    return ScreenWidth, ScreenHeight
}

func main() {
    ebiten.SetWindowSize(ScreenWidth, ScreenHeight)
    ebiten.SetWindowTitle("Typing Maniac")
    if err := ebiten.RunGame(NewGame()); err != nil {
        log.Fatal(err)
    }
}
```

### Web/WASM Considerations

- **No file system access** - embed assets using `//go:embed`
- **No os/exec** - not available in WASM
- **Limited goroutines** - TinyGo has limited concurrency support
- **No cgo** - not available in TinyGo WASM

```go
// Embed assets for WASM compatibility
//go:embed assets/fonts/minecraft.ttf
var fontData []byte

//go:embed dictionary.txt
var dictionaryData []byte
```

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./game -v
```

## Debugging

- **Desktop**: Use `log.Println()` or `fmt.Printf()`
- **WASM**: Console output goes to browser dev tools (F12 → Console)

## Key Game Constants

```go
const (
    ScreenWidth  = 1280
    ScreenHeight = 720
    FrameRate    = 60
    
    WordFontSize   = 24
    MenuFontSize   = 34
    
    MaxLives       = 3
    WordsPerLevel  = 50
    MaxWordLength  = 10
)
```

## Power-Up Types

1. **Fire** - Destroys all visible words
2. **Ice** - Slows falling words for N seconds
3. **Wind** - Pushes words back up

## Development Workflow

1. Develop and test on desktop (`make run`)
2. Periodically test WASM build (`make wasm && make serve`)
3. Test in browser at http://localhost:8080
4. Commit working versions
