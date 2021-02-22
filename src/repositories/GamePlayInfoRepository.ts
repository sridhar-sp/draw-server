import GamePlayInfo from "../models/GamePlayInfo";
import RedisHelper from "../redis/RedisHelperV2";
import logger from "../logger/logger";
import Participant from "../models/Participant";

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

  addParticipant(gameKey: string, socketId: string): Promise<GamePlayInfo> {
    logger.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo) => void, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          //To-do based on game play status, decide which state to assign to the participant
          gamePlayInfo.addParticipant(Participant.create(socketId));
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson()).then(() => gamePlayInfo);
        })
        .then(gamePlayInfo => resolve(gamePlayInfo))
        .catch(err => reject(err));
    });
  }

}

export default GamePlayInfoRepository;
