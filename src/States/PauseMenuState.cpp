//
// Created by Simon on 5/18/2020.
//

#include <log4cplus/loggingmacros.h>
#include "PauseMenuState.h"

PauseMenuState::PauseMenuState(StateMachine *stateMachine)
{
    this->stateMachine = stateMachine;
    sf::Vector2f pos = sf::Vector2f(this->stateMachine->window.getSize());
    menuView.setSize(pos);
    pos *= 0.5f;
    menuView.setCenter(pos);

    if (!menuFont.loadFromFile(TMConfig::fontPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMConfig::fontPath);
    }

    if (!pauseMenuMusic.openFromFile(TMAssets::menuPauseSoundPath.string()))
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Can't load " << TMAssets::menuPauseSoundPath);
    }

    pauseMenuText.resize(2);
    pauseMenuText[0].setFont(menuFont);
    pauseMenuText[0].setString("PAUSE");
    pauseMenuText[0].setCharacterSize(TMConfig::gameOverMenuFontSize);
    pauseMenuText[0].setFillColor(TMConfig::gameOverMenuColor);
    pauseMenuText[0].setStyle(sf::Text::Bold);
    pauseMenuText[0].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 150.0f, this->stateMachine->window.getSize().y * 0.5f));

    pauseMenuText[1].setFont(menuFont);
    pauseMenuText[1].setString("Press Space to return");
    pauseMenuText[1].setCharacterSize(TMConfig::gameOverMenuFontSize - 20);
    pauseMenuText[1].setFillColor(TMConfig::gameOverMenuColor);
    pauseMenuText[1].setStyle(sf::Text::Bold);
    pauseMenuText[1].setPosition(sf::Vector2f(this->stateMachine->window.getSize().x * 0.5f - 250.0f, this->stateMachine->window.getSize().y * 0.5f + 100.0f));
}

void PauseMenuState::draw(const float dt)
{
    this->stateMachine->window.setView(menuView);
    this->stateMachine->window.clear(sf::Color::Black);
    this->stateMachine->window.draw(this->stateMachine->background);
    for (const auto& menuText: pauseMenuText)
    {
        this->stateMachine->window.draw(menuText);
    }

}

void PauseMenuState::update(const float dt)
{
    if (pauseMenuMusic.getStatus() != sf::SoundSource::Status::Playing)
    {
        pauseMenuMusic.play();
    }

    if (clock.getElapsedTime().asSeconds() > 0.2f)
    {
        clock.restart();
        pauseColorIndex = (pauseColorIndex + 1) % pauseColorStates.size();
        pauseMenuText[1].setFillColor(pauseColorStates[pauseColorIndex]);
    }
}

void PauseMenuState::handleInput()
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
            case sf::Event::KeyPressed:
            {
                if (event.key.code == sf::Keyboard::Space)
                {
                    sound.setVolume(10);
                    sound.setBuffer(this->stateMachine->sounds[TMAssets::SoundType::MenuSelect]);
                    sound.play();
                    goBackToInGame();
                    break;
                }
            }
            default:
                break;
        }
    }
}

void PauseMenuState::goBackToInGame()
{
    LOG4CPLUS_INFO(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), "Go back to ingame");
    pauseMenuMusic.stop();
    this->stateMachine->popState();
}