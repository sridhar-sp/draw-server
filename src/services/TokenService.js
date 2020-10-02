const jwt = require('jsonwebtoken');
const config = require('../config/index.js')
const JWTAccessTokenPayload = require('../models/JWTAccessTokenPayload.js');
const JWTRefreshTokenPayload = require('../models/JWTRefreshTokenPayload.js');

JWT_ALGORITHM = "HS256";

class TokenService {

    constructor() {
        console.log("Constructing TokenService")
    }

    generateAccessToken(userId) {
        return this._generateToken(JWTAccessTokenPayload.create(userId).toJson(), config.accessToken.secret, config.accessToken.lifeInSeconds)
    }

    generateRefreshToken(userId) {
        return this._generateToken(JWTRefreshTokenPayload.create(userId).toJson(), config.refreshToken.secret, config.refreshToken.lifeInSeconds)
    }

    verifyAccessToken(token) {
        return this._verifyToken(token, config.accessToken.secret)
    }

    verifyRefreshToken(refreshToken) {        
        return this._verifyToken(refreshToken, config.refreshToken.secret)
    }

    verifyAccessTokenIgnoreExpiry(token) {
        try {
            return jwt.verify(token, config.accessToken.secret, {
                algorithm: JWT_ALGORITHM,
                ignoreExpiration: true
            })
        } catch (e) {
            return null
        }
    }

    _generateToken(payload, secret, lifeInSeconds) {
        return jwt.sign(payload, secret, {
            algorithm: JWT_ALGORITHM,
            expiresIn: lifeInSeconds
        });
    }

    _verifyToken(token, secret) {
        try {
            return jwt.verify(token, secret, {
                algorithm: JWT_ALGORITHM,
            })
        } catch (e) {
            return null
        }
    }

}

module.exports = TokenService