//
// Created by Simon on 5/18/2020.
//

#ifndef TYPINGMANIAC_PAUSEMENUSTATE_H
#define TYPINGMANIAC_PAUSEMENUSTATE_H

#include "../GameConfig.h"
#include "../StateManager/State.h"

class PauseMenuState: public State
{
public:
    PauseMenuState(StateMachine* stateMachine);

    virtual void draw(const float dt);
    virtual void update(const float dt);
    virtual void handleInput();

private:
    void goBackToInGame();

    sf::View menuView;
    sf::Clock clock;
    sf::Sound sound;
    std::vector<sf::Text> pauseMenuText;
    std::vector<sf::Color> pauseColorStates = {TMConfig::gameOverMenuColor, TMConfig::gameWordFontColor};
    unsigned int pauseColorIndex = 0;
};


#endif //TYPINGMANIAC_PAUSEMENUSTATE_H
