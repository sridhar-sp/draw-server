import { request } from "express";
import GameScreen from "./GameScreen";

class GameScreenStatePayload {
  public gameScreenState: GameScreen;
  public screenData: string;

  static create(gameScreenState: GameScreen, screenData: string): GameScreenStatePayload {
    return new GameScreenStatePayload(gameScreenState, screenData);
  }

  constructor(gameScreenState: GameScreen, screenData: string) {
    this.gameScreenState = gameScreenState;
    this.screenData = screenData;
  }

  toJson(): string {
    return JSON.stringify(this);
  }
}

export default GameScreenStatePayload;
