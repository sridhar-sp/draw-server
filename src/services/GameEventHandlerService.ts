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
import GamePlayInfo from "../models/GamePlayInfo";
import AutoEndDrawingSessionTaskRequest from "../models/AutoEndDrawingSessionTaskRequest";
import DismissLeaderBoardTaskRequest from "../models/DismissLeaderBoardTaskRequest";
import AnswerEventResponse from "../models/AnswerEventResponse";
import UserScore from "../models/UserScore";
import LeaderBoardData from "../models/LeaderBoardData";

class GameEventHandlerService {
  private static TAG = "GameEventHandlerService";

  private static LEADER_BOARD_VISIBLE_TIME_IN_SECONDS = 3

  private socketServer: Server;
  private gamePlayInfoRepository: GamePlayInfoRepository;
  private taskScheduler: TaskScheduler;
  private questionRepository: QuestionRepository;

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
      .then(_ => this.gamePlayInfoRepository.getGameInfoOrThrow(gameKey))
      .then(gamePlayInfo => {
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

    logger.logInfo(GameEventHandlerService.TAG, `Start game : game key = ${gameKey}`)

    await this.gamePlayInfoRepository.getGameInfoOrThrow(gameKey)
      .then(gamePlayInfo => this.rotateRoles(gamePlayInfo))
      .then(gamePlayInfo => {
        gamePlayInfo.gamePlayStatus = GamePlayStatus.STARTED;
        // gamePlayInfo.currentRound = 1;
        return this.gamePlayInfoRepository.saveGameInfo(gamePlayInfo)
      })
      .then(_ => this.socketServer.in(gameKey).emit(SocketEvents.Game.START_GAME))
      .catch(error => logger.logError(GameEventHandlerService.TAG, error))
  }

  async endCurrentDrawingSession(gameKey: string) {

    this.gamePlayInfoRepository.getGameInfoOrThrow(gameKey)
      .then(gamePlayInfo => {
        const drawingParticipant = gamePlayInfo.getDrawingParticipant()

        //if drawing participant disconnect, it will cause drawing session to end during those times then simply ignore and continue. 
        if (drawingParticipant != null && gamePlayInfo.getParticipantScoreForCurrentMatch(drawingParticipant.socketId) == -1) {
          gamePlayInfo.setDrawingParticipantScoreForCurrentMatch(10)//Add the score calc logic later
          return this.gamePlayInfoRepository.saveGameInfo(gamePlayInfo)
        }

        return gamePlayInfo
      })
      .then(gamePlayInfo => {
        const leaderBoardData = this.formLeaderBoardPayloadFrom(gamePlayInfo)
        this.socketServer.in(gameKey).emit(SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
          SuccessResponse.createSuccessResponse(GameScreenStatePayload.createLeaderBoard(leaderBoardData)))

        if (!leaderBoardData.isGameCompleted()) {
          this.scheduleTask(TaskType.DISMISS_LEADER_BOARD,
            DismissLeaderBoardTaskRequest.create(gameKey).toJson(),
            GameEventHandlerService.LEADER_BOARD_VISIBLE_TIME_IN_SECONDS)
        }

      })
      .catch(e => logger.logError(GameEventHandlerService.TAG, e))

  }

  private updateDrawingParticipantScoreIfRequired(gamePlayInfo: GamePlayInfo): Promise<GamePlayInfo> {
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo) => void, reject: (e: Error) => void) => {
      const drawingParticipant = gamePlayInfo.getDrawingParticipant()
      if (drawingParticipant == null) {
        logger.logWarn(GameEventHandlerService.TAG, `updateDrawingParticipantScoreIfRequired : no drawing participant for game key ${gamePlayInfo.gameKey} `)
        resolve(gamePlayInfo)
        return
      }

      // if(drawingParticipant.getScore())

    });
  }

  async rotateUserGameScreenState(gameKey: string) {
    logger.logInfo(GameEventHandlerService.TAG, `rotateUserRoles for game = ${gameKey}`)
    this.gamePlayInfoRepository.getGameInfoOrThrow(gameKey)
      .then(gamePlayInfo => this.rotateRoles(gamePlayInfo))
      .then(gamePlayInfo => {

        logger.logInfo(GameEventHandlerService.TAG, `rotateUserGameScreenState gamePlayInfo.participants[0].gameScreenState 
        ${gamePlayInfo.participants[0].getGameScreenState()}`)

        if (gamePlayInfo.participants[0].getGameScreenState() == GameScreen.State.SELECT_DRAWING_WORD) {
          logger.logInfo(GameEventHandlerService.TAG, `rotateUserGameScreenState one round trip completed`)
          gamePlayInfo.incrementCurrentRound()
        }

        return this.gamePlayInfoRepository.saveGameInfo(gamePlayInfo)
      })
      .then(gamePlayInfo => {
        gamePlayInfo.participants.forEach(participant => {

          const drawingParticipant = gamePlayInfo.getDrawingParticipant()
          if (null == drawingParticipant)
            throw new Error(`No drawing participant found after rotating roles`);

          const drawingParticipantSocket = this.socketServer.sockets.sockets[drawingParticipant.socketId];
          if (null == drawingParticipantSocket)
            throw new Error(`Drawing participant socket instance is not found for game ${gameKey}`);

          let response
          if (participant.socketId == drawingParticipant.socketId) {
            response = SuccessResponse.createSuccessResponse(GameScreenStatePayload.createSelectDrawingWord())
          } else {
            response = SuccessResponse.createSuccessResponse(GameScreenStatePayload.createWaitForDrawingWord(drawingParticipantSocket.getUserRecord()))
          }

          this.socketServer.to(participant.socketId).emit(SocketEvents.Game.GAME_SCREEN_STATE_RESULT, response);
        })
      })
      .catch(error => logger.logError(GameEventHandlerService.TAG, error))
  }

  async handleGameScreenState(socket: Socket) {
    const gameKey = socket.getGameKey();

    this.gamePlayInfoRepository
      .getGameInfoOrThrow(gameKey)
      .then((gamePlayInfo) => {
        const thisParticipant = gamePlayInfo.findParticipant(socket.id);
        if (thisParticipant == null) throw new Error(`Participant ${socket.id} is not belong to the game ${gameKey}`);

        const gameScreenState = thisParticipant.getGameScreenState();
        switch (gameScreenState) {
          case GameScreen.State.NONE:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
          case GameScreen.State.SELECT_DRAWING_WORD:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.createSelectDrawingWord());
          case GameScreen.State.DRAW:
            if (gamePlayInfo.word == null)
              throw new Error("No drawing word is selected, but the game screen state is set as RAW");
            return SuccessResponse.createSuccessResponse(
              GameScreenStatePayload.create(gameScreenState, DrawGameScreenStateData.create(gamePlayInfo.word).toJson())
            );
          case GameScreen.State.WAIT_FOR_DRAWING_WORD:
            const drawingParticipant = gamePlayInfo.getDrawingParticipant()
            if (null == drawingParticipant)
              throw new Error(
                `No participant is selecting a word to draw but participant ${thisParticipant.socketId} is in waiting state`
              );
            const drawingParticipantSocket = this.socketServer.sockets.sockets[drawingParticipant.socketId];
            if (null == drawingParticipantSocket)
              throw new Error(`Drawing participant socket instance is not found for game ${gameKey}`);

            return SuccessResponse.createSuccessResponse(
              GameScreenStatePayload.createWaitForDrawingWord(drawingParticipantSocket.getUserRecord())
            );

          case GameScreen.State.VIEW:
            return SuccessResponse.createSuccessResponse(GameScreenStatePayload.create(gameScreenState, ""));
          case GameScreen.State.LEADER_BOARD:
            return SuccessResponse.createSuccessResponse(
              GameScreenStatePayload.createLeaderBoard(this.formLeaderBoardPayloadFrom(gamePlayInfo))
            );
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
    this.gamePlayInfoRepository.getGameInfoOrThrow(gameKey)
      .then(gamePlayInfo => this.scheduleAutoSelectWordTask(gamePlayInfo, questions[0], socket.id))
      .then((taskId) => this.gamePlayInfoRepository.updateTaskId(gameKey, TaskType.AUTO_SELECT_WORD, taskId))
      .then(() => {
        socket.emit(SocketEvents.Game.LIST_OF_WORD_RESPONSE, SuccessResponse.createSuccessResponse(questions));
      })
      .catch((error) => logger.logError(GameEventHandlerService.TAG, error));

    // this.taskScheduler
    //   .scheduleTask(
    //     GameEventHandlerService.MAX_TIME_TO_SELECT_A_DRAWING_WORD,
    //     Task.create(
    //       TaskType.AUTO_SELECT_WORD,
    //       GameEventHandlerService.AUTO_SELECT_DRAWING_WORD_TTL_IN_SECONDS,
    //       AutoSelectWordTaskRequest.create(socket.getGameKey(), socket.id, questions[0]).toJson()
    //     )
    //   )
    //   .then((taskId) => this.gamePlayInfoRepository.updateTaskId(gameKey, TaskType.AUTO_SELECT_WORD, taskId))
    //   .then(() => {
    //     socket.emit(SocketEvents.Game.LIST_OF_WORD_RESPONSE, SuccessResponse.createSuccessResponse(questions));
    //   })
    //   .catch((error) => logger.logError(GameEventHandlerService.TAG, error));
  }

  async handleSelectWord(fromSocket: Socket, word: string) {
    const gameKey = fromSocket.getGameKey();
    logger.logInfo(GameEventHandlerService.TAG, `handleSelectWord game = ${gameKey} data = ${word}`);

    this.gamePlayInfoRepository
      .getTaskId(gameKey, TaskType.AUTO_SELECT_WORD)
      .then((autoSelectWordTaskId) => this.taskScheduler.invalidateTask(autoSelectWordTaskId!!))
      .then(() => this.gamePlayInfoRepository.updateSelectedWord(gameKey, word))
      .then(gamePlayInfo => this.scheduleDrawingSessionEndTask(gamePlayInfo))
      .then((taskId) => this.gamePlayInfoRepository.updateTaskId(gameKey, TaskType.END_DRAWING_SESSION, taskId))
      .then(() => SocketUtils.getAllSocketFromRoom(this.socketServer, gameKey))
      .then((socketList: Array<Socket>) => {
        const hint = this.createHint(word)

        socketList.forEach((socket) => {
          if (socket.id == fromSocket.id) {
            socket.emit(
              SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
              SuccessResponse.createSuccessResponse(
                GameScreenStatePayload.create(GameScreen.State.DRAW, DrawGameScreenStateData.create(word).toJson())
              )
            );
          } else {
            socket.emit(
              SocketEvents.Game.GAME_SCREEN_STATE_RESULT,
              SuccessResponse.createSuccessResponse(
                GameScreenStatePayload.create(
                  GameScreen.State.VIEW,
                  ViewGameScreenStateData.create(hint, fromSocket.getUserRecord()).toJson()
                )
              )
            );
          }
        });
      })
      .catch((error) => logger.logError(GameEventHandlerService.TAG, error));
  }

  private createHint(word: string): string {
    const hint = [];
    for (let index = 0; index < word.length; index++) {
      const element = word.charAt(index);
      if (Math.random() > 0.8) hint.push(word.charAt(index));
      else hint.push("_");
    }
    return hint.join("");
  }


  handleDrawingEvent(socket: Socket, data: Array<any>) {
    socket.to(socket.getGameKey()).emit(SocketEvents.Game.DRAWING_EVENT, data);
  }

  async handleAnswerEvent(socket: Socket, answer: string) {
    logger.logInfo(
      GameEventHandlerService.TAG,
      `handleAnswerEvent from socket '${socket.getLoggingMeta()}' data = '${answer}'`
    );
    this.gamePlayInfoRepository
      .getGameInfoOrThrow(socket.getGameKey())
      .then(async (gamePlayInfo) => {
        const word = gamePlayInfo.word

        if (word == null || word.trim() == "")
          throw new Error(`handleDrawingEvent :: No word data found in game play record for key: ${socket.getGameKey()}`);

        logger.logInfo(GameEventHandlerService.TAG, `Word = '${word} :: answer'${answer}`);

        if (answer.toLowerCase() == word.toLowerCase()) {
          gamePlayInfo.setParticipantScoreForCurrentMatch(socket.id, word.length)//Dummy score

          const isEveryoneAnswered = gamePlayInfo.isAllParticipantGuessedTheWordInCurrentRound()
          logger.logInfo(GameEventHandlerService.TAG, `isAllParticipantGuessedTheWordInCurrentRound ${isEveryoneAnswered}`)
          if (isEveryoneAnswered) {
            gamePlayInfo.setDrawingParticipantScoreForCurrentMatch(word.length / 2)//Dummy score
            gamePlayInfo.incrementMatchIndex()
          }

          await this.gamePlayInfoRepository.saveGameInfo(gamePlayInfo)

          socket.emit(SocketEvents.Game.ANSWER_RESPONSE,
            SuccessResponse.createSuccessResponse(AnswerEventResponse.createCorrectAnswerResponse(word)));

          if (isEveryoneAnswered) {
            const endDrawingSessionTaskId = gamePlayInfo.endDrawingSessionTaskId
            if (endDrawingSessionTaskId == null)
              throw new Error("Everyone answered but task id to end the current drawing session is missing from record")

            await this.taskScheduler.invalidateTask(endDrawingSessionTaskId)
            this.endCurrentDrawingSession(gamePlayInfo.gameKey)
          }
        }
        else {
          socket.emit(SocketEvents.Game.ANSWER_RESPONSE,
            SuccessResponse.createSuccessResponse(AnswerEventResponse.createWrongAnswerResponse(answer)));
        }

      })
      .catch((error) => {
        logger.logError(GameEventHandlerService.TAG, error);
      });

    // this.gamePlayInfoRepository
    //   .getSelectedWord(socket.getGameKey())
    //   .then((word) => {
    //     logger.logInfo(GameEventHandlerService.TAG, `Word = '${word} :: answer'${answer}`);
    //     let response: AnswerEventResponse

    //     if (answer.toLowerCase() == word.toLowerCase())
    //       response = AnswerEventResponse.createCorrectAnswerResponse(word)
    //     else
    //       response = AnswerEventResponse.createWrongAnswerResponse(answer)

    //     socket.emit(SocketEvents.Game.ANSWER_RESPONSE, SuccessResponse.createSuccessResponse(response));
    //   })
    //   .catch((error) => {
    //     logger.logError(GameEventHandlerService.TAG, error);
    //   });
  }



  private rotateRoles(gamePlayInfo: GamePlayInfo): Promise<GamePlayInfo> {

    logger.logInfo(GameEventHandlerService.TAG, `rotateRoles for game ${gamePlayInfo.gameKey}`);

    if (gamePlayInfo.participants.length == 0) throw new Error(`No participant available on game ${gamePlayInfo.gameKey}`);

    let nextDrawingParticipantPos;
    if (gamePlayInfo.getDrawingParticipant() == null) {
      nextDrawingParticipantPos = 0;
    } else {
      nextDrawingParticipantPos = gamePlayInfo.findNextParticipantIndex(
        gamePlayInfo.getDrawingParticipant()!!.socketId
      );
      // if (nextDrawingParticipantPos == 0) {
      //   gamePlayInfo.currentRound++; // One round trip is completed
      // }
    }
    const nextDrawingParticipant = gamePlayInfo.participants[nextDrawingParticipantPos];
    gamePlayInfo.setDrawingParticipant(nextDrawingParticipant)

    gamePlayInfo.participants.forEach((participant) => {
      if (participant.socketId == nextDrawingParticipant.socketId)
        participant.setGameScreenState(GameScreen.State.SELECT_DRAWING_WORD)
      else participant.setGameScreenState(GameScreen.State.WAIT_FOR_DRAWING_WORD)
      logger.logInfo(GameEventHandlerService.TAG, `Assigning ${participant.socketId} with ${participant.getGameScreenState()}`);
    });

    return Promise.resolve(gamePlayInfo);
  }

  private scheduleDrawingSessionEndTask(gamePlayInfo: GamePlayInfo): Promise<string> {
    return this.scheduleTask(TaskType.END_DRAWING_SESSION,
      AutoEndDrawingSessionTaskRequest.create(gamePlayInfo.gameKey).toJson(), gamePlayInfo.maxDrawingTime)
  }

  private scheduleAutoSelectWordTask(gamePlayInfo: GamePlayInfo, word: string, socketId: string): Promise<string> {
    return this.scheduleTask(TaskType.AUTO_SELECT_WORD,
      AutoSelectWordTaskRequest.create(gamePlayInfo.gameKey, socketId, word).toJson(), gamePlayInfo.maxWordSelectionTime)
  }

  private scheduleTask(taskType: TaskType, payload: string, taskDelayInSeconds: number): Promise<string> {
    return this.taskScheduler.scheduleTask(taskDelayInSeconds * 1000, Task.create(taskType, taskDelayInSeconds + 10, payload))
  }

  private formLeaderBoardPayloadFrom(gamePlayInfo: GamePlayInfo): LeaderBoardData {
    let leaderBoardPayload: Array<UserScore> = []

    const participantsSize = gamePlayInfo.participants.length
    if (participantsSize == 0) {
      logger.logWarn(GameEventHandlerService.TAG, "No participants, can't form leader board")
      return LeaderBoardData.create(leaderBoardPayload, gamePlayInfo.isAllRoundCompleted())
    }

    for (let i = 0; i < participantsSize; i++) {
      const participant = gamePlayInfo.participants[i]
      const participantSocket = this.getSocketForId(participant.socketId)
      if (null != participantSocket) {
        leaderBoardPayload.push(UserScore.create(Math.max(participant.getTotalScore(), 0), participantSocket.getUserRecord()))
      }
    }

    leaderBoardPayload.sort((i1, i2) => i2.score - i1.score)
    return LeaderBoardData.create(leaderBoardPayload, gamePlayInfo.isAllRoundCompleted())
  }

  private getSocketForId(socketId: string): Socket | null {
    return this.socketServer.sockets.sockets[socketId]
  }
}

export default GameEventHandlerService;
