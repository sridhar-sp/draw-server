import logger from "../logger/logger";
import Participant from "./Participant";
import GamePlayStatus from "./GamePlayStatus";

class GamePlayInfo {
  static createCopy(copyObj: GamePlayInfo): GamePlayInfo {
    return new GamePlayInfo(
      copyObj.gameKey,
      copyObj.gamePlayStatus,
      copyObj.noOfRounds,
      copyObj.currentRound,
      copyObj.participants
    );
  }

  static create(gameKey: string) {
    return new GamePlayInfo(gameKey, GamePlayStatus.NOT_STARTED, 1, 0, []);
  }

  public static fromJson(json: string): GamePlayInfo | null {
    try {
      return this.createCopy(JSON.parse(json) as GamePlayInfo);
    } catch (err) {
      logger.log(`Error while creating a game play object from copy ${err}`);
      return null;
    }
  }

  public gameKey: string;
  public gamePlayStatus: GamePlayStatus;
  public noOfRounds: number;
  public currentRound: number;
  public participants: Participant[];

  constructor(
    gameKey: string,
    gamePlayStatus: GamePlayStatus,
    noOfRounds: number,
    currentRound: number,
    participants: Participant[]
  ) {
    this.gameKey = gameKey;
    this.gamePlayStatus = gamePlayStatus;
    this.noOfRounds = noOfRounds;
    this.currentRound = currentRound;
    this.participants = participants == null ? [] : participants;
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}

export default GamePlayInfo;
