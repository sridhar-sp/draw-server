import redisHelper from '../redis/RedisHelperSingleton'

class TokenRepository {

    static PARTIAL_KEY_REFRESH_TOKEN = "key_refresh_token_"

    constructor() {
        console.log("Constructing the TokenRepository")
    }

    async getRefreshToken(userId: string) {
        return await redisHelper.getString(TokenRepository.PARTIAL_KEY_REFRESH_TOKEN + userId);
    }

    async saveRefreshToken(userId: string, refreshToken: string) {
        return await redisHelper.setString(TokenRepository.PARTIAL_KEY_REFRESH_TOKEN + userId, refreshToken);
    }
}

export default TokenRepository