import { JsxEmit } from "typescript";
import GamePlayInfo from "../models/GamePlayInfo";
import GamePlayStatus from "../models/GamePlayStatus";
import RedisHelper from "../redis/RedisHelperV2";
import logger from "../logger/logger";
import Participant from "../models/Participant";
import GameScreen from "../models/GameScreen";
import TaskType from "../scheduler/TaskType";

class GamePlayInfoRepository {
  private static TAG = "GamePlayInfoRepository";

  private redisHelper: RedisHelper;

  public static create(redisHelper: RedisHelper): GamePlayInfoRepository {
    return new GamePlayInfoRepository(redisHelper);
  }

  private constructor(redisHelper: RedisHelper) {
    this.redisHelper = redisHelper;
  }

  createGameInfo(gameKey: string, noOfRounds: number, maxWordSelectionTime: number, maxDrawingTime: number): Promise<GamePlayInfo> {
    const gamePlayInfo = GamePlayInfo.create(gameKey, noOfRounds, maxWordSelectionTime, maxDrawingTime)
    return this.saveGameInfo(gamePlayInfo)
  }

  getGameInfoOrThrow(gameKey: string): Promise<GamePlayInfo> {
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo) => void, reject) => {
      this.redisHelper
        .getString(gameKey)
        .then(async (gamePlayInfoJson) => {
          const gamePlayInfo = GamePlayInfo.fromJson(gamePlayInfoJson ? gamePlayInfoJson : "")
          if (null == gamePlayInfo) reject(`No game record found for game key = ${gameKey}`);
          else resolve(gamePlayInfo);
        })
        .catch(err => reject(err));
    });
  }

  deleteGameInfo(gameKey: string): Promise<boolean> {
    return this.redisHelper.delete_(gameKey);
  }

  saveGameInfo(gamePlayInfo: GamePlayInfo): Promise<GamePlayInfo> {
    return this.redisHelper.setString(gamePlayInfo.gameKey, gamePlayInfo.toJson())
      .then(_ => this.redisHelper.expire(gamePlayInfo.gameKey, gamePlayInfo.getTTLInSeconds()))
      .then(_ => gamePlayInfo)
  }

  addParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          //To-do based on game play status, decide which state to assign to the participant
          gamePlayInfo.addParticipant(Participant.create(socketId));
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then(_ => resolve())
        .catch(err => reject(err));
    });
  }

  removeParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`removeParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.removeParticipant(socketId);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateGameStatus(gameKey: string, gamePlayStatus: GamePlayStatus): Promise<void> {
    logger.logInfo(GamePlayInfoRepository.TAG, `updateGameStatus ${gamePlayStatus} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.updateGamePlayStatus(gamePlayStatus);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }
}

export default GamePlayInfoRepository;
