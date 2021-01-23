import { Socket } from "socket.io";
import ErrorResponse from "../models/ErrorResponse"
import redisHelper from "../redis/RedisHelperSingleton"
import logger from "../logger/logger"

const TAG = "gameKeyVerifierSocketMiddleware"

const gameKeyVerifierSocketMiddleware = async function (socket: Socket, next: Function) {
    const gameKey = socket.handshake.query.gameKey;

    let isGameKeyExist = false
    try {
        isGameKeyExist = await redisHelper.exist(gameKey)
    } catch (error) {
        logger.logError(TAG, error)
    }

    if (isGameKeyExist) {
        next()
    }
    else {
        logger.logInfo(TAG, `GameKey : ${gameKey} not exist in record `)
        next(new Error(ErrorResponse.createErrorResponse(422, "Invalid game key").toJson()));
        setTimeout(function () {
            socket.disconnect();
        }, 1500);
    }
}

export default gameKeyVerifierSocketMiddleware