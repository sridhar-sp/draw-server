const redisHelper = require('../redis/RedisHelper.js')
const GamePlayInfo = require('../models/GamePlayInfo.js')

class GamePlayInfoRepository {

    async createGameInfo(gameKey) {
        console.log("Create game info")
        return redisHelper.setString(gameKey, JSON.stringify(new GamePlayInfo(gameKey,
            GamePlayInfo.GamePlayStatus.NOT_STARTED)))
    }

    async deleteGameInfo(gameKey) {
        return redisHelper.delete(gameKey)
    }

    async updateGameStatus(gameKey, gamePlayStatus) {
        const gameInfo = await this.getGameInfo(gameKey)
        if (gameInfo == null)
            return
        gameInfo.gamePlayStatus = gamePlayStatus
        return redisHelper.setString(gameKey, JSON.stringify(gameInfo))
    }

    async getGameInfo(gameKey) {
        const gameInfo = await redisHelper.getString(gameKey)
        if (gameInfo == null)
            return null
        try {
            return JSON.parse(gameInfo)
        } catch (err) {
            console.log("Error parsing game info " + err)
        }
        return null
    }

}

module.exports = GamePlayInfoRepository