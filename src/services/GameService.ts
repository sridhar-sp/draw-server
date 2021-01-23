import GamePlayInfoRepository from "../repositories/GamePlayInfoRepository";
import redisHelper from "../redis/RedisHelperSingleton";
import BaseResponse from "../models/BaseResponse";
import SuccessResponse from "../models/SuccessResponse";
import ErrorResponse from "../models/ErrorResponse";
import CreateGameResponse from "../models/CreateGameResponse";
import CreateGameRequest from "../models/CreateGameRequest";
import cryptoRandomString from "crypto-random-string";

class GameService {
  private static GAME_KEY_LENGTH = 10;

  private gamePlayInfoRepository: GamePlayInfoRepository;

  constructor() {
    this.gamePlayInfoRepository = GamePlayInfoRepository.create(redisHelper);
  }

  createGame(request: CreateGameRequest): Promise<BaseResponse> {
    return new Promise((resolve: (response: BaseResponse) => void, reject: (error: Error) => void) => {
      const gameKey = cryptoRandomString({ length: GameService.GAME_KEY_LENGTH })
      this.gamePlayInfoRepository
        .createGameInfo(gameKey, request.noOfRounds, request.maxWordSelectionTime, request.maxDrawingTime)
        .then(gamePlayInfo => resolve(SuccessResponse.createSuccessResponse(CreateGameResponse.create(gamePlayInfo.gameKey))))
        .catch(error => resolve(ErrorResponse.createErrorResponse(500, String(error))))
    })
  }
}

export default GameService;
