//
// Created by Simon on 5/17/2020.
//

#ifndef TYPINGMANIAC_GAMEOVERSTATE_H
#define TYPINGMANIAC_GAMEOVERSTATE_H

#include "../GameConfig.h"
#include "../StateManager/State.h"

class GameOverState: public State
{
public:
    GameOverState(StateMachine* stateMachine);

    virtual void draw(const float dt);
    virtual void update(const float dt);
    virtual void handleInput();

private:
    void goBackToMainMenu();

    unsigned int gameOverColorIndex = 0;
    std::vector<sf::Color> gameOverColorStates = {TMConfig::gameOverMenuColor, TMConfig::gameWordFontColor};
    sf::Clock clock;
    sf::View menuView;
    sf::Font menuFont;
    sf::Sound sound;
    sf::Music gameOverMusic;
    std::vector<sf::Text> gameOverMenuText;
    bool gameOverStarted = false;
};

#endif //TYPINGMANIAC_GAMEOVERSTATE_H
