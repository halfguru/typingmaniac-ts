//
// Created by Simon on 5/11/2020.
//

#include <log4cplus/loggingmacros.h>
#include "../GameConfig.h"
#include "GameMenuState.h"
#include "GameState.h"

GameMenuState::GameMenuState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!gameMenuMusic.openFromFile(TMAssets::menuMusicPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::menuMusicPath);
    }

    menuText.resize(3);
    menuText[0].setFont(this->stateMachine->fonts[TMAssets::FontType::Minecraft]);
    menuText[0].setString("Start Game");
    menuText[0].setCharacterSize(TMConfig::menuFontSize);
    menuText[0].setFillColor(TMConfig::gameMenuFontColor);
    menuText[0].setStyle(sf::Text::Bold);
    menuText[0].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 100.0f, this->stateMachine->window.getSize().y * 0.5f));
    menuText[1].setFont(this->stateMachine->fonts[TMAssets::FontType::Minecraft]);
    menuText[1].setString("Quit");
    menuText[1].setCharacterSize(TMConfig::menuFontSize);
    menuText[1].setFillColor(TMConfig::gameMenuFontColor);
    menuText[1].setStyle(sf::Text::Bold);
    menuText[1].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 100.0f, this->stateMachine->window.getSize().y * 0.5f + 50.0f));
    menuText[2].setFont(this->stateMachine->fonts[TMAssets::FontType::Minecraft]);
    menuText[2].setString(">");
    menuText[2].setCharacterSize(TMConfig::menuFontSize);
    menuText[2].setFillColor(TMConfig::gameMenuFontColor);
    menuText[2].setStyle(sf::Text::Bold);
    menuText[2].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 120.0f, this->stateMachine->window.getSize().y * 0.5f));

    gameMenuMusic.setVolume(10);
    gameMenuMusic.setLoop(true);
    gameMenuMusic.play();
}

void GameMenuState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->background.setColor(sf::Color(255, 255, 255, backgroundColorValue));
    this->stateMachine->window.draw(this->stateMachine->background);

    if (menuSelectionId == static_cast<int>(MenuState::PLAY))
        menuText[2].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 120.0f, this->stateMachine->window.getSize().y * 0.5f));
    if (menuSelectionId == static_cast<int>(MenuState::QUIT))
        menuText[2].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 120.0f, this->stateMachine->window.getSize().y * 0.5f + 50.0f));
    for (auto &text: menuText)
    {
        text.setFillColor(TMConfig::gameMenuFontColor);
        menuText.at(menuSelectionId).setFillColor(sf::Color(255,  0, 0, colorValue));
        menuText[2].setFillColor(sf::Color(255,  0, 0, colorValue));
        this->stateMachine->window.draw(text);
    }
}

void GameMenuState::update(const float dt)
{
    if(clock.getElapsedTime().asMilliseconds() > 50)
    {
        clock.restart();
        colorValue = (colorValue + 5) % (255) + 50;
        if (loadingGame)
        {
            if (gameMenuMusic.getVolume() > 1)
            {
                gameMenuMusic.setVolume(gameMenuMusic.getVolume() - 0.5f);
            }
            backgroundColorValue = backgroundColorValue - 10;
        }
    }

    if (backgroundColorValue < 10)
    {
        this->loadGame();
    }
}

void GameMenuState::handleInput()
{
    sf::Event event;

    while(this->stateMachine->window.pollEvent(event))
    {
        switch(event.type)
        {
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
            case sf::Event::KeyPressed:
            {
                if (event.key.code == sf::Keyboard::Down)
                {
                    menuSelectionId = (menuSelectionId + 1) % (menuText.size() - 1);
                }

                else if (event.key.code == sf::Keyboard::Up)
                {
                    menuSelectionId = (menuSelectionId - 1) % (menuText.size() - 1);
                }

                else if(event.key.code == sf::Keyboard::Enter)
                {
                    switch (menuSelectionId)
                    {
                        case static_cast<int>(MenuState::PLAY):
                        {
                            sound.setVolume(10);
                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::MenuSelect]);
                            sound.play();
                            loadingGame = true;
                            break;
                        }
                        case static_cast<int>(MenuState::QUIT):
                        {
                            LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Exiting game");
                            sound.setVolume(10);
                            sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::MenuSelect]);
                            sound.play();
                            this->stateMachine->window.close();
                            break;
                        }
                        default:
                            break;
                    }

                }
                break;
            }
            default:
                break;
        }
    }
}

void GameMenuState::loadGame()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Loading game");
    gameMenuMusic.stop();
    this->stateMachine->pushState(new GameState(this->stateMachine));
}