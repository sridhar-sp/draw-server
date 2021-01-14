import { Socket } from "socket.io";

import GamePlayInfoRepository from "../repositories/GamePlayInfoRepository";
import SuccessResponse from "../models/SuccessResponse";
import GamePlayStatus from "../models/GamePlayStatus";
import GameScreen from "../models/GameScreen";
import GameScreenStatePayload from "../models/GameScreenStatePayload";
import SocketEvents from "../socket/SocketEvents";
import redisHelper from "../redis/RedisHelperSingleton";

import { Server } from "socket.io";
import TaskScheduler from "../scheduler/TaskScheduler";
import Task from "../scheduler/Task";
import logger from "../logger/logger";
import TaskType from "../scheduler/TaskType";
import AutoSelectWordTaskRequest from "../models/AutoSelectWordTaskRequest";
import DrawGameScreenStateData from "../models/DrawGameScreenStateData";

class GameEventHandlerService {
  private static TAG = "GameEventHandlerService";

  private socketServer: Server;
  private gamePlayInfoRepository: GamePlayInfoRepository;
  private taskScheduler: TaskScheduler;

  //Will be moved to config or based on the user config value when creating the game
  private static MAX_TIME_TO_SELECT_A_DRAWING_WORD = 3000;
  private static AUTO_SELECT_DRAWING_WORD_TTL_IN_SECONDS = 60;

  constructor(socketServer: Server, taskScheduler: TaskScheduler) {
    this.socketServer = socketServer;
    this.gamePlayInfoRepository = GamePlayInfoRepository.create(redisHelper);
    this.taskScheduler = taskScheduler;
  }

  async handleJoin(socket: Socket) {
    await this.gamePlayInfoRepository.addParticipant(this.getGameKeyFromSocket(socket), socket.id);
  }

  async handleLeave(socket: Socket) {
    try {
      await this.gamePlayInfoRepository.removeParticipant(this.getGameKeyFromSocket(socket), socket.id);
    } catch (err) {
      logger.log(`Caught error ${err}}`);
    }
  }

  async handleStartGame(socket: Socket) {
    const gameKey = this.getGameKeyFromSocket(socket);
    await this.gamePlayInfoRepository.updateGameStatus(gameKey, GamePlayStatus.STARTED);
    await this.gamePlayInfoRepository.assignRoles(gameKey);

    //Temp code
    // this.taskScheduler.scheduleTask(5000, Task.create(TaskType.AUTO_SELECT_WORD, gameKey));
    //Temp code
    console.log("SocketEvents.GAME.START_GAME " + SocketEvents.Game.START_GAME);
    this.socketServer.in(this.getGameKeyFromSocket(socket)).emit(SocketEvents.Game.START_GAME);
  }

  async handleGameScreenState(socket: Socket) {
    const gameScreenState = await this.gamePlayInfoRepository.getGameScreenState(
      this.getGameKeyFromSocket(socket),
      socket.id
    );
    console.log("gameScreenState " + gameScreenState);

    socket.emit(
      SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
      SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""))
    );
  }

  async handleFetchWordList(socket: Socket) {
    const gameKey = this.getGameKeyFromSocket(socket);
    logger.logInfo(GameEventHandlerService.TAG, `REQUEST_LIST_OF_WORD for game = ${gameKey}`);
    this.taskScheduler
      .scheduleTask(
        GameEventHandlerService.MAX_TIME_TO_SELECT_A_DRAWING_WORD,
        Task.create(
          TaskType.AUTO_SELECT_WORD,
          GameEventHandlerService.AUTO_SELECT_DRAWING_WORD_TTL_IN_SECONDS,
          AutoSelectWordTaskRequest.create(
            this.getGameKeyFromSocket(socket),
            socket.id,
            "Sridhar selected as default"
          ).toJson()
        )
      )
      .then((taskId) => this.gamePlayInfoRepository.updateTaskId(gameKey, TaskType.AUTO_SELECT_WORD, taskId))
      .then(() => {
        socket.emit(
          SocketEvents.Game.LIST_OF_WORD_RESPONSE,
          SuccessResponse.createSuccessResponse(["Sridhar", "Laptop", "Toy", "Gun"])
        );
      })
      .catch((error) => logger.logError(GameEventHandlerService.TAG, error));
  }

  async handleSelectWord(socket: Socket, data: string) {
    const gameKey = this.getGameKeyFromSocket(socket);
    logger.logInfo(GameEventHandlerService.TAG, `handleSelectWord game = ${gameKey} data = ${data}`);
    this.gamePlayInfoRepository
      .getTaskId(gameKey, TaskType.AUTO_SELECT_WORD)
      .then((autoSelectWordTaskId) => this.taskScheduler.invalidateTask(autoSelectWordTaskId!!))
      .then(() =>
        socket.emit(
          SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
          SuccessResponse.createSuccessResponse(
            GameScreenStatePayload.create(GameScreen.State.DRAW, DrawGameScreenStateData.create(data).toJson())
          )
        )
      )
      .catch((error) => logger.logError(GameEventHandlerService.TAG, error));
  }

  async tempRotateRoles(gameKey: string) {
    await this.gamePlayInfoRepository.assignRoles(gameKey);
    const gamePlayInfo = await this.gamePlayInfoRepository.getGameInfo(gameKey);
    gamePlayInfo?.participants.forEach((participant) => {
      this.socketServer.sockets.sockets[participant.socketId].emit(
        SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
        SuccessResponse.createSuccessResponse(participant.gameScreenState)
      );
      logger.logInfo(
        "GameEventHandlerService",
        `Assigning ${participant.socketId} with ${participant.gameScreenState}`
      );
    });
    //Temp code
    // this.taskScheduler.scheduleTask(5000, Task.create(TaskType.AUTO_SELECT_WORD, gameKey));
    //Temp code
  }

  handleDrawingEvent(socket: Socket, data: Array<any>) {
    socket.to(this.getGameKeyFromSocket(socket)).emit(SocketEvents.Game.DRAWING_EVENT, data);
  }

  private getGameKeyFromSocket(socket: Socket): string {
    return socket.handshake.query.gameKey;
  }
}

export default GameEventHandlerService;
