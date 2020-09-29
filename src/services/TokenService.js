const jwt = require('jsonwebtoken');
const config = require('../config/index.js')

const JWT_ALGORITHM = "HS256";

const generateAccessToken = function (payload) {
    return jwt.sign(payload, config.accessToken.secret, {
        algorithm: JWT_ALGORITHM,
        expiresIn: config.accessToken.lifeInSeconds
    })
}

const verifyAccessToken = function (token) {
    try {
        return jwt.verify(token, config.accessToken.secret)
    } catch (e) {
        return null
    }
}

module.exports = {
    generateAccessToken, verifyAccessToken
}