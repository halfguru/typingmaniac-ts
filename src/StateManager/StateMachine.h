//
// Created by Simon on 5/11/2020.
//

#ifndef TYPINGMANIAC_STATEMACHINE_H
#define TYPINGMANIAC_STATEMACHINE_H

#include <experimental/filesystem>
#include <log4cplus/logger.h>
#include <stack>
#include <SFML/Audio.hpp>
#include <SFML/Graphics.hpp>
#include "../GameConfig.h"
#include <Thor/Resources.hpp>

struct TMScreenConfig
{
    std::string name;
    unsigned short width;
    unsigned short height;
    unsigned char frameRate;
};

class State;

class StateMachine
{
public:
    StateMachine(struct TMScreenConfig tmScreenConfig);
    ~StateMachine();

    void pushState(State* state);
    void popState();
    void changeState(State* state);
    State* peekState();
    void gameLoop();

    std::stack<State*> states;
    sf::RenderWindow window;
    sf::Sprite background;
    thor::ResourceHolder<sf::Texture, TMAssets::TextureType> textures;
    thor::ResourceHolder<sf::SoundBuffer, TMAssets::SoundType> sounds;

private:
    void loadTextures();
    void loadSounds();
};

#endif /* TYPINGMANIAC_STATEMACHINE_H */
