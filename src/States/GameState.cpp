//
// Created by Simon on 5/12/2020.
//

#include <cmath>
#include <log4cplus/loggingmacros.h>
#include <fstream>
#include <iostream>
#include <stdlib.h>
#include "../GameConfig.h"
#include "GameState.h"
#include "GameOverState.h"
#include "PauseMenuState.h"

GameState::GameState(StateMachine* stateMachine)
{
    srand(time(0));

    this->stateMachine = stateMachine;
    this->stateMachine->background.setColor(sf::Color(255, 255, 255, 255));
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!gameFont.loadFromFile(TMConfig::fontPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMConfig::fontPath);
    }

    if (!inGameMusic.openFromFile(TMAssets::inGameMusicPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::inGameMusicPath);
    }

    gameText.setFont(gameFont);
    gameText.setString("Typing Maniac Game");
    gameText.setCharacterSize(TMConfig::wordFontSize);
    gameText.setFillColor(sf::Color::Black);
    gameText.setStyle(sf::Text::Bold);
    gameText.setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 100.0f, this->stateMachine->window.getSize().y - 50.0f));

    scoreText.setFont(gameFont);
    scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
    scoreText.setCharacterSize(TMConfig::wordFontSize);
    scoreText.setFillColor(sf::Color::Black);
    scoreText.setStyle(sf::Text::Bold);
    scoreText.setPosition(sf::Vector2f(100.0f, this->stateMachine->window.getSize().y - 50.0f));

    livesText.setFont(gameFont);
    livesText.setString(gameStatistics.livesText + std::to_string(gameStatistics.lives));
    livesText.setCharacterSize(TMConfig::wordFontSize);
    livesText.setFillColor(sf::Color::Black);
    livesText.setStyle(sf::Text::Bold);
    livesText.setPosition(sf::Vector2f(1100.0f, this->stateMachine->window.getSize().y - 50.0f));

    rectangleLimit.setPosition(sf::Vector2f(0, this->stateMachine->window.getSize().y - 75.0f));
    rectangleLimit.setSize(sf::Vector2f(this->stateMachine->window.getSize().x, 10));
    rectangleLimit.setFillColor(sf::Color(150, 50, 150, 150));

    loadDictionary();
    generateLevelWords();
}

void GameState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->window.draw(this->stateMachine->background);
    this->stateMachine->window.draw(gameText);
    this->stateMachine->window.draw(scoreText);
    this->stateMachine->window.draw(livesText);
    this->stateMachine->window.draw(rectangleLimit);
    for (WordState& ele: drawnWords)
    {
        this->stateMachine->window.draw(ele.word);
    }
}

void GameState::update(const float dt)
{
    // New game
    if (!gameStarted)
    {
        gameStopWatch.restart();
        statsStopWatch.restart();
        inGameMusic.setVolume(10);
        inGameMusic.setLoop(true);
        inGameMusic.play();

        if (!gameWords.empty())
        {
            drawnWords.push_back(gameWords.top());
            gameWords.pop();
            gameStarted = true;
        }
        else
        {
            LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Game started but no words in stack?");
        }
    }

    if (gamePaused)
    {
        gamePaused = false;
        inGameMusic.setLoop(true);
        inGameMusic.setVolume(10);
        inGameMusic.play();
        gameStopWatch.start();
        statsStopWatch.start();
    }

    if (statsStopWatch.getElapsedTime().asMilliseconds() > 50)
    {
        statsStopWatch.restart();
        if (statsColorValue == 250)
            increasingColorValue = false;
        else if (statsColorValue == 150)
            increasingColorValue = true;
        if (increasingColorValue)
            statsColorValue = statsColorValue + 10;
        else
            statsColorValue = statsColorValue - 10;

        gameText.setFillColor(sf::Color(statsColorValue, 150, 100));
        scoreText.setFillColor(sf::Color(statsColorValue, 150, 100));
        livesText.setFillColor(sf::Color(statsColorValue, 150, 100));
    }

    if (gameStopWatch.getElapsedTime().asSeconds() > gameConfig.wordTimeInterval)
    {
        gameStopWatch.restart();
        if (!gameWords.empty())
        {
            drawnWords.push_back(gameWords.top());
            gameWords.pop();
        }
        else
        {
            if (drawnWords.empty())
            {
                goToGameOverMenu();
            }
        }
    }

    if (gameStatistics.lives <= -1)
    {
        goToGameOverMenu();
    }

    for (int i = 0; i < drawnWords.size(); ++i)
    {
        if (drawnWords[i].wordYPos >= rectangleLimit.getPosition().y - 26.0f)
        {
            gameStatistics.lives--;
            livesText.setString(gameStatistics.livesText + std::to_string(gameStatistics.lives));
            drawnWords.erase(drawnWords.begin() + i);
        }

        else
        {
            drawnWords[i].wordYPos = drawnWords[i].wordYPos + gameConfig.incrementSpeed;
            drawnWords[i].word.setPosition(sf::Vector2f(drawnWords[i].wordXpos, drawnWords[i].wordYPos));
        }
    }

}

void GameState::handleInput()
{
    sf::Event event;

    while(this->stateMachine->window.pollEvent(event))
    {
        switch(event.type)
        {
            /* Close the window */
            case sf::Event::Closed:
            {
                this->stateMachine->window.close();
                break;
            }
            /* Resize the window */
            case sf::Event::Resized:
            {
                menuView.setSize(event.size.width, event.size.height);
                this->stateMachine->background.setPosition(this->stateMachine->window.mapPixelToCoords(sf::Vector2i(0, 0)));
                this->stateMachine->background.setScale(
                        float(event.size.width) / float(this->stateMachine->background.getTexture()->getSize().x),
                        float(event.size.height) / float(this->stateMachine->background.getTexture()->getSize().y));
                break;
            }

            case sf::Event::TextEntered:
            {
                // Erase character
                if (event.key.code == BACKSPACE_KEY)
                {
                    backspaceEventHandler();
                }

                // Accelerate speed
                else if (event.key.code == SPACE_KEY)
                {
                    gameConfig.incrementSpeed = 3;
                    break;
                }

                // Pause game
                else if (event.key.code == ESCAPE_KEY)
                {
                    goToPauseMenu();
                }

                // Character attempt
                else
                {
                    // New word
                    if (gameConfig.focusedWord.empty() && !drawnWords.empty())
                    {
                        for (WordState& drawnWord: drawnWords)
                        {
                            // good char
                            if (event.key.code == drawnWord.wordString[0])
                            {
                                LOG4CPLUS_TRACE(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "correct char: " << drawnWord.wordString[0]);
                                drawnWord.word.clear();

                                if (drawnWord.error)
                                {
                                    drawnWord.wordChars[0] = TMConfig::gameWordErrorColor;
                                }
                                else
                                {
                                    drawnWord.wordChars[0] = TMConfig::gameWordHighlightColor;
                                }

                                drawnWord.charIndex++;
                                gameConfig.focusedWord = drawnWord.wordString;
                                gameStatistics.score++;
                                scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                                for (int j = 0; j < drawnWord.wordString.length(); ++j)
                                {
                                    drawnWord.word << drawnWord.wordChars[j] << drawnWord.wordString[j] << " ";
                                }
                                return;
                            }
                        }

                        // bad char
                        LOG4CPLUS_TRACE(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "wrong char: " << drawnWords[0].wordString[0]);
                        drawnWords[0].word.clear();
                        drawnWords[0].error = true;
                        drawnWords[0].wordChars[0] = TMConfig::gameWordErrorColor;
                        drawnWords[0].charIndex++;
                        gameConfig.focusedWord = drawnWords[0].wordString;

                        gameStatistics.score = gameStatistics.score - 1;
                        scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                        for (int j = 0; j < drawnWords[0].wordString.length(); ++j)
                        {
                            drawnWords[0].word << drawnWords[0].wordChars[j] << drawnWords[0].wordString[j] << " ";
                        }
                    }

                    // Focused word
                    else
                    {
                        for (int i = 0; i < drawnWords.size(); ++i)
                        {
                            if (gameConfig.focusedWord == drawnWords[i].wordString)
                            {
                                // Character pressed matches word index
                                if (event.key.code == drawnWords[i].wordString[drawnWords[i].charIndex])
                                {
                                    LOG4CPLUS_TRACE(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "correct char: " << drawnWords[i].wordString[drawnWords[i].charIndex]);
                                    drawnWords[i].word.clear();

                                    if (drawnWords[i].error)
                                    {
                                        drawnWords[i].wordChars[drawnWords[i].charIndex] = TMConfig::gameWordErrorColor;
                                    }
                                    else
                                    {
                                        drawnWords[i].wordChars[drawnWords[i].charIndex] = TMConfig::gameWordHighlightColor;
                                    }

                                    drawnWords[i].charIndex++;
                                    gameConfig.focusedWord = drawnWords[i].wordString;
                                    gameStatistics.score++;
                                    scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                                    for (int j = 0; j < drawnWords[i].wordString.length(); ++j)
                                    {
                                        drawnWords[i].word << drawnWords[i].wordChars[j] << drawnWords[i].wordString[j] << " ";
                                    }

                                    // Word completed
                                    if (drawnWords[i].charIndex >= drawnWords[i].wordString.length())
                                    {
                                        if (!drawnWords[i].error)
                                        {
                                            LOG4CPLUS_DEBUG(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "correct word: " << drawnWords[i].wordString.c_str());
                                            drawnWords.erase(drawnWords.begin() + i);
                                            gameConfig.focusedWord.clear();
                                            gameStatistics.score = gameStatistics.score + 50;
                                            scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::CorrectWord]);
                                            sound.play();
                                        }

                                        else
                                        {
                                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::ErrorWord]);
                                            sound.play();
                                        }

                                    }
                                }

                                // Character pressed doesn't match word index
                                else
                                {
                                    LOG4CPLUS_TRACE(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "wrong char: " << drawnWords[i].wordString[drawnWords[i].charIndex]);
                                    drawnWords[i].word.clear();
                                    drawnWords[i].error = true;
                                    drawnWords[i].wordChars[drawnWords[i].charIndex] = TMConfig::gameWordErrorColor;
                                    drawnWords[i].charIndex++;
                                    gameConfig.focusedWord = drawnWords[i].wordString;

                                    gameStatistics.score = gameStatistics.score - 1;
                                    scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                                    for (int j = 0; j < drawnWords[i].wordString.length(); ++j)
                                    {
                                        drawnWords[i].word << drawnWords[i].wordChars[j] << drawnWords[i].wordString[j] << " ";
                                    }

                                    // Word completed
                                    if (drawnWords[i].charIndex >= drawnWords[i].wordString.size())
                                    {
                                        LOG4CPLUS_DEBUG(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "wrong word: " << drawnWords[i].wordString.c_str());
                                        drawnWords.erase(drawnWords.begin() + i);
                                        gameStatistics.lives--;
                                        gameConfig.focusedWord.clear();
                                        livesText.setString(gameStatistics.livesText + std::to_string(gameStatistics.lives));
                                        gameStatistics.score = gameStatistics.score - 5;
                                        scoreText.setString(gameStatistics.scoreText + std::to_string(gameStatistics.score));
                                        sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::ErrorWord]);
                                        sound.play();
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            case sf::Event::KeyReleased:
            {
                if (event.key.code == sf::Keyboard::Space)
                {
                    gameConfig.incrementSpeed = 1;
                    break;
                }
            }

            default:
                break;
        }
    }
}

void GameState::backspaceEventHandler()
{
    if (!gameConfig.focusedWord.empty())
    {
        for (WordState& drawnWord: drawnWords)
        {
            // word started being written to
            if (gameConfig.focusedWord == drawnWord.wordString)
            {
                drawnWord.word.clear();
                drawnWord.charIndex--;
                drawnWord.error = false;
                drawnWord.wordChars[drawnWord.charIndex] = TMConfig::gameWordFontColor;

                if (drawnWord.charIndex == 0)
                {
                    gameConfig.focusedWord.clear();
                }

                // verify if any errors are left in word
                for (auto& [key, val]: drawnWord.wordChars)
                {
                    if (val == TMConfig::gameWordErrorColor)
                    {
                        drawnWord.error = true;
                        break;
                    }
                }

                // rewrite word with appropriate colors
                for (int j = 0; j < drawnWord.wordString.length(); ++j)
                {
                    drawnWord.word << drawnWord.wordChars[j] << drawnWord.wordString[j] << " ";
                }
                break;
            }
        }
    }
}

void GameState::loadDictionary()
{
    std::string line;
    std::ifstream file;
    file.open(TMConfig::dictionaryPath.string());

    while (std::getline(file, line))
    {
        if (line.length() <= MAX_WORD_LENGTH)
        {
            if (dictionaryByLen.find(line.length()) == dictionaryByLen.end())
            {
                dictionaryByLen.insert(std::pair<unsigned char, std::vector<std::string>>(line.length(), {}));
            }
            else
            {
                dictionaryByLen[line.length()].push_back(line);
            }
        }
    }
    file.close();
}

void GameState::generateLevelWords()
{
    LOG4CPLUS_DEBUG(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Generating " << WORDS_PER_LEVEL << " words for this level");

    for (int i = 0; i < WORDS_PER_LEVEL; ++i)
    {
        gameWords.push(spawnWord());
    }
}

WordState GameState::spawnWord()
{
    WordState gameWord;
    gameWord.wordString = dictionaryByLen[gameConfig.wordLen][rand() % dictionaryByLen[gameConfig.wordLen].size()];
    for (int i = 0; i < gameWord.wordString.length(); ++i) {
        gameWord.wordChars.insert(std::pair<unsigned char, sf::Color>(i, TMConfig::gameWordFontColor));
    }

    LOG4CPLUS_TRACE(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "word spawned: " << gameWord.wordString.c_str());

    gameWord.wordYPos = 0;
    gameWord.wordXpos = rand() % (this->stateMachine->background.getTexture()->getSize().x - 230) + 50;
    gameWord.word.setFont(gameFont);
    gameWord.word.clear();
    for (int i = 0; i < gameWord.wordString.size(); ++i) {
        gameWord.word << gameWord.wordChars[i] << gameWord.wordString[i] << " ";
    }
    gameWord.word.setCharacterSize(TMConfig::wordFontSize);
    gameWord.word.setPosition(gameWord.wordXpos, gameWord.wordYPos);
    return gameWord;
}

void GameState::goToGameOverMenu()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go to game over menu");
    inGameMusic.stop();
    this->stateMachine->changeState(new GameOverState(this->stateMachine));
}

void GameState::goToPauseMenu()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go to pause menu");
    gamePaused = true;
    gameStopWatch.stop();
    statsStopWatch.stop();
    inGameMusic.pause();
    sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::MenuPause]);
    sound.play();
    this->stateMachine->pushState(new PauseMenuState(this->stateMachine));
}