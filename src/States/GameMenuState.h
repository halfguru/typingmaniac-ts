//
// Created by Simon on 5/11/2020.
//

#ifndef TYPINGMANIAC_GAMEMENUSTATE_H
#define TYPINGMANIAC_GAMEMENUSTATE_H

#include "../StateManager/State.h"

enum class MenuState
{
    PLAY,
    QUIT
};


class GameMenuState: public State {
public:
    GameMenuState(StateMachine* stateMachine);

    virtual void draw(const float dt);
    virtual void update(const float dt);
    virtual void handleInput();

private:
    void loadGame();

    sf::View menuView;
    sf::Font menuFont;
    std::vector<sf::Text> menuText;
    sf::Clock clock;
    sf::Sound sound;
    sf::Music gameMenuMusic;
    bool loadingGame = false;
    unsigned int colorValue = 0;
    unsigned int menuSelectionId = 0;
    unsigned int backgroundColorValue = 255;
};


#endif //TYPINGMANIAC_GAMEMENUSTATE_H
