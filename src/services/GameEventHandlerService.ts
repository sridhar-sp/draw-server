import { Socket } from "socket.io";

import GamePlayInfoRepository from "../repositories/GamePlayInfoRepository";
import SuccessResponse from "../models/SuccessResponse";
import ErrorResponse from "../models/ErrorResponse"
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
import QuestionRepository from "../repositories/QuestionRepository";
import SocketUtils from "../socket/SocketUtils";
import ViewGameScreenStateData from "../models/ViewGameScreenStateData";
import SimpleGameInfo from "../models/SimpleGameInfo";

class GameEventHandlerService {
  private static TAG = "GameEventHandlerService";

  private socketServer: Server;
  private gamePlayInfoRepository: GamePlayInfoRepository;
  private taskScheduler: TaskScheduler;
  private questionRepository: QuestionRepository;

  //Will be moved to config or based on the user config value when creating the game
  private static MAX_TIME_TO_SELECT_A_DRAWING_WORD = 3000;
  private static AUTO_SELECT_DRAWING_WORD_TTL_IN_SECONDS = 60;

  constructor(socketServer: Server, taskScheduler: TaskScheduler) {
    this.socketServer = socketServer;
    this.gamePlayInfoRepository = GamePlayInfoRepository.create(redisHelper);
    this.questionRepository = QuestionRepository.create();
    this.taskScheduler = taskScheduler;
  }

  async handleJoin(socket: Socket, errJoiningRoom: Error) {

    if (errJoiningRoom) {
      socket.emit(SocketEvents.Room.JOINED, ErrorResponse.createErrorResponse(500, "Failed to join room"))
    }

    const gameKey = socket.getGameKey();

    this.gamePlayInfoRepository.addParticipant(gameKey, socket.id)
      .then(_ => this.gamePlayInfoRepository.getGameInfo(gameKey))
      .then(gamePlayInfo => {
        if (gamePlayInfo == null)
          throw new Error(`No game play info exist for game key ${gameKey}`)

        socket.emit(SocketEvents.Room.JOINED, SuccessResponse.createSuccessResponse(
          SimpleGameInfo.createSimpleGameInfo(
            gamePlayInfo.gameKey,
            gamePlayInfo.noOfRounds,
            gamePlayInfo.maxDrawingTime,
            gamePlayInfo.maxWordSelectionTime
          )
        ))

        socket.to(socket.getGameKey()).emit(SocketEvents.Room.MEMBER_ADD,
          SuccessResponse.createSuccessResponse(socket.getUserRecord()))
      }).catch(error => {
        socket.emit(SocketEvents.Room.JOINED, ErrorResponse.createErrorResponse(500, String(error)))
      })

  }

  async handleLeave(socket: Socket) {
    try {
      await this.gamePlayInfoRepository.removeParticipant(socket.getGameKey(), socket.id);
    } catch (err) {
      logger.log(`Caught error ${err}}`);
    }
  }

  async handleStartGame(socket: Socket) {
    const gameKey = socket.getGameKey();
    await this.gamePlayInfoRepository.assignRoles(gameKey);
    await this.gamePlayInfoRepository.updateGameStatus(gameKey, GamePlayStatus.STARTED);

    console.log("SocketEvents.GAME.START_GAME " + SocketEvents.Game.START_GAME);
    this.socketServer.in(socket.getGameKey()).emit(SocketEvents.Game.START_GAME);
  }

  async handleGameScreenState(socket: Socket) {
    const gameKey = socket.getGameKey();

    this.gamePlayInfoRepository
      .getGameInfo(gameKey)
      .then((gamePlayInfo) => {
        if (gamePlayInfo == null) throw new Error(`No game record found for ${gameKey}`);

        const thisParticipant = gamePlayInfo.findParticipant(socket.id);
        if (thisParticipant == null) throw new Error(`Participant ${socket.id} is not belong to the game ${gameKey}`);

        const gameScreenState = thisParticipant.gameScreenState;
        switch (gameScreenState) {
          case GameScreen.State.NONE:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
          case GameScreen.State.SELECT_DRAWING_WORD:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
          case GameScreen.State.DRAW:
            if (gamePlayInfo.word == null)
              throw new Error("No drawing word is selected, but the game screen state is set as RAW");
            return SuccessResponse.createSuccessResponse(
              GameScreenStatePayload.create(gameScreenState, DrawGameScreenStateData.create(gamePlayInfo.word).toJson())
            );
          case GameScreen.State.WAIT_FOR_DRAWING_WORD:
            const drawingParticipant = gamePlayInfo.findDrawingParticipant();
            if (null == drawingParticipant)
              throw new Error(
                `No participant is selecting a word to draw but participant ${thisParticipant.socketId} is in waiting state`
              );
            const drawingParticipantSocket = this.socketServer.sockets.sockets[drawingParticipant.socketId];
            if (null == drawingParticipantSocket)
              throw new Error(`Drawing participant socket instance is not found for game ${gameKey}`);

            return SuccessResponse.createSuccessResponse(
              GameScreenStatePayload.create(gameScreenState, drawingParticipantSocket.getUserRecord().toJson())
            );
          case GameScreen.State.VIEW:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
          case GameScreen.State.LEADER_BOARD:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
        }
      })
      .then((gameScreenStateResponse) =>
        socket.emit(SocketEvents.Game.GAME_SCREEN_STATE_RESULT, gameScreenStateResponse)
      )
      .catch((error) => logger.logError(GameEventHandlerService.TAG, `handleGameScreenState : ${error}`));
  }

  async handleFetchWordList(socket: Socket) {
    const gameKey = socket.getGameKey();
    logger.logInfo(GameEventHandlerService.TAG, `REQUEST_LIST_OF_WORD for game = ${gameKey}`);
    const questions = this.questionRepository.getRandomQuestions(5);
    this.taskScheduler
      .scheduleTask(
        GameEventHandlerService.MAX_TIME_TO_SELECT_A_DRAWING_WORD,
        Task.create(
          TaskType.AUTO_SELECT_WORD,
          GameEventHandlerService.AUTO_SELECT_DRAWING_WORD_TTL_IN_SECONDS,
          AutoSelectWordTaskRequest.create(socket.getGameKey(), socket.id, questions[0]).toJson()
        )
      )
      .then((taskId) => this.gamePlayInfoRepository.updateTaskId(gameKey, TaskType.AUTO_SELECT_WORD, taskId))
      .then(() => {
        socket.emit(SocketEvents.Game.LIST_OF_WORD_RESPONSE, SuccessResponse.createSuccessResponse(questions));
      })
      .catch((error) => logger.logError(GameEventHandlerService.TAG, error));
  }

  async handleSelectWord(fromSocket: Socket, word: string) {
    const gameKey = fromSocket.getGameKey();
    logger.logInfo(GameEventHandlerService.TAG, `handleSelectWord game = ${gameKey} data = ${word}`);

    this.gamePlayInfoRepository
      .getTaskId(gameKey, TaskType.AUTO_SELECT_WORD)
      .then((autoSelectWordTaskId) => this.taskScheduler.invalidateTask(autoSelectWordTaskId!!))
      .then(() => this.gamePlayInfoRepository.updateSelectedWord(gameKey, word))
      .then(() => SocketUtils.getAllSocketFromRoom(this.socketServer, gameKey))
      .then((socketList: Array<Socket>) => {
        socketList.forEach((socket) => {
          if (socket.id == fromSocket.id) {
            socket.emit(
              SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
              SuccessResponse.createSuccessResponse(
                GameScreenStatePayload.create(GameScreen.State.DRAW, DrawGameScreenStateData.create(word).toJson())
              )
            );
          } else {
            const hint = [];
            for (let index = 0; index < word.length; index++) {
              const element = word.charAt(index);
              if (Math.random() > 0.5) hint.push(word.charAt(index));
              else hint.push("_");
            }

            socket.emit(
              SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
              SuccessResponse.createSuccessResponse(
                GameScreenStatePayload.create(
                  GameScreen.State.VIEW,
                  ViewGameScreenStateData.create(hint.join(), fromSocket.getUserRecord()).toJson()
                )
              )
            );
          }
        });
      })
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
  }

  handleDrawingEvent(socket: Socket, data: Array<any>) {
    socket.to(socket.getGameKey()).emit(SocketEvents.Game.DRAWING_EVENT, data);
  }

  handleAnswerEvent(socket: Socket, answer: string) {
    logger.logInfo(
      GameEventHandlerService.TAG,
      `handleAnswerEvent from socket '${socket.getLoggingMeta()}' data = '${answer}'`
    );
    this.gamePlayInfoRepository
      .getSelectedWord(socket.getGameKey())
      .then((word) => {
        logger.logInfo(GameEventHandlerService.TAG, `Word = '${word} :: answer'${answer}`);
        socket.emit(
          SocketEvents.Game.ANSWER_RESPONSE,
          SuccessResponse.createSuccessResponse(answer.toLowerCase() == word.toLowerCase())
        );
      })
      .catch((error) => {
        logger.logError(GameEventHandlerService.TAG, error);
      });
  }
}

export default GameEventHandlerService;
