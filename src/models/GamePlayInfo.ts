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

  updateGamePlayStatus(gamePlayStatus: GamePlayStatus): void {
    this.gamePlayStatus = gamePlayStatus;
  }

  addParticipant(participant: Participant): Participant {
    const index = this.findParticipant(participant.socketId);

    if (index != -1) {
      logger.warn(`Participant record already available at index ${index}`);
      return this.participants[index];
    }

    this.participants.push(participant);
    logger.log(`Added participant ${participant.socketId}`);

    return participant;
  }

  removeParticipant(socketId: string): Participant | null {
    const index = this.findParticipant(socketId);

    if (index == -1) {
      logger.log(`No user record found for ${socketId}`);
      return null;
    }

    const participantToRemove = this.participants[index];

    this.participants.splice(index, 1);

    return participantToRemove;
  }

  findParticipant(socketId: string): number {
    if (!this.participants || this.participants.length == 0) return -1;
    return this.participants.findIndex((participant) => participant.socketId == socketId);
  }
}

export default GamePlayInfo;
