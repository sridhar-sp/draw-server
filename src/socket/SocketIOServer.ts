import "./Extension";
import SocketEvents from "./SocketEvents";
import socketIOAuthMiddleware from "../middlewares/socketAccessTokenAuthMiddleware";
import gameKeyVerifierSocketMiddleware from "../middlewares/gameKeyVerifierSocketMiddleware"
import RoomEventHandlerService from "../services/RoomEventHandlerService";
import GameEventHandlerService from "../services/GameEventHandlerService";

import socketIo from "socket.io";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import TaskScheduler from "../scheduler/TaskScheduler";
import TaskRepository from "../scheduler/TaskRepository";
import TaskSchedulerImpl from "../scheduler/TaskSchedulerImpl";
import TaskRepositoryImpl from "../scheduler/TaskRepositoryImpl";
import redisHelper from "../redis/RedisHelperSingleton";
import TaskConsumerImpl from "../scheduler/TaskConsumerImpl";
import TaskType from "../scheduler/TaskType";
import logger from "../logger/logger";
import Task from "../scheduler/Task";

import AutoSelectWordTaskRequest from "../models/AutoSelectWordTaskRequest";
import AutoEndDrawingSessionTaskRequest from "../models/AutoEndDrawingSessionTaskRequest";
import DismissLeaderBoardTaskRequest from "../models/DismissLeaderBoardTaskRequest";

class SocketIOServer {
  private static TAG = "SocketIOServer";

  private socketServer: SocketIO.Server;
  private gameEventHandlerService: GameEventHandlerService;
  private roomEventHandlerService: RoomEventHandlerService;

  private taskScheduler: TaskScheduler;

  constructor(httpServer: HttpServer | HttpsServer) {
    this.socketServer = socketIo(httpServer);

    const taskRepository: TaskRepository = TaskRepositoryImpl.create(redisHelper);
    this.taskScheduler = TaskSchedulerImpl.create(taskRepository);

    this.roomEventHandlerService = new RoomEventHandlerService(this.socketServer);
    this.gameEventHandlerService = new GameEventHandlerService(this.socketServer, this.taskScheduler);

    const autoSelectTaskConsumer = TaskConsumerImpl.create(taskRepository);
    autoSelectTaskConsumer.consume(TaskType.AUTO_SELECT_WORD, this.onTimeToAutoSelectWord.bind(this));

    const endDrawingSessionTaskConsumer = TaskConsumerImpl.create(taskRepository);
    endDrawingSessionTaskConsumer.consume(TaskType.END_DRAWING_SESSION, this.onTimeToEndDrawingSession.bind(this));

    const dismissLeaderBoardTaskConsumer = TaskConsumerImpl.create(taskRepository);
    dismissLeaderBoardTaskConsumer.consume(TaskType.DISMISS_LEADER_BOARD, this.onDismissLeaderBoard.bind(this));
  }

  static bind(httpServer: any) {
    return new SocketIOServer(httpServer);
  }

  build() {
    this.attachMiddleware();
    this.setup();
  }

  private attachMiddleware() {
    this.socketServer.use(socketIOAuthMiddleware);
    this.socketServer.use(gameKeyVerifierSocketMiddleware)
  }

  private onTimeToAutoSelectWord(task: Task) {
    const request = AutoSelectWordTaskRequest.fromJson(task.payload);
    logger.logInfo(SocketIOServer.TAG, `onTimeToAutoSelectWord ${request.word}`);

    const socketWhoIsYetToSelectTheWord = this.socketServer.sockets.sockets[request.socketId];
    if (socketWhoIsYetToSelectTheWord == null) {
      logger.logError(SocketIOServer.TAG, "onTimeToAutoSelectWord socket becomes a ghost, can't proceed with the task execution");
      return;
    }
    this.gameEventHandlerService.handleSelectWord(socketWhoIsYetToSelectTheWord, request.word);
  }

  private onTimeToEndDrawingSession(task: Task) {
    logger.logInfo(SocketIOServer.TAG, `onTimeToEndDrawingSession ${task.payload}`);
    const request = AutoEndDrawingSessionTaskRequest.fromJson(task.payload)
    this.gameEventHandlerService.endCurrentDrawingSession(request.gameKey)
  }

  private onDismissLeaderBoard(task: Task) {
    logger.logInfo(SocketIOServer.TAG, `onDismissLeaderBoard ${task.payload}`);
    const request = DismissLeaderBoardTaskRequest.fromJson(task.payload)
    this.gameEventHandlerService.rotateUserGameScreenState(request.gameKey)
  }

  private setup() {
    this.socketServer.on("connection", (socket) => {
      logger.log(`Socket connected ${socket.id}
            Gamekey = ${socket.handshake.query.gameKey} 
            name = ${socket.request.userRecord.displayName}`);

      socket.join(socket.getGameKey(), (err) => {
        //this.roomEventHandlerService.handleJoin(socket, err);
        //To-Do check, is await needs to be added here or not
        this.gameEventHandlerService.handleJoin(socket, err);
      });

      socket.on("disconnect", () => {
        this.roomEventHandlerService.handleLeave(socket);
        this.gameEventHandlerService.handleLeave(socket);
      });

      socket.on(SocketEvents.Game.LEAVE_GAME, () => {
        this.roomEventHandlerService.handleLeave(socket);
        this.gameEventHandlerService.handleLeave(socket);
      });

      socket.on(SocketEvents.Room.FETCH_USER_RECORDS, (data) => {
        this.roomEventHandlerService.handleFetchUserRecords(socket);
      });

      socket.on(SocketEvents.Game.REQUEST_START_GAME, async (data) => {
        await this.gameEventHandlerService.handleStartGame(socket);
      });

      socket.on(SocketEvents.Game.REQUEST_GAME_SCREEN_STATE, async (data) => {
        await this.gameEventHandlerService.handleGameScreenState(socket);
      });

      socket.on(SocketEvents.Game.REQUEST_LIST_OF_WORD, (data) => {
        this.gameEventHandlerService.handleFetchWordList(socket);
      });

      socket.on(SocketEvents.Game.REQUEST_SELECT_WORD, (data) => {
        this.gameEventHandlerService.handleSelectWord(socket, data);
      });

      socket.on(SocketEvents.Game.DRAWING_EVENT, (data) => {
        this.gameEventHandlerService.handleDrawingEvent(socket, data);
      });

      socket.on(SocketEvents.Game.ANSWER_REQUEST, (data) => {
        this.gameEventHandlerService.handleAnswerEvent(socket, data);
      });
    });
  }
}

export default SocketIOServer;
