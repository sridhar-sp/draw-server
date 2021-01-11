import { JsxEmit } from "typescript";
import GamePlayInfo from "../models/GamePlayInfo";
import GamePlayStatus from "../models/GamePlayStatus";
import RedisHelper from "../redis/RedisHelperV2";
import logger from "../logger/logger";
import Participant from "../models/Participant";
import Task from "../scheduler/Task";

class GamePlayInfoRepository {
  private static TAG = "GamePlayInfoRepository";

  private redisHelper: RedisHelper;

  public static create(redisHelper: RedisHelper): GamePlayInfoRepository {
    return new GamePlayInfoRepository(redisHelper);
  }

  private constructor(redisHelper: RedisHelper) {
    this.redisHelper = redisHelper;
  }

  getGameInfo(gameKey: string): Promise<GamePlayInfo | null> {
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo | null) => void, reject) => {
      this.redisHelper
        .getString(gameKey)
        .then(async (gamePlayInfoJson) => {
          if (null == gamePlayInfoJson) resolve(null);
          else resolve(GamePlayInfo.fromJson(gamePlayInfoJson));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getOrCreateGameInfo(gameKey: string): Promise<GamePlayInfo> {
    return new Promise(async (resolve: (gamePlayInfo: GamePlayInfo) => void, reject) => {
      this.getGameInfo(gameKey).then(async (gamePlayInfo) => {
        if (null != gamePlayInfo) {
          resolve(gamePlayInfo);
          return;
        }
        const newGamePlayInfo = GamePlayInfo.create(gameKey);
        await this.redisHelper.setString(gameKey, newGamePlayInfo.toJson());
        resolve(newGamePlayInfo);
      });
    });
  }

  deleteGameInfo(gameKey: string): Promise<boolean> {
    return this.redisHelper.delete_(gameKey);
  }

  addParticipant(gameKey: string, socketId: string): Promise<void> {
    this.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getOrCreateGameInfo(gameKey)
        .then((gamePlayInfo) => {
          const index = this.findParticipant(gamePlayInfo, socketId);

          if (index != -1) {
            this.warn(`Participant record already available at index ${index}`);
            return false;
          }

          const participant = Participant.create(socketId);

          gamePlayInfo.participants.push(participant);
          this.log(`Added participant ${participant.socketId}`);

          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  removeParticipant(gameKey: string, socketId: string): Promise<void> {
    this.log(`removeParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          const index = this.findParticipant(gamePlayInfo, socketId);

          if (index == -1) {
            this.log(`No user record found for ${socketId}`);
            return false;
          }

          const participantToRemove = gamePlayInfo.participants[index];
          this.log(`Removed participant from game play info ${participantToRemove}`);

          gamePlayInfo.participants.splice(index, 1);

          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateGameStatus(gameKey: string, gamePlayStatus: GamePlayStatus): Promise<void> {
    this.log(`updateGameStatus ${gamePlayStatus} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          gamePlayInfo.gamePlayStatus = gamePlayStatus;
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  findParticipant(gamePlayInfo: GamePlayInfo, socketId: string): number {
    if (!gamePlayInfo.participants || gamePlayInfo.participants.length == 0) return -1;
    return gamePlayInfo.participants.findIndex((participant) => participant.socketId == socketId);
  }

  private log(log: string) {
    logger.log(`${GamePlayInfoRepository.TAG} :: ${log}`);
  }

  private warn(log: string) {
    logger.warn(`${GamePlayInfoRepository.TAG} :: ${log}`);
  }
}

export default GamePlayInfoRepository;
