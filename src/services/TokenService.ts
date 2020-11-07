const jwt = require('jsonwebtoken');
const config = require('../config/index.js')
import JWTAccessTokenPayload from '../models/JWTAccessTokenPayload'
import JWTRefreshTokenPayload from '../models/JWTRefreshTokenPayload';

class TokenService {

    static JWT_ALGORITHM = "HS256";

    constructor() {
        console.log("Constructing TokenService")
    }

    generateAccessToken(userId: string) {
        return this._generateToken(JWTAccessTokenPayload.create(userId).toJson(), config.accessToken.secret, config.accessToken.lifeInSeconds)
    }

    generateRefreshToken(userId: string) {
        return this._generateToken(JWTRefreshTokenPayload.create(userId).toJson(), config.refreshToken.secret, config.refreshToken.lifeInSeconds)
    }

    verifyAccessToken(token: string) {
        return this._verifyToken(token, config.accessToken.secret)
    }

    verifyRefreshToken(refreshToken: string) {
        return this._verifyToken(refreshToken, config.refreshToken.secret)
    }

    verifyAccessTokenIgnoreExpiry(token: string) {
        try {
            return jwt.verify(token, config.accessToken.secret, {
                algorithm: TokenService.JWT_ALGORITHM,
                ignoreExpiration: true
            })
        } catch (e) {
            return null
        }
    }

    _generateToken(payload: typeof JWTAccessTokenPayload, secret: string, lifeInSeconds: string) {
        return jwt.sign(payload, secret, {
            algorithm: TokenService.JWT_ALGORITHM,
            expiresIn: lifeInSeconds
        });
    }

    _verifyToken(token: string, secret: string) {
        try {
            return jwt.verify(token, secret, {
                algorithm: TokenService.JWT_ALGORITHM,
            })
        } catch (e) {
            return null
        }
    }

}

export default TokenService