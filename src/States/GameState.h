//
// Created by Simon on 5/12/2020.
//

#ifndef TYPINGMANIAC_GAMESTATE_H
#define TYPINGMANIAC_GAMESTATE_H

#include <SFML/Graphics.hpp>
#include "../StateManager/State.h"
#include "GameState.h"
#include <Thor/Time.hpp>
#include <Thor/Shapes.hpp>

static constexpr unsigned char BACKSPACE_KEY = 8;
static constexpr unsigned char SPACE_KEY = 32;
static constexpr unsigned char ESCAPE_KEY = 27;

struct WordState
{
    sfe::RichText word;
    std::string wordString = "";
    std::map<unsigned char, sf::Color> wordChars;
    unsigned short charIndex = 0;
    float wordXpos = 0.0f;
    float wordYPos = 0.0f;
    bool error = false;
};

struct GameStatistics
{
    const std::string scoreText = "Score: ";
    const std::string livesText = "Lives: ";
    const std::string percentageProgressionText = " %";
    float percentageProgression = 0.0f;
    int score = 0;
    char lives = 3;
};

struct GameConfig
{
    unsigned char wordTimeInterval = 2;
    float incrementSpeed = 1.0f;
    unsigned int wordLen = 6;
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
    WordState spawnWord(const unsigned short wordLen);
    void updateNextLevel();
    void goToGameOverMenu();
    void goToPauseMenu();
    void goToCourseCleared();
    void backspaceEventHandler();

    static constexpr unsigned short WORDS_PER_LEVEL = 5;
    static constexpr unsigned char MAX_WORD_LENGTH = 10;
    std::map<unsigned char, std::vector<std::string>> dictionaryByLen;
    sf::Text gameText;
    sf::Text scoreText;
    sf::Text livesText;
    sf::Text progressionText;
    std::vector<WordState> drawnWords;
    sf::Sound sound;
    thor::StopWatch gameStopWatch;
    thor::StopWatch statsStopWatch;
    sf::View menuView;
    sf::Music inGameMusic;
    sf::RectangleShape limitRect;
    sf::ConvexShape staticProgressionRect;
    sf::ConvexShape progressionRect;
    sf::Vector2f oldProgressionRectSize;
    sf::Vector2f progressionRectSize;
    GameConfig gameConfig;
    GameStatistics gameStatistics;
    bool gameStarted = false;
    unsigned int statsColorValue = 150;
    bool increasingColorValue = false;
    bool gamePaused = false;
    bool wordCompleted = false;
};

#endif //TYPINGMANIAC_GAMESTATE_H
