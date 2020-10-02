const TokenService = require('../services/TokenService.js')
const TokenRepository = require('../repositories/TokenRepository.js');
const Error = require('../models/ErrorResponse.js');
const Success = require('../models/SuccessResponse.js');
const TokenResponse = require('../models/TokenResponse.js');
const { use } = require('../routes/api/token.js');

class LoginService {

    constructor() {
        console.log("Constructing LoginService")
        this.tokenService = new TokenService();
        this.tokenRepository = new TokenRepository();
    }

    /**
     * 
     * Generate and return accessToken for the {@code userId}.
     * Generate refresh token and persist in cache.
     * 
     * @param {*} userId UserId Obtained from firebase
     * @return accessToken
     */
    async authenticateUser(userId) {
        const accessToken = this.tokenService.generateAccessToken(userId)
        const refreshToken = this.tokenService.generateRefreshToken(userId)

        //Not handling any errors as of now.
        await this.tokenRepository.saveRefreshToken(userId, refreshToken)

        return accessToken
    }

    async authenticateUserBasedOnRefreshToken(accessToken) {
        return this._verifyAccessTokenIgnoreExpiry(accessToken)
            .then(accessTokenPayload => this.tokenRepository.getRefreshToken(accessTokenPayload.userId))
            .then(refreshToken => this._verifyRefreshToken(refreshToken))
            .then(refreshTokenPayload => this.tokenService.generateAccessToken(refreshTokenPayload.userId))
            .then(accessToken => Success.createSuccessResponse(TokenResponse.create(accessToken)))
            .catch(error => Error.unAuthorised())
    }

    _verifyAccessTokenIgnoreExpiry(accessToken) {
        return new Promise((resolve, reject) => {
            const payload = this.tokenService.verifyAccessTokenIgnoreExpiry(accessToken)
            if (payload != null)
                resolve(payload)
            else
                reject("error while extracing access token payload")
        })
    }

    _verifyRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            const payload = this.tokenService.verifyRefreshToken(refreshToken)
            if (payload != null)
                resolve(payload) 
            else
                reject("error while extracing refresh token payload")
        })
    }
}

module.exports = LoginService