#include <iostream>
#include <log4cplus/initializer.h>
#include <log4cplus/configurator.h>
#include <memory>
#include "States/GameMenuState.h"
#include "GameConfig.h"

int main()
{
    // Initialize logger
    log4cplus::Initializer initializer;
    log4cplus::BasicConfigurator config;
    config.configure();
    log4cplus::Logger logger = log4cplus::Logger::getInstance(LOG4CPLUS_TEXT("TypingManiac"));

    // Initialize state machine
    TMScreenConfig tmScreenConfig =
    {
        .name = TMConfig::WINDOW_NAME,
        .width = TMConfig::SCREEN_WIDTH,
        .height = TMConfig::SCREEN_HEIGHT,
        .frameRate = TMConfig::FRAME_RATE
    };
    std::unique_ptr<StateMachine> stateMachine =  std::make_unique<StateMachine>(tmScreenConfig);
    std::unique_ptr<GameMenuState> gameMenu = std::make_unique<GameMenuState>(stateMachine.get());
    stateMachine->pushState(gameMenu.get());
    stateMachine->gameLoop();
    return 0;
}
