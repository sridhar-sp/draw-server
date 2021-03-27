import GameScreen from "./GameScreen";
import SimpleUserRecord from "./SimpleUserRecord";
import LeaderBoardData from "./LeaderBoardData";
import ViewGameScreenStateData from "./ViewGameScreenStateData";
import GamePlayInfo from "./GamePlayInfo";
import DrawGameScreenStateData from "./DrawGameScreenStateData";
import SelectWordGameScreenData from "./SelectWordGameScreenData";

class GameScreenStatePayload {
  public gameScreenState: GameScreen;
  public screenData: string;

  static create(gameScreenState: GameScreen, screenData: string): GameScreenStatePayload {
    return new GameScreenStatePayload(gameScreenState, screenData);
  }

  static createWaitForDrawingWord(simpleUserRecord: SimpleUserRecord): GameScreenStatePayload {
    return new GameScreenStatePayload(GameScreen.State.WAIT_FOR_DRAWING_WORD, simpleUserRecord.toJson());
  }

  static createSelectDrawingWord(maxWordSelectionTimeInSeconds: number): GameScreenStatePayload {
    return new GameScreenStatePayload(GameScreen.State.SELECT_DRAWING_WORD, SelectWordGameScreenData.create(maxWordSelectionTimeInSeconds).toJson());
  }

  static createViewStatePayload(hint: string, maxDrawingTimeInSeconds: number, drawingParticipantUserRecord: SimpleUserRecord): GameScreenStatePayload {
    return GameScreenStatePayload.create(GameScreen.State.VIEW,
      ViewGameScreenStateData.create(hint, maxDrawingTimeInSeconds, drawingParticipantUserRecord).toJson())
  }

  static createLeaderBoard(leaderBoardData: LeaderBoardData): GameScreenStatePayload {
    return new GameScreenStatePayload(GameScreen.State.LEADER_BOARD, leaderBoardData.toJson());
  }

  static createDraw(gamePlayInfo: GamePlayInfo): GameScreenStatePayload {
    const word = gamePlayInfo.getDrawingWord() != null ? gamePlayInfo.getDrawingWord()!! : ""

    return GameScreenStatePayload.create(GameScreen.State.DRAW,
      DrawGameScreenStateData.create(word, gamePlayInfo.maxDrawingTime).toJson()
    )
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
