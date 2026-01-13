import { DeskThing } from "@deskthing/server";
import { SETTING_TYPES } from "@deskthing/types";

export const setupSettings = async () => {
  const Settings = {
    gameSpeed: {
      id: "gameSpeed",
      type: SETTING_TYPES.NUMBER,
      value: 2,
      min: 1,
      max: 10,
      step: 1,
      label: "Game Speed",
      description: "Speed of the snake in the game",
    },
    playWidth: {
      id: "playWidth",
      type: SETTING_TYPES.NUMBER,
      value: 20,
      min: 1,
      max: 100,
      step: 1,
      label: "Play Width",
      description: "width of the play area in squares",
    },
    playHeight: {
      id: "playHeight",
      type: SETTING_TYPES.NUMBER,
      value: 10,
      min: 1,
      max: 100,
      step: 1,
      label: "Play Height",
      description: "height of the play area in squares",
    },
    snakeColor: {
      id: "snakeColor",
      type: SETTING_TYPES.COLOR,
      value: "#ff0000",
      label: "Snake Color",
      description: "Color for the snake in the game",
    },  
    
  };

  DeskThing.initSettings(Settings as any);
  return Settings;
};

