import { JsxEmit } from "typescript";
import GamePlayInfo from "../models/GamePlayInfo";
import GamePlayStatus from "../models/GamePlayStatus";
import RedisHelper from "../redis/RedisHelperV2";
import logger from "../logger/logger";
import Participant from "../models/Participant";
import GameScreen from "../models/GameScreen";
import TaskType from "../scheduler/TaskType";

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
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo) => void, reject) => {
      const gamePlayInfo = GamePlayInfo.create(gameKey, noOfRounds, maxWordSelectionTime, maxDrawingTime)
      this.redisHelper
        .setString(gameKey, gamePlayInfo.toJson())
        .then(_ => resolve(gamePlayInfo))
        .catch(error => reject(error))
    })
  }

  private getGameInfo(gameKey: string): Promise<GamePlayInfo | null> {
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo | null) => void, reject) => {
      this.redisHelper
        .getString(gameKey)
        .then(async (gamePlayInfoJson) => {
          if (null == gamePlayInfoJson) resolve(null);
          else resolve(GamePlayInfo.fromJson(gamePlayInfoJson));
        })
        .catch(err => reject(err));
    });
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

  saveGameInfo(gamePlayInfo: GamePlayInfo): Promise<boolean> {
    return this.redisHelper.setString(gamePlayInfo.gameKey, gamePlayInfo.toJson())
  }

  addParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          //To-do based on game play status, decide which state to assign to the participant
          gamePlayInfo.addParticipant(Participant.create(socketId));
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then(_ => resolve())
        .catch(err => reject(err));
    });
  }

  removeParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`removeParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.removeParticipant(socketId);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateGameStatus(gameKey: string, gamePlayStatus: GamePlayStatus): Promise<void> {
    logger.logInfo(GamePlayInfoRepository.TAG, `updateGameStatus ${gamePlayStatus} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.updateGamePlayStatus(gamePlayStatus);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateSelectedWord(gameKey: string, word: string): Promise<GamePlayInfo> {
    logger.logInfo(GamePlayInfoRepository.TAG, `updateSelectedWord ${word} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.word = word;
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson())
            .then(_ => gamePlayInfo);
        })
        .then((gamePlayInfo) => resolve(gamePlayInfo))
        .catch((err) => reject(err));
    });
  }

  updateTaskId(gameKey: string, taskType: TaskType, taskId: string): Promise<void> {
    logger.log(`update ${taskType} id for game ${gameKey} with ${taskId} `);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          if (taskType == TaskType.AUTO_SELECT_WORD) gamePlayInfo.setAutoSelectWordTaskId(taskId);
          else if (taskType == TaskType.END_DRAWING_SESSION) gamePlayInfo.setEndDrawingSessionTaskId(taskId);

          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  getTaskId(gameKey: string, taskType: TaskType): Promise<string | null> {
    return new Promise((resolve: (taskId: string | null) => void, reject: (error: Error) => void) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          if (taskType == TaskType.AUTO_SELECT_WORD) {
            return gamePlayInfo.autoSelectWordTaskId;
          } else if (taskType == TaskType.END_DRAWING_SESSION) {
            return gamePlayInfo.endDrawingSessionTaskId;
          }
          throw new Error(`Unknown task type ${taskType}`);
        })
        .then((taskId) => resolve(taskId))
        .catch((error) => reject(error));
    });
  }

  getSelectedWord(gameKey: string): Promise<string> {
    return new Promise((resolve: (word: string) => void, reject: (error: Error) => void) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {

          if (gamePlayInfo.word == null || gamePlayInfo.word.trim() == "")
            throw new Error(`getSelectedWord :: No word data found in game play record for key: ${gameKey}`);

          return gamePlayInfo.word;
        })
        .then((word) => resolve(word))
        .catch((error) => reject(error));
    });
  }

  //Not used
  private assignRoles(gameKey: string): Promise<void> {
    logger.log(`assignRoles for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then((gamePlayInfo) => {
          if (gamePlayInfo.participants.length == 0) throw new Error(`No participant available on game ${gameKey}`);

          let nextDrawingParticipantPos;
          if (gamePlayInfo.currentDrawingParticipant == null) {
            nextDrawingParticipantPos = 0;
          } else {
            nextDrawingParticipantPos = gamePlayInfo.findNextParticipantIndex(
              gamePlayInfo.currentDrawingParticipant.socketId
            );
            if (nextDrawingParticipantPos == 0) {
              gamePlayInfo.currentRound++; // One round trip is completed
            }
          }
          const nextDrawingParticipant = gamePlayInfo.participants[nextDrawingParticipantPos];
          gamePlayInfo.currentDrawingParticipant = nextDrawingParticipant;

          gamePlayInfo.participants.forEach((participant) => {
            if (participant.socketId == nextDrawingParticipant.socketId)
              participant.gameScreenState = GameScreen.State.SELECT_DRAWING_WORD;
            else participant.gameScreenState = GameScreen.State.WAIT_FOR_DRAWING_WORD;
            logger.logInfo(
              GamePlayInfoRepository.TAG,
              `Assigning ${participant.socketId} with ${participant.gameScreenState}`
            );
          });

          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => {
          logger.logInfo(GamePlayInfoRepository.TAG, "Roles re-assigned");
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  getGameScreenState(gameKey: string, socketId: string): Promise<GameScreen> {
    return new Promise((resolve: (gamePlayInfo: GameScreen) => void, reject) => {
      this.getGameInfoOrThrow(gameKey)
        .then(async (gamePlayInfo) => {
          const participantIndex: number = gamePlayInfo.findParticipantIndex(socketId);
          if (participantIndex == -1) {
            logger.logInfo(
              GamePlayInfoRepository.TAG,
              `Executing getGameScreenState, no participant record found for ${socketId} hence returning NONE as default`
            );
            resolve(GameScreen.State.NONE);
            return;
          }
          resolve(gamePlayInfo.participants[participantIndex].gameScreenState);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default GamePlayInfoRepository;
