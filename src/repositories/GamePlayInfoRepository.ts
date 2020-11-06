import redisHelper from '../redis/RedisHelper.js'
const GamePlayInfo = require('../models/GamePlayInfo.js')
const Participant = require('../models/Participant.js')
const logger = require('../logger/logger.js')

class GamePlayInfoRepository {

    async deleteGameInfo(gameKey: string) {
        console.log(`deleteGameInfo for game ${gameKey}`)
        return redisHelper.delete(gameKey)
    }

    async addParticipant(gameKey: string, socketId: string) {
        logger.log(`addParticipant ${socketId} for game ${gameKey}`)
        const gameInfo = await this.getGameInfo(gameKey)
        gameInfo.addParticipant(Participant.create(socketId))
        await redisHelper.setString(gameKey, JSON.stringify(gameInfo))
    }

    async removeParticipant(gameKey: string, socketId: string) {
        logger.log(`remove ${socketId} for game ${gameKey}`)
        const gameInfo = await this.getGameInfo(gameKey)
        gameInfo.removeParticipant(socketId)
        await redisHelper.setString(gameKey, JSON.stringify(gameInfo))
    }

    async updateGameStatus(gameKey: string, gamePlayStatus: string) {
        logger.log(`updateGameStatus ${gamePlayStatus} for game ${gameKey}`)
        const gameInfo = await this.getGameInfo(gameKey)
        gameInfo.updateGamePlayStatus(gamePlayStatus)
        return redisHelper.setString(gameKey, JSON.stringify(gameInfo))
    }

    async getGameInfo(gameKey: string) {
        const gameInfo = await redisHelper.getString(gameKey)

        if (gameInfo != null) {
            try {
                return GamePlayInfo.createCopy(JSON.parse(gameInfo))
            } catch (err) {
                logger.error("Error parsing game info " + err)
            }
        }

        return GamePlayInfo.create(gameKey)
    }

}

export default GamePlayInfoRepository