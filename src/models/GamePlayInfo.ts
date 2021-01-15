import logger from "../logger/logger";
import Participant from "./Participant";
import GamePlayStatus from "./GamePlayStatus";
import GameScreen from "./GameScreen";

class GamePlayInfo {
  static createCopy(copyObj: GamePlayInfo): GamePlayInfo {
    return new GamePlayInfo(
      copyObj.gameKey,
      copyObj.gamePlayStatus,
      copyObj.noOfRounds,
      copyObj.currentRound,
      copyObj.currentDrawingParticipant,
      copyObj.participants,
      copyObj.autoSelectWordTaskId,
      copyObj.endDrawingSessionTaskId,
      copyObj.word
    );
  }

  static create(gameKey: string) {
    return new GamePlayInfo(gameKey, GamePlayStatus.NOT_STARTED, 1, 0, null, [], null, null, null);
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
  public currentDrawingParticipant: Participant | null;
  public participants: Participant[];
  public autoSelectWordTaskId: string | null;
  public endDrawingSessionTaskId: string | null;
  public word: string | null;

  constructor(
    gameKey: string,
    gamePlayStatus: GamePlayStatus,
    noOfRounds: number,
    currentRound: number,
    currentDrawingParticipant: Participant | null,
    participants: Participant[],
    autoSelectWordTaskId: string | null,
    endDrawingSessionTaskId: string | null,
    word: string | null
  ) {
    this.gameKey = gameKey;
    this.gamePlayStatus = gamePlayStatus;
    this.noOfRounds = noOfRounds;
    this.currentRound = currentRound;
    this.currentDrawingParticipant = currentDrawingParticipant;
    this.participants = participants == null ? [] : participants;
    this.autoSelectWordTaskId = autoSelectWordTaskId;
    this.endDrawingSessionTaskId = endDrawingSessionTaskId;
    this.word = word;
  }

  public toJson(): string {
    return JSON.stringify(this);
  }

  updateGamePlayStatus(gamePlayStatus: GamePlayStatus): void {
    this.gamePlayStatus = gamePlayStatus;
  }

  addParticipant(participant: Participant): Participant {
    const index = this.findParticipantIndex(participant.socketId);

    if (index != -1) {
      logger.warn(`Participant record already available at index ${index}`);
      return this.participants[index];
    }

    this.participants.push(participant);
    logger.log(`Added participant ${participant.socketId}`);

    return participant;
  }

  removeParticipant(socketId: string): Participant | null {
    const index = this.findParticipantIndex(socketId);

    if (index == -1) {
      logger.log(`No user record found for ${socketId}`);
      return null;
    }

    const participantToRemove = this.participants[index];

    this.participants.splice(index, 1);

    return participantToRemove;
  }

  findParticipant(socketId: string): Participant | null {
    const index = this.findParticipantIndex(socketId);
    if (index == -1) return null;
    return this.participants[index];
  }

  findParticipantIndex(socketId: string): number {
    if (!this.participants || this.participants.length == 0) return -1;
    return this.participants.findIndex((participant) => participant.socketId == socketId);
  }

  findNextParticipantIndex(currentPlayerSocketId: string): number {
    if (!this.participants || this.participants.length == 0) return -1;

    const currentPlayerIndex = this.participants.findIndex(
      (participant) => participant.socketId == currentPlayerSocketId
    );

    return (currentPlayerIndex + 1) % this.participants.length;
  }

  findDrawingParticipant(): Participant | null {
    if (!this.participants || this.participants.length == 0) return null;

    for (let index = 0; index < this.participants.length; index++) {
      const participant = this.participants[index];
      if (participant.gameScreenState == GameScreen.State.SELECT_DRAWING_WORD) return participant;
    }
    return null;
  }

  setAutoSelectWordTaskId(taskId: string) {
    this.autoSelectWordTaskId = taskId;
  }

  setEndDrawingSessionTaskId(taskId: string) {
    this.endDrawingSessionTaskId = taskId;
  }
}

export default GamePlayInfo;
