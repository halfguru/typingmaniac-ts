cmake_minimum_required(VERSION 3.16)
project(TypingManiac)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS ${CMAKE_CXX_FLAGS} -DUNICODE)
set(CMAKE_MODULE_PATH "${CMAKE_CURRENT_LIST_DIR}/cmake_modules")
set(SFML_ROOT "${CMAKE_CURRENT_LIST_DIR}/sfml_module")

include_directories(lib/log4cplus-2.0.5/include
                    lib/Thor/include
                    lib/Thor/extlibs/aurora/include)

add_executable(${PROJECT_NAME}
        src/main.cpp
        src/States/GameMenuState.cpp
        src/States/GameMenuState.h
        src/States/GameOverState.cpp
        src/States/GameOverState.h
        src/States/GameState.cpp
        src/States/GameState.h
        src/States/PauseMenuState.cpp
        src/States/PauseMenuState.h
        src/States/CourseClearedState.cpp
        src/States/CourseClearedState.h
        src/StateManager/State.h
        src/StateManager/StateMachine.cpp
        src/StateManager/StateMachine.h
        sfml_module/include/SFML/Graphics/RichText.cpp
        sfml_module/include/SFML/Graphics/RichText.hpp
        )

find_package(SFML 2.5 REQUIRED system window graphics audio)
if (SFML_FOUND)
    include_directories(${SFML_INCLUDE_DIR})
    target_link_libraries(${PROJECT_NAME} ${SFML_DEPENDENCIES} ${SFML_LIBRARIES})
endif()

target_link_libraries(${PROJECT_NAME} stdc++fs "${CMAKE_BINARY_DIR}/liblog4cplusUD.dll" "${CMAKE_BINARY_DIR}/libthor-d.dll")
