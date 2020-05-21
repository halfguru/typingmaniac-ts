//
// Created by Simon on 5/13/2020.
//

#ifndef TYPINGMANIAC_GAMECONFIG_H
#define TYPINGMANIAC_GAMECONFIG_H

#include <SFML/Graphics/Color.hpp>
#include <experimental/filesystem>
#include <string>

namespace TMConfig
{
    static constexpr unsigned short SCREEN_WIDTH = 1280;
    static constexpr unsigned short SCREEN_HEIGHT = 720;
    static constexpr unsigned char FRAME_RATE = 60;
    constexpr char WINDOW_NAME[] = "Typing Maniac";
    const std::experimental::filesystem::path dictionaryPath = "../dictionary.txt";
    static constexpr unsigned char gameOverMenuFontSize = 60;
    static constexpr unsigned char menuFontSize = 34;
    static constexpr unsigned char wordFontSize = 24;
    const sf::Color gameWordFontColor = sf::Color::White;
    const sf::Color gameWordHighlightColor = sf::Color::Yellow;
    const sf::Color gameWordErrorColor = sf::Color::Red;
    const sf::Color gameMenuFontColor = sf::Color::White;
    const sf::Color gameMenuHighlightColor = sf::Color::Red;
    const sf::Color gameOverMenuColor = sf::Color::Red;
}

namespace TMAssets
{
    const std::experimental::filesystem::path fontsPath = "../assets/fonts/";
    const std::experimental::filesystem::path imagesPath = "../assets/images/";
    const std::experimental::filesystem::path soundsPath = "../assets/sounds/";
    const std::experimental::filesystem::path minecraftFontPath = fontsPath.string() + "minecraft.ttf";
    const std::experimental::filesystem::path backgroundImgPath = imagesPath.string() + "background.png";
    const std::experimental::filesystem::path correctWordSoundPath = soundsPath.string() + "smw_coin.wav";
    const std::experimental::filesystem::path errorWordSoundPath = soundsPath.string() + "smw_lemmy_wendy_incorrect.wav";
    const std::experimental::filesystem::path menuSelectSoundPath = soundsPath.string() + "smb2_throw.wav";
    const std::experimental::filesystem::path menuPauseSoundPath = soundsPath.string() + "smw_pause.wav";
    const std::experimental::filesystem::path menuMusicPath = soundsPath.string() + "title_theme.wav";
    const std::experimental::filesystem::path inGameMusicPath = soundsPath.string() + "overworld_theme.wav";
    const std::experimental::filesystem::path gameOverMusicPath = soundsPath.string() + "smb_gameover.wav";
    const std::experimental::filesystem::path courseClearedMusicPath = soundsPath.string() + "smw_course_clear.wav";

    enum class TextureType
    {
        Background,
    };


    enum class SoundType
    {
        CorrectWord,
        ErrorWord,
        MenuSelect,
        MenuPause
    };

    enum class FontType
    {
        Minecraft
    };
}

#endif //TYPINGMANIAC_GAMECONFIG_H
