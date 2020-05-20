//
// Created by Simon on 5/12/2020.
//

#ifndef TYPINGMANIAC_GAMESTATE_H
#define TYPINGMANIAC_GAMESTATE_H

#include <SFML/Graphics.hpp>
#include "../StateManager/State.h"
#include "GameState.h"
#include <Thor/Time.hpp>

static constexpr unsigned char BACKSPACE_KEY = 8;
static constexpr unsigned char SPACE_KEY = 32;
static constexpr unsigned char ESCAPE_KEY = 27;

struct WordState
{
    sfe::RichText word;
    std::string wordString = "";
    std::map<unsigned char, sf::Color> wordChars;
    unsigned short charIndex = 0;
    unsigned short wordXpos = 0;
    unsigned short wordYPos = 0;
    bool error = false;
};

struct GameStatistics
{
    const std::string scoreText = "Score: ";
    const std::string livesText = "Lives: ";
    int score = 0;
    char lives = 3;
};

struct GameConfig
{
    unsigned char wordTimeInterval = 2;
    unsigned char incrementSpeed = 1;
    unsigned int wordLen = 10;
    std::string focusedWord = "";
};

class GameState: public State
{
public:
    GameState(StateMachine* stateMachine);

    virtual void draw(const float dt);
    virtual void update(const float dt);
    virtual void handleInput();

private:
    void loadDictionary();
    WordState spawnWord();
    void generateLevelWords();
    void goToGameOverMenu();
    void goToPauseMenu();
    void backspaceEventHandler();

    static constexpr unsigned short WORDS_PER_LEVEL = 50;
    static constexpr unsigned char MAX_WORD_LENGTH = 10;
    std::map<unsigned char, std::vector<std::string>> dictionaryByLen;
    sf::Text gameText;
    sf::Text scoreText;
    sf::Text livesText;
    std::stack<WordState> gameWords;
    std::vector<WordState> drawnWords;
    sf::Sound sound;
    thor::StopWatch gameStopWatch;
    thor::StopWatch statsStopWatch;
    sf::Font gameFont;
    sf::View menuView;
    sf::Music inGameMusic;
    sf::RectangleShape rectangleLimit;
    GameConfig gameConfig;
    GameStatistics gameStatistics;
    bool gameStarted = false;
    unsigned int statsColorValue = 150;
    bool increasingColorValue = false;
    bool gamePaused = false;
};

#endif //TYPINGMANIAC_GAMESTATE_H
