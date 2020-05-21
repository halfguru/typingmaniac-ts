//
// Created by Simon on 5/20/2020.
//

#ifndef TYPINGMANIAC_COURSECLEAREDSTATE_H
#define TYPINGMANIAC_COURSECLEAREDSTATE_H

#include "../StateManager/State.h"
#include "../StateManager/StateMachine.h"

class CourseClearedState: public State
{
public:
    CourseClearedState(StateMachine* stateMachine);

    virtual void draw(const float dt);
    virtual void update(const float dt);
    virtual void handleInput();

private:
    void goBacktoInGame();

    sf::View menuView;
    sf::Text courseClearedText;
    sf::Music courseClearedMusic;
};


#endif //TYPINGMANIAC_COURSECLEAREDSTATE_H
