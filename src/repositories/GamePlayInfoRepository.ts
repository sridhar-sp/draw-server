import GamePlayInfo from "../models/GamePlayInfo";
import RedisHelper from "../redis/RedisHelperV2";

class GamePlayInfoRepository {
  private static TAG = "GamePlayInfoRepository";

  private redisHelper: RedisHelper;

  public static create(redisHelper: RedisHelper): GamePlayInfoRepository {
    return new GamePlayInfoRepository(redisHelper);
  }

  private constructor(redisHelper: RedisHelper) {
    this.redisHelper = redisHelper;
  }

  createGameInfo(gameKey: string, noOfRounds: number, maxWordSelectionTime: number, maxDrawingTime: number, wordSelectionSource: number): Promise<GamePlayInfo> {
    const gamePlayInfo = GamePlayInfo.create(gameKey, noOfRounds, maxWordSelectionTime, maxDrawingTime, wordSelectionSource)
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

}

export default GamePlayInfoRepository;
