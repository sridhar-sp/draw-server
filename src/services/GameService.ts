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

  createGame(gameCreateRequest: CreateGameRequest): BaseResponse {
    return SuccessResponse.createSuccessResponse(
      CreateGameResponse.create(cryptoRandomString({ length: GameService.GAME_KEY_LENGTH }))
    )
  }
}

export default GameService;
