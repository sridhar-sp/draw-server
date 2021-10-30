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
      copyObj.maxWordSelectionTime,
      copyObj.maxDrawingTime,
      Participant.createCopy(copyObj.currentDrawingParticipant),
      Participant.createCopies(copyObj.participants),
      copyObj.autoSelectWordTaskId,
      copyObj.endDrawingSessionTaskId,
      copyObj.word,
      copyObj.hint,
      copyObj.wordSelectTimeInMilliseconds,
      copyObj.matchIndex,
      copyObj.organiserUid,
      copyObj.wordSelectionSource
    );
  }

  static create(gameKey: string, noOfRounds: number, maxWordSelectionTime: number, maxDrawingTime: number, wordSelectionSource: number) {
    return new GamePlayInfo(gameKey, GamePlayStatus.NOT_STARTED, noOfRounds, 1, maxWordSelectionTime, maxDrawingTime, null, [], null, null, null, null, 0, 1, null, wordSelectionSource);
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
  private gamePlayStatus: GamePlayStatus;
  public noOfRounds: number;
  private currentRound: number;
  private maxWordSelectionTime: number
  public maxDrawingTime: number
  private currentDrawingParticipant: Participant | null;
  public participants: Participant[];
  public autoSelectWordTaskId: string | null;
  public endDrawingSessionTaskId: string | null;
  private word: string | null;
  private hint: string | null;
  private wordSelectTimeInMilliseconds: number
  private matchIndex: number
  private organiserUid: string | null
  private wordSelectionSource: number

  constructor(
    gameKey: string,
    gamePlayStatus: GamePlayStatus,
    noOfRounds: number,
    currentRound: number,
    maxWordSelectionTime: number,
    maxDrawingTime: number,
    currentDrawingParticipant: Participant | null,
    participants: Participant[],
    autoSelectWordTaskId: string | null,
    endDrawingSessionTaskId: string | null,
    word: string | null,
    hint: string | null,
    wordSelectTimeInMilliseconds: number,
    matchIndex: number,
    organiserUid: string | null,
    wordSelectionSource: number
  ) {
    this.gameKey = gameKey;
    this.gamePlayStatus = gamePlayStatus;
    this.noOfRounds = noOfRounds;
    this.currentRound = currentRound;
    this.maxWordSelectionTime = maxWordSelectionTime;
    this.maxDrawingTime = maxDrawingTime;
    this.currentDrawingParticipant = currentDrawingParticipant;
    this.participants = participants == null ? [] : participants;
    this.autoSelectWordTaskId = autoSelectWordTaskId;
    this.endDrawingSessionTaskId = endDrawingSessionTaskId;
    this.word = word;
    this.hint = hint
    this.wordSelectTimeInMilliseconds = wordSelectTimeInMilliseconds
    this.matchIndex = matchIndex
    this.organiserUid = organiserUid
    this.wordSelectionSource = wordSelectionSource
  }

  public toJson(): string {
    return JSON.stringify(this);
  }

  public setOrganiserUid(organiserUid: string) {
    this.organiserUid = organiserUid
  }

  public getOrganiserUid(): string | null {
    return this.organiserUid
  }

  public getWordSelectionSource(): number {
    return this.wordSelectionSource
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

    if (this.currentDrawingParticipant != null && this.currentDrawingParticipant.socketId == socketId)
      this.currentDrawingParticipant = null

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

  incrementCurrentRound() {
    this.currentRound++
    this.matchIndex = 1
  }

  incrementMatchIndex() {
    this.matchIndex++
  }

  setAllParticipantGameStateToLeaderBoard() {
    this.participants.forEach(participant => participant.setGameScreenState(GameScreen.State.LEADER_BOARD))
  }

  getParticipantScoreForCurrentMatch(participantSocketId: string): number {
    const participant = this.findParticipant(participantSocketId)
    if (participant == null) {
      logger.logInfo("GamePlayInfo", `getParticipantScoreForCurrentMatch no participant found for ${participantSocketId}`)
      return -1
    }
    return participant.getScore(this.currentRound, this.matchIndex)
  }

  setDrawingParticipantScoreForCurrentMatch(score: number) {
    if (this.currentDrawingParticipant == null) {
      logger.logInfo("GamePlayInfo", `setDrawingParticipantScore no drawing participant found`)
      return
    }
    this.setParticipantScoreForCurrentMatch(this.currentDrawingParticipant.socketId, score)
  }

  setScoreAsZeroToParticipantsWhoHaveNotGuessedTheWordCorrectly() {
    const drawingParticipantSocketId = this.currentDrawingParticipant != null ? this.currentDrawingParticipant.socketId : "-1"
    this.participants
      .filter(participant => participant.socketId != drawingParticipantSocketId)
      .forEach(participant => {
        if (this.getParticipantScoreForCurrentMatch(participant.socketId) == -1) {
          participant.setScore(this.currentRound, this.matchIndex, 0)
        }
      })
  }

  setParticipantScoreForCurrentMatch(participantSocketId: string, score: number) {
    const participant = this.findParticipant(participantSocketId)
    if (participant == null) {
      logger.logInfo("GamePlayInfo", `getParticipantScoreForCurrentMatch no participant found for ${participantSocketId}`)
      return -1
    }
    participant.setScore(this.currentRound, this.matchIndex, Math.round(score))
  }

  isAllParticipantReceivedTheScoreForCurrentRound(): boolean {

    let isAllParticipantReceivedScoreForCurrentRound = true

    this.participants.forEach(participant => {
      if (participant.getScore(this.currentRound, this.matchIndex) == -1) {
        isAllParticipantReceivedScoreForCurrentRound = false;
        return
      }
    })
    return isAllParticipantReceivedScoreForCurrentRound;
  }

  isAllViewingParticipantReceivedTheScoreForCurrentRound(): boolean {

    let isAllViewingParticipantReceivedScoreForCurrentRound = true

    const drawingParticipantSocketId = this.currentDrawingParticipant != null ? this.currentDrawingParticipant.socketId : "-1"

    this.participants
      .filter(participant => participant.socketId != drawingParticipantSocketId)
      .forEach(participant => {
        if (participant.getScore(this.currentRound, this.matchIndex) == -1) {
          isAllViewingParticipantReceivedScoreForCurrentRound = false;
          return
        }
      })

    return isAllViewingParticipantReceivedScoreForCurrentRound;
  }

  getTTLInSeconds(): number {
    const minTTLInSeconds = 60 * 60//1 Hour
    const ttlInSeconds = minTTLInSeconds + this.maxDrawingTime * this.maxWordSelectionTime * this.participants.length * Math.max(this.noOfRounds - this.currentRound, 0)
    return ttlInSeconds
  }

  isCurrentRoundCompleted(): boolean {
    return this.isAllParticipantReceivedTheScoreForCurrentRound() && this.matchIndex >= this.participants.length
  }

  isAllRoundCompleted(): Boolean {
    return this.currentRound >= this.noOfRounds && this.isAllParticipantReceivedTheScoreForCurrentRound() && this.matchIndex >= this.participants.length
  }

  setDrawingParticipant(drawingParticipant: Participant | null) {
    this.currentDrawingParticipant = drawingParticipant
  }

  setDrawingParticipantGameStateAsDraw() {
    this.setDrawingParticipantGameState(GameScreen.State.DRAW)
  }

  setDrawingParticipantGameStateAsSelectingWord() {
    this.setDrawingParticipantGameState(GameScreen.State.SELECT_DRAWING_WORD)
  }

  private setDrawingParticipantGameState(gameScreenState: GameScreen) {
    if (this.currentDrawingParticipant == null) {
      logger.warn("Trying to set drawing participant game state on null")
      return
    }
    this.currentDrawingParticipant.setGameScreenState(gameScreenState)
  }

  //Current/Last Drawing participant
  getDrawingParticipant(): Participant | null {
    return this.currentDrawingParticipant
  }

  setAutoSelectWordTaskId(taskId: string) {
    this.autoSelectWordTaskId = taskId;
  }

  setEndDrawingSessionTaskId(taskId: string) {
    this.endDrawingSessionTaskId = taskId;
  }

  getDrawingWord(): string | null {
    return this.word
  }

  setDrawingWord(word: string) {
    this.word = word
    this.wordSelectTimeInMilliseconds = new Date().getTime()
  }

  setDrawingHint(hint: string) {
    this.hint = hint
  }

  getDrawingHint(): string | null {
    return this.hint
  }

  findScoreBasedOnAnswerTime(): number {
    return (this.maxDrawingTime * 1000 - (new Date().getTime() - this.wordSelectTimeInMilliseconds)) / 1000
  }

  getGamePlayStatus(): GamePlayStatus {
    return this.gamePlayStatus
  }

  setGamePlayStatus(gamePlayStatus: GamePlayStatus) {
    this.gamePlayStatus = gamePlayStatus
  }

  isGameStarted(): boolean {
    return this.gamePlayStatus == GamePlayStatus.STARTED
  }
  isGameFinished(): boolean {
    return this.gamePlayStatus == GamePlayStatus.FINISHED
  }

  getCurrentRound(): number {
    return this.currentRound
  }

  getTotalRounds(): number {
    return this.noOfRounds
  }

  getMatchIndex(): number {
    return this.matchIndex
  }

  getMaxWordSelectionTimeInSeconds(): number {
    return this.maxWordSelectionTime
  }
}

export default GamePlayInfo;
