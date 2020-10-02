const redisHelper = require('../redis/RedisHelper.js')

PARTIAL_KEY_REFRESH_TOKEN = "key_refresh_token_"

class TokenRepository {

    constructor() {
        console.log("Constructing the TokenRepository")
    }

    async getRefreshToken(userId) {
        return await redisHelper.getString(PARTIAL_KEY_REFRESH_TOKEN + userId);
    }

    async saveRefreshToken(userId, refreshToken) {
        return await redisHelper.setString(PARTIAL_KEY_REFRESH_TOKEN + userId, refreshToken);
    }
}

module.exports = TokenRepository