//
// Created by Simon on 5/11/2020.
//

#include <log4cplus/loggingmacros.h>
#include <SFML/Graphics.hpp>
#include "StateMachine.h"
#include "State.h"

StateMachine::StateMachine(struct TMScreenConfig tmScreenConfig)
{
    this->window.create(sf::VideoMode(tmScreenConfig.width, tmScreenConfig.height), tmScreenConfig.name);
    this->window.setFramerateLimit(tmScreenConfig.frameRate);
    this->loadTextures();
    this->loadSounds();
    this->background.setTexture(textures[TMAssets::TextureType::Background]);
}

StateMachine::~StateMachine()
{
    while(!this->states.empty())
    {
        popState();
    }
}

void StateMachine::pushState(State* state)
{
    this->states.push(state);
}

void StateMachine::popState()
{
    this->states.pop();
}

void StateMachine::changeState(State* state)
{
    if(!this->states.empty())
    {
        popState();
    }
    pushState(state);
}

State* StateMachine::peekState()
{
    if(this->states.empty())
    {
        return nullptr;
    }
    return this->states.top();
}

void StateMachine::gameLoop()
{
    sf::Clock clock;
    float dt;

    while(this->window.isOpen())
    {
        dt = clock.restart().asSeconds();

        if(peekState() == nullptr)
        {
            continue;
        }

        peekState()->handleInput();
        peekState()->update(dt);
        this->window.clear(sf::Color::Black);
        peekState()->draw(dt);
        this->window.display();
    }
}

void StateMachine::loadSounds()
{
    try
    {
        sounds.acquire(TMAssets::SoundType::CorrectWord, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::correctWordSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::ErrorWord, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::errorWordSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::MenuSelect, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::menuSelectSoundPath.string()));
        sounds.acquire(TMAssets::SoundType::MenuPause, thor::Resources::fromFile<sf::SoundBuffer>(TMAssets::menuPauseSoundPath.string()));
    }
    catch (thor::ResourceLoadingException& e)
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), e.what());
    }
}

void StateMachine::loadTextures()
{
    try
    {
        textures.acquire(TMAssets::TextureType::Background, thor::Resources::fromFile<sf::Texture>(TMAssets::backgroundImgPath.string()));
    }
    catch (thor::ResourceLoadingException& e)
    {
        LOG4CPLUS_ERROR(log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac")), e.what());
    }
}


