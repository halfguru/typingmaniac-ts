package main

import (
	"bytes"
	"image/color"
	"log"
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/examples/resources/fonts"
	"github.com/hajimehoshi/ebiten/v2/inpututil"
	"github.com/hajimehoshi/ebiten/v2/text/v2"
)

const (
	ScreenWidth  = 1280
	ScreenHeight = 720
	FontSize     = 28
	FallSpeed    = 1.5
	SpawnDelay   = 90
	DangerZoneY  = ScreenHeight - 80
	MaxLives     = 3
	PointPenalty = 50
)

var wordList = []string{
	"apple", "banana", "cherry", "dragon", "elephant",
	"forest", "garden", "house", "island", "jungle",
	"king", "lemon", "mountain", "night", "ocean",
	"piano", "queen", "river", "star", "tree",
	"umbrella", "village", "window", "yellow", "zebra",
	"book", "cloud", "dream", "earth", "fire",
	"gold", "heart", "ice", "jump", "kite",
	"light", "moon", "north", "orange", "pink",
	"quick", "rain", "snow", "thunder", "water",
	"cat", "dog", "bird", "fish", "wolf",
}

type Word struct {
	text string
	x, y float64
}

type Game struct {
	words    []Word
	input    string
	score    int
	lives    int
	spawnCnt int
	rand     *rand.Rand
	fontFace *text.GoTextFace
	gameOver bool
}

func NewGame() *Game {
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)

	f, err := text.NewGoTextFaceSource(bytes.NewReader(fonts.MPlus1pRegular_ttf))
	if err != nil {
		log.Fatal(err)
	}
	fontFace := &text.GoTextFace{
		Source: f,
		Size:   FontSize,
	}

	return &Game{
		rand:     r,
		fontFace: fontFace,
		lives:    MaxLives,
	}
}

func (g *Game) spawnWord() {
	word := wordList[g.rand.Intn(len(wordList))]
	x := float64(g.rand.Intn(ScreenWidth - 200))
	g.words = append(g.words, Word{text: word, x: x, y: -30})
}

func (g *Game) Update() error {
	if g.gameOver {
		if inpututil.IsKeyJustPressed(ebiten.KeySpace) {
			g.reset()
		}
		return nil
	}

	g.spawnCnt++
	if g.spawnCnt >= SpawnDelay {
		g.spawnCnt = 0
		g.spawnWord()
	}

	for i := range g.words {
		g.words[i].y += FallSpeed
	}

	var active []Word
	for _, w := range g.words {
		if w.y >= DangerZoneY && w.y < DangerZoneY+FallSpeed+1 {
			g.lives--
			g.score -= PointPenalty
			if g.score < 0 {
				g.score = 0
			}
			if g.lives <= 0 {
				g.gameOver = true
			}
			continue
		}
		if w.y < ScreenHeight+50 {
			active = append(active, w)
		}
	}
	g.words = active

	runes := ebiten.AppendInputChars(nil)
	for _, r := range runes {
		if r >= 'a' && r <= 'z' {
			g.input += string(r)
		} else if r >= 'A' && r <= 'Z' {
			g.input += strings.ToLower(string(r))
		}
	}

	if inpututil.IsKeyJustPressed(ebiten.KeyBackspace) && len(g.input) > 0 {
		g.input = g.input[:len(g.input)-1]
	}

	inputLower := strings.ToLower(g.input)
	if inputLower != "" {
		targetIdx := g.findTargetWord(inputLower)
		if targetIdx >= 0 && strings.ToLower(g.words[targetIdx].text) == inputLower {
			g.score += len(g.words[targetIdx].text) * 10
			g.words = append(g.words[:targetIdx], g.words[targetIdx+1:]...)
			g.input = ""
		}
	}

	return nil
}

func (g *Game) findTargetWord(inputLower string) int {
	targetIdx := -1
	var targetY float64 = -1

	for i, w := range g.words {
		if strings.HasPrefix(strings.ToLower(w.text), inputLower) {
			if w.y > targetY {
				targetY = w.y
				targetIdx = i
			}
		}
	}
	return targetIdx
}

func (g *Game) reset() {
	g.words = nil
	g.input = ""
	g.score = 0
	g.lives = MaxLives
	g.spawnCnt = 0
	g.gameOver = false
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.Fill(color.RGBA{20, 20, 40, 255})

	dangerZoneOp := &text.DrawOptions{}
	dangerZoneOp.GeoM.Translate(20, DangerZoneY)
	dangerZoneOp.ColorScale.ScaleWithColor(color.RGBA{80, 30, 30, 100})
	text.Draw(screen, strings.Repeat("-", 100), g.fontFace, dangerZoneOp)

	targetIdx := -1
	if g.input != "" {
		targetIdx = g.findTargetWord(strings.ToLower(g.input))
	}

	for i, w := range g.words {
		isTarget := (i == targetIdx)
		g.drawWord(screen, w, isTarget)
	}

	inputOp := &text.DrawOptions{}
	inputOp.GeoM.Translate(20, ScreenHeight-40)
	inputOp.ColorScale.ScaleWithColor(color.RGBA{255, 255, 100, 255})
	text.Draw(screen, "> "+g.input, g.fontFace, inputOp)

	scoreOp := &text.DrawOptions{}
	scoreOp.GeoM.Translate(ScreenWidth-150, 40)
	scoreOp.ColorScale.ScaleWithColor(color.RGBA{255, 255, 255, 255})
	text.Draw(screen, "Score: "+strconv.Itoa(g.score), g.fontFace, scoreOp)

	livesOp := &text.DrawOptions{}
	livesOp.GeoM.Translate(20, 40)
	livesOp.ColorScale.ScaleWithColor(color.RGBA{255, 100, 100, 255})
	text.Draw(screen, "Lives: "+strconv.Itoa(g.lives), g.fontFace, livesOp)

	if g.gameOver {
		overOp := &text.DrawOptions{}
		overOp.GeoM.Translate(ScreenWidth/2-100, ScreenHeight/2-20)
		overOp.ColorScale.ScaleWithColor(color.RGBA{255, 50, 50, 255})
		text.Draw(screen, "GAME OVER - Press SPACE to restart", g.fontFace, overOp)
	}
}

func (g *Game) drawWord(screen *ebiten.Image, w Word, isTarget bool) {
	inputLower := strings.ToLower(g.input)
	wordLower := strings.ToLower(w.text)

	matchedLen := 0
	if inputLower != "" && strings.HasPrefix(wordLower, inputLower) {
		matchedLen = len(inputLower)
	}

	baseColor := color.RGBA{255, 255, 255, 255}
	if isTarget && matchedLen > 0 {
		baseColor = color.RGBA{255, 200, 100, 255}
	}

	x := w.x
	for i, ch := range w.text {
		op := &text.DrawOptions{}
		op.GeoM.Translate(x, w.y)

		if i < matchedLen {
			if isTarget {
				op.ColorScale.ScaleWithColor(color.RGBA{50, 255, 50, 255})
			} else {
				op.ColorScale.ScaleWithColor(color.RGBA{100, 255, 100, 255})
			}
		} else {
			op.ColorScale.ScaleWithColor(baseColor)
		}

		text.Draw(screen, string(ch), g.fontFace, op)

		advance := text.Advance(string(ch), g.fontFace)
		x += advance
	}
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}

func main() {
	ebiten.SetWindowSize(ScreenWidth, ScreenHeight)
	ebiten.SetWindowTitle("Typing Maniac")
	if err := ebiten.RunGame(NewGame()); err != nil {
		log.Fatal(err)
	}
}
