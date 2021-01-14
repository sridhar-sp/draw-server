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

  getGameInfo(gameKey: string): Promise<GamePlayInfo | null> {
    return new Promise((resolve: (gamePlayInfo: GamePlayInfo | null) => void, reject) => {
      this.redisHelper
        .getString(gameKey)
        .then(async (gamePlayInfoJson) => {
          if (null == gamePlayInfoJson) resolve(null);
          else resolve(GamePlayInfo.fromJson(gamePlayInfoJson));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  getOrCreateGameInfo(gameKey: string): Promise<GamePlayInfo> {
    return new Promise(async (resolve: (gamePlayInfo: GamePlayInfo) => void, reject) => {
      this.getGameInfo(gameKey).then(async (gamePlayInfo) => {
        if (null != gamePlayInfo) {
          resolve(gamePlayInfo);
          return;
        }
        const newGamePlayInfo = GamePlayInfo.create(gameKey);
        await this.redisHelper.setString(gameKey, newGamePlayInfo.toJson());
        resolve(newGamePlayInfo);
      });
    });
  }

  deleteGameInfo(gameKey: string): Promise<boolean> {
    return this.redisHelper.delete_(gameKey);
  }

  addParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`addParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getOrCreateGameInfo(gameKey)
        .then((gamePlayInfo) => {
          gamePlayInfo.addParticipant(Participant.create(socketId));
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  removeParticipant(gameKey: string, socketId: string): Promise<void> {
    logger.log(`removeParticipant ${socketId} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          gamePlayInfo.removeParticipant(socketId);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateGameStatus(gameKey: string, gamePlayStatus: GamePlayStatus): Promise<void> {
    logger.log(`updateGameStatus ${gamePlayStatus} for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

          gamePlayInfo.updateGamePlayStatus(gamePlayStatus);
          return this.redisHelper.setString(gameKey, gamePlayInfo.toJson());
        })
        .then((_) => resolve())
        .catch((err) => reject(err));
    });
  }

  updateTaskId(gameKey: string, taskType: TaskType, taskId: string): Promise<void> {
    logger.log(`update ${taskType} id for game ${gameKey} with ${taskId} `);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`No game record found for keu: ${gameKey}`);

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
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (null == gamePlayInfo) throw new Error(`getTaskId :: No game record found for keu: ${gameKey}`);

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

  assignRoles(gameKey: string): Promise<void> {
    logger.log(`assignRoles for game ${gameKey}`);
    return new Promise((resolve, reject) => {
      this.getGameInfo(gameKey)
        .then((gamePlayInfo) => {
          if (gamePlayInfo == null) throw new Error(`No game record found for ${gameKey}`);
          if (gamePlayInfo.participants.length == 0) throw new Error(`No participant available on game ${gameKey}`);

          let nextDrawingParticipantPos;
          if (gamePlayInfo.currentDrawingParticipant == null) {
            nextDrawingParticipantPos = 0;
          } else {
            nextDrawingParticipantPos = gamePlayInfo.findNextParticipant(
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
            else participant.gameScreenState = GameScreen.State.VIEW;
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
      this.getGameInfo(gameKey)
        .then(async (gamePlayInfo) => {
          if (null == gamePlayInfo) {
            logger.logInfo(
              GamePlayInfoRepository.TAG,
              `Executing getGameScreenState, no game record found for ${gameKey} hence returning VIEW as default`
            );
            resolve(GameScreen.State.VIEW);
          } else {
            const participantIndex: number = gamePlayInfo.findParticipant(socketId);
            if (participantIndex == -1) {
              logger.logInfo(
                GamePlayInfoRepository.TAG,
                `Executing getGameScreenState, no participant record found for ${socketId} hence returning VIEW as default`
              );
              resolve(GameScreen.State.VIEW);
              return;
            }
            resolve(gamePlayInfo.participants[participantIndex].gameScreenState);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

export default GamePlayInfoRepository;
