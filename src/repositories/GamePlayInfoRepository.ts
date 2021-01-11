import { JsxEmit } from "typescript";
import GamePlayInfo from "../models/GamePlayInfo";
import GamePlayStatus from "../models/GamePlayStatus";
import RedisHelper from "../redis/RedisHelperV2";
import logger from "../logger/logger";
import Participant from "../models/Participant";

class GamePlayInfoRepository {
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
    logger.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getOrCreateGameInfo(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.addParticipant(Participant.create(socketId));
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  removeParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`removeParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          gamePlayInfo.removeParticipant(socketId);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateGameStatus(gameKey: string, gamePlayStatus: GamePlayStatus): Promise<void> {
    logger.log(`updateGameStatus ${gamePlayStatus} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          gamePlayInfo.updateGamePlayStatus(gamePlayStatus);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }
}

export default GamePlayInfoRepository;
