//
// Created by Simon on 5/11/2020.
//

#ifndef BREAKOUT_STATE_H
#define BREAKOUT_STATE_H

#include "StateMachine.h"

class State
{
public:
    virtual void draw(const float dt) = 0;
    virtual void update(const float dt) = 0;
    virtual void handleInput() = 0;

    StateMachine* stateMachine;
};

#endif /* BREAKOUT_STATE_H */
