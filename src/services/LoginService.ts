import TokenService from '../services/TokenService'
import TokenRepository from '../repositories/TokenRepository'
import ErrorResponse from '../models/ErrorResponse';
import SuccessResponse from '../models/SuccessResponse';
import TokenResponse from '../models/TokenResponse'
import JWTAccessTokenPayload from '../models/JWTAccessTokenPayload';
import JWTRefreshTokenPayload from '../models/JWTRefreshTokenPayload';

class LoginService {

    tokenService: TokenService
    tokenRepository: TokenRepository

    constructor() {
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
    async authenticateUser(userId: string) {
        const accessToken = this.tokenService.generateAccessToken(userId)
        const refreshToken = this.tokenService.generateRefreshToken(userId)

        //Not handling any errors as of now.
        await this.tokenRepository.saveRefreshToken(userId, refreshToken)

        return accessToken
    }

    async authenticateUserBasedOnRefreshToken(accessToken: string) {
        return this._verifyAccessTokenIgnoreExpiry(accessToken)
            .then(accessTokenPayload => this.tokenRepository.getRefreshToken(accessTokenPayload.userId))
            .then(refreshToken => this._verifyRefreshToken(refreshToken!))
            .then(refreshTokenPayload => this.tokenService.generateAccessToken(refreshTokenPayload.userId))
            .then(accessToken => SuccessResponse.createSuccessResponse(TokenResponse.create(accessToken)))
            .catch(error => ErrorResponse.unAuthorised())
    }

    _verifyAccessTokenIgnoreExpiry(accessToken: string) {
        return new Promise((resolve: (tokenPayload: JWTAccessTokenPayload) => void, reject: (error: string) => void) => {
            const payload = this.tokenService.verifyAccessTokenIgnoreExpiry(accessToken)
            if (payload != null)
                resolve(payload)
            else
                reject("error while extracing access token payload")
        })
    }

    _verifyRefreshToken(refreshToken: string) {
        return new Promise((resolve: (tokenPayload: JWTRefreshTokenPayload) => void, reject: (error: string) => void) => {
            const payload = this.tokenService.verifyRefreshToken(refreshToken)
            if (payload != null)
                resolve(payload)
            else
                reject("error while extracing refresh token payload")
        })
    }
}

export default LoginService