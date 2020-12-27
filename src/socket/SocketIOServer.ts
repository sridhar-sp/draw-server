import "./Extension";
import SocketEvents from "./SocketEvents";
import socketIOAuthMiddleware from "../middlewares/socketAccessTokenAuthMiddleware";
import RoomEventHandlerService from "../services/RoomEventHandlerService";
import GameEventHandlerService from "../services/GameEventHandlerService";

import socketIo from "socket.io";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import TaskScheduler from "../scheduler/TaskScheduler";
import TaskConsumer from "../scheduler/TaskConsumer";
import TaskRepository from "../scheduler/TaskRepository";
import TaskSchedulerImpl from "../scheduler/TaskSchedulerImpl";
import TaskRepositoryImpl from "../scheduler/TaskRepositoryImpl";
import redisHelper from "../redis/RedisHelperSingleton";
import TaskConsumerImpl from "../scheduler/TaskConsumerImpl";
import TaskType from "../scheduler/TaskType";
import logger from "../logger/logger";
import Task from "../scheduler/Task";

class SocketIOServer {
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
    autoSelectTaskConsumer.consume(TaskType.AUTO_SELECT_WORD, this.onTimeToAutoSelectWord);

    const endDrawingSessionTaskConsumer = TaskConsumerImpl.create(taskRepository);
    endDrawingSessionTaskConsumer.consume(TaskType.END_DRAWING_SESSION, this.onTimeToEndDrawingSession);
  }

  static bind(httpServer: any) {
    return new SocketIOServer(httpServer);
  }

  build() {
    this.attachAuthMiddleware();
    this.setup();
  }

  private attachAuthMiddleware() {
    this.socketServer.use(socketIOAuthMiddleware);
  }

  private onTimeToAutoSelectWord(task: Task) {
    logger.log("***** onTimeToAutoSelectWord Payload " + task.payload);
  }

  private onTimeToEndDrawingSession(task: Task) {
    logger.log("***** onTimeToEndDrawingSession Payload " + task.payload);
  }

  private setup() {
    this.socketServer.on("connection", (socket) => {
      logger.log(`Socket connected ${socket.id}
            Gamekey = ${socket.handshake.query.gameKey} 
            name = ${socket.request.userRecord.displayName}`);

      socket.join(socket.getGameKey(), (err) => {
        this.roomEventHandlerService.handleJoin(socket, err);
        this.gameEventHandlerService.handleJoin(socket);
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
        this.gameEventHandlerService.handleStartGame(socket);
        this.taskScheduler.scheduleTask(2000, Task.create(TaskType.AUTO_SELECT_WORD, "hye man"));
      });

      socket.on(SocketEvents.Game.REQUEST_GAME_SCREEN_STATE, (data) => {
        this.gameEventHandlerService.handleGameScreenState(socket);
      });

      socket.on(SocketEvents.Game.DRAWING_EVENT, (data) => {
        this.gameEventHandlerService.handleDrawingEvent(socket, data);
      });

      socket.on(SocketEvents.Game.ANSWER_EVENT, (data) => {
        console.log(`Answer ${data}`);
      });
    });
  }
}

export default SocketIOServer;
