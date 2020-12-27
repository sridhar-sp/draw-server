import { Socket } from "socket.io";

import GamePlayInfoRepository from "../repositories/GamePlayInfoRepository";
import SuccessResponse from "../models/SuccessResponse";
import GamePlayStatus from "../models/GamePlayStatus";
import GameScreen from "../models/GameScreen";
import SocketEvents from "../socket/SocketEvents";
import redisHelper from "../redis/RedisHelperSingleton";

import { Server } from "socket.io";
import TaskScheduler from "../scheduler/TaskScheduler";
import logger from "../logger/logger";

class GameEventHandlerService {
  private socketServer: Server;
  private gamePlayInfoRepository: GamePlayInfoRepository;
  private taskScheduler: TaskScheduler;

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
    await this.gamePlayInfoRepository.updateGameStatus(this.getGameKeyFromSocket(socket), GamePlayStatus.STARTED);

    socket.handshake.headers.admin = true;
    console.log("SocketEvents.GAME.START_GAME " + SocketEvents.Game.START_GAME);
    this.socketServer.in(this.getGameKeyFromSocket(socket)).emit(SocketEvents.Game.START_GAME);
  }

  handleGameScreenState(socket: Socket) {
    const gameScreenState = socket.handshake.headers.admin ? GameScreen.State.DRAW : GameScreen.State.VIEW;
    console.log("gameScreenState " + gameScreenState);
    socket.emit(SocketEvents.Game.GAME_SCREEN_STATE_RESULT, SuccessResponse.createSuccessResponse(gameScreenState));
  }

  handleDrawingEvent(socket: Socket, data: Array<any>) {
    socket.to(this.getGameKeyFromSocket(socket)).emit(SocketEvents.Game.DRAWING_EVENT, data);
  }

  private getGameKeyFromSocket(socket: Socket): string {
    return socket.handshake.query.gameKey;
  }
}

export default GameEventHandlerService;
